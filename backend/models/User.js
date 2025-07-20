const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const allergenSchema = new mongoose.Schema({
  nuts: { type: Boolean, default: false },
  shellfish: { type: Boolean, default: false },
  eggs: { type: Boolean, default: false },
  soy: { type: Boolean, default: false },
  sesame: { type: Boolean, default: false },
  fish: { type: Boolean, default: false },
  dairy: { type: Boolean, default: false },
  gluten: { type: Boolean, default: false }
});

const nutritionGoalsSchema = new mongoose.Schema({
  dailyCalories: { type: Number, default: 2000 },
  proteinPercentage: { type: Number, default: 20 }, // % of daily calories
  carbsPercentage: { type: Number, default: 50 },
  fatPercentage: { type: Number, default: 30 },
  maxSodium: { type: Number, default: 2300 }, // mg per day
  minFiber: { type: Number, default: 25 }, // grams per day
  waterIntakeGoal: { type: Number, default: 8 } // glasses per day
});

const inventoryItemSchema = new mongoose.Schema({
  ingredient: { type: String, required: true },
  quantity: { type: String, default: '' },
  unit: { type: String, default: '' },
  expiryDate: { type: Date },
  purchaseDate: { type: Date, default: Date.now },
  category: {
    type: String,
    enum: ['vegetables', 'fruits', 'proteins', 'grains', 'dairy', 'spices', 'oils', 'nuts', 'legumes', 'herbs', 'other'],
    default: 'other'
  },
  storageLocation: {
    type: String,
    enum: ['fridge', 'freezer', 'pantry', 'counter'],
    default: 'pantry'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  notes: { type: String },
  barcode: { type: String }, // For future scanning features
  estimatedCost: { type: Number }, // Cost per item
  nutritionPer100g: {
    calories: { type: Number },
    protein: { type: Number },
    carbs: { type: Number },
    fat: { type: Number }
  }
}, {
  timestamps: true
});

const mealPlanSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  mealType: {
    type: String,
    enum: ['breakfast', 'lunch', 'dinner', 'snack'],
    required: true
  },
  recipeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' },
  servings: { type: Number, default: 1 },
  notes: { type: String },
  completed: { type: Boolean, default: false },
  rating: { type: Number, min: 1, max: 5 }
}, {
  timestamps: true
});

const cookingHistorySchema = new mongoose.Schema({
  recipeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Recipe', required: true },
  cookedAt: { type: Date, default: Date.now },
  rating: { type: Number, min: 1, max: 5 },
  notes: { type: String },
  modifications: [String], // What the user changed
  leftoverAmount: { type: String }, // How much was left over
  wouldCookAgain: { type: Boolean },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard']
  },
  actualCookTime: { type: Number }, // In minutes
  cost: { type: Number } // Estimated cost to make
});

const shoppingListSchema = new mongoose.Schema({
  ingredient: { type: String, required: true },
  quantity: { type: String, default: '' },
  unit: { type: String, default: '' },
  category: { type: String, default: 'other' },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  purchased: { type: Boolean, default: false },
  estimatedPrice: { type: Number },
  store: { type: String },
  notes: { type: String },
  addedFrom: { type: String }, // 'recipe', 'manual', 'suggestion'
  recipeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' }
}, {
  timestamps: true
});

const userSchema = new mongoose.Schema({
  // Basic Information
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  avatar: { type: String, default: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face' },
  
  // Profile Information
  dateOfBirth: { type: Date },
  gender: { type: String, enum: ['male', 'female', 'other', 'prefer-not-to-say'] },
  location: {
    country: { type: String },
    city: { type: String },
    timezone: { type: String, default: 'UTC' }
  },
  
  // Cooking Profile
  cookingSkillLevel: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
    default: 'Beginner'
  },
  cookingExperience: { type: Number, default: 0 }, // Years of cooking
  preferredCuisines: [String],
  favoriteDishTypes: [String],
  cookingGoals: [String], // 'save-money', 'eat-healthy', 'reduce-waste', 'learn-new-skills'
  
  // Dietary Information
  dietaryPreferences: {
    vegetarian: { type: Boolean, default: false },
    vegan: { type: Boolean, default: false },
    pescatarian: { type: Boolean, default: false },
    flexitarian: { type: Boolean, default: false },
    keto: { type: Boolean, default: false },
    paleo: { type: Boolean, default: false },
    mediterranean: { type: Boolean, default: false },
    lowCarb: { type: Boolean, default: false },
    lowFat: { type: Boolean, default: false },
    diabetic: { type: Boolean, default: false },
    heartHealthy: { type: Boolean, default: false }
  },
  
  allergens: allergenSchema,
  nutritionGoals: nutritionGoalsSchema,
  
  // Recipe Interactions
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' }],
  myRecipes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' }],
  recentlyViewed: [{
    recipeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' },
    viewedAt: { type: Date, default: Date.now }
  }],
  
  // Kitchen Management
  kitchenInventory: [inventoryItemSchema],
  shoppingList: [shoppingListSchema],
  mealPlan: [mealPlanSchema],
  cookingHistory: [cookingHistorySchema],
  
  // Kitchen Equipment
  availableEquipment: [{
    name: { type: String, required: true },
    category: { type: String }, // 'cooking', 'baking', 'prep', 'storage'
    brand: { type: String },
    size: { type: String },
    notes: { type: String }
  }],
  
  // User Behavior Analytics
  searchHistory: [{
    query: { type: String },
    ingredients: [String],
    filters: { type: mongoose.Schema.Types.Mixed },
    resultsCount: { type: Number },
    searchedAt: { type: Date, default: Date.now }
  }],
  
  // Personalization
  recommendationPreferences: {
    preferQuickMeals: { type: Boolean, default: false },
    preferHealthyOptions: { type: Boolean, default: true },
    preferBudgetFriendly: { type: Boolean, default: false },
    preferSeasonalIngredients: { type: Boolean, default: true },
    adventurousnessLevel: { type: Number, min: 1, max: 5, default: 3 } // 1=conservative, 5=very adventurous
  },
  
  // Sustainability
  sustainabilityGoals: {
    reduceWaste: { type: Boolean, default: true },
    preferLocal: { type: Boolean, default: false },
    preferOrganic: { type: Boolean, default: false },
    minimizePackaging: { type: Boolean, default: false },
    seasonalEating: { type: Boolean, default: false }
  },
  
  // App Settings
  notifications: {
    email: { type: Boolean, default: true },
    push: { type: Boolean, default: true },
    recipeRecommendations: { type: Boolean, default: true },
    expirationReminders: { type: Boolean, default: true },
    mealPlanReminders: { type: Boolean, default: true },
    shoppingListUpdates: { type: Boolean, default: true }
  },
  
  appSettings: {
    defaultServingSize: { type: Number, default: 4 },
    measurementSystem: { type: String, enum: ['metric', 'imperial'], default: 'metric' },
    language: { type: String, default: 'en' },
    theme: { type: String, enum: ['light', 'dark', 'auto'], default: 'auto' }
  },
  
  // Subscription & Premium Features
  subscriptionType: {
    type: String,
    enum: ['free', 'premium', 'family'],
    default: 'free'
  },
  subscriptionExpiry: { type: Date },
  premiumFeatures: {
    unlimitedRecipeSaves: { type: Boolean, default: false },
    advancedNutritionTracking: { type: Boolean, default: false },
    aiMealPlanning: { type: Boolean, default: false },
    customRecipeGenerator: { type: Boolean, default: false }
  },
  
  // Social Features
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  profileVisibility: {
    type: String,
    enum: ['public', 'friends', 'private'],
    default: 'public'
  },
  
  // Gamification
  achievements: [{
    name: { type: String },
    description: { type: String },
    unlockedAt: { type: Date, default: Date.now },
    category: { type: String } // 'cooking', 'sustainability', 'social', 'exploration'
  }],
  points: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  streak: {
    current: { type: Number, default: 0 },
    longest: { type: Number, default: 0 },
    lastActiveDate: { type: Date }
  },
  
  // Account Status
  isActive: { type: Boolean, default: true },
  emailVerified: { type: Boolean, default: false },
  lastLogin: { type: Date },
  accountCreated: { type: Date, default: Date.now },
  
  // Privacy
  dataUsageConsent: { type: Boolean, default: false },
  marketingConsent: { type: Boolean, default: false },
  analyticsConsent: { type: Boolean, default: false }
}, {
  timestamps: true
});

// Indexes for better performance
userSchema.index({ email: 1 });
userSchema.index({ 'kitchenInventory.ingredient': 1 });
userSchema.index({ 'kitchenInventory.expiryDate': 1 });
userSchema.index({ 'shoppingList.purchased': 1 });
userSchema.index({ 'mealPlan.date': 1 });
userSchema.index({ level: -1, points: -1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to add ingredient to inventory
userSchema.methods.addToInventory = function(ingredientData) {
  const existingIndex = this.kitchenInventory.findIndex(
    item => item.ingredient.toLowerCase() === ingredientData.ingredient.toLowerCase()
  );
  
  if (existingIndex > -1) {
    // Update existing ingredient
    this.kitchenInventory[existingIndex] = {
      ...this.kitchenInventory[existingIndex].toObject(),
      ...ingredientData,
      updatedAt: new Date()
    };
  } else {
    // Add new ingredient
    this.kitchenInventory.push(ingredientData);
  }
  
  return this.save();
};

// Method to get expiring ingredients
userSchema.methods.getExpiringIngredients = function(days = 3) {
  const threshold = new Date();
  threshold.setDate(threshold.getDate() + days);
  
  return this.kitchenInventory.filter(item => 
    item.expiryDate && 
    item.expiryDate <= threshold &&
    item.expiryDate > new Date()
  ).sort((a, b) => a.expiryDate - b.expiryDate);
};

// Method to get urgent ingredients (expiring today/tomorrow)
userSchema.methods.getUrgentIngredients = function() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(23, 59, 59, 999);
  
  return this.kitchenInventory.filter(item => 
    item.expiryDate && 
    item.expiryDate <= tomorrow &&
    item.expiryDate > new Date()
  );
};

// Method to get available ingredients (not expired)
userSchema.methods.getAvailableIngredients = function() {
  const now = new Date();
  return this.kitchenInventory.filter(item => 
    !item.expiryDate || item.expiryDate > now
  );
};

// Method to add to shopping list
userSchema.methods.addToShoppingList = function(items) {
  if (!Array.isArray(items)) items = [items];
  
  items.forEach(item => {
    const existingIndex = this.shoppingList.findIndex(
      listItem => listItem.ingredient.toLowerCase() === item.ingredient.toLowerCase() &&
                  !listItem.purchased
    );
    
    if (existingIndex > -1) {
      // Update existing item quantity
      const existing = this.shoppingList[existingIndex];
      if (item.quantity && existing.quantity) {
        // Try to combine quantities if units match
        if (existing.unit === item.unit) {
          const existingQty = parseFloat(existing.quantity) || 0;
          const newQty = parseFloat(item.quantity) || 0;
          existing.quantity = (existingQty + newQty).toString();
        }
      }
    } else {
      this.shoppingList.push(item);
    }
  });
  
  return this.save();
};

// Method to mark shopping list item as purchased
userSchema.methods.markAsPurchased = function(itemId) {
  const item = this.shoppingList.id(itemId);
  if (item) {
    item.purchased = true;
    
    // Optionally add to inventory
    this.addToInventory({
      ingredient: item.ingredient,
      quantity: item.quantity,
      unit: item.unit,
      category: item.category,
      purchaseDate: new Date(),
      // Set expiry based on category defaults
      expiryDate: this.getDefaultExpiryDate(item.category)
    });
  }
  return this.save();
};

// Method to get default expiry date based on category
userSchema.methods.getDefaultExpiryDate = function(category) {
  const now = new Date();
  const daysToAdd = {
    'vegetables': 7,
    'fruits': 5,
    'proteins': 3,
    'dairy': 7,
    'grains': 365,
    'spices': 365,
    'oils': 365,
    'nuts': 180,
    'legumes': 365,
    'herbs': 7,
    'other': 30
  };
  
  const days = daysToAdd[category] || 30;
  const expiryDate = new Date(now);
  expiryDate.setDate(now.getDate() + days);
  return expiryDate;
};

// Method to generate meal plan based on inventory
userSchema.methods.generateMealPlan = async function(days = 7) {
  const Recipe = mongoose.model('Recipe');
  const availableIngredients = this.getAvailableIngredients();
  const ingredientNames = availableIngredients.map(item => item.ingredient);
  
  // Find recipes that use available ingredients
  const recipes = await Recipe.findByIngredients({
    ingredients: ingredientNames,
    matchType: 'any',
    preferences: {
      dietary: this.dietaryPreferences,
      allergens: this.allergens
    },
    limit: days * 3 // breakfast, lunch, dinner
  });
  
  // Generate meal plan for the next X days
  const mealPlan = [];
  const mealTypes = ['breakfast', 'lunch', 'dinner'];
  
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    
    mealTypes.forEach((mealType, index) => {
      const recipeIndex = (i * 3 + index) % recipes.length;
      if (recipes[recipeIndex]) {
        mealPlan.push({
          date,
          mealType,
          recipeId: recipes[recipeIndex]._id,
          servings: this.appSettings.defaultServingSize || 4
        });
      }
    });
  }
  
  this.mealPlan = mealPlan;
  return this.save();
};

// Method to add cooking history
userSchema.methods.addCookingHistory = function(cookingData) {
  this.cookingHistory.unshift(cookingData); // Add to beginning
  
  // Keep only last 100 entries
  if (this.cookingHistory.length > 100) {
    this.cookingHistory = this.cookingHistory.slice(0, 100);
  }
  
  // Update points and level
  this.points += 10; // Points for cooking
  this.updateLevel();
  
  // Update streak
  this.updateCookingStreak();
  
  return this.save();
};

// Method to update level based on points
userSchema.methods.updateLevel = function() {
  const newLevel = Math.floor(this.points / 100) + 1; // Level up every 100 points
  if (newLevel > this.level) {
    this.level = newLevel;
    // Add achievement for leveling up
    this.achievements.push({
      name: `Level ${newLevel} Chef`,
      description: `Reached level ${newLevel}!`,
      category: 'cooking'
    });
  }
};

// Method to update cooking streak
userSchema.methods.updateCookingStreak = function() {
  const today = new Date().toDateString();
  const lastActive = this.streak.lastActiveDate ? this.streak.lastActiveDate.toDateString() : null;
  
  if (lastActive === today) {
    // Already counted today
    return;
  }
  
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (lastActive === yesterday.toDateString()) {
    // Continue streak
    this.streak.current += 1;
  } else {
    // Reset streak
    this.streak.current = 1;
  }
  
  if (this.streak.current > this.streak.longest) {
    this.streak.longest = this.streak.current;
  }
  
  this.streak.lastActiveDate = new Date();
};

// Method to get personalized recipe recommendations
userSchema.methods.getPersonalizedRecommendations = async function(limit = 10) {
  const Recipe = mongoose.model('Recipe');
  
  // Base query from user preferences
  const query = {};
  
  // Apply dietary preferences
  Object.keys(this.dietaryPreferences).forEach(diet => {
    if (this.dietaryPreferences[diet]) {
      query[diet] = true;
    }
  });
  
  // Apply allergen restrictions
  Object.keys(this.allergens).forEach(allergen => {
    if (this.allergens[allergen]) {
      query[`allergens.${allergen}`] = { $ne: true };
    }
  });
  
  // Prefer quick meals if user setting is enabled
  if (this.recommendationPreferences.preferQuickMeals) {
    query.readyInMinutes = { $lte: 30 };
  }
  
  // Prefer healthy options
  if (this.recommendationPreferences.preferHealthyOptions) {
    query.healthScore = { $gte: 70 };
  }
  
  // Consider user's cooking skill level
  const skillDifficulty = {
    'Beginner': 'Easy',
    'Intermediate': ['Easy', 'Medium'],
    'Advanced': ['Easy', 'Medium', 'Hard'],
    'Expert': ['Easy', 'Medium', 'Hard']
  };
  
  const allowedDifficulties = skillDifficulty[this.cookingSkillLevel] || ['Easy'];
  if (Array.isArray(allowedDifficulties)) {
    query.difficulty = { $in: allowedDifficulties };
  } else {
    query.difficulty = allowedDifficulties;
  }
  
  // Get available ingredients for better matching
  const availableIngredients = this.getAvailableIngredients().map(item => item.ingredient);
  
  if (availableIngredients.length > 0) {
    return await Recipe.findByIngredients({
      ingredients: availableIngredients,
      matchType: 'any',
      preferences: {
        dietary: this.dietaryPreferences,
        allergens: this.allergens
      },
      limit
    });
  } else {
    return await Recipe.find(query)
      .sort({ rating: -1, healthScore: -1 })
      .limit(limit);
  }
};

module.exports = mongoose.model('User', userSchema);
