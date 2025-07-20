const express = require('express');
const Recipe = require('../models/Recipe');
const router = express.Router();

// Sample recipe data for development
const sampleRecipes = [
  {
    _id: '1',
    name: 'Leftover Vegetable Stir Fry',
    description: 'A quick and delicious way to use up leftover vegetables',
    ingredients: [
      { name: 'mixed vegetables', amount: '2', unit: 'cups' },
      { name: 'soy sauce', amount: '2', unit: 'tbsp' },
      { name: 'garlic', amount: '2', unit: 'cloves' },
      { name: 'ginger', amount: '1', unit: 'inch' },
      { name: 'oil', amount: '1', unit: 'tbsp' }
    ],
    instructions: [
      { step: 1, description: 'Heat oil in a large pan or wok over high heat' },
      { step: 2, description: 'Add minced garlic and ginger, stir for 30 seconds' },
      { step: 3, description: 'Add vegetables and stir-fry for 3-4 minutes' },
      { step: 4, description: 'Add soy sauce and toss to combine' },
      { step: 5, description: 'Serve hot over rice or noodles' }
    ],
    prepTime: 10,
    cookTime: 8,
    servings: 4,
    difficulty: 'Easy',
    category: 'Main Course',
    cuisine: 'Asian',
    tags: ['quick', 'healthy', 'leftover-friendly', 'vegetarian'],
    nutrition: { calories: 120, protein: 4, carbs: 15, fat: 5, fiber: 3 },
    image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&h=300&fit=crop',
    rating: 4.5,
    ratingCount: 23,
    leftoverFriendly: true,
    quickMeal: true
  },
  {
    _id: '2',
    name: 'Leftover Rice Fried Rice',
    description: 'Transform yesterday\'s rice into today\'s delicious meal',
    ingredients: [
      { name: 'cooked rice', amount: '3', unit: 'cups' },
      { name: 'eggs', amount: '2', unit: 'large' },
      { name: 'mixed vegetables', amount: '1', unit: 'cup' },
      { name: 'soy sauce', amount: '3', unit: 'tbsp' },
      { name: 'sesame oil', amount: '1', unit: 'tsp' },
      { name: 'green onions', amount: '2', unit: 'stalks' }
    ],
    instructions: [
      { step: 1, description: 'Heat oil in a large skillet over medium-high heat' },
      { step: 2, description: 'Scramble eggs and set aside' },
      { step: 3, description: 'Add rice to the skillet, breaking up clumps' },
      { step: 4, description: 'Add vegetables and cook for 2-3 minutes' },
      { step: 5, description: 'Stir in eggs, soy sauce, and sesame oil' },
      { step: 6, description: 'Garnish with green onions and serve' }
    ],
    prepTime: 15,
    cookTime: 10,
    servings: 4,
    difficulty: 'Easy',
    category: 'Main Course',
    cuisine: 'Asian',
    tags: ['quick', 'leftover-friendly', 'comfort-food'],
    nutrition: { calories: 180, protein: 8, carbs: 28, fat: 4, fiber: 2 },
    image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=300&fit=crop',
    rating: 4.7,
    ratingCount: 45,
    leftoverFriendly: true,
    quickMeal: true
  },
  {
    _id: '3',
    name: 'Leftover Chicken Sandwich',
    description: 'Gourmet sandwich using leftover roasted chicken',
    ingredients: [
      { name: 'leftover chicken', amount: '1', unit: 'cup' },
      { name: 'bread', amount: '2', unit: 'slices' },
      { name: 'mayonnaise', amount: '2', unit: 'tbsp' },
      { name: 'lettuce', amount: '2', unit: 'leaves' },
      { name: 'tomato', amount: '1', unit: 'medium' },
      { name: 'avocado', amount: '1/2', unit: 'medium' }
    ],
    instructions: [
      { step: 1, description: 'Shred or chop the leftover chicken' },
      { step: 2, description: 'Toast bread slices until golden' },
      { step: 3, description: 'Spread mayonnaise on both slices' },
      { step: 4, description: 'Layer chicken, lettuce, tomato, and avocado' },
      { step: 5, description: 'Season with salt and pepper, then assemble sandwich' }
    ],
    prepTime: 8,
    cookTime: 0,
    servings: 1,
    difficulty: 'Easy',
    category: 'Lunch',
    cuisine: 'American',
    tags: ['quick', 'no-cook', 'leftover-friendly', 'protein-rich'],
    nutrition: { calories: 320, protein: 25, carbs: 22, fat: 15, fiber: 5 },
    image: 'https://images.unsplash.com/photo-1553909489-cd47e0ef937f?w=400&h=300&fit=crop',
    rating: 4.3,
    ratingCount: 12,
    leftoverFriendly: true,
    quickMeal: true
  }
];

// GET all recipes with filtering and search
router.get('/', async (req, res) => {
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
      page = 1,
      limit = 10,
      sortBy = 'rating'
    } = req.query;

    // For development, use sample data if MongoDB is not connected
    let recipes;
    
    try {
      // Try to fetch from MongoDB
      let query = Recipe.find();
      
      // Apply filters
      if (search) {
        query = query.find({ $text: { $search: search } });
      }
      
      if (category) {
        query = query.where('category').equals(category);
      }
      
      if (difficulty) {
        query = query.where('difficulty').equals(difficulty);
      }
      
      if (ingredients) {
        const ingredientList = ingredients.split(',').map(ing => ing.trim());
        query = query.where('ingredients.name').in(new RegExp(ingredientList.join('|'), 'i'));
      }
      
      if (maxTime) {
        query = query.where('cookTime').lte(parseInt(maxTime));
      }
      
      if (minRating) {
        query = query.where('rating').gte(parseFloat(minRating));
      }
      
      if (leftoverFriendly === 'true') {
        query = query.where('leftoverFriendly').equals(true);
      }
      
      if (quickMeal === 'true') {
        query = query.where('quickMeal').equals(true);
      }
      
      // Sort
      let sortOptions = {};
      switch (sortBy) {
        case 'rating':
          sortOptions = { rating: -1 };
          break;
        case 'name':
          sortOptions = { name: 1 };
          break;
        case 'time':
          sortOptions = { cookTime: 1 };
          break;
        case 'newest':
          sortOptions = { createdAt: -1 };
          break;
        default:
          sortOptions = { rating: -1 };
      }
      
      recipes = await query
        .sort(sortOptions)
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec();
        
    } catch (dbError) {
      console.log('Using sample data:', dbError.message);
      // Use sample data with basic filtering
      recipes = sampleRecipes.filter(recipe => {
        if (search && !recipe.name.toLowerCase().includes(search.toLowerCase()) && 
            !recipe.description.toLowerCase().includes(search.toLowerCase())) {
          return false;
        }
        if (category && recipe.category !== category) return false;
        if (difficulty && recipe.difficulty !== difficulty) return false;
        if (minRating && recipe.rating < parseFloat(minRating)) return false;
        if (leftoverFriendly === 'true' && !recipe.leftoverFriendly) return false;
        if (quickMeal === 'true' && !recipe.quickMeal) return false;
        return true;
      });
    }

    res.json({
      recipes,
      total: recipes.length,
      page: parseInt(page),
      pages: Math.ceil(recipes.length / limit)
    });
    
  } catch (error) {
    console.error('Error fetching recipes:', error);
    res.status(500).json({ message: 'Error fetching recipes', error: error.message });
  }
});

// GET recipe by ID
router.get('/:id', async (req, res) => {
  try {
    let recipe;
    
    try {
      recipe = await Recipe.findById(req.params.id);
    } catch (dbError) {
      // Use sample data
      recipe = sampleRecipes.find(r => r._id === req.params.id);
    }
    
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    
    res.json(recipe);
  } catch (error) {
    console.error('Error fetching recipe:', error);
    res.status(500).json({ message: 'Error fetching recipe', error: error.message });
  }
});

// POST smart recipe search by ingredients
router.post('/search-by-ingredients', async (req, res) => {
  try {
    const { ingredients, preferences = {} } = req.body;
    
    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return res.status(400).json({ message: 'Please provide at least one ingredient' });
    }
    
    let recipes;
    
    try {
      // MongoDB search
      const ingredientRegex = ingredients.map(ing => new RegExp(ing, 'i'));
      
      let query = Recipe.find({
        'ingredients.name': { $in: ingredientRegex }
      });
      
      // Apply dietary preferences
      if (preferences.vegetarian) {
        query = query.where('tags').in(['vegetarian']);
      }
      if (preferences.vegan) {
        query = query.where('tags').in(['vegan']);
      }
      if (preferences.glutenFree) {
        query = query.where('tags').in(['gluten-free']);
      }
      
      recipes = await query.sort({ rating: -1 }).limit(20).exec();
      
    } catch (dbError) {
      console.log('Using sample data for ingredient search');
      // Use sample data
      recipes = sampleRecipes.filter(recipe => {
        const recipeIngredients = recipe.ingredients.map(ing => ing.name.toLowerCase());
        const hasIngredient = ingredients.some(userIng => 
          recipeIngredients.some(recipeIng => 
            recipeIng.includes(userIng.toLowerCase())
          )
        );
        return hasIngredient;
      });
    }
    
    // Calculate match scores
    const recipesWithScores = recipes.map(recipe => {
      const recipeIngredients = recipe.ingredients.map(ing => ing.name.toLowerCase());
      const matchedIngredients = [];
      const missingIngredients = [];
      
      recipe.ingredients.forEach(ing => {
        const isMatched = ingredients.some(userIng => 
          ing.name.toLowerCase().includes(userIng.toLowerCase())
        );
        
        if (isMatched) {
          matchedIngredients.push(ing.name);
        } else {
          missingIngredients.push(ing.name);
        }
      });
      
      const matchScore = matchedIngredients.length / recipe.ingredients.length;
      
      return {
        ...recipe,
        matchScore,
        matchedIngredients,
        missingIngredients
      };
    });
    
    // Sort by match score
    recipesWithScores.sort((a, b) => b.matchScore - a.matchScore);
    
    res.json({
      recipes: recipesWithScores,
      totalFound: recipesWithScores.length,
      searchedIngredients: ingredients
    });
    
  } catch (error) {
    console.error('Error in ingredient search:', error);
    res.status(500).json({ message: 'Error searching recipes', error: error.message });
  }
});

// POST create new recipe
router.post('/', async (req, res) => {
  try {
    const recipe = new Recipe(req.body);
    const savedRecipe = await recipe.save();
    res.status(201).json(savedRecipe);
  } catch (error) {
    console.error('Error creating recipe:', error);
    res.status(400).json({ message: 'Error creating recipe', error: error.message });
  }
});

// GET recipe categories
router.get('/meta/categories', async (req, res) => {
  try {
    const categories = [
      'Main Course',
      'Appetizer',
      'Dessert',
      'Breakfast',
      'Lunch',
      'Dinner',
      'Snack',
      'Soup',
      'Salad',
      'Side Dish'
    ];
    
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching categories', error: error.message });
  }
});

// GET daily recipe
router.get('/daily/featured', async (req, res) => {
  try {
    let recipe;
    
    try {
      // Try to get a random recipe from database
      const count = await Recipe.countDocuments();
      const random = Math.floor(Math.random() * count);
      recipe = await Recipe.findOne().skip(random);
    } catch (dbError) {
      // Use sample data
      const randomIndex = Math.floor(Math.random() * sampleRecipes.length);
      recipe = sampleRecipes[randomIndex];
    }
    
    if (!recipe) {
      recipe = sampleRecipes[0]; // fallback to first sample recipe
    }
    
    res.json(recipe);
  } catch (error) {
    console.error('Error fetching daily recipe:', error);
    res.status(500).json({ message: 'Error fetching daily recipe', error: error.message });
  }
});

module.exports = router;
