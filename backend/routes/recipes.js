const express = require('express');
const Recipe = require('../models/Recipe');
const User = require('../models/User');
const recipeService = require('../services/recipeService');
const aiService = require('../services/aiService');
const nlpService = require('../services/nlpService');
const spellCorrectionService = require('../services/spellCorrectionService');
const spacySpoonacularService = require('../services/spacySpoonacularService');
const mockData = require('../mockData');
const router = express.Router();

// Middleware for authentication (optional for most routes)
const authenticateUser = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (token) {
      // In a real app, verify JWT token here
      // For now, just pass through
      req.userId = 'demo-user-id';
    }
    next();
  } catch (error) {
    next();
  }
};

// GET all recipes with advanced filtering and search
router.get('/', authenticateUser, async (req, res) => {
    try {
    // Check if we're in mock mode first
    if (global.MOCK_MODE) {
      const filters = {
        search: req.query.search,
        leftoverFriendly: req.query.leftoverFriendly === 'true',
        quickMeal: req.query.quickMeal === 'true',
        vegetarian: req.query.vegetarian === 'true',
        maxTime: req.query.maxTime ? parseInt(req.query.maxTime) : null
      };

      return res.json(mockData.searchRecipes(filters));
    }

    const {
      search,
      category,
      difficulty,
      ingredients,
      maxTime,
      minRating,
      leftoverFriendly,
      quickMeal,
      vegetarian,
      vegan,
      glutenFree,
      dairyFree,
      maxCalories,
      minProtein,
      maxCarbs,
      cuisine,
      dishType,
      page = 1,
      limit = 12,
      sortBy = 'rating'
    } = req.query;

    // Build query
    let query = {};
    
    // Text search
    if (search) {
      query.$text = { $search: search };
    }
    
    // Category filters
    if (category) query.dishTypes = category;
    if (difficulty) query.difficulty = difficulty;
    if (cuisine) query.cuisines = cuisine;
    if (dishType) query.dishTypes = dishType;
    
    // Dietary filters
    if (vegetarian === 'true') query.vegetarian = true;
    if (vegan === 'true') query.vegan = true;
    if (glutenFree === 'true') query.glutenFree = true;
    if (dairyFree === 'true') query.dairyFree = true;
    
    // Time and quality filters
    if (maxTime) query.readyInMinutes = { $lte: parseInt(maxTime) };
    if (minRating) query.rating = { $gte: parseFloat(minRating) };
    if (leftoverFriendly === 'true') query.leftoverFriendly = true;
    if (quickMeal === 'true') query.quickMeal = true;
    
    // Nutrition filters
    if (maxCalories) query['nutrition.calories'] = { $lte: parseInt(maxCalories) };
    if (minProtein) query['nutrition.protein'] = { $gte: parseInt(minProtein) };
    if (maxCarbs) query['nutrition.carbs'] = { $lte: parseInt(maxCarbs) };
    
    // Ingredient filter
    if (ingredients) {
      const ingredientList = ingredients.split(',').map(ing => ing.trim());
      const ingredientRegexes = ingredientList.map(ing => new RegExp(ing, 'i'));
      query.ingredientNames = { $in: ingredientRegexes };
    }
    
    // Build sort options
    let sortOptions = {};
    switch (sortBy) {
      case 'rating':
        sortOptions = { rating: -1, aggregateLikes: -1 };
        break;
      case 'time':
        sortOptions = { readyInMinutes: 1 };
        break;
      case 'healthy':
        sortOptions = { healthScore: -1, rating: -1 };
        break;
      case 'popular':
        sortOptions = { aggregateLikes: -1, rating: -1 };
        break;
      case 'newest':
        sortOptions = { createdAt: -1 };
        break;
      default:
        sortOptions = { rating: -1, createdAt: -1 };
    }
    
    // Execute query with pagination
    const skip = (page - 1) * limit;
    const recipes = await Recipe.find(query)
      .select('-userRatings') // Exclude detailed user ratings for performance
      .sort(sortOptions)
      .limit(parseInt(limit))
      .skip(skip)
      .lean();
    
    // Get total count for pagination
    const total = await Recipe.countDocuments(query);
    
    // Add view tracking
    if (recipes.length > 0) {
      const recipeIds = recipes.map(r => r._id);
      await Recipe.updateMany(
        { _id: { $in: recipeIds } },
        { $inc: { viewCount: 1 } }
      );
    }
    
    res.json({
      recipes,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        limit: parseInt(limit)
      },
      filters: {
        categories: await Recipe.distinct('dishTypes'),
        cuisines: await Recipe.distinct('cuisines'),
        difficulties: await Recipe.distinct('difficulty')
      }
    });
    
  } catch (error) {
    console.error('Error fetching recipes:', error);
    res.status(500).json({ 
      message: 'Error fetching recipes', 
      error: error.message 
    });
  }
});

// POST smart recipe search by ingredients (Enhanced)
router.post('/search-by-ingredients', authenticateUser, async (req, res) => {
  try {
    const {
      ingredients,
      matchType = 'any',
      preferences = {},
      nutrition = {},
      maxReadyTime,
      useAI = false,
      useSpoonacular = true,
      limit = 20
    } = req.body;

    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return res.status(400).json({
        message: 'Please provide at least one ingredient'
      });
    }

    // Process ingredients through NLP service for better recognition
    const processedIngredients = ingredients.map(ingredient => {
      const normalized = nlpService.normalizeIngredient(ingredient);
      const extracted = nlpService.extractIngredients(ingredient);
      return extracted.length > 0 ? extracted : [normalized || ingredient];
    }).flat();

    console.log(`🔍 Original ingredients: [${ingredients.join(', ')}]`);
    console.log(`🧠 NLP processed ingredients: [${processedIngredients.join(', ')}]`);

    // Use processed ingredients for search
    const searchIngredients = [...new Set([...ingredients, ...processedIngredients])]; // Combine original and processed

    let recipes = [];
    let spoonacularResults = [];

    // Try Spoonacular API first for global recipe search
    if (useSpoonacular) {
      try {
        spoonacularResults = await recipeService.searchByIngredients(searchIngredients, {
          number: Math.min(limit, 10), // Get some from Spoonacular
          ranking: matchType === 'all' ? 2 : 1, // 1 = maximize used, 2 = minimize missing
          ignorePantry: true
        });

        if (spoonacularResults && spoonacularResults.length > 0) {
          recipes = recipes.concat(spoonacularResults);
        }
      } catch (spoonacularError) {
        console.error('Spoonacular search failed:', spoonacularError.message);
      }
    }

    // Use AI-enhanced search if requested and user preferences available
    if (useAI && req.userId && !global.MOCK_MODE) {
      try {
        const user = await User.findById(req.userId);
        if (user) {
          const aiRecipes = await aiService.generatePersonalizedRecommendations(user, searchIngredients);
          if (aiRecipes && aiRecipes.length > 0) {
            recipes = recipes.concat(aiRecipes);
          }
        }
      } catch (aiError) {
        console.error('AI search failed, falling back to standard search:', aiError);
      }
    }

    // Always search local database and merge results (use mock search in mock mode)
    let localRecipes = [];
    if (global.MOCK_MODE) {
      // Use enhanced mock search with processed ingredients
      const mockData = require('../mockData');
      localRecipes = mockData.searchByIngredients(searchIngredients, {
        matchType,
        limit: limit - recipes.length
      });
      console.log(`🔍 Mock search for [${searchIngredients.join(', ')}] found ${localRecipes.length} recipes`);
    } else {
      try {
        localRecipes = await Recipe.findByIngredients({
          ingredients: searchIngredients,
          matchType,
          preferences,
          nutrition: {
            maxCalories: nutrition.maxCalories,
            minProtein: nutrition.minProtein,
            maxCarbs: nutrition.maxCarbs
          },
          maxReadyTime,
          limit: limit - recipes.length
        });
      } catch (dbError) {
        console.error('Local database search failed:', dbError.message);
        localRecipes = [];
      }
    }

    if (localRecipes && localRecipes.length > 0) {
      recipes = recipes.concat(localRecipes);
    }

    // Remove duplicates and sort by relevance
    const uniqueRecipes = recipes.filter((recipe, index, self) => {
      return index === self.findIndex(r =>
        (r._id && r._id.toString()) === (recipe._id && recipe._id.toString()) ||
        (r.spoonacularId && recipe.spoonacularId && r.spoonacularId === recipe.spoonacularId) ||
        (r.title && recipe.title && r.title.toLowerCase() === recipe.title.toLowerCase())
      );
    });

    // Sort by match score and relevance
    uniqueRecipes.sort((a, b) => {
      const scoreA = a.matchScore || 0;
      const scoreB = b.matchScore || 0;
      if (scoreA !== scoreB) return scoreB - scoreA;

      const ratingA = a.rating || 0;
      const ratingB = b.rating || 0;
      return ratingB - ratingA;
    });

    // Limit results
    recipes = uniqueRecipes.slice(0, limit);
    
    // Track search for analytics and Recipe of the Day (skip in mock mode)
    if (req.userId && !global.MOCK_MODE) {
      try {
        await User.findByIdAndUpdate(req.userId, {
          $push: {
            searchHistory: {
              $each: [{
                ingredients,
                filters: { matchType, preferences, nutrition },
                resultsCount: recipes.length,
                searchedAt: new Date()
              }],
              $slice: -50 // Keep only last 50 searches
            }
          }
        });
      } catch (trackingError) {
        console.error('Error tracking search:', trackingError);
      }
    }

    // Track search popularity for Recipe of the Day (skip in mock mode)
    if (!global.MOCK_MODE) {
      try {
        // Update search count for returned recipes
        const recipeIds = recipes.map(r => r._id).filter(Boolean);
        if (recipeIds.length > 0) {
          await Recipe.updateMany(
            { _id: { $in: recipeIds } },
            { $inc: { searchCount: 1 } }
          );
        }

        // Track ingredient searches globally
        await Promise.all(ingredients.map(async (ingredient) => {
          await Recipe.updateMany(
            { ingredientNames: new RegExp(ingredient, 'i') },
            { $inc: { ingredientSearchCount: 1 } }
          );
        }));
      } catch (trackingError) {
        console.error('Error tracking recipe popularity:', trackingError);
      }
    }
    
    res.json({
      recipes,
      totalFound: recipes.length,
      searchedIngredients: ingredients,
      matchType,
      sources: {
        spoonacular: spoonacularResults.length,
        local: localRecipes ? localRecipes.length : 0,
        ai: useAI && recipes.some(r => r.aiRecommended) ? recipes.filter(r => r.aiRecommended).length : 0
      },
      aiEnhanced: useAI && recipes.some(r => r.aiRecommended),
      globalSearch: useSpoonacular && spoonacularResults.length > 0
    });
    
  } catch (error) {
    console.error('Error in ingredient search:', error);
    res.status(500).json({ 
      message: 'Error searching recipes', 
      error: error.message 
    });
  }
});

// GET recipe by ID with enhanced details
router.get('/:id', authenticateUser, async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    
    // Increment view count
    recipe.viewCount = (recipe.viewCount || 0) + 1;
    await recipe.save();
    
    // Add to user's recently viewed if authenticated
    if (req.userId) {
      try {
        await User.findByIdAndUpdate(req.userId, {
          $pull: { recentlyViewed: { recipeId: recipe._id } }, // Remove if already exists
        });
        await User.findByIdAndUpdate(req.userId, {
          $push: { 
            recentlyViewed: {
              $each: [{ recipeId: recipe._id, viewedAt: new Date() }],
              $position: 0,
              $slice: 20 // Keep only last 20 viewed recipes
            }
          }
        });
      } catch (trackingError) {
        console.error('Error tracking viewed recipe:', trackingError);
      }
    }
    
    // Get AI-enhanced cooking tips if not already generated
    let cookingTips = null;
    if (req.userId) {
      try {
        const user = await User.findById(req.userId);
        if (user) {
          cookingTips = await aiService.generateCookingTips(recipe, user.cookingSkillLevel);
        }
      } catch (aiError) {
        console.error('Error generating cooking tips:', aiError);
      }
    }
    
    // Get similar recipes
    const similarRecipes = await Recipe.find({
      _id: { $ne: recipe._id },
      $or: [
        { dishTypes: { $in: recipe.dishTypes } },
        { cuisines: { $in: recipe.cuisines } },
        { ingredientNames: { $in: recipe.ingredientNames?.slice(0, 3) } }
      ]
    })
    .limit(6)
    .select('title image rating readyInMinutes difficulty')
    .sort({ rating: -1 });
    
    const responseData = {
      ...recipe.toObject(),
      similarRecipes,
      cookingTips
    };
    
    res.json(responseData);
    
  } catch (error) {
    console.error('Error fetching recipe:', error);
    res.status(500).json({ 
      message: 'Error fetching recipe', 
      error: error.message 
    });
  }
});

// POST create new recipe
router.post('/', authenticateUser, async (req, res) => {
  try {
    const recipeData = {
      ...req.body,
      createdBy: req.userId,
      source: 'user'
    };
    
    const recipe = new Recipe(recipeData);
    const savedRecipe = await recipe.save();
    
    // Add to user's recipes if authenticated
    if (req.userId) {
      await User.findByIdAndUpdate(req.userId, {
        $push: { myRecipes: savedRecipe._id }
      });
    }
    
    res.status(201).json(savedRecipe);
    
  } catch (error) {
    console.error('Error creating recipe:', error);
    res.status(400).json({ 
      message: 'Error creating recipe', 
      error: error.message 
    });
  }
});

// PUT update recipe
router.put('/:id', authenticateUser, async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    
    // Check if user owns the recipe
    if (recipe.createdBy && !recipe.createdBy.equals(req.userId)) {
      return res.status(403).json({ message: 'Not authorized to update this recipe' });
    }
    
    Object.assign(recipe, req.body);
    recipe.lastUpdated = new Date();
    
    const updatedRecipe = await recipe.save();
    res.json(updatedRecipe);
    
  } catch (error) {
    console.error('Error updating recipe:', error);
    res.status(400).json({ 
      message: 'Error updating recipe', 
      error: error.message 
    });
  }
});

// POST rate recipe
router.post('/:id/rate', authenticateUser, async (req, res) => {
  try {
    const { rating } = req.body;
    const recipeId = req.params.id;
    
    if (!req.userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }
    
    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    
    await recipe.addRating(req.userId, rating);
    
    res.json({ 
      message: 'Rating added successfully',
      newRating: recipe.rating,
      ratingCount: recipe.ratingCount
    });
    
  } catch (error) {
    console.error('Error rating recipe:', error);
    res.status(500).json({ 
      message: 'Error rating recipe', 
      error: error.message 
    });
  }
});

// POST toggle favorite
router.post('/:id/favorite', authenticateUser, async (req, res) => {
  try {
    const recipeId = req.params.id;
    
    if (!req.userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    
    const isFavorite = user.favorites.includes(recipeId);
    
    if (isFavorite) {
      // Remove from favorites
      user.favorites.pull(recipeId);
      recipe.favoriteCount = Math.max(0, (recipe.favoriteCount || 0) - 1);
    } else {
      // Add to favorites
      user.favorites.push(recipeId);
      recipe.favoriteCount = (recipe.favoriteCount || 0) + 1;
    }
    
    await Promise.all([user.save(), recipe.save()]);
    
    res.json({ 
      message: isFavorite ? 'Removed from favorites' : 'Added to favorites',
      isFavorite: !isFavorite,
      favoriteCount: recipe.favoriteCount
    });
    
  } catch (error) {
    console.error('Error toggling favorite:', error);
    res.status(500).json({ 
      message: 'Error toggling favorite', 
      error: error.message 
    });
  }
});

// GET user's favorite recipes
router.get('/user/:userId/favorites', authenticateUser, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .populate({
        path: 'favorites',
        select: 'title image rating readyInMinutes difficulty cuisines dishTypes nutrition',
        options: { sort: { createdAt: -1 } }
      });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user.favorites || []);
    
  } catch (error) {
    console.error('Error fetching favorites:', error);
    res.status(500).json({ 
      message: 'Error fetching favorites', 
      error: error.message 
    });
  }
});

// GET recipe categories and filters
router.get('/meta/filters', async (req, res) => {
    try {
    // Check if we're in mock mode first
    if (global.MOCK_MODE) {
      return res.json({
        categories: ['Main Course', 'Lunch', 'Appetizer', 'Dessert', 'Breakfast', 'Dinner', 'Snack', 'Soup', 'Salad', 'Side Dish'],
        cuisines: ['Asian', 'Italian', 'American', 'Mexican', 'Indian', 'Mediterranean', 'French', 'Thai'],
        difficulties: ['Easy', 'Medium', 'Hard'],
        dietaryOptions: [
          'vegetarian',
          'vegan',
          'glutenFree',
          'dairyFree',
          'ketogenic',
          'lowFodmap',
          'whole30'
        ]
      });
    }

    const [categories, cuisines, difficulties] = await Promise.all([
      Recipe.distinct('dishTypes'),
      Recipe.distinct('cuisines'),
      Recipe.distinct('difficulty')
    ]);
    
    res.json({
      categories: categories.filter(Boolean),
      cuisines: cuisines.filter(Boolean),
      difficulties: difficulties.filter(Boolean),
      dietaryOptions: [
        'vegetarian',
        'vegan', 
        'glutenFree',
        'dairyFree',
        'ketogenic',
        'lowFodmap',
        'whole30'
      ]
    });
    
  } catch (error) {
    console.error('Error fetching filters:', error);
    res.status(500).json({ 
      message: 'Error fetching filters', 
      error: error.message 
    });
  }
});

// GET daily featured recipe (based on popular searches and trends)
router.get('/daily/featured', async (req, res) => {
  try {
    // Check if we're in mock mode first
    if (global.MOCK_MODE) {
      return res.json(mockData.getDailyRecipe());
    }

    // Get the most frequently searched and highly rated recipe
    const dailyRecipe = await recipeService.getFeaturedRecipeOfTheDay();

    if (!dailyRecipe) {
      // Fallback to a highly rated recipe
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

// POST generate shopping list for recipe
router.post('/:id/shopping-list', authenticateUser, async (req, res) => {
  try {
    const recipeId = req.params.id;
    
    if (!req.userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const shoppingList = await recipeService.generateShoppingList(
      recipeId, 
      user.kitchenInventory
    );
    
    // Add items to user's shopping list
    await user.addToShoppingList(shoppingList);
    
    res.json({
      message: 'Shopping list generated successfully',
      items: shoppingList,
      addedCount: shoppingList.length
    });
    
  } catch (error) {
    console.error('Error generating shopping list:', error);
    res.status(500).json({ 
      message: 'Error generating shopping list', 
      error: error.message 
    });
  }
});

// GET personalized recommendations
router.get('/recommendations/personalized', authenticateUser, async (req, res) => {
  try {
    if (!req.userId) {
      // Return popular recipes for non-authenticated users
      const popularRecipes = await Recipe.find({ rating: { $gte: 4.0 } })
        .sort({ aggregateLikes: -1, rating: -1 })
        .limit(10)
        .select('title image rating readyInMinutes difficulty leftoverFriendly');
      
      return res.json({
        recipes: popularRecipes,
        type: 'popular',
        message: 'Popular recipes for everyone'
      });
    }
    
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const availableIngredients = user.getAvailableIngredients()
      .map(item => item.ingredient);
    
    // Get AI-powered personalized recommendations
    const recommendations = await aiService.generatePersonalizedRecommendations(
      user, 
      availableIngredients
    );
    
    res.json({
      recipes: recommendations,
      type: 'personalized',
      basedOn: {
        skillLevel: user.cookingSkillLevel,
        availableIngredients: availableIngredients.length,
        dietaryPreferences: Object.keys(user.dietaryPreferences)
          .filter(key => user.dietaryPreferences[key])
      }
    });
    
  } catch (error) {
    console.error('Error getting personalized recommendations:', error);
    res.status(500).json({ 
      message: 'Error getting recommendations', 
      error: error.message 
    });
  }
});

// POST import recipes from external APIs
router.post('/import/bulk', authenticateUser, async (req, res) => {
  try {
    const { query = 'leftover', count = 50 } = req.body;
    
    // Only allow admin users to bulk import (in a real app, check admin permissions)
    if (!req.userId || req.userId !== 'admin-user-id') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    const importedRecipes = await recipeService.bulkImportRecipes(query, count);
    
    res.json({
      message: 'Bulk import completed',
      imported: importedRecipes.length,
      recipes: importedRecipes.slice(0, 10) // Return first 10 as preview
    });
    
  } catch (error) {
    console.error('Error bulk importing recipes:', error);
    res.status(500).json({ 
      message: 'Error importing recipes', 
      error: error.message 
    });
  }
});

// GET trending recipes
router.get('/trending/popular', async (req, res) => {
  try {
    const { timeframe = 'week', limit = 10 } = req.query;
    
    // Calculate date threshold based on timeframe
    const now = new Date();
    let dateThreshold;
    
    switch (timeframe) {
      case 'day':
        dateThreshold = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'week':
        dateThreshold = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        dateThreshold = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        dateThreshold = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }
    
    const trendingRecipes = await Recipe.find({
      createdAt: { $gte: dateThreshold }
    })
    .sort({ 
      viewCount: -1, 
      favoriteCount: -1, 
      rating: -1 
    })
    .limit(parseInt(limit))
    .select('title image rating readyInMinutes difficulty viewCount favoriteCount');
    
    res.json({
      recipes: trendingRecipes,
      timeframe,
      generatedAt: new Date()
    });
    
  } catch (error) {
    console.error('Error fetching trending recipes:', error);
    res.status(500).json({ 
      message: 'Error fetching trending recipes', 
      error: error.message 
    });
  }
});

// POST global recipe search (worldwide ingredients search via Spoonacular)
router.post('/search/global', authenticateUser, async (req, res) => {
  try {
    const {
      query,
      ingredients = [],
      cuisine,
      diet,
      intolerances,
      maxReadyTime,
      minCalories,
      maxCalories,
      number = 20
    } = req.body;

    if (!query && (!ingredients || ingredients.length === 0)) {
      return res.status(400).json({
        message: 'Please provide a search query or ingredients'
      });
    }

    let spoonacularResults = [];
    let localResults = [];

    try {
      // Search Spoonacular API for global recipes
      if (ingredients && ingredients.length > 0) {
        // Search by ingredients
        spoonacularResults = await recipeService.searchByIngredients(ingredients, {
          number: Math.floor(number / 2),
          ranking: 1,
          ignorePantry: true
        });
      } else if (query) {
        // Search by recipe name/query using complexSearch
        const axios = require('axios');
        const SPOONACULAR_API_KEY = process.env.SPOONACULAR_API_KEY;

        if (SPOONACULAR_API_KEY) {
          const searchParams = {
            query,
            number: Math.floor(number / 2),
            addRecipeInformation: true,
            fillIngredients: true,
            apiKey: SPOONACULAR_API_KEY
          };

          if (cuisine) searchParams.cuisine = cuisine;
          if (diet) searchParams.diet = diet;
          if (intolerances) searchParams.intolerances = intolerances;
          if (maxReadyTime) searchParams.maxReadyTime = maxReadyTime;
          if (minCalories) searchParams.minCalories = minCalories;
          if (maxCalories) searchParams.maxCalories = maxCalories;

          const response = await axios.get('https://api.spoonacular.com/recipes/complexSearch', {
            params: searchParams
          });

          if (response.data.results && response.data.results.length > 0) {
            // Format and save the recipes
            const formattedRecipes = response.data.results.map(recipe =>
              recipeService.formatSpoonacularRecipe(recipe)
            );
            spoonacularResults = await recipeService.saveRecipesToDatabase(formattedRecipes);
          }
        }
      }
    } catch (spoonacularError) {
      console.error('Spoonacular global search error:', spoonacularError.message);
    }

    // Also search local database
    try {
      const searchQuery = {};

      if (query) {
        searchQuery.$text = { $search: query };
      }

      if (ingredients && ingredients.length > 0) {
        const ingredientRegexes = ingredients.map(ing => new RegExp(ing, 'i'));
        searchQuery.ingredientNames = { $in: ingredientRegexes };
      }

      if (cuisine) searchQuery.cuisines = cuisine;
      if (diet) {
        if (diet.includes('vegetarian')) searchQuery.vegetarian = true;
        if (diet.includes('vegan')) searchQuery.vegan = true;
        if (diet.includes('gluten free')) searchQuery.glutenFree = true;
      }
      if (maxReadyTime) searchQuery.readyInMinutes = { $lte: maxReadyTime };

      localResults = await Recipe.find(searchQuery)
        .limit(Math.floor(number / 2))
        .sort({ rating: -1, popularityScore: -1 })
        .lean();
    } catch (localError) {
      console.error('Local search error:', localError.message);
    }

    // Combine and deduplicate results
    const allResults = [...(spoonacularResults || []), ...(localResults || [])];
    const uniqueResults = allResults.filter((recipe, index, self) => {
      return index === self.findIndex(r =>
        (r._id && r._id.toString()) === (recipe._id && recipe._id.toString()) ||
        (r.spoonacularId && recipe.spoonacularId && r.spoonacularId === recipe.spoonacularId) ||
        (r.title && recipe.title && r.title.toLowerCase() === recipe.title.toLowerCase())
      );
    });

    // Sort by relevance
    uniqueResults.sort((a, b) => {
      const scoreA = (a.rating || 0) * (a.ratingCount || 1) + (a.healthScore || 0) / 10;
      const scoreB = (b.rating || 0) * (b.ratingCount || 1) + (b.healthScore || 0) / 10;
      return scoreB - scoreA;
    });

    const finalResults = uniqueResults.slice(0, number);

    res.json({
      recipes: finalResults,
      totalFound: finalResults.length,
      sources: {
        spoonacular: spoonacularResults ? spoonacularResults.length : 0,
        local: localResults ? localResults.length : 0
      },
      searchQuery: query,
      searchIngredients: ingredients,
      isGlobalSearch: true
    });

  } catch (error) {
    console.error('Error in global search:', error);
    res.status(500).json({
      message: 'Error performing global search',
      error: error.message
    });
  }
});

// GET recipe statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const stats = await Promise.all([
      Recipe.countDocuments(),
      Recipe.countDocuments({ leftoverFriendly: true }),
      Recipe.countDocuments({ quickMeal: true }),
      Recipe.aggregate([
        { $group: { _id: null, avgRating: { $avg: '$rating' } } }
      ]),
      Recipe.distinct('cuisines').then(cuisines => cuisines.length),
      Recipe.distinct('dishTypes').then(types => types.length)
    ]);

    res.json({
      totalRecipes: stats[0],
      leftoverFriendlyRecipes: stats[1],
      quickMealRecipes: stats[2],
      averageRating: stats[3][0]?.avgRating || 0,
      cuisineCount: stats[4],
      dishTypeCount: stats[5],
      generatedAt: new Date()
    });

  } catch (error) {
    console.error('Error fetching recipe stats:', error);
    res.status(500).json({
      message: 'Error fetching stats',
      error: error.message
    });
  }
});

// Spell correction endpoint
router.post('/spell-check', async (req, res) => {
  try {
    const { ingredient } = req.body;

    if (!ingredient) {
      return res.status(400).json({
        message: 'Ingredient is required'
      });
    }

    const correctionResult = spellCorrectionService.autoCorrect(ingredient);

    res.json({
      original: ingredient,
      ...correctionResult
    });

  } catch (error) {
    console.error('Error in spell checking:', error);
    res.status(500).json({
      message: 'Error checking spelling',
      error: error.message
    });
  }
});

// Ingredient suggestions endpoint
router.get('/ingredient-suggestions', async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.length < 2) {
      return res.json({ suggestions: [] });
    }

    const suggestions = spellCorrectionService.suggestIngredients(q);

    res.json({
      query: q,
      suggestions: suggestions
    });

  } catch (error) {
    console.error('Error getting ingredient suggestions:', error);
    res.status(500).json({
      message: 'Error getting suggestions',
      error: error.message
    });
  }
});

// Enhanced ingredient processing endpoint
router.post('/process-ingredients', async (req, res) => {
  try {
    const { ingredients } = req.body;

    if (!ingredients || !Array.isArray(ingredients)) {
      return res.status(400).json({
        message: 'Ingredients array is required'
      });
    }

    const processedIngredients = ingredients.map(ingredient => {
      return nlpService.processIngredientInput(ingredient);
    });

    res.json({
      originalIngredients: ingredients,
      processedIngredients: processedIngredients,
      corrections: processedIngredients.filter(p => p.autoChanged || p.suggestion),
      totalProcessed: processedIngredients.length
    });

  } catch (error) {
    console.error('Error processing ingredients:', error);
    res.status(500).json({
      message: 'Error processing ingredients',
      error: error.message
    });
  }
});

// Enhanced SpaCy + Spoonacular search endpoint
router.post('/search/enhanced', async (req, res) => {
  try {
    const {
      ingredients,
      cuisine,
      diet,
      intolerances,
      maxReadyTime,
      maxCalories,
      number = 20
    } = req.body;

    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return res.status(400).json({
        message: 'Ingredients array is required'
      });
    }

    console.log('🔍 Enhanced search request:', { ingredients, cuisine, diet });

    const searchOptions = {
      cuisine,
      diet,
      intolerances,
      maxReadyTime,
      maxCalories,
      number
    };

    const result = await spacySpoonacularService.enhancedRecipeSearch(ingredients, searchOptions);

    res.json({
      success: true,
      totalFound: result.totalResults,
      recipes: result.recipes,
      nlpProcessing: result.nlpProcessing,
      searchMetadata: result.searchMetadata,
      apiUsed: 'spacy-spoonacular-enhanced',
      message: `Found ${result.recipes.length} enhanced recipes with NLP processing`
    });

  } catch (error) {
    console.error('Error in enhanced search:', error);
    res.status(500).json({
      message: 'Error in enhanced search',
      error: error.message,
      success: false
    });
  }
});

// Get detailed recipe with full instructions
router.get('/details/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        message: 'Recipe ID is required'
      });
    }

    // Check if it's a Spoonacular recipe (numeric ID)
    if (/^\d+$/.test(id)) {
      const recipeDetails = await spacySpoonacularService.getRecipeDetails(id);

      res.json({
        success: true,
        recipe: recipeDetails,
        source: 'spoonacular-api',
        enhanced: true
      });
    } else {
      // Handle local recipe details (from our database)
      let recipe = null;

      if (global.MOCK_MODE) {
        // Search in mock data
        const allRecipes = mockData.getAllRecipes();
        recipe = allRecipes.find(r => r._id === id || r.id === id);
      } else {
        // Search in actual database
        recipe = await Recipe.findById(id);
      }

      if (!recipe) {
        return res.status(404).json({
          message: 'Recipe not found',
          success: false
        });
      }

      res.json({
        success: true,
        recipe: recipe,
        source: 'local-database',
        enhanced: false
      });
    }

  } catch (error) {
    console.error('Error getting recipe details:', error);
    res.status(500).json({
      message: 'Error getting recipe details',
      error: error.message,
      success: false
    });
  }
});

// Advanced ingredient processing with NLP
router.post('/ingredients/analyze', async (req, res) => {
  try {
    const { ingredients } = req.body;

    if (!ingredients || !Array.isArray(ingredients)) {
      return res.status(400).json({
        message: 'Ingredients array is required'
      });
    }

    const nlpResult = await spacySpoonacularService.processIngredientsWithNLP(ingredients);

    res.json({
      success: true,
      originalIngredients: ingredients,
      processedIngredients: nlpResult.processedIngredients,
      corrections: nlpResult.corrections,
      suggestions: nlpResult.suggestions,
      enhancedIngredientList: nlpResult.enhancedIngredientList,
      analysisMetadata: {
        totalProcessed: ingredients.length,
        correctionsMade: nlpResult.corrections.length,
        suggestionsAvailable: nlpResult.suggestions.length,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error analyzing ingredients:', error);
    res.status(500).json({
      message: 'Error analyzing ingredients',
      error: error.message,
      success: false
    });
  }
});

// Cuisine-specific recipe search
router.post('/search/cuisine/:cuisine', async (req, res) => {
  try {
    const { cuisine } = req.params;
    const { ingredients, options = {} } = req.body;

    if (!ingredients || !Array.isArray(ingredients)) {
      return res.status(400).json({
        message: 'Ingredients array is required'
      });
    }

    const searchOptions = {
      ...options,
      cuisine: cuisine.toLowerCase(),
      number: options.number || 15
    };

    const result = await spacySpoonacularService.enhancedRecipeSearch(ingredients, searchOptions);

    res.json({
      success: true,
      cuisine: cuisine,
      totalFound: result.totalResults,
      recipes: result.recipes,
      nlpProcessing: result.nlpProcessing,
      searchMetadata: result.searchMetadata,
      message: `Found ${result.recipes.length} ${cuisine} recipes`
    });

  } catch (error) {
    console.error(`Error searching ${req.params.cuisine} recipes:`, error);
    res.status(500).json({
      message: `Error searching ${req.params.cuisine} recipes`,
      error: error.message,
      success: false
    });
  }
});

// Browse recipes by cuisine (without ingredients)
router.get('/browse/:cuisine', async (req, res) => {
  try {
    const { cuisine } = req.params;
    const { limit = 50 } = req.query;

    let recipes = [];

    if (global.MOCK_MODE) {
      recipes = mockData.searchByCuisine(cuisine, parseInt(limit));
    } else {
      // Database search for cuisine
      recipes = await Recipe.find({
        $or: [
          { cuisines: { $regex: cuisine, $options: 'i' } },
          { title: { $regex: cuisine, $options: 'i' } },
          { summary: { $regex: cuisine, $options: 'i' } }
        ]
      }).limit(parseInt(limit)).sort({ popularityScore: -1, rating: -1 });
    }

    res.json({
      success: true,
      cuisine: cuisine,
      totalFound: recipes.length,
      recipes: recipes,
      message: `Found ${recipes.length} ${cuisine} recipes`
    });

  } catch (error) {
    console.error(`Error browsing ${cuisine} recipes:`, error);
    res.status(500).json({
      message: `Error browsing ${cuisine} recipes`,
      error: error.message,
      success: false
    });
  }
});

// Test database and get statistics
router.get('/test/database', async (req, res) => {
  try {
    let stats = {};

    if (global.MOCK_MODE) {
      stats = mockData.testRecipeDatabase();

      // Get sample recipes for each cuisine
      const sampleRecipes = {
        gujarati: mockData.searchByCuisine('gujarati', 3),
        italian: mockData.searchByCuisine('italian', 3),
        indian: mockData.searchByCuisine('indian', 3),
        chinese: mockData.searchByCuisine('chinese', 3)
      };

      res.json({
        success: true,
        databaseStats: stats,
        sampleRecipes: sampleRecipes,
        message: `Database contains ${stats.total} recipes across multiple cuisines`,
        timestamp: new Date().toISOString()
      });
    } else {
      // Database statistics
      const totalCount = await Recipe.countDocuments();
      const gujaratiCount = await Recipe.countDocuments({
        cuisines: { $regex: 'gujarati', $options: 'i' }
      });
      const italianCount = await Recipe.countDocuments({
        cuisines: { $regex: 'italian', $options: 'i' }
      });
      const indianCount = await Recipe.countDocuments({
        cuisines: { $regex: 'indian', $options: 'i' }
      });

      stats = {
        total: totalCount,
        gujarati: gujaratiCount,
        italian: italianCount,
        indian: indianCount
      };

      res.json({
        success: true,
        databaseStats: stats,
        message: `Database contains ${stats.total} recipes`,
        timestamp: new Date().toISOString()
      });
    }

  } catch (error) {
    console.error('Error testing database:', error);
    res.status(500).json({
      message: 'Error testing database',
      error: error.message,
      success: false
    });
  }
});

module.exports = router;
