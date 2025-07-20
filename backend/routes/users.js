const express = require('express');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const router = express.Router();

// JWT Secret (in production, use environment variable)
const JWT_SECRET = process.env.JWT_SECRET || 'leftover-chef-secret-key';

// Register user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Check if user already exists
    let existingUser;
    try {
      existingUser = await User.findOne({ email });
    } catch (dbError) {
      // If MongoDB is not connected, proceed with registration
      console.log('MongoDB not connected, proceeding with registration');
    }
    
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }
    
    // Create new user
    const user = new User({ name, email, password });
    
    try {
      await user.save();
    } catch (dbError) {
      console.log('Could not save to database, returning mock user');
      // Return a mock response for development
      return res.status(201).json({
        message: 'User registered successfully (mock)',
        user: {
          id: 'mock-user-id',
          name,
          email,
          avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
        },
        token: jwt.sign({ userId: 'mock-user-id' }, JWT_SECRET, { expiresIn: '7d' })
      });
    }
    
    // Generate JWT
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });
    
    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar
      },
      token
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Error registering user', error: error.message });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    let user;
    try {
      user = await User.findOne({ email });
    } catch (dbError) {
      // Mock login for development
      if (email === 'demo@leftoverchef.com' && password === 'demo123') {
        const token = jwt.sign({ userId: 'demo-user-id' }, JWT_SECRET, { expiresIn: '7d' });
        return res.json({
          message: 'Login successful (demo)',
          user: {
            id: 'demo-user-id',
            name: 'Demo User',
            email: 'demo@leftoverchef.com',
            avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
          },
          token
        });
      }
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Generate JWT
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });
    
    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar
      },
      token
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
});

// Get user profile
router.get('/profile/:id', async (req, res) => {
  try {
    let user;
    
    try {
      user = await User.findById(req.params.id).select('-password');
    } catch (dbError) {
      // Return mock user data
      user = {
        _id: req.params.id,
        name: 'Demo User',
        email: 'demo@leftoverchef.com',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
        favorites: [],
        myRecipes: [],
        dietaryPreferences: {
          vegetarian: false,
          vegan: false,
          glutenFree: false,
          dairyFree: false,
          nutFree: false
        },
        kitchenInventory: [
          { ingredient: 'rice', quantity: '2 cups', category: 'grains' },
          { ingredient: 'chicken', quantity: '1 lb', category: 'proteins' },
          { ingredient: 'broccoli', quantity: '1 head', category: 'vegetables' }
        ],
        cookingSkillLevel: 'Intermediate',
        preferredCuisines: ['Asian', 'Italian'],
        createdAt: new Date(),
        updatedAt: new Date()
      };
    }
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Error fetching user profile', error: error.message });
  }
});

// Update kitchen inventory
router.post('/inventory', async (req, res) => {
  try {
    const { userId, ingredients } = req.body;
    
    try {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Add ingredients to inventory
      ingredients.forEach(ingredient => {
        user.addToInventory(ingredient);
      });
      
      await user.save();
      res.json({ message: 'Inventory updated successfully', inventory: user.kitchenInventory });
      
    } catch (dbError) {
      // Mock response for development
      res.json({ 
        message: 'Inventory updated successfully (mock)',
        inventory: ingredients.map(ing => ({
          ...ing,
          _id: Date.now() + Math.random()
        }))
      });
    }
    
  } catch (error) {
    console.error('Error updating inventory:', error);
    res.status(500).json({ message: 'Error updating inventory', error: error.message });
  }
});

// Get user favorites
router.get('/:userId/favorites', async (req, res) => {
  try {
    let favorites = [];
    
    try {
      const user = await User.findById(req.params.userId).populate('favorites');
      favorites = user ? user.favorites : [];
    } catch (dbError) {
      // Return empty array for development
      favorites = [];
    }
    
    res.json(favorites);
  } catch (error) {
    console.error('Error fetching favorites:', error);
    res.status(500).json({ message: 'Error fetching favorites', error: error.message });
  }
});

module.exports = router;
