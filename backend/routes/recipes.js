const express = require('express');
const Recipe = require('../models/Recipe');
const User = require('../models/User');
const recipeService = require('../services/recipeService');
const aiService = require('../services/aiService');
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
      limit = 20 
    } = req.body;
    
    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return res.status(400).json({ 
        message: 'Please provide at least one ingredient' 
      });
    }
    
    let recipes;
    
    // Use AI-enhanced search if requested and user preferences available
    if (useAI && req.userId) {
      try {
        const user = await User.findById(req.userId);
        if (user) {
          recipes = await aiService.generatePersonalizedRecommendations(user, ingredients);
        }
      } catch (aiError) {
        console.error('AI search failed, falling back to standard search:', aiError);
      }
    }
    
    // Fallback to standard search or if AI search wasn't used
    if (!recipes || recipes.length === 0) {
      recipes = await Recipe.findByIngredients({
        ingredients,
        matchType,
        preferences,
        nutrition: {
          maxCalories: nutrition.maxCalories,
          minProtein: nutrition.minProtein,
          maxCarbs: nutrition.maxCarbs
        },
        maxReadyTime,
        limit
      });
    }
    
    // Track search for analytics
    if (req.userId) {
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
    
    res.json({
      recipes,
      totalFound: recipes.length,
      searchedIngredients: ingredients,
      matchType,
      aiEnhanced: useAI && recipes.some(r => r.aiRecommended)
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

// GET daily featured recipe
router.get('/daily/featured', async (req, res) => {
  try {
    const dailyRecipe = await recipeService.getRecipeOfTheDay();
    
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

module.exports = router;
