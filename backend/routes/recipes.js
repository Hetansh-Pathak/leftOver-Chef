const express = require('express');
const Recipe = require('../models/Recipe');
const User = require('../models/User');
const recipeService = require('../services/recipeService');
const multiApiRecipeService = require('../services/multiApiRecipeService');
const mockData = require('../mockData');
const router = express.Router();

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

// Enhanced ingredient-based search - Main BigOven-style endpoint with Multi-API support
router.post('/search-by-ingredients', authenticateUser, async (req, res) => {
  try {
    const {
      ingredients,
      matchType = 'any',
      useMultiAPI = true,
      limit = 30,
      filters = {}
    } = req.body;

    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return res.status(400).json({
        message: 'Please provide at least one ingredient'
      });
    }

    console.log(`🔍 Enhanced Multi-API search for ingredients: [${ingredients.join(', ')}]`);

    let allRecipes = [];
    let searchSources = {
      multiAPI: 0,
      local: 0,
      spoonacular: 0
    };

    // 1. Use Multi-API service for comprehensive search
    if (useMultiAPI) {
      try {
        const multiApiResults = await multiApiRecipeService.searchRecipesFromMultipleAPIs(ingredients, {
          limit: Math.ceil(limit * 0.7),
          filters,
          includeSpoonacular: true,
          includeRecipePuppy: true,
          includeEdamam: true
        });

        if (multiApiResults && multiApiResults.length > 0) {
          console.log(`✅ Multi-API search: ${multiApiResults.length} recipes`);
          allRecipes = allRecipes.concat(multiApiResults);
          searchSources.multiAPI = multiApiResults.length;

          // Count by individual sources
          searchSources.spoonacular = multiApiResults.filter(r => r.source === 'spoonacular').length;
        }
      } catch (multiApiError) {
        console.error('Multi-API search failed, falling back to local:', multiApiError.message);
      }
    }

    // 2. Supplement with local database (enhanced Indian recipes)
    let localResults = [];
    if (global.MOCK_MODE) {
      localResults = mockData.searchByIngredients(ingredients, {
        matchType,
        limit: Math.max(limit - allRecipes.length, 10)
      });
      console.log(`📊 Found ${localResults.length} recipes from enhanced local database`);
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
      searchSources.local = localResults.length;
    }

    // 3. Remove duplicates with enhanced deduplication
    const uniqueRecipes = allRecipes.filter((recipe, index, self) => {
      return index === self.findIndex(r => {
        // Multiple ways to detect duplicates
        const sameId = (r._id && recipe._id && r._id.toString() === recipe._id.toString());
        const sameSpoonId = (r.spoonacularId && recipe.spoonacularId && r.spoonacularId === recipe.spoonacularId);
        const sameTitle = (r.title && recipe.title &&
          r.title.toLowerCase().replace(/[^a-z0-9]/g, '') ===
          recipe.title.toLowerCase().replace(/[^a-z0-9]/g, ''));

        return sameId || sameSpoonId || sameTitle;
      });
    });

    // 4. Enhanced relevance scoring and sorting
    const scoredRecipes = uniqueRecipes.map(recipe => {
      let relevanceScore = 0;

      // Ingredient match scoring
      ingredients.forEach(ingredient => {
        const ingredientLower = ingredient.toLowerCase();
        if (recipe.title?.toLowerCase().includes(ingredientLower)) relevanceScore += 3;
        if (recipe.summary?.toLowerCase().includes(ingredientLower)) relevanceScore += 1;
        if (recipe.ingredientNames?.some(name => name.includes(ingredientLower))) relevanceScore += 2;
      });

      // Quality scoring
      relevanceScore += (recipe.rating || 4) * 0.5;
      relevanceScore += (recipe.ratingCount || 0) * 0.001;

      // Source priority
      if (recipe.source === 'spoonacular') relevanceScore += 1;
      if (recipe.source === 'indian-traditional') relevanceScore += 2; // Boost Indian recipes

      // Recency boost for local recipes
      if (recipe.source === 'mock' || recipe.source === 'indian-traditional') relevanceScore += 0.5;

      return { ...recipe, relevanceScore };
    });

    // Sort by relevance score
    scoredRecipes.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));

    // 5. Apply advanced filters
    let filteredRecipes = scoredRecipes;

    if (filters.cuisine) {
      filteredRecipes = filteredRecipes.filter(recipe =>
        recipe.cuisines && recipe.cuisines.some(cuisine =>
          cuisine.toLowerCase().includes(filters.cuisine.toLowerCase())
        )
      );
    }

    if (filters.diet) {
      filteredRecipes = filteredRecipes.filter(recipe => {
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
      filteredRecipes = filteredRecipes.filter(recipe =>
        (recipe.readyInMinutes || 30) <= maxTime
      );
    }

    if (filters.difficulty) {
      filteredRecipes = filteredRecipes.filter(recipe =>
        (recipe.difficulty || 'Medium').toLowerCase() === filters.difficulty.toLowerCase()
      );
    }

    // 6. Enhanced recipe formatting
    const enhancedRecipes = filteredRecipes.slice(0, limit).map((recipe, index) => ({
      ...recipe,
      searchRank: index + 1,
      image: recipe.image || `https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=636&h=393&fit=crop&auto=format&q=80`,
      title: recipe.title || recipe.name,
      summary: recipe.summary || 'A delicious recipe perfect for your ingredients',
      readyInMinutes: recipe.readyInMinutes || 30,
      servings: recipe.servings || 4,
      rating: recipe.rating || (recipe.spoonacularScore ? recipe.spoonacularScore / 20 : 4.0),
      cuisines: recipe.cuisines && recipe.cuisines.length > 0 ? recipe.cuisines : ['International'],
      tags: recipe.tags || [],
      lastUpdated: new Date(),
      // Add search metadata
      searchMetadata: {
        ingredientMatches: ingredients.filter(ing =>
          recipe.title?.toLowerCase().includes(ing.toLowerCase()) ||
          recipe.ingredientNames?.some(name => name.includes(ing.toLowerCase()))
        ),
        relevanceScore: recipe.relevanceScore,
        apiSource: recipe.source
      }
    }));

    console.log(`🎯 Enhanced search completed: ${enhancedRecipes.length} recipes found`);
    console.log(`📊 Sources: Multi-API(${searchSources.multiAPI}), Local(${searchSources.local}), Spoonacular(${searchSources.spoonacular})`);

    // 7. Generate intelligent suggestions if no results
    const suggestions = enhancedRecipes.length === 0 ? [
      'Try popular Indian combinations: "rice dal", "chapati paneer", "potato onion"',
      'Use common ingredients: chicken, tomato, onion, garlic',
      'Check spelling of ingredient names',
      'Try single ingredients first, then combinations',
      'Remove dietary filters to see more options'
    ] : [];

    res.json({
      recipes: enhancedRecipes,
      totalFound: enhancedRecipes.length,
      totalBeforeFiltering: scoredRecipes.length,
      searchedIngredients: ingredients,
      appliedFilters: filters,
      sources: {
        multiAPI: searchSources.multiAPI,
        local: searchSources.local,
        spoonacular: searchSources.spoonacular,
        breakdown: {
          spoonacular: enhancedRecipes.filter(r => r.source === 'spoonacular').length,
          edamam: enhancedRecipes.filter(r => r.source === 'edamam').length,
          recipepuppy: enhancedRecipes.filter(r => r.source === 'recipepuppy').length,
          local: enhancedRecipes.filter(r => r.source === 'mock' || r.source === 'indian-traditional').length
        }
      },
      searchEnhancements: {
        multiApiUsed: useMultiAPI,
        relevanceScoring: true,
        indianRecipeFocus: true,
        duplicateRemoval: true
      },
      message: enhancedRecipes.length > 0 ?
        `Found ${enhancedRecipes.length} delicious recipes using multiple APIs and enhanced search!` :
        'No recipes found. Try our suggestions below.',
      suggestions: suggestions,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in enhanced ingredient search:', error);
    res.status(500).json({
      message: 'Error searching recipes',
      error: error.message,
      fallbackSuggestion: 'Try simpler ingredient searches like "rice" or "chicken"'
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

// Get daily featured recipe with enhanced API support
router.get('/daily/featured', async (req, res) => {
  try {
    // Try multi-API service first for diverse content
    try {
      const featuredRecipe = await multiApiRecipeService.getFeaturedRecipeOfTheDay();
      if (featuredRecipe) {
        return res.json({
          ...featuredRecipe,
          isFeatured: true,
          featuredReason: 'Popular Indian recipe from our enhanced database',
          featuredDate: new Date().toISOString().split('T')[0]
        });
      }
    } catch (apiError) {
      console.log('Multi-API featured recipe failed, using fallback:', apiError.message);
    }

    // Fallback to mock data
    if (global.MOCK_MODE) {
      const mockFeatured = mockData.getDailyRecipe();
      return res.json({
        ...mockFeatured,
        isFeatured: true,
        featuredReason: 'Traditional recipe perfect for today',
        featuredDate: new Date().toISOString().split('T')[0]
      });
    }

    // Database fallback
    const dailyRecipe = await recipeService.getFeaturedRecipeOfTheDay();
    if (!dailyRecipe) {
      const fallbackRecipe = await Recipe.findOne({
        rating: { $gte: 4.0 }
      }).sort({ aggregateLikes: -1 });

      return res.json({
        ...fallbackRecipe?.toObject(),
        isFeatured: true,
        featuredReason: 'Highly rated community favorite',
        featuredDate: new Date().toISOString().split('T')[0]
      });
    }

    res.json({
      ...dailyRecipe,
      isFeatured: true,
      featuredReason: 'Recipe of the day',
      featuredDate: new Date().toISOString().split('T')[0]
    });

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
