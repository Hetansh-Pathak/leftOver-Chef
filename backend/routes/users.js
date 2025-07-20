const express = require('express');
const User = require('../models/User');
const Recipe = require('../models/Recipe');
const aiService = require('../services/aiService');
const jwt = require('jsonwebtoken');
const router = express.Router();

// JWT Secret (in production, use environment variable)
const JWT_SECRET = process.env.JWT_SECRET || 'leftover-chef-secret-key';

// Middleware for authentication
const authenticateUser = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token.' });
  }
};

// In-memory storage for mock mode
let mockUsers = [];
let mockUserIdCounter = 1;

// POST register user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, ...profileData } = req.body;

    // Handle mock mode
    if (global.MOCK_MODE) {
      // Check if user already exists
      const existingUser = mockUsers.find(user => user.email === email);
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists with this email' });
      }

      // Create mock user
      const mockUser = {
        _id: mockUserIdCounter++,
        name,
        email,
        password, // In real app, this would be hashed
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
        cookingSkillLevel: 'Beginner',
        points: 0,
        level: 1,
        isActive: true,
        emailVerified: false,
        accountCreated: new Date(),
        achievements: [{
          name: 'Welcome to Leftover Chef!',
          description: 'Started your journey to reduce food waste',
          category: 'milestone',
          unlockedAt: new Date()
        }],
        dietaryPreferences: {},
        allergens: {},
        ...profileData
      };

      mockUsers.push(mockUser);

      // Generate JWT
      const token = jwt.sign({ userId: mockUser._id }, JWT_SECRET, { expiresIn: '7d' });

      return res.status(201).json({
        message: 'User registered successfully',
        user: {
          id: mockUser._id,
          name: mockUser.name,
          email: mockUser.email,
          avatar: mockUser.avatar,
          cookingSkillLevel: mockUser.cookingSkillLevel,
          points: mockUser.points,
          level: mockUser.level
        },
        token
      });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }
    
    // Create new user with extended profile data
    const userData = {
      name,
      email,
      password,
      ...profileData,
      // Set default equipment for new users
      availableEquipment: [
        { name: 'Stove', category: 'cooking' },
        { name: 'Oven', category: 'baking' },
        { name: 'Microwave', category: 'cooking' },
        { name: 'Refrigerator', category: 'storage' },
        { name: 'Basic Knives', category: 'prep' }
      ]
    };
    
    const user = new User(userData);
    await user.save();
    
    // Generate JWT
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });
    
    // Add welcome achievement
    user.achievements.push({
      name: 'Welcome to Leftover Chef!',
      description: 'Started your journey to reduce food waste',
      category: 'milestone'
    });
    await user.save();
    
    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        cookingSkillLevel: user.cookingSkillLevel,
        points: user.points,
        level: user.level
      },
      token
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Error registering user', error: error.message });
  }
});

// POST login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Handle mock mode
    if (global.MOCK_MODE) {
      const user = mockUsers.find(u => u.email === email);
      if (!user || user.password !== password) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Update last login
      user.lastLogin = new Date();

      // Generate JWT
      const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });

      return res.json({
        message: 'Login successful',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          cookingSkillLevel: user.cookingSkillLevel,
          points: user.points,
          level: user.level,
          dietaryPreferences: user.dietaryPreferences,
          allergens: user.allergens
        },
        token
      });
    }
    
    const user = await User.findOne({ email });
    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Update last login
    user.lastLogin = new Date();
    await user.save();
    
    // Generate JWT
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });
    
    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        cookingSkillLevel: user.cookingSkillLevel,
        points: user.points,
        level: user.level,
        dietaryPreferences: user.dietaryPreferences,
        allergens: user.allergens
      },
      token
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
});

// GET user profile
router.get('/profile/:id', authenticateUser, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('favorites', 'title image rating')
      .populate('myRecipes', 'title image rating createdAt')
      .populate('recentlyViewed.recipeId', 'title image rating');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Calculate additional stats
    const stats = {
      totalFavorites: user.favorites?.length || 0,
      totalRecipesCreated: user.myRecipes?.length || 0,
      totalCookingSessions: user.cookingHistory?.length || 0,
      currentStreak: user.streak?.current || 0,
      longestStreak: user.streak?.longest || 0,
      expiringIngredientsCount: user.getUrgentIngredients().length,
      inventoryValue: user.kitchenInventory?.reduce((sum, item) => 
        sum + (item.estimatedCost || 0), 0) || 0
    };
    
    res.json({
      ...user.toObject(),
      stats
    });
    
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Error fetching user profile', error: error.message });
  }
});

// PUT update user profile
router.put('/profile/:id', authenticateUser, async (req, res) => {
  try {
    if (req.params.id !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to update this profile' });
    }
    
    const updateData = { ...req.body };
    delete updateData.password; // Don't allow password updates through this route
    delete updateData.email; // Don't allow email updates without verification
    
    const user = await User.findByIdAndUpdate(
      req.userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({
      message: 'Profile updated successfully',
      user
    });
    
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Error updating profile', error: error.message });
  }
});

// POST add to kitchen inventory
router.post('/inventory', authenticateUser, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const { ingredients } = req.body;
    
    if (!Array.isArray(ingredients)) {
      return res.status(400).json({ message: 'Ingredients must be an array' });
    }
    
    // Add multiple ingredients
    for (const ingredient of ingredients) {
      await user.addToInventory(ingredient);
    }
    
    // Check for achievements
    if (user.kitchenInventory.length >= 10 && !user.achievements.some(a => a.name === 'Inventory Master')) {
      user.achievements.push({
        name: 'Inventory Master',
        description: 'Added 10+ items to your kitchen inventory',
        category: 'organization'
      });
      user.points += 50;
      await user.save();
    }
    
    res.json({ 
      message: 'Inventory updated successfully', 
      inventory: user.kitchenInventory.slice(-10), // Return last 10 items
      totalItems: user.kitchenInventory.length
    });
    
  } catch (error) {
    console.error('Error updating inventory:', error);
    res.status(500).json({ message: 'Error updating inventory', error: error.message });
  }
});

// GET kitchen inventory with expiration alerts
router.get('/inventory', authenticateUser, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const availableIngredients = user.getAvailableIngredients();
    const expiringIngredients = user.getExpiringIngredients(3); // Next 3 days
    const urgentIngredients = user.getUrgentIngredients(); // Today/tomorrow
    
    // Categorize ingredients
    const categorizedInventory = {};
    availableIngredients.forEach(item => {
      if (!categorizedInventory[item.category]) {
        categorizedInventory[item.category] = [];
      }
      categorizedInventory[item.category].push(item);
    });
    
    res.json({
      inventory: categorizedInventory,
      alerts: {
        expiring: expiringIngredients,
        urgent: urgentIngredients,
        totalItems: availableIngredients.length
      },
      suggestions: urgentIngredients.length > 0 ? 
        'You have ingredients expiring soon! Consider using them in a recipe.' : null
    });
    
  } catch (error) {
    console.error('Error fetching inventory:', error);
    res.status(500).json({ message: 'Error fetching inventory', error: error.message });
  }
});

// DELETE remove from inventory
router.delete('/inventory/:itemId', authenticateUser, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const item = user.kitchenInventory.id(req.params.itemId);
    if (!item) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }
    
    item.remove();
    await user.save();
    
    res.json({ message: 'Item removed from inventory' });
    
  } catch (error) {
    console.error('Error removing inventory item:', error);
    res.status(500).json({ message: 'Error removing item', error: error.message });
  }
});

// GET shopping list
router.get('/shopping-list', authenticateUser, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Group shopping list by category
    const groupedList = {};
    user.shoppingList.forEach(item => {
      if (!groupedList[item.category]) {
        groupedList[item.category] = [];
      }
      groupedList[item.category].push(item);
    });
    
    // Calculate estimated total cost
    const estimatedTotal = user.shoppingList.reduce((sum, item) => 
      sum + (item.estimatedPrice || 0), 0);
    
    res.json({
      shoppingList: groupedList,
      summary: {
        totalItems: user.shoppingList.length,
        pendingItems: user.shoppingList.filter(item => !item.purchased).length,
        estimatedTotal
      }
    });
    
  } catch (error) {
    console.error('Error fetching shopping list:', error);
    res.status(500).json({ message: 'Error fetching shopping list', error: error.message });
  }
});

// POST add to shopping list
router.post('/shopping-list', authenticateUser, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const { items } = req.body;
    await user.addToShoppingList(items);
    
    res.json({ 
      message: 'Items added to shopping list',
      totalItems: user.shoppingList.length
    });
    
  } catch (error) {
    console.error('Error adding to shopping list:', error);
    res.status(500).json({ message: 'Error adding to shopping list', error: error.message });
  }
});

// PUT mark shopping item as purchased
router.put('/shopping-list/:itemId/purchase', authenticateUser, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    await user.markAsPurchased(req.params.itemId);
    
    res.json({ message: 'Item marked as purchased and added to inventory' });
    
  } catch (error) {
    console.error('Error marking item as purchased:', error);
    res.status(500).json({ message: 'Error updating item', error: error.message });
  }
});

// GET meal plan
router.get('/meal-plan', authenticateUser, async (req, res) => {
  try {
    const { startDate, days = 7 } = req.query;
    
    const user = await User.findById(req.userId)
      .populate('mealPlan.recipeId', 'title image readyInMinutes difficulty rating nutrition');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    let mealPlan = user.mealPlan || [];
    
    // Filter by date range if specified
    if (startDate) {
      const start = new Date(startDate);
      const end = new Date(start);
      end.setDate(start.getDate() + parseInt(days));
      
      mealPlan = mealPlan.filter(meal => 
        meal.date >= start && meal.date < end
      );
    }
    
    // Group by date
    const groupedMealPlan = {};
    mealPlan.forEach(meal => {
      const dateKey = meal.date.toISOString().split('T')[0];
      if (!groupedMealPlan[dateKey]) {
        groupedMealPlan[dateKey] = {};
      }
      groupedMealPlan[dateKey][meal.mealType] = meal;
    });
    
    res.json({
      mealPlan: groupedMealPlan,
      totalMeals: mealPlan.length,
      dateRange: {
        start: startDate || 'today',
        days: parseInt(days)
      }
    });
    
  } catch (error) {
    console.error('Error fetching meal plan:', error);
    res.status(500).json({ message: 'Error fetching meal plan', error: error.message });
  }
});

// POST generate AI meal plan
router.post('/meal-plan/generate', authenticateUser, async (req, res) => {
  try {
    const { days = 7, preferences = {} } = req.body;
    
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Generate AI-powered meal plan
    const mealPlan = await aiService.generateAIMealPlan(user, days);
    
    res.json({
      message: 'AI meal plan generated successfully',
      mealPlan,
      generatedFor: days,
      basedOn: {
        availableIngredients: user.getAvailableIngredients().length,
        dietaryPreferences: Object.keys(user.dietaryPreferences).filter(key => user.dietaryPreferences[key]),
        skillLevel: user.cookingSkillLevel
      }
    });
    
  } catch (error) {
    console.error('Error generating meal plan:', error);
    res.status(500).json({ message: 'Error generating meal plan', error: error.message });
  }
});

// POST add cooking session to history
router.post('/cooking-history', authenticateUser, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const cookingData = {
      ...req.body,
      cookedAt: new Date()
    };
    
    await user.addCookingHistory(cookingData);
    
    // Check for cooking achievements
    const cookingCount = user.cookingHistory.length;
    if (cookingCount === 1) {
      user.achievements.push({
        name: 'First Cook!',
        description: 'Completed your first recipe',
        category: 'cooking'
      });
    } else if (cookingCount === 10) {
      user.achievements.push({
        name: 'Home Chef',
        description: 'Cooked 10 recipes',
        category: 'cooking'
      });
    } else if (cookingCount === 50) {
      user.achievements.push({
        name: 'Master Chef',
        description: 'Cooked 50 recipes',
        category: 'cooking'
      });
    }
    
    await user.save();
    
    res.json({
      message: 'Cooking session recorded',
      totalSessions: user.cookingHistory.length,
      currentStreak: user.streak.current,
      pointsEarned: 10
    });
    
  } catch (error) {
    console.error('Error recording cooking session:', error);
    res.status(500).json({ message: 'Error recording cooking session', error: error.message });
  }
});

// GET cooking history and analytics
router.get('/cooking-history', authenticateUser, async (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query;
    
    const user = await User.findById(req.userId)
      .populate('cookingHistory.recipeId', 'title image rating difficulty cuisines');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const cookingHistory = user.cookingHistory
      .slice(offset, offset + limit)
      .sort((a, b) => b.cookedAt - a.cookedAt);
    
    // Calculate analytics
    const analytics = {
      totalSessions: user.cookingHistory.length,
      averageRating: user.cookingHistory.reduce((sum, session) => 
        sum + (session.rating || 0), 0) / user.cookingHistory.length || 0,
      favoriteCuisines: this.calculateTopCuisines(user.cookingHistory),
      cookingStreak: user.streak,
      totalCookingTime: user.cookingHistory.reduce((sum, session) => 
        sum + (session.actualCookTime || 0), 0)
    };
    
    res.json({
      cookingHistory,
      analytics,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: user.cookingHistory.length
      }
    });
    
  } catch (error) {
    console.error('Error fetching cooking history:', error);
    res.status(500).json({ message: 'Error fetching cooking history', error: error.message });
  }
});

// Helper function to calculate top cuisines
function calculateTopCuisines(cookingHistory) {
  const cuisineCounts = {};
  
  cookingHistory.forEach(session => {
    if (session.recipeId && session.recipeId.cuisines) {
      session.recipeId.cuisines.forEach(cuisine => {
        cuisineCounts[cuisine] = (cuisineCounts[cuisine] || 0) + 1;
      });
    }
  });
  
  return Object.entries(cuisineCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([cuisine, count]) => ({ cuisine, count }));
}

// GET user achievements and gamification
router.get('/achievements', authenticateUser, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const pointsToNextLevel = (user.level * 100) - (user.points % 100);
    
    res.json({
      achievements: user.achievements.sort((a, b) => b.unlockedAt - a.unlockedAt),
      gamification: {
        level: user.level,
        points: user.points,
        pointsToNextLevel,
        streak: user.streak,
        nextLevelAt: user.level * 100
      },
      categories: {
        cooking: user.achievements.filter(a => a.category === 'cooking').length,
        sustainability: user.achievements.filter(a => a.category === 'sustainability').length,
        social: user.achievements.filter(a => a.category === 'social').length,
        exploration: user.achievements.filter(a => a.category === 'exploration').length
      }
    });
    
  } catch (error) {
    console.error('Error fetching achievements:', error);
    res.status(500).json({ message: 'Error fetching achievements', error: error.message });
  }
});

// GET personalized dashboard
router.get('/dashboard', authenticateUser, async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .populate('recentlyViewed.recipeId', 'title image rating')
      .populate('favorites', 'title image rating', null, { limit: 5 });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const urgentIngredients = user.getUrgentIngredients();
    const availableIngredients = user.getAvailableIngredients().map(item => item.ingredient);
    
    // Get personalized recommendations
    const recommendations = await aiService.generatePersonalizedRecommendations(
      user, 
      availableIngredients.slice(0, 5)
    );
    
    const dashboard = {
      welcome: {
        name: user.name,
        level: user.level,
        points: user.points,
        streak: user.streak.current
      },
      alerts: {
        expiringIngredients: urgentIngredients.length,
        urgentItems: urgentIngredients.slice(0, 3),
        pendingShoppingItems: user.shoppingList.filter(item => !item.purchased).length
      },
      quickStats: {
        totalRecipes: user.myRecipes?.length || 0,
        favoriteRecipes: user.favorites?.length || 0,
        cookingSessions: user.cookingHistory?.length || 0,
        inventoryItems: user.kitchenInventory?.length || 0
      },
      recommendations: recommendations.slice(0, 4),
      recentActivity: {
        recentlyViewed: user.recentlyViewed.slice(0, 3),
        lastCookingSession: user.cookingHistory?.[0] || null
      },
      todaysMealPlan: user.mealPlan.filter(meal => {
        const today = new Date().toISOString().split('T')[0];
        const mealDate = meal.date.toISOString().split('T')[0];
        return mealDate === today;
      })
    };
    
    res.json(dashboard);
    
  } catch (error) {
    console.error('Error fetching dashboard:', error);
    res.status(500).json({ message: 'Error fetching dashboard', error: error.message });
  }
});

// POST update notification preferences
router.put('/notifications', authenticateUser, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.userId,
      { 
        notifications: req.body,
        'appSettings.lastNotificationUpdate': new Date()
      },
      { new: true }
    ).select('notifications');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({
      message: 'Notification preferences updated',
      notifications: user.notifications
    });
    
  } catch (error) {
    console.error('Error updating notifications:', error);
    res.status(500).json({ message: 'Error updating notifications', error: error.message });
  }
});

// GET all users (admin endpoint)
router.get('/admin/all-users', async (req, res) => {
  try {
    // Get all users with basic information (excluding passwords)
    const users = await User.find({})
      .select('-password -cookingHistory -searchHistory -kitchenInventory -shoppingList -mealPlan')
      .sort({ accountCreated: -1 })
      .limit(100); // Limit to prevent huge responses

    // Calculate summary statistics
    const stats = {
      totalUsers: await User.countDocuments(),
      activeUsers: await User.countDocuments({ isActive: true }),
      verifiedUsers: await User.countDocuments({ emailVerified: true }),
      premiumUsers: await User.countDocuments({ subscriptionType: { $ne: 'free' } }),
      recentRegistrations: await User.countDocuments({
        accountCreated: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      }),
      averageLevel: await User.aggregate([
        { $group: { _id: null, avgLevel: { $avg: '$level' } } }
      ]).then(result => result[0]?.avgLevel || 0),
      topCookingSkillLevels: await User.aggregate([
        { $group: { _id: '$cookingSkillLevel', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ])
    };

    res.json({
      message: 'Users retrieved successfully',
      stats,
      users: users.map(user => ({
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        cookingSkillLevel: user.cookingSkillLevel,
        level: user.level,
        points: user.points,
        isActive: user.isActive,
        emailVerified: user.emailVerified,
        subscriptionType: user.subscriptionType,
        lastLogin: user.lastLogin,
        accountCreated: user.accountCreated,
        favoriteRecipes: user.favorites?.length || 0,
        cookingSessions: user.cookingHistory?.length || 0,
        achievements: user.achievements?.length || 0,
        currentStreak: user.streak?.current || 0,
        dietaryPreferences: Object.keys(user.dietaryPreferences || {})
          .filter(key => user.dietaryPreferences[key]),
        allergens: Object.keys(user.allergens || {})
          .filter(key => user.allergens[key])
      })),
      totalReturned: users.length
    });

  } catch (error) {
    console.error('Error fetching all users:', error);
    res.status(500).json({
      message: 'Error fetching users',
      error: error.message
    });
  }
});

// GET user statistics for admin dashboard
router.get('/admin/stats', async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - 7);

    const stats = {
      overview: {
        totalUsers: await User.countDocuments(),
        activeUsers: await User.countDocuments({ isActive: true }),
        newThisMonth: await User.countDocuments({ accountCreated: { $gte: startOfMonth } }),
        newThisWeek: await User.countDocuments({ accountCreated: { $gte: startOfWeek } })
      },
      engagement: {
        dailyActiveUsers: await User.countDocuments({
          lastLogin: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        }),
        weeklyActiveUsers: await User.countDocuments({
          lastLogin: { $gte: startOfWeek }
        }),
        monthlyActiveUsers: await User.countDocuments({
          lastLogin: { $gte: startOfMonth }
        })
      },
      demographics: {
        cookingSkillLevels: await User.aggregate([
          { $group: { _id: '$cookingSkillLevel', count: { $sum: 1 } } }
        ]),
        subscriptionTypes: await User.aggregate([
          { $group: { _id: '$subscriptionType', count: { $sum: 1 } } }
        ]),
        dietaryPreferences: await User.aggregate([
          { $unwind: { path: '$dietaryPreferences', preserveNullAndEmptyArrays: true } },
          { $match: { 'dietaryPreferences': { $exists: true } } },
          { $group: { _id: '$dietaryPreferences', count: { $sum: 1 } } }
        ])
      },
      activity: {
        totalCookingSessions: await User.aggregate([
          { $project: { cookingSessionCount: { $size: { $ifNull: ['$cookingHistory', []] } } } },
          { $group: { _id: null, total: { $sum: '$cookingSessionCount' } } }
        ]).then(result => result[0]?.total || 0),
        totalRecipesCreated: await User.aggregate([
          { $project: { recipeCount: { $size: { $ifNull: ['$myRecipes', []] } } } },
          { $group: { _id: null, total: { $sum: '$recipeCount' } } }
        ]).then(result => result[0]?.total || 0),
        avgUserLevel: await User.aggregate([
          { $group: { _id: null, avgLevel: { $avg: '$level' } } }
        ]).then(result => result[0]?.avgLevel || 0)
      }
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({
      message: 'Error fetching statistics',
      error: error.message
    });
  }
});

module.exports = router;
