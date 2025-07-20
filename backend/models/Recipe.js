const mongoose = require('mongoose');

const nutritionSchema = new mongoose.Schema({
  calories: { type: Number, required: true },
  protein: { type: Number, required: true }, // in grams
  carbs: { type: Number, required: true }, // in grams
  fat: { type: Number, required: true }, // in grams
  fiber: { type: Number, default: 0 },
  sugar: { type: Number, default: 0 },
  sodium: { type: Number, default: 0 }, // in mg
  cholesterol: { type: Number, default: 0 }, // in mg
  saturatedFat: { type: Number, default: 0 },
  vitaminA: { type: Number, default: 0 }, // % daily value
  vitaminC: { type: Number, default: 0 }, // % daily value
  calcium: { type: Number, default: 0 }, // % daily value
  iron: { type: Number, default: 0 } // % daily value
});

const ingredientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  amount: { type: Number, required: true },
  unit: { type: String, required: true },
  originalString: { type: String, required: true },
  metaInformation: [String], // ["fresh", "organic", etc.]
  measures: {
    us: {
      amount: Number,
      unitShort: String,
      unitLong: String
    },
    metric: {
      amount: Number,
      unitShort: String,
      unitLong: String
    }
  }
});

const instructionSchema = new mongoose.Schema({
  number: { type: Number, required: true },
  step: { type: String, required: true },
  ingredients: [{
    id: Number,
    name: String,
    localizedName: String,
    image: String
  }],
  equipment: [{
    id: Number,
    name: String,
    localizedName: String,
    image: String
  }],
  length: {
    number: Number,
    unit: String
  },
  temperature: {
    number: Number,
    unit: String
  }
});

const recipeSchema = new mongoose.Schema({
  // Basic Information
  spoonacularId: { type: Number, unique: true, sparse: true },
  title: { type: String, required: true, index: true },
  summary: { type: String },
  readyInMinutes: { type: Number, required: true },
  servings: { type: Number, required: true, min: 1 },
  sourceUrl: { type: String },
  image: { type: String },
  imageType: { type: String, default: 'jpg' },
  
  // Cooking Information
  preparationMinutes: { type: Number, default: 0 },
  cookingMinutes: { type: Number, default: 0 },
  aggregateLikes: { type: Number, default: 0 },
  healthScore: { type: Number, min: 0, max: 100 },
  spoonacularScore: { type: Number, min: 0, max: 100 },
  pricePerServing: { type: Number },
  
  // Categorization
  cuisines: [{ type: String, index: true }],
  dishTypes: [{ type: String, index: true }],
  diets: [{ type: String, index: true }], // vegetarian, vegan, gluten-free, etc.
  occasions: [String], // dinner, lunch, breakfast, etc.
  
  // Dietary Information
  vegetarian: { type: Boolean, default: false, index: true },
  vegan: { type: Boolean, default: false, index: true },
  glutenFree: { type: Boolean, default: false, index: true },
  dairyFree: { type: Boolean, default: false, index: true },
  veryHealthy: { type: Boolean, default: false },
  cheap: { type: Boolean, default: false },
  veryPopular: { type: Boolean, default: false },
  sustainable: { type: Boolean, default: false },
  lowFodmap: { type: Boolean, default: false },
  ketogenic: { type: Boolean, default: false },
  whole30: { type: Boolean, default: false },
  
  // Allergen Information
  allergens: {
    nuts: { type: Boolean, default: false },
    shellfish: { type: Boolean, default: false },
    eggs: { type: Boolean, default: false },
    soy: { type: Boolean, default: false },
    sesame: { type: Boolean, default: false },
    fish: { type: Boolean, default: false }
  },
  
  // Recipe Content
  extendedIngredients: [ingredientSchema],
  analyzedInstructions: [instructionSchema],
  originalId: Number,
  instructions: { type: String }, // Fallback plain text instructions
  
  // Nutrition
  nutrition: nutritionSchema,
  
  // User Interaction
  rating: { type: Number, min: 0, max: 5, default: 0 },
  ratingCount: { type: Number, default: 0 },
  userRatings: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rating: { type: Number, min: 1, max: 5 },
    createdAt: { type: Date, default: Date.now }
  }],
  
  // Custom Fields
  leftoverFriendly: { type: Boolean, default: true, index: true },
  quickMeal: { type: Boolean, default: false, index: true },
  difficulty: { 
    type: String, 
    enum: ['Easy', 'Medium', 'Hard'], 
    default: 'Medium',
    index: true 
  },
  
  // AI Enhancement
  aiEnhanced: { type: Boolean, default: false },
  aiSummary: { type: String },
  aiTips: [String],
  leftoverTips: [String],
  substitutions: [{
    original: String,
    substitute: String,
    notes: String
  }],
  
  // Metadata
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isPublic: { type: Boolean, default: true },
  source: { 
    type: String, 
    enum: ['spoonacular', 'user', 'ai-generated', 'imported'], 
    default: 'spoonacular' 
  },
  lastUpdated: { type: Date, default: Date.now },
  
  // Search Optimization
  searchKeywords: [{ type: String, index: true }],
  ingredientNames: [{ type: String, index: true }], // Extracted ingredient names for faster search
  
  // Performance Metrics
  viewCount: { type: Number, default: 0 },
  favoriteCount: { type: Number, default: 0 },
  cookCount: { type: Number, default: 0 } // How many times users marked as "cooked"
}, {
  timestamps: true
});

// Indexes for better search performance
recipeSchema.index({ title: 'text', summary: 'text', searchKeywords: 'text' });
recipeSchema.index({ ingredientNames: 1 });
recipeSchema.index({ 'extendedIngredients.name': 1 });
recipeSchema.index({ readyInMinutes: 1 });
recipeSchema.index({ healthScore: -1 });
recipeSchema.index({ rating: -1 });
recipeSchema.index({ leftoverFriendly: 1, quickMeal: 1 });
recipeSchema.index({ vegetarian: 1, vegan: 1, glutenFree: 1, dairyFree: 1 });
recipeSchema.index({ 'nutrition.calories': 1, 'nutrition.protein': 1 });

// Virtual for total time
recipeSchema.virtual('totalTime').get(function() {
  return this.readyInMinutes || (this.preparationMinutes + this.cookingMinutes) || 0;
});

// Virtual for difficulty calculation based on time and ingredient count
recipeSchema.virtual('calculatedDifficulty').get(function() {
  const ingredientCount = this.extendedIngredients?.length || 0;
  const totalTime = this.totalTime;
  
  if (ingredientCount <= 5 && totalTime <= 30) return 'Easy';
  if (ingredientCount <= 10 && totalTime <= 60) return 'Medium';
  return 'Hard';
});

// Method to add rating
recipeSchema.methods.addRating = function(userId, rating) {
  // Remove existing rating from this user
  this.userRatings = this.userRatings.filter(r => !r.userId.equals(userId));
  
  // Add new rating
  this.userRatings.push({ userId, rating });
  
  // Recalculate average rating
  const totalRating = this.userRatings.reduce((sum, r) => sum + r.rating, 0);
  this.rating = totalRating / this.userRatings.length;
  this.ratingCount = this.userRatings.length;
  
  return this.save();
};

// Method to check if recipe matches dietary preferences
recipeSchema.methods.matchesDietaryPreferences = function(preferences) {
  if (preferences.vegetarian && !this.vegetarian) return false;
  if (preferences.vegan && !this.vegan) return false;
  if (preferences.glutenFree && !this.glutenFree) return false;
  if (preferences.dairyFree && !this.dairyFree) return false;
  return true;
};

// Method to check allergen restrictions
recipeSchema.methods.hasAllergens = function(restrictions) {
  if (restrictions.noNuts && this.allergens.nuts) return true;
  if (restrictions.noShellfish && this.allergens.shellfish) return true;
  if (restrictions.noEggs && this.allergens.eggs) return true;
  if (restrictions.noSoy && this.allergens.soy) return true;
  return false;
};

// Method to calculate ingredient match score
recipeSchema.methods.calculateIngredientMatchScore = function(userIngredients) {
  if (!userIngredients || userIngredients.length === 0) return 0;
  
  const recipeIngredients = this.ingredientNames || 
    this.extendedIngredients?.map(ing => ing.name.toLowerCase()) || [];
  
  if (recipeIngredients.length === 0) return 0;
  
  const userIngredientsLower = userIngredients.map(ing => ing.toLowerCase());
  const matchedIngredients = recipeIngredients.filter(recipeIng =>
    userIngredientsLower.some(userIng => 
      recipeIng.includes(userIng) || userIng.includes(recipeIng)
    )
  );
  
  return matchedIngredients.length / recipeIngredients.length;
};

// Method to extract ingredient names (for search optimization)
recipeSchema.methods.extractIngredientNames = function() {
  if (this.extendedIngredients && this.extendedIngredients.length > 0) {
    this.ingredientNames = this.extendedIngredients.map(ing => ing.name.toLowerCase());
  }
  return this.ingredientNames;
};

// Pre-save middleware to extract ingredient names and keywords
recipeSchema.pre('save', function(next) {
  // Extract ingredient names for faster searching
  this.extractIngredientNames();
  
  // Extract search keywords
  const keywords = [];
  if (this.title) keywords.push(...this.title.toLowerCase().split(' '));
  if (this.cuisines) keywords.push(...this.cuisines.map(c => c.toLowerCase()));
  if (this.dishTypes) keywords.push(...this.dishTypes.map(d => d.toLowerCase()));
  if (this.diets) keywords.push(...this.diets.map(d => d.toLowerCase()));
  
  this.searchKeywords = [...new Set(keywords.filter(k => k.length > 2))];
  
  // Auto-calculate difficulty if not set
  if (!this.difficulty) {
    this.difficulty = this.calculatedDifficulty;
  }
  
  this.lastUpdated = new Date();
  next();
});

// Static method for advanced ingredient-based search
recipeSchema.statics.findByIngredients = async function(searchCriteria) {
  const {
    ingredients = [],
    matchType = 'any',
    preferences = {},
    nutrition = {},
    maxReadyTime,
    limit = 20,
    offset = 0
  } = searchCriteria;
  
  // Build base query
  const query = {};
  
  // Dietary preferences
  if (preferences.dietary) {
    if (preferences.dietary.vegetarian) query.vegetarian = true;
    if (preferences.dietary.vegan) query.vegan = true;
    if (preferences.dietary.glutenFree) query.glutenFree = true;
    if (preferences.dietary.dairyFree) query.dairyFree = true;
  }
  
  // Allergen restrictions
  if (preferences.allergens) {
    if (preferences.allergens.noNuts) query['allergens.nuts'] = { $ne: true };
    if (preferences.allergens.noShellfish) query['allergens.shellfish'] = { $ne: true };
    if (preferences.allergens.noEggs) query['allergens.eggs'] = { $ne: true };
    if (preferences.allergens.noSoy) query['allergens.soy'] = { $ne: true };
  }
  
  // Nutrition filters
  if (nutrition.maxCalories) query['nutrition.calories'] = { $lte: nutrition.maxCalories };
  if (nutrition.minProtein) query['nutrition.protein'] = { $gte: nutrition.minProtein };
  if (nutrition.maxCarbs) query['nutrition.carbs'] = { $lte: nutrition.maxCarbs };
  
  // Time filter
  if (maxReadyTime) query.readyInMinutes = { $lte: maxReadyTime };
  
  // Ingredient matching
  if (ingredients.length > 0) {
    const ingredientRegexes = ingredients.map(ing => new RegExp(ing, 'i'));
    
    if (matchType === 'all') {
      // Must have ALL ingredients
      query.ingredientNames = { $all: ingredientRegexes };
    } else if (matchType === 'any') {
      // Must have ANY ingredient
      query.ingredientNames = { $in: ingredientRegexes };
    } else {
      // Most ingredients (at least 60% match)
      query.ingredientNames = { $in: ingredientRegexes };
    }
  }
  
  // Execute query
  let recipesQuery = this.find(query)
    .select('-userRatings') // Exclude user ratings for performance
    .limit(limit)
    .skip(offset);
  
  // Sort by relevance (rating, health score, popularity)
  recipesQuery = recipesQuery.sort({
    rating: -1,
    healthScore: -1,
    aggregateLikes: -1,
    createdAt: -1
  });
  
  const recipes = await recipesQuery.exec();
  
  // Calculate match scores and add matched/missing ingredients
  const recipesWithScores = recipes.map(recipe => {
    const recipeObj = recipe.toObject();
    
    if (ingredients.length > 0) {
      const matchScore = recipe.calculateIngredientMatchScore(ingredients);
      const recipeIngredients = recipe.ingredientNames || [];
      
      const matchedIngredients = recipeIngredients.filter(recipeIng =>
        ingredients.some(userIng => 
          recipeIng.toLowerCase().includes(userIng.toLowerCase()) ||
          userIng.toLowerCase().includes(recipeIng.toLowerCase())
        )
      );
      
      const missingIngredients = recipeIngredients.filter(recipeIng =>
        !ingredients.some(userIng => 
          recipeIng.toLowerCase().includes(userIng.toLowerCase()) ||
          userIng.toLowerCase().includes(recipeIng.toLowerCase())
        )
      );
      
      recipeObj.matchScore = matchScore;
      recipeObj.matchedIngredients = matchedIngredients;
      recipeObj.missingIngredients = missingIngredients;
    } else {
      recipeObj.matchScore = 1;
      recipeObj.matchedIngredients = [];
      recipeObj.missingIngredients = recipe.ingredientNames || [];
    }
    
    return recipeObj;
  });
  
  // Filter by match type for 'most' option
  let filteredRecipes = recipesWithScores;
  if (matchType === 'most' && ingredients.length > 0) {
    filteredRecipes = recipesWithScores.filter(recipe => recipe.matchScore >= 0.6);
  }
  
  // Sort by match score
  filteredRecipes.sort((a, b) => b.matchScore - a.matchScore);
  
  return filteredRecipes;
};

// Static method for AI-powered recipe suggestions
recipeSchema.statics.getAISuggestions = async function(userId, preferences = {}) {
  // This would integrate with OpenAI for personalized suggestions
  // For now, return high-rated leftover-friendly recipes
  return this.find({
    leftoverFriendly: true,
    rating: { $gte: 4.0 },
    ...preferences
  })
  .limit(10)
  .sort({ rating: -1, aggregateLikes: -1 });
};

module.exports = mongoose.model('Recipe', recipeSchema);
