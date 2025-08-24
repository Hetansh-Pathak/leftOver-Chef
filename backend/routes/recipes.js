const express = require('express');
const Recipe = require('../models/Recipe');
const User = require('../models/User');
const RecipeService = require('../services/recipeService');
const mockData = require('../mockData');
const router = express.Router();

// Create instance of RecipeService
const recipeService = new RecipeService();

// Middleware for authentication (optional for most routes)
const authenticateUser = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (token) {
      req.userId = 'demo-user-id';
    }
    next();
  } catch (error) {
    next();
  }
};

// Enhanced ingredient-based search - Main BigOven-style endpoint
router.post('/search-by-ingredients', authenticateUser, async (req, res) => {
  try {
    const {
      ingredients,
      matchType = 'any',
      useSpoonacular = true,
      limit = 30
    } = req.body;

    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return res.status(400).json({
        message: 'Please provide at least one ingredient'
      });
    }

    console.log(`🔍 Searching for recipes with ingredients: [${ingredients.join(', ')}]`);

    let allRecipes = [];
    let spoonacularResults = [];
    let localResults = [];

    // 1. Search Spoonacular API for global recipes
    if (useSpoonacular) {
      try {
        spoonacularResults = await recipeService.searchByIngredients(ingredients, {
          number: Math.min(limit, 15),
          ranking: 1,
          ignorePantry: true
        });

        if (spoonacularResults && spoonacularResults.length > 0) {
          console.log(`✅ Found ${spoonacularResults.length} recipes from Spoonacular API`);
          allRecipes = allRecipes.concat(spoonacularResults);
        }
      } catch (spoonacularError) {
        console.error('Spoonacular search failed:', spoonacularError.message);
      }
    }

    // 2. Search local database
    if (global.MOCK_MODE) {
      localResults = mockData.searchByIngredients(ingredients, {
        matchType,
        limit: Math.max(limit - allRecipes.length, 15)
      });
      console.log(`📊 Found ${localResults.length} recipes from local database`);
    } else {
      try {
        localResults = await Recipe.findByIngredients({
          ingredients,
          matchType,
          limit: limit - allRecipes.length
        });
      } catch (dbError) {
        console.error('Local database search failed:', dbError.message);
        localResults = [];
      }
    }

    if (localResults && localResults.length > 0) {
      allRecipes = allRecipes.concat(localResults);
    }

    // 3. Remove duplicates and ensure minimum results
    const uniqueRecipes = allRecipes.filter((recipe, index, self) => {
      return index === self.findIndex(r =>
        (r._id && r._id.toString()) === (recipe._id && recipe._id.toString()) ||
        (r.spoonacularId && recipe.spoonacularId && r.spoonacularId === recipe.spoonacularId) ||
        (r.title && recipe.title && r.title.toLowerCase() === recipe.title.toLowerCase())
      );
    });

    // 4. If we have less than 3 recipes, try broader search
    if (uniqueRecipes.length < 3) {
      console.log(`⚠️ Only found ${uniqueRecipes.length} recipes, trying broader search...`);
      
      try {
        // Try searching with individual ingredients
        for (const ingredient of ingredients) {
          if (uniqueRecipes.length >= 10) break;
          
          const singleIngredientResults = await recipeService.searchByIngredients([ingredient], {
            number: 5,
            ranking: 1
          });
          
          if (singleIngredientResults) {
            uniqueRecipes.push(...singleIngredientResults.filter(recipe => 
              !uniqueRecipes.some(existing => 
                existing.title?.toLowerCase() === recipe.title?.toLowerCase()
              )
            ));
          }
        }
      } catch (broaderError) {
        console.error('Broader search failed:', broaderError.message);
      }
    }

    // 5. Sort by relevance
    uniqueRecipes.sort((a, b) => {
      const scoreA = (a.matchScore || 0) * 0.6 + (a.rating || 0) * 0.4;
      const scoreB = (b.matchScore || 0) * 0.6 + (b.rating || 0) * 0.4;
      return scoreB - scoreA;
    });

    // 6. Limit final results
    const finalRecipes = uniqueRecipes.slice(0, limit);

    // 7. Enhance recipes with proper formatting and apply filters
    let enhancedRecipes = finalRecipes.map((recipe, index) => ({
      ...recipe,
      searchRank: index + 1,
      image: recipeService.getOptimizedImageUrl(recipe.image, recipe.title || recipe.name),
      title: recipe.title || recipe.name,
      summary: recipe.summary || recipeService.generateDefaultSummary(recipe),
      readyInMinutes: recipe.readyInMinutes || 30,
      servings: recipe.servings || 4,
      rating: recipe.rating || (recipe.spoonacularScore ? recipe.spoonacularScore / 20 : 4.0),
      cuisines: recipe.cuisines && recipe.cuisines.length > 0 ? recipe.cuisines : ['International'],
      tags: recipe.tags || [],
      lastUpdated: new Date()
    }));

    // 8. Apply filters if provided
    if (filters) {
      if (filters.cuisine) {
        enhancedRecipes = enhancedRecipes.filter(recipe =>
          recipe.cuisines.some(cuisine =>
            cuisine.toLowerCase().includes(filters.cuisine.toLowerCase())
          )
        );
      }

      if (filters.diet) {
        enhancedRecipes = enhancedRecipes.filter(recipe => {
          switch (filters.diet.toLowerCase()) {
            case 'vegetarian':
              return recipe.vegetarian === true;
            case 'vegan':
              return recipe.vegan === true;
            case 'glutenfree':
              return recipe.glutenFree === true;
            case 'dairyfree':
              return recipe.dairyFree === true;
            default:
              return true;
          }
        });
      }

      if (filters.maxTime) {
        const maxTime = parseInt(filters.maxTime);
        enhancedRecipes = enhancedRecipes.filter(recipe =>
          (recipe.readyInMinutes || 30) <= maxTime
        );
      }

      if (filters.difficulty) {
        enhancedRecipes = enhancedRecipes.filter(recipe =>
          (recipe.difficulty || 'Medium').toLowerCase() === filters.difficulty.toLowerCase()
        );
      }
    }

    // 9. Final limit after filtering
    const finalFilteredRecipes = enhancedRecipes.slice(0, limit);

    console.log(`🎯 Final result: ${finalFilteredRecipes.length} recipes found (${enhancedRecipes.length} before filtering)`);

    res.json({
      recipes: finalFilteredRecipes,
      totalFound: finalFilteredRecipes.length,
      totalBeforeFiltering: enhancedRecipes.length,
      searchedIngredients: ingredients,
      appliedFilters: filters,
      sources: {
        spoonacular: spoonacularResults.length,
        local: localResults.length
      },
      message: finalFilteredRecipes.length > 0 ?
        `Found ${finalFilteredRecipes.length} recipes for your ingredients` :
        'No recipes found. Try different ingredients or adjust filters.',
      searchTips: finalFilteredRecipes.length === 0 ? [
        'Try using more common ingredients',
        'Check your spelling',
        'Remove some filters to see more results',
        'Try ingredient combinations like "chicken rice" or "pasta tomato"'
      ] : [],
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error in ingredient search:', error);
    res.status(500).json({ 
      message: 'Error searching recipes', 
      error: error.message 
    });
  }
});

// Global search endpoint (Spoonacular only)
router.post('/search/global', authenticateUser, async (req, res) => {
  try {
    const {
      ingredients = [],
      query,
      cuisine,
      diet,
      number = 20
    } = req.body;

    if (!ingredients.length && !query) {
      return res.status(400).json({
        message: 'Please provide ingredients or search query'
      });
    }

    let recipes = [];

    try {
      if (ingredients.length > 0) {
        // Search by ingredients
        recipes = await recipeService.searchByIngredients(ingredients, {
          number,
          ranking: 1,
          ignorePantry: true
        });
      } else if (query) {
        // Search by query using complexSearch
        const axios = require('axios');
        const SPOONACULAR_API_KEY = process.env.SPOONACULAR_API_KEY;

        if (SPOONACULAR_API_KEY) {
          const searchParams = {
            query,
            number,
            addRecipeInformation: true,
            fillIngredients: true,
            apiKey: SPOONACULAR_API_KEY
          };

          if (cuisine) searchParams.cuisine = cuisine;
          if (diet) searchParams.diet = diet;

          const response = await axios.get('https://api.spoonacular.com/recipes/complexSearch', {
            params: searchParams
          });

          if (response.data.results) {
            const formattedRecipes = response.data.results.map(recipe =>
              recipeService.formatSpoonacularRecipe(recipe)
            );
            recipes = await recipeService.saveRecipesToDatabase(formattedRecipes);
          }
        }
      }
    } catch (apiError) {
      console.error('Spoonacular API error:', apiError.message);
      recipes = [];
    }

    res.json({
      recipes: recipes || [],
      totalFound: recipes ? recipes.length : 0,
      searchQuery: query,
      searchIngredients: ingredients,
      isGlobalSearch: true,
      source: 'spoonacular'
    });

  } catch (error) {
    console.error('Error in global search:', error);
    res.status(500).json({
      message: 'Error performing global search',
      error: error.message
    });
  }
});

// Get daily featured recipe
router.get('/daily/featured', async (req, res) => {
  try {
    if (global.MOCK_MODE) {
      return res.json(mockData.getDailyRecipe());
    }

    const dailyRecipe = await recipeService.getFeaturedRecipeOfTheDay();

    if (!dailyRecipe) {
      const fallbackRecipe = await Recipe.findOne({
        rating: { $gte: 4.0 }
      }).sort({ aggregateLikes: -1 });

      return res.json(fallbackRecipe);
    }

    res.json(dailyRecipe);

  } catch (error) {
    console.error('Error fetching daily recipe:', error);
    res.status(500).json({
      message: 'Error fetching daily recipe',
      error: error.message
    });
  }
});

// Get recipe by ID
router.get('/:id', authenticateUser, async (req, res) => {
  try {
    let recipe = null;

    if (global.MOCK_MODE) {
      recipe = mockData.getRecipeById(req.params.id);
    } else {
      recipe = await Recipe.findById(req.params.id);
    }
    
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    
    res.json(recipe);
    
  } catch (error) {
    console.error('Error fetching recipe:', error);
    res.status(500).json({ 
      message: 'Error fetching recipe', 
      error: error.message 
    });
  }
});

// Toggle favorite
router.post('/:id/favorite', authenticateUser, async (req, res) => {
  try {
    const recipeId = req.params.id;
    
    // In a real app, this would update user's favorites in database
    // For now, just return success
    res.json({ 
      message: 'Favorite toggled successfully',
      isFavorite: Math.random() > 0.5 // Random for demo
    });
    
  } catch (error) {
    console.error('Error toggling favorite:', error);
    res.status(500).json({ 
      message: 'Error toggling favorite', 
      error: error.message 
    });
  }
});

// Health check
router.get('/health', async (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    totalRecipes: global.MOCK_MODE ? mockData.getAllRecipes().length : await Recipe.countDocuments()
  });
});

module.exports = router;
