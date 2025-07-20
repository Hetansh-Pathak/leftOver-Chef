const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  avatar: {
    type: String,
    default: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
  },
  favorites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Recipe'
  }],
  myRecipes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Recipe'
  }],
  dietaryPreferences: {
    vegetarian: {
      type: Boolean,
      default: false
    },
    vegan: {
      type: Boolean,
      default: false
    },
    glutenFree: {
      type: Boolean,
      default: false
    },
    dairyFree: {
      type: Boolean,
      default: false
    },
    nutFree: {
      type: Boolean,
      default: false
    }
  },
  kitchenInventory: [{
    ingredient: {
      type: String,
      required: true
    },
    quantity: {
      type: String,
      default: ''
    },
    expiryDate: Date,
    category: {
      type: String,
      enum: ['vegetables', 'fruits', 'proteins', 'grains', 'dairy', 'spices', 'other'],
      default: 'other'
    }
  }],
  cookingSkillLevel: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Beginner'
  },
  preferredCuisines: [String],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for faster queries
userSchema.index({ email: 1 });
userSchema.index({ 'kitchenInventory.ingredient': 1 });

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
userSchema.methods.addToInventory = function(ingredient) {
  const existingIngredient = this.kitchenInventory.find(
    item => item.ingredient.toLowerCase() === ingredient.ingredient.toLowerCase()
  );
  
  if (existingIngredient) {
    existingIngredient.quantity = ingredient.quantity || existingIngredient.quantity;
    existingIngredient.expiryDate = ingredient.expiryDate || existingIngredient.expiryDate;
  } else {
    this.kitchenInventory.push(ingredient);
  }
  
  return this.save();
};

// Method to get expiring ingredients
userSchema.methods.getExpiringIngredients = function(days = 3) {
  const threshold = new Date();
  threshold.setDate(threshold.getDate() + days);
  
  return this.kitchenInventory.filter(item => 
    item.expiryDate && item.expiryDate <= threshold
  );
};

module.exports = mongoose.model('User', userSchema);
