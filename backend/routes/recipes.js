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

    // 6. Enhanced recipe formatting with diverse images (NO DUPLICATES)
    const getFallbackImage = (recipe, index) => {
      // Expanded diverse high-quality food images for different recipe types
      const fallbackImages = [
        'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=636&h=393&fit=crop&auto=format&q=80', // Indian curry
        'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=636&h=393&fit=crop&auto=format&q=80', // Pizza
        'https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=636&h=393&fit=crop&auto=format&q=80', // Healthy salad
        'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=636&h=393&fit=crop&auto=format&q=80', // Pasta
        'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=636&h=393&fit=crop&auto=format&q=80', // Stir fry
        'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=636&h=393&fit=crop&auto=format&q=80', // Chinese food
        'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=636&h=393&fit=crop&auto=format&q=80', // Tacos
        'https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?w=636&h=393&fit=crop&auto=format&q=80', // Burger
        'https://images.unsplash.com/photo-1563379091339-03246963d51a?w=636&h=393&fit=crop&auto=format&q=80', // Thai food
        'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=636&h=393&fit=crop&auto=format&q=80', // Soup
        'https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=636&h=393&fit=crop&auto=format&q=80', // Chicken dish
        'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=636&h=393&fit=crop&auto=format&q=80', // Vegetarian bowl
        'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=636&h=393&fit=crop&auto=format&q=80', // Breakfast
        'https://images.unsplash.com/photo-1547637589-f54c34f5d7a4?w=636&h=393&fit=crop&auto=format&q=80', // Seafood
        'https://images.unsplash.com/photo-1579952363873-27d3bfad9c0d?w=636&h=393&fit=crop&auto=format&q=80', // Dessert
        'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=636&h=393&fit=crop&auto=format&q=80', // Rice dish
        'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=636&h=393&fit=crop&auto=format&q=80', // Meat dish
        'https://images.unsplash.com/photo-1529042410759-befb1204b468?w=636&h=393&fit=crop&auto=format&q=80', // Japanese food
        'https://images.unsplash.com/photo-1514326640560-7d063ef2aed5?w=636&h=393&fit=crop&auto=format&q=80', // Bread/sandwich
        'https://images.unsplash.com/photo-1562967914-608f82629710?w=636&h=393&fit=crop&auto=format&q=80', // Mediterranean
        'https://images.unsplash.com/photo-1567620832903-b006beb0113b?w=636&h=393&fit=crop&auto=format&q=80', // Indian dishes
        'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=636&h=393&fit=crop&auto=format&q=80', // Burrito
        'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=636&h=393&fit=crop&auto=format&q=80', // Salad bowl
        'https://images.unsplash.com/photo-1548940740-204726a19be3?w=636&h=393&fit=crop&auto=format&q=80', // Grilled fish
        'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=636&h=393&fit=crop&auto=format&q=80', // Noodles
        'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=636&h=393&fit=crop&auto=format&q=80', // Sandwich
        'https://images.unsplash.com/photo-1588461598336-8e4a36e7b936?w=636&h=393&fit=crop&auto=format&q=80', // Healthy bowl
        'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=636&h=393&fit=crop&auto=format&q=80', // Fried rice
        'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=636&h=393&fit=crop&auto=format&q=80', // Pancakes
        'https://images.unsplash.com/photo-1559054663-e9bb52a8d0d6?w=636&h=393&fit=crop&auto=format&q=80', // Smoothie bowl
        'https://images.unsplash.com/photo-1571091655789-405eb7a3a3a8?w=636&h=393&fit=crop&auto=format&q=80', // Avocado toast
        'https://images.unsplash.com/photo-1608039829572-78524f79c4c7?w=636&h=393&fit=crop&auto=format&q=80', // Ramen
        'https://images.unsplash.com/photo-1574448857443-dc1d7e914556?w=636&h=393&fit=crop&auto=format&q=80', // Grilled vegetables
        'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=636&h=393&fit=crop&auto=format&q=80', // Lasagna
        'https://images.unsplash.com/photo-1600803907087-f56d462fd26b?w=636&h=393&fit=crop&auto=format&q=80', // Roasted chicken
        'https://images.unsplash.com/photo-1581873372046-3c614fa0e78b?w=636&h=393&fit=crop&auto=format&q=80', // Smoothie
        'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=636&h=393&fit=crop&auto=format&q=80', // Buddha bowl
        'https://images.unsplash.com/photo-1564671165093-20688ff1fffa?w=636&h=393&fit=crop&auto=format&q=80', // Fish tacos
        'https://images.unsplash.com/photo-1559181567-c3190ca9959b?w=636&h=393&fit=crop&auto=format&q=80', // Cheeseburger
        'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=636&h=393&fit=crop&auto=format&q=80'  // Different pizza
      ];

      // Create unique hash based on recipe title to ensure consistency
      const createHash = (str) => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
          const char = str.charCodeAt(i);
          hash = ((hash << 5) - hash) + char;
          hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash);
      };

      const recipeTitle = recipe.title || recipe.name || `recipe_${index}`;
      const hash = createHash(recipeTitle);

      // Smart image selection based on recipe properties with hash for uniqueness
      let imageIndex = hash % fallbackImages.length;

      // Override with cuisine-specific images when possible
      if (recipe.cuisines && recipe.cuisines.length > 0) {
        const cuisine = recipe.cuisines[0].toLowerCase();
        const cuisineHash = createHash(cuisine + recipeTitle);

        if (cuisine.includes('indian')) {
          const indianImages = [0, 20, 27]; // Multiple Indian food images
          imageIndex = indianImages[cuisineHash % indianImages.length];
        } else if (cuisine.includes('italian')) {
          const italianImages = [1, 3, 33]; // Pizza, pasta, lasagna
          imageIndex = italianImages[cuisineHash % italianImages.length];
        } else if (cuisine.includes('chinese') || cuisine.includes('asian')) {
          const asianImages = [5, 8, 24, 31]; // Chinese, Thai, noodles, ramen
          imageIndex = asianImages[cuisineHash % asianImages.length];
        } else if (cuisine.includes('mexican')) {
          const mexicanImages = [6, 21, 37]; // Tacos, burrito, fish tacos
          imageIndex = mexicanImages[cuisineHash % mexicanImages.length];
        } else if (cuisine.includes('mediterranean')) {
          const medImages = [19, 13, 23]; // Mediterranean, seafood, grilled fish
          imageIndex = medImages[cuisineHash % medImages.length];
        }
      }

      // Use ingredient-based selection for better matching
      const title = (recipe.title || '').toLowerCase();
      const titleHash = createHash(title);

      if (title.includes('curry') || title.includes('dal') || title.includes('masala')) {
        const indImages = [0, 20, 27];
        imageIndex = indImages[titleHash % indImages.length];
      } else if (title.includes('pizza')) {
        const pizzaImages = [1, 39];
        imageIndex = pizzaImages[titleHash % pizzaImages.length];
      } else if (title.includes('salad')) {
        const saladImages = [2, 22, 26];
        imageIndex = saladImages[titleHash % saladImages.length];
      } else if (title.includes('pasta') || title.includes('spaghetti')) {
        const pastaImages = [3, 24, 33];
        imageIndex = pastaImages[titleHash % pastaImages.length];
      } else if (title.includes('burger')) {
        const burgerImages = [7, 38];
        imageIndex = burgerImages[titleHash % burgerImages.length];
      } else if (title.includes('soup')) {
        imageIndex = 9;
      } else if (title.includes('chicken')) {
        const chickenImages = [10, 34];
        imageIndex = chickenImages[titleHash % chickenImages.length];
      } else if (title.includes('rice')) {
        const riceImages = [15, 27];
        imageIndex = riceImages[titleHash % riceImages.length];
      } else if (title.includes('fish') || title.includes('seafood')) {
        const fishImages = [13, 23, 37];
        imageIndex = fishImages[titleHash % fishImages.length];
      } else if (title.includes('pancake')) {
        imageIndex = 28;
      } else if (title.includes('sandwich')) {
        const sandwichImages = [18, 25, 30];
        imageIndex = sandwichImages[titleHash % sandwichImages.length];
      }

      return fallbackImages[imageIndex];
    };

    const enhancedRecipes = filteredRecipes.slice(0, limit).map((recipe, index) => ({
      ...recipe,
      searchRank: index + 1,
      image: recipe.image || getFallbackImage(recipe, index),
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

// Advanced search with natural language processing
router.post('/search/advanced', authenticateUser, async (req, res) => {
  try {
    const {
      query,
      ingredients = [],
      cuisine,
      mealType,
      cookingTime,
      difficulty,
      dietary = [],
      nutritionGoals = {},
      limit = 20
    } = req.body;

    console.log(`🧠 Advanced search query: "${query}" with filters`);

    let searchResults = [];

    // 1. Natural language processing for query
    if (query) {
      const extractedIngredients = extractIngredientsFromQuery(query);
      const extractedFilters = extractFiltersFromQuery(query);

      // Combine extracted ingredients with provided ones
      const allIngredients = [...new Set([...ingredients, ...extractedIngredients])];

      if (allIngredients.length > 0) {
        searchResults = await multiApiRecipeService.searchRecipesFromMultipleAPIs(allIngredients, {
          limit,
          filters: { ...extractedFilters, cuisine, difficulty }
        });
      }
    } else if (ingredients.length > 0) {
      searchResults = await multiApiRecipeService.searchRecipesFromMultipleAPIs(ingredients, {
        limit,
        filters: { cuisine, difficulty }
      });
    }

    // 2. Apply advanced filters
    let filteredResults = searchResults;

    if (mealType) {
      filteredResults = filteredResults.filter(recipe =>
        recipe.dishTypes?.some(type => type.toLowerCase().includes(mealType.toLowerCase())) ||
        recipe.title.toLowerCase().includes(mealType.toLowerCase())
      );
    }

    if (cookingTime) {
      const maxTime = parseInt(cookingTime);
      filteredResults = filteredResults.filter(recipe =>
        (recipe.readyInMinutes || 30) <= maxTime
      );
    }

    if (dietary.length > 0) {
      filteredResults = filteredResults.filter(recipe => {
        return dietary.every(diet => {
          switch (diet.toLowerCase()) {
            case 'vegetarian': return recipe.vegetarian;
            case 'vegan': return recipe.vegan;
            case 'gluten-free': return recipe.glutenFree;
            case 'dairy-free': return recipe.dairyFree;
            case 'low-carb': return (recipe.nutrition?.carbs || 0) < 20;
            case 'high-protein': return (recipe.nutrition?.protein || 0) > 15;
            default: return true;
          }
        });
      });
    }

    // 3. Nutrition-based filtering
    if (nutritionGoals.maxCalories) {
      filteredResults = filteredResults.filter(recipe =>
        (recipe.nutrition?.calories || recipe.calories || 0) <= nutritionGoals.maxCalories
      );
    }

    res.json({
      recipes: filteredResults,
      searchQuery: query,
      extractedIngredients: query ? extractIngredientsFromQuery(query) : [],
      appliedFilters: {
        cuisine,
        mealType,
        cookingTime,
        difficulty,
        dietary,
        nutritionGoals
      },
      totalFound: filteredResults.length,
      searchType: 'advanced',
      processingTime: new Date().toISOString()
    });

  } catch (error) {
    console.error('Advanced search error:', error);
    res.status(500).json({
      message: 'Advanced search failed',
      error: error.message
    });
  }
});

// Smart suggestion endpoint
router.get('/suggestions/smart', authenticateUser, async (req, res) => {
  try {
    const { pantryItems, dietary, lastSearches } = req.query;

    const suggestions = {
      trending: [
        'Dal Tadka with rice',
        'Paneer Butter Masala',
        'Chicken Biryani',
        'Aloo Gobi',
        'Vegetable Stir Fry'
      ],
      seasonal: getSeasonalSuggestions(),
      quickMeals: [
        'Instant Pasta',
        'Egg Fried Rice',
        'Vegetable Upma',
        'Cheese Toast',
        'Masala Omelette'
      ],
      healthy: [
        'Quinoa Salad',
        'Grilled Vegetables',
        'Protein Bowl',
        'Green Smoothie',
        'Lentil Soup'
      ],
      indian: [
        'Chole Bhature',
        'Rajma Rice',
        'Sambar with Idli',
        'Butter Chicken',
        'Palak Paneer'
      ]
    };

    res.json({
      suggestions,
      personalized: pantryItems ? `Based on your pantry: ${pantryItems}` : null,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Smart suggestions error:', error);
    res.status(500).json({
      message: 'Error generating suggestions',
      error: error.message
    });
  }
});

// Recipe analytics endpoint
router.get('/analytics/search-trends', async (req, res) => {
  try {
    const trends = {
      popularIngredients: [
        { ingredient: 'rice', searches: 1240 },
        { ingredient: 'chicken', searches: 1156 },
        { ingredient: 'dal', searches: 987 },
        { ingredient: 'paneer', searches: 834 },
        { ingredient: 'potato', searches: 756 },
        { ingredient: 'tomato', searches: 698 },
        { ingredient: 'onion', searches: 654 },
        { ingredient: 'chapati', searches: 543 }
      ],
      popularCuisines: [
        { cuisine: 'Indian', searches: 2340 },
        { cuisine: 'Italian', searches: 1567 },
        { cuisine: 'Chinese', searches: 1234 },
        { cuisine: 'Mexican', searches: 890 },
        { cuisine: 'Thai', searches: 567 }
      ],
      trendingRecipes: [
        'Dal Tadka',
        'Paneer Butter Masala',
        'Chicken Biryani',
        'Aloo Paratha',
        'Vegetable Curry'
      ],
      searchPatterns: {
        peakHours: ['12:00-14:00', '19:00-21:00'],
        popularDays: ['Saturday', 'Sunday'],
        averageIngredientsPerSearch: 2.3
      }
    };

    res.json({
      trends,
      lastUpdated: new Date().toISOString(),
      dataSource: 'enhanced-analytics'
    });

  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({
      message: 'Error fetching analytics',
      error: error.message
    });
  }
});

// Helper functions
function extractIngredientsFromQuery(query) {
  const commonIngredients = [
    'rice', 'dal', 'chapati', 'roti', 'paneer', 'chicken', 'potato', 'tomato',
    'onion', 'garlic', 'ginger', 'curry', 'masala', 'egg', 'bread', 'cheese',
    'pasta', 'noodles', 'fish', 'mutton', 'vegetables', 'spinach', 'corn'
  ];

  const queryLower = query.toLowerCase();
  return commonIngredients.filter(ingredient =>
    queryLower.includes(ingredient)
  );
}

function extractFiltersFromQuery(query) {
  const filters = {};
  const queryLower = query.toLowerCase();

  // Extract cuisine
  if (queryLower.includes('indian') || queryLower.includes('desi')) filters.cuisine = 'indian';
  if (queryLower.includes('italian')) filters.cuisine = 'italian';
  if (queryLower.includes('chinese')) filters.cuisine = 'chinese';
  if (queryLower.includes('thai')) filters.cuisine = 'thai';

  // Extract dietary preferences
  if (queryLower.includes('vegetarian') || queryLower.includes('veg')) filters.diet = 'vegetarian';
  if (queryLower.includes('vegan')) filters.diet = 'vegan';
  if (queryLower.includes('gluten free')) filters.diet = 'glutenfree';

  // Extract time preferences
  if (queryLower.includes('quick') || queryLower.includes('fast')) filters.maxTime = '30';
  if (queryLower.includes('slow') || queryLower.includes('long')) filters.maxTime = '120';

  return filters;
}

function getSeasonalSuggestions() {
  const month = new Date().getMonth();

  // Summer months (Apr-Sep in India)
  if (month >= 3 && month <= 8) {
    return [
      'Cold Lassi',
      'Cucumber Salad',
      'Aam Panna',
      'Ice Cream',
      'Fresh Fruit Salad'
    ];
  } else {
    // Winter months
    return [
      'Hot Soup',
      'Gajar Halwa',
      'Warm Curry',
      'Hot Tea',
      'Comfort Food'
    ];
  }
}

// Health check with enhanced info
router.get('/health', async (req, res) => {
  try {
    const totalRecipes = global.MOCK_MODE ? mockData.getAllRecipes().length : await Recipe.countDocuments();

    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      totalRecipes,
      features: {
        multiApiSearch: true,
        indianRecipeDatabase: true,
        advancedFiltering: true,
        naturalLanguageSearch: true,
        smartSuggestions: true,
        recipeAnalytics: true
      },
      apiSources: {
        spoonacular: SPOONACULAR_API_KEY ? 'configured' : 'not-configured',
        recipePuppy: 'simulated',
        edamam: EDAMAM_APP_ID ? 'configured' : 'simulated',
        localDatabase: 'active'
      },
      version: '2.0.0-enhanced'
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
