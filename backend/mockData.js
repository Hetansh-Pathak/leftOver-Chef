// Mock data for development when database is not available
const { generateComprehensiveRecipes } = require('./comprehensiveRecipes');

// Generate comprehensive recipe database
const comprehensiveRecipes = generateComprehensiveRecipes();

const mockRecipes = [
  {
    _id: 'daily-recipe-1',
    title: 'Leftover Vegetable Stir Fry',
    summary: 'A quick and delicious way to use up leftover vegetables with a savory sauce',
    image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&h=300&fit=crop',
    readyInMinutes: 15,
    servings: 4,
    difficulty: 'Easy',
    rating: 4.5,
    ratingCount: 245,
    leftoverFriendly: true,
    quickMeal: true,
    vegetarian: true,
    cuisines: ['Asian'],
    dishTypes: ['Main Course'],
    extendedIngredients: [
      { name: 'Mixed vegetables', amount: 2, unit: 'cups', originalString: '2 cups mixed leftover vegetables' },
      { name: 'Soy sauce', amount: 3, unit: 'tablespoons', originalString: '3 tablespoons soy sauce' },
      { name: 'Garlic', amount: 2, unit: 'cloves', originalString: '2 cloves garlic, minced' },
      { name: 'Vegetable oil', amount: 2, unit: 'tablespoons', originalString: '2 tablespoons vegetable oil' }
    ],
    ingredientNames: ['mixed vegetables', 'vegetables', 'soy sauce', 'garlic', 'vegetable oil', 'oil'],
    analyzedInstructions: [
      { number: 1, step: 'Heat oil in a large pan or wok over medium-high heat.' },
      { number: 2, step: 'Add minced garlic and stir-fry for 30 seconds until fragrant.' },
      { number: 3, step: 'Add leftover vegetables and stir-fry for 3-4 minutes.' },
      { number: 4, step: 'Add soy sauce and toss everything together. Cook for another 1-2 minutes.' },
      { number: 5, step: 'Serve hot over rice or noodles.' }
    ],
    nutrition: {
      calories: 180,
      protein: 6,
      carbs: 15,
      fat: 8,
      fiber: 4
    },
    source: 'mock',
    searchCount: 45,
    ingredientSearchCount: 23,
    popularityScore: 234
  },
  {
    _id: 'recipe-2',
    title: 'Simple Leftover Pasta',
    summary: 'Transform your leftover pasta into a delicious meal',
    image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=400&h=300&fit=crop',
    readyInMinutes: 10,
    servings: 2,
    difficulty: 'Easy',
    rating: 4.2,
    ratingCount: 128,
    leftoverFriendly: true,
    quickMeal: true,
    vegetarian: false,
    cuisines: ['Italian'],
    dishTypes: ['Main Course'],
    extendedIngredients: [
      { name: 'Leftover pasta', amount: 2, unit: 'cups', originalString: '2 cups leftover pasta' },
      { name: 'Olive oil', amount: 2, unit: 'tablespoons', originalString: '2 tablespoons olive oil' },
      { name: 'Parmesan cheese', amount: 1/4, unit: 'cup', originalString: '1/4 cup grated Parmesan cheese' }
    ],
    ingredientNames: ['leftover pasta', 'pasta', 'olive oil', 'oil', 'parmesan cheese', 'cheese'],
    analyzedInstructions: [
      { number: 1, step: 'Heat olive oil in a pan over medium heat.' },
      { number: 2, step: 'Add leftover pasta and toss to heat through.' },
      { number: 3, step: 'Add Parmesan cheese and toss until melted.' },
      { number: 4, step: 'Serve immediately while hot.' }
    ],
    nutrition: {
      calories: 320,
      protein: 12,
      carbs: 45,
      fat: 10,
      fiber: 2
    },
    source: 'mock',
    searchCount: 67,
    ingredientSearchCount: 89,
    popularityScore: 456
  },
  {
    _id: 'recipe-3',
    title: 'Leftover Rice Bowl',
    summary: 'A nutritious bowl using leftover rice and vegetables',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop',
    readyInMinutes: 12,
    servings: 1,
    difficulty: 'Easy',
    rating: 4.7,
    ratingCount: 89,
    leftoverFriendly: true,
    quickMeal: true,
    vegetarian: true,
    vegan: true,
    cuisines: ['Asian'],
    dishTypes: ['Main Course', 'Lunch'],
    extendedIngredients: [
      { name: 'Leftover rice', amount: 1, unit: 'cup', originalString: '1 cup leftover rice' },
      { name: 'Mixed vegetables', amount: 1/2, unit: 'cup', originalString: '1/2 cup mixed vegetables' },
      { name: 'Soy sauce', amount: 1, unit: 'tablespoon', originalString: '1 tablespoon soy sauce' },
      { name: 'Sesame oil', amount: 1, unit: 'teaspoon', originalString: '1 teaspoon sesame oil' }
    ],
    ingredientNames: ['leftover rice', 'rice', 'mixed vegetables', 'vegetables', 'soy sauce', 'sesame oil', 'oil'],
    analyzedInstructions: [
      { number: 1, step: 'Heat sesame oil in a pan over medium heat.' },
      { number: 2, step: 'Add leftover rice and break up any clumps.' },
      { number: 3, step: 'Add vegetables and stir-fry for 2-3 minutes.' },
      { number: 4, step: 'Add soy sauce and mix well.' },
      { number: 5, step: 'Serve in a bowl and enjoy!' }
    ],
    nutrition: {
      calories: 210,
      protein: 5,
      carbs: 38,
      fat: 4,
      fiber: 3
    },
    source: 'mock',
    searchCount: 34,
    ingredientSearchCount: 56,
    popularityScore: 123
  },
  // Add all comprehensive recipes
  ...comprehensiveRecipes
];

const getDailyRecipe = () => {
  // Return the first recipe as daily recipe
  return mockRecipes[0];
};

const getRandomRecipes = (count = 10) => {
  // Return a shuffled subset of recipes
  const shuffled = [...mockRecipes];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, Math.min(count, shuffled.length));
};

const getRecipeById = (id) => {
  return mockRecipes.find(recipe => recipe._id === id) || null;
};

const searchRecipes = (filters = {}) => {
  let results = [...mockRecipes];
  
  if (filters.search) {
    const searchTerm = filters.search.toLowerCase();
    results = results.filter(recipe => 
      recipe.title.toLowerCase().includes(searchTerm) ||
      recipe.summary.toLowerCase().includes(searchTerm)
    );
  }
  
  if (filters.leftoverFriendly) {
    results = results.filter(recipe => recipe.leftoverFriendly);
  }
  
  if (filters.quickMeal) {
    results = results.filter(recipe => recipe.quickMeal);
  }
  
  if (filters.vegetarian) {
    results = results.filter(recipe => recipe.vegetarian);
  }
  
  if (filters.maxTime) {
    results = results.filter(recipe => recipe.readyInMinutes <= filters.maxTime);
  }
  
  return {
    recipes: results,
    pagination: {
      total: results.length,
      page: 1,
      pages: 1,
      limit: results.length
    }
  };
};

module.exports = {
  mockRecipes,
  getDailyRecipe,
  getRandomRecipes,
  getRecipeById,
  searchRecipes
};
