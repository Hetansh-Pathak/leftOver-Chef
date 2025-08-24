// Mock data for development when database is not available
const { generateComprehensiveRecipes } = require('./comprehensiveRecipes');

// Generate comprehensive recipe database
const comprehensiveRecipes = generateComprehensiveRecipes();

// Enhanced Indian Recipes for better search results
const indianRecipes = [
  {
    _id: 'indian-1',
    title: 'Soft Chapati (Indian Flatbread)',
    summary: 'Traditional Indian flatbread made with whole wheat flour, perfect for any meal. Soft, pliable, and delicious.',
    image: 'https://images.unsplash.com/photo-1574653969094-61d25fa49eaf?w=400&h=300&fit=crop',
    readyInMinutes: 30,
    servings: 8,
    difficulty: 'Easy',
    rating: 4.8,
    ratingCount: 892,
    leftoverFriendly: true,
    quickMeal: false,
    vegetarian: true,
    vegan: true,
    cuisines: ['Indian'],
    dishTypes: ['Bread', 'Side Dish'],
    extendedIngredients: [
      { name: 'Whole wheat flour', amount: 2, unit: 'cups', originalString: '2 cups whole wheat flour' },
      { name: 'Water', amount: 0.75, unit: 'cup', originalString: '3/4 cup warm water' },
      { name: 'Salt', amount: 0.5, unit: 'teaspoon', originalString: '1/2 teaspoon salt' },
      { name: 'Oil', amount: 1, unit: 'tablespoon', originalString: '1 tablespoon oil' }
    ],
    ingredientNames: ['chapati', 'roti', 'whole wheat flour', 'flour', 'water', 'salt', 'oil'],
    analyzedInstructions: [
      { number: 1, step: 'Mix flour and salt in a large bowl.' },
      { number: 2, step: 'Add water gradually while mixing to form a soft dough.' },
      { number: 3, step: 'Knead for 5-7 minutes until smooth. Let rest for 15 minutes.' },
      { number: 4, step: 'Divide into 8 portions and roll each into thin circles.' },
      { number: 5, step: 'Cook on hot griddle for 1-2 minutes each side until golden spots appear.' },
      { number: 6, step: 'Serve hot with curry or dal.' }
    ],
    nutrition: { calories: 110, protein: 4, carbs: 22, fat: 2, fiber: 3 },
    source: 'indian-traditional',
    searchCount: 156,
    ingredientSearchCount: 89,
    popularityScore: 445,
    tags: ['indian', 'bread', 'traditional', 'vegetarian', 'vegan']
  },
  {
    _id: 'indian-2',
    title: 'Classic Dal Tadka (Spiced Lentils)',
    summary: 'Aromatic yellow lentils cooked with traditional Indian spices. A staple in every Indian household and perfect comfort food.',
    image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&h=300&fit=crop',
    readyInMinutes: 45,
    servings: 6,
    difficulty: 'Medium',
    rating: 4.9,
    ratingCount: 1247,
    leftoverFriendly: true,
    quickMeal: false,
    vegetarian: true,
    vegan: true,
    cuisines: ['Indian'],
    dishTypes: ['Main Course', 'Soup'],
    extendedIngredients: [
      { name: 'Yellow dal (toor dal)', amount: 1, unit: 'cup', originalString: '1 cup yellow dal (toor dal)' },
      { name: 'Turmeric powder', amount: 0.5, unit: 'teaspoon', originalString: '1/2 teaspoon turmeric powder' },
      { name: 'Onion', amount: 1, unit: 'medium', originalString: '1 medium onion, chopped' },
      { name: 'Tomato', amount: 2, unit: 'medium', originalString: '2 medium tomatoes, chopped' },
      { name: 'Ginger-garlic paste', amount: 1, unit: 'tablespoon', originalString: '1 tablespoon ginger-garlic paste' },
      { name: 'Cumin seeds', amount: 1, unit: 'teaspoon', originalString: '1 teaspoon cumin seeds' },
      { name: 'Mustard seeds', amount: 0.5, unit: 'teaspoon', originalString: '1/2 teaspoon mustard seeds' },
      { name: 'Green chilies', amount: 2, unit: 'whole', originalString: '2 green chilies, slit' },
      { name: 'Curry leaves', amount: 8, unit: 'leaves', originalString: '8-10 curry leaves' },
      { name: 'Red chili powder', amount: 1, unit: 'teaspoon', originalString: '1 teaspoon red chili powder' },
      { name: 'Coriander powder', amount: 1, unit: 'teaspoon', originalString: '1 teaspoon coriander powder' },
      { name: 'Garam masala', amount: 0.5, unit: 'teaspoon', originalString: '1/2 teaspoon garam masala' },
      { name: 'Salt', amount: 1, unit: 'teaspoon', originalString: 'Salt to taste' },
      { name: 'Oil', amount: 3, unit: 'tablespoons', originalString: '3 tablespoons oil' },
      { name: 'Fresh coriander', amount: 0.25, unit: 'cup', originalString: '1/4 cup fresh coriander, chopped' }
    ],
    ingredientNames: ['dal', 'lentils', 'toor dal', 'turmeric', 'onion', 'tomato', 'ginger', 'garlic', 'cumin', 'mustard seeds', 'curry leaves', 'green chilies', 'red chili powder', 'coriander powder', 'garam masala', 'salt', 'oil', 'coriander'],
    analyzedInstructions: [
      { number: 1, step: 'Wash and soak dal for 30 minutes. Boil with turmeric and salt until soft.' },
      { number: 2, step: 'Heat oil in a pan. Add cumin and mustard seeds. When they splutter, add curry leaves.' },
      { number: 3, step: 'Add onions and green chilies. Sauté until onions turn golden.' },
      { number: 4, step: 'Add ginger-garlic paste and cook for 1 minute.' },
      { number: 5, step: 'Add tomatoes, red chili powder, coriander powder. Cook until tomatoes are soft.' },
      { number: 6, step: 'Add cooked dal and simmer for 10 minutes. Add garam masala.' },
      { number: 7, step: 'Garnish with fresh coriander and serve hot with rice or chapati.' }
    ],
    nutrition: { calories: 195, protein: 12, carbs: 28, fat: 6, fiber: 8 },
    source: 'indian-traditional',
    searchCount: 234,
    ingredientSearchCount: 156,
    popularityScore: 567,
    tags: ['indian', 'dal', 'lentils', 'vegetarian', 'vegan', 'protein-rich']
  },
  {
    _id: 'indian-3',
    title: 'Perfect Basmati Rice',
    summary: 'Fragrant, fluffy basmati rice cooked to perfection. The foundation of any great Indian meal and pairs wonderfully with curries.',
    image: 'https://images.unsplash.com/photo-1596560548464-f010549b84d7?w=400&h=300&fit=crop',
    readyInMinutes: 25,
    servings: 4,
    difficulty: 'Easy',
    rating: 4.7,
    ratingCount: 543,
    leftoverFriendly: true,
    quickMeal: true,
    vegetarian: true,
    vegan: true,
    glutenFree: true,
    cuisines: ['Indian'],
    dishTypes: ['Side Dish', 'Main Course'],
    extendedIngredients: [
      { name: 'Basmati rice', amount: 1, unit: 'cup', originalString: '1 cup basmati rice' },
      { name: 'Water', amount: 2, unit: 'cups', originalString: '2 cups water' },
      { name: 'Salt', amount: 1, unit: 'teaspoon', originalString: '1 teaspoon salt' },
      { name: 'Ghee', amount: 1, unit: 'tablespoon', originalString: '1 tablespoon ghee or oil' },
      { name: 'Bay leaf', amount: 1, unit: 'leaf', originalString: '1 bay leaf' },
      { name: 'Green cardamom', amount: 2, unit: 'pods', originalString: '2 green cardamom pods' }
    ],
    ingredientNames: ['rice', 'basmati rice', 'water', 'salt', 'ghee', 'bay leaf', 'cardamom'],
    analyzedInstructions: [
      { number: 1, step: 'Wash rice until water runs clear. Soak for 30 minutes.' },
      { number: 2, step: 'Heat ghee in a heavy-bottomed pot. Add bay leaf and cardamom.' },
      { number: 3, step: 'Add drained rice and sauté gently for 2 minutes.' },
      { number: 4, step: 'Add water and salt. Bring to a boil.' },
      { number: 5, step: 'Reduce heat, cover and simmer for 12-15 minutes.' },
      { number: 6, step: 'Let it rest for 5 minutes before fluffing with a fork.' }
    ],
    nutrition: { calories: 160, protein: 3, carbs: 35, fat: 3, fiber: 1 },
    source: 'indian-traditional',
    searchCount: 178,
    ingredientSearchCount: 98,
    popularityScore: 398,
    tags: ['indian', 'rice', 'basmati', 'side-dish', 'gluten-free']
  },
  {
    _id: 'indian-4',
    title: 'Authentic Paneer Butter Masala',
    summary: 'Rich and creamy cottage cheese curry in tomato-based gravy. A restaurant favorite that you can easily make at home.',
    image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&h=300&fit=crop',
    readyInMinutes: 40,
    servings: 4,
    difficulty: 'Medium',
    rating: 4.8,
    ratingCount: 967,
    leftoverFriendly: true,
    quickMeal: false,
    vegetarian: true,
    cuisines: ['Indian'],
    dishTypes: ['Main Course'],
    extendedIngredients: [
      { name: 'Paneer', amount: 250, unit: 'grams', originalString: '250g paneer, cubed' },
      { name: 'Onion', amount: 2, unit: 'medium', originalString: '2 medium onions, chopped' },
      { name: 'Tomato', amount: 4, unit: 'medium', originalString: '4 medium tomatoes, chopped' },
      { name: 'Cashews', amount: 10, unit: 'pieces', originalString: '10 cashews' },
      { name: 'Ginger-garlic paste', amount: 2, unit: 'tablespoons', originalString: '2 tablespoons ginger-garlic paste' },
      { name: 'Heavy cream', amount: 0.5, unit: 'cup', originalString: '1/2 cup heavy cream' },
      { name: 'Butter', amount: 3, unit: 'tablespoons', originalString: '3 tablespoons butter' },
      { name: 'Red chili powder', amount: 1, unit: 'teaspoon', originalString: '1 teaspoon red chili powder' },
      { name: 'Garam masala', amount: 1, unit: 'teaspoon', originalString: '1 teaspoon garam masala' },
      { name: 'Kasuri methi', amount: 1, unit: 'teaspoon', originalString: '1 teaspoon kasuri methi' }
    ],
    ingredientNames: ['paneer', 'cottage cheese', 'onion', 'tomato', 'cashews', 'ginger', 'garlic', 'cream', 'butter', 'red chili powder', 'garam masala', 'kasuri methi'],
    analyzedInstructions: [
      { number: 1, step: 'Lightly fry paneer cubes in butter until golden. Set aside.' },
      { number: 2, step: 'In the same pan, sauté onions until golden. Add cashews and cook for 2 minutes.' },
      { number: 3, step: 'Add tomatoes and ginger-garlic paste. Cook until tomatoes are soft.' },
      { number: 4, step: 'Let mixture cool and blend into smooth paste.' },
      { number: 5, step: 'Heat butter in pan, add the paste and cook for 5 minutes.' },
      { number: 6, step: 'Add cream, spices, and paneer. Simmer for 10 minutes.' },
      { number: 7, step: 'Garnish with kasuri methi and serve with rice or naan.' }
    ],
    nutrition: { calories: 285, protein: 14, carbs: 12, fat: 22, fiber: 3 },
    source: 'indian-traditional',
    searchCount: 289,
    ingredientSearchCount: 167,
    popularityScore: 678,
    tags: ['indian', 'paneer', 'curry', 'vegetarian', 'creamy']
  },
  {
    _id: 'indian-5',
    title: 'South Indian Sambar',
    summary: 'Traditional South Indian lentil curry with vegetables and tangy tamarind. Perfect with rice, idli, or dosa.',
    image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&h=300&fit=crop',
    readyInMinutes: 50,
    servings: 6,
    difficulty: 'Medium',
    rating: 4.7,
    ratingCount: 445,
    leftoverFriendly: true,
    quickMeal: false,
    vegetarian: true,
    vegan: true,
    glutenFree: true,
    cuisines: ['Indian', 'South Indian'],
    dishTypes: ['Main Course', 'Soup'],
    extendedIngredients: [
      { name: 'Toor dal', amount: 1, unit: 'cup', originalString: '1 cup toor dal' },
      { name: 'Drumsticks', amount: 6, unit: 'pieces', originalString: '6 drumstick pieces' },
      { name: 'Okra', amount: 10, unit: 'pieces', originalString: '10 okra, chopped' },
      { name: 'Brinjal', amount: 1, unit: 'small', originalString: '1 small brinjal, cubed' },
      { name: 'Onion', amount: 1, unit: 'medium', originalString: '1 medium onion, chopped' },
      { name: 'Tomato', amount: 2, unit: 'medium', originalString: '2 medium tomatoes, chopped' },
      { name: 'Tamarind paste', amount: 2, unit: 'tablespoons', originalString: '2 tablespoons tamarind paste' },
      { name: 'Sambar powder', amount: 3, unit: 'tablespoons', originalString: '3 tablespoons sambar powder' },
      { name: 'Turmeric powder', amount: 0.5, unit: 'teaspoon', originalString: '1/2 teaspoon turmeric powder' },
      { name: 'Mustard seeds', amount: 1, unit: 'teaspoon', originalString: '1 teaspoon mustard seeds' },
      { name: 'Curry leaves', amount: 10, unit: 'leaves', originalString: '10 curry leaves' },
      { name: 'Asafoetida', amount: 0.25, unit: 'teaspoon', originalString: '1/4 teaspoon asafoetida (hing)' },
      { name: 'Oil', amount: 3, unit: 'tablespoons', originalString: '3 tablespoons oil' }
    ],
    ingredientNames: ['sambar', 'toor dal', 'dal', 'drumsticks', 'okra', 'brinjal', 'eggplant', 'onion', 'tomato', 'tamarind', 'sambar powder', 'turmeric', 'mustard seeds', 'curry leaves', 'asafoetida', 'hing', 'oil'],
    analyzedInstructions: [
      { number: 1, step: 'Cook toor dal with turmeric until soft and mushy.' },
      { number: 2, step: 'In a large pot, cook vegetables with tamarind water and salt.' },
      { number: 3, step: 'Add cooked dal and sambar powder. Simmer for 15 minutes.' },
      { number: 4, step: 'Heat oil in small pan. Add mustard seeds, curry leaves, and hing.' },
      { number: 5, step: 'Add this tempering to the sambar.' },
      { number: 6, step: 'Simmer for 5 more minutes and serve hot.' }
    ],
    nutrition: { calories: 165, protein: 9, carbs: 26, fat: 4, fiber: 7 },
    source: 'south-indian-traditional',
    searchCount: 134,
    ingredientSearchCount: 78,
    popularityScore: 345,
    tags: ['south-indian', 'sambar', 'lentils', 'vegetables', 'tangy']
  },
  {
    _id: 'indian-6',
    title: 'Complete Indian Thali',
    summary: 'A traditional Indian platter with rice, dal, vegetables, chapati, pickle, and papad. A complete balanced meal.',
    image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&h=300&fit=crop',
    readyInMinutes: 90,
    servings: 4,
    difficulty: 'Hard',
    rating: 4.9,
    ratingCount: 234,
    leftoverFriendly: true,
    quickMeal: false,
    vegetarian: true,
    cuisines: ['Indian'],
    dishTypes: ['Main Course', 'Platter'],
    extendedIngredients: [
      { name: 'Basmati rice', amount: 1, unit: 'cup', originalString: '1 cup basmati rice' },
      { name: 'Dal (mixed)', amount: 0.5, unit: 'cup', originalString: '1/2 cup mixed dal' },
      { name: 'Seasonal vegetables', amount: 2, unit: 'cups', originalString: '2 cups seasonal vegetables' },
      { name: 'Whole wheat flour', amount: 1, unit: 'cup', originalString: '1 cup whole wheat flour for chapati' },
      { name: 'Yogurt', amount: 1, unit: 'cup', originalString: '1 cup fresh yogurt' },
      { name: 'Pickle', amount: 4, unit: 'tablespoons', originalString: '4 tablespoons mixed pickle' },
      { name: 'Papad', amount: 4, unit: 'pieces', originalString: '4 papads' },
      { name: 'Ghee', amount: 4, unit: 'tablespoons', originalString: '4 tablespoons ghee' }
    ],
    ingredientNames: ['thali', 'indian thali', 'rice', 'dal', 'vegetables', 'chapati', 'roti', 'yogurt', 'curd', 'pickle', 'papad', 'ghee'],
    analyzedInstructions: [
      { number: 1, step: 'Prepare basmati rice as per recipe instructions.' },
      { number: 2, step: 'Cook dal with spices until soft and flavorful.' },
      { number: 3, step: 'Prepare seasonal vegetable curry with spices.' },
      { number: 4, step: 'Make fresh chapatis and keep them warm.' },
      { number: 5, step: 'Roast papads until crispy.' },
      { number: 6, step: 'Arrange everything on a large plate (thali) with yogurt, pickle, and ghee.' },
      { number: 7, step: 'Serve immediately while everything is hot.' }
    ],
    nutrition: { calories: 485, protein: 18, carbs: 68, fat: 16, fiber: 12 },
    source: 'indian-traditional',
    searchCount: 89,
    ingredientSearchCount: 45,
    popularityScore: 278,
    tags: ['indian', 'thali', 'complete-meal', 'traditional', 'balanced']
  },
  {
    _id: 'indian-7',
    title: 'Rajma (Kidney Bean Curry)',
    summary: 'Popular North Indian kidney bean curry in rich tomato gravy. Comfort food that pairs perfectly with rice.',
    image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&h=300&fit=crop',
    readyInMinutes: 60,
    servings: 4,
    difficulty: 'Medium',
    rating: 4.6,
    ratingCount: 378,
    leftoverFriendly: true,
    quickMeal: false,
    vegetarian: true,
    vegan: true,
    glutenFree: true,
    cuisines: ['Indian', 'North Indian'],
    dishTypes: ['Main Course'],
    extendedIngredients: [
      { name: 'Kidney beans (rajma)', amount: 1, unit: 'cup', originalString: '1 cup rajma, soaked overnight' },
      { name: 'Onion', amount: 2, unit: 'medium', originalString: '2 medium onions, chopped' },
      { name: 'Tomato', amount: 3, unit: 'medium', originalString: '3 medium tomatoes, chopped' },
      { name: 'Ginger-garlic paste', amount: 2, unit: 'tablespoons', originalString: '2 tablespoons ginger-garlic paste' },
      { name: 'Red chili powder', amount: 1, unit: 'teaspoon', originalString: '1 teaspoon red chili powder' },
      { name: 'Coriander powder', amount: 2, unit: 'teaspoons', originalString: '2 teaspoons coriander powder' },
      { name: 'Garam masala', amount: 1, unit: 'teaspoon', originalString: '1 teaspoon garam masala' },
      { name: 'Cumin seeds', amount: 1, unit: 'teaspoon', originalString: '1 teaspoon cumin seeds' }
    ],
    ingredientNames: ['rajma', 'kidney beans', 'beans', 'onion', 'tomato', 'ginger', 'garlic', 'red chili powder', 'coriander powder', 'garam masala', 'cumin'],
    analyzedInstructions: [
      { number: 1, step: 'Boil soaked rajma in pressure cooker until soft.' },
      { number: 2, step: 'Heat oil, add cumin seeds. Add onions and cook until golden.' },
      { number: 3, step: 'Add ginger-garlic paste and cook for 1 minute.' },
      { number: 4, step: 'Add tomatoes and all spices. Cook until tomatoes are soft.' },
      { number: 5, step: 'Add cooked rajma with its water. Simmer for 20 minutes.' },
      { number: 6, step: 'Garnish with coriander and serve with rice.' }
    ],
    nutrition: { calories: 195, protein: 12, carbs: 32, fat: 3, fiber: 10 },
    source: 'north-indian-traditional',
    searchCount: 145,
    ingredientSearchCount: 89,
    popularityScore: 367,
    tags: ['north-indian', 'rajma', 'kidney-beans', 'protein-rich', 'comfort-food']
  },
  {
    _id: 'indian-8',
    title: 'Chole (Chickpea Curry)',
    summary: 'Spicy and flavorful chickpea curry that is a staple in North Indian cuisine. Great with bhature or rice.',
    image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&h=300&fit=crop',
    readyInMinutes: 45,
    servings: 4,
    difficulty: 'Medium',
    rating: 4.7,
    ratingCount: 567,
    leftoverFriendly: true,
    quickMeal: false,
    vegetarian: true,
    vegan: true,
    glutenFree: true,
    cuisines: ['Indian', 'North Indian'],
    dishTypes: ['Main Course'],
    extendedIngredients: [
      { name: 'Chickpeas (chole)', amount: 1, unit: 'cup', originalString: '1 cup chickpeas, soaked overnight' },
      { name: 'Onion', amount: 2, unit: 'medium', originalString: '2 medium onions, chopped' },
      { name: 'Tomato', amount: 2, unit: 'medium', originalString: '2 medium tomatoes, chopped' },
      { name: 'Ginger-garlic paste', amount: 1, unit: 'tablespoon', originalString: '1 tablespoon ginger-garlic paste' },
      { name: 'Chole masala', amount: 2, unit: 'tablespoons', originalString: '2 tablespoons chole masala' },
      { name: 'Red chili powder', amount: 1, unit: 'teaspoon', originalString: '1 teaspoon red chili powder' },
      { name: 'Turmeric powder', amount: 0.5, unit: 'teaspoon', originalString: '1/2 teaspoon turmeric powder' },
      { name: 'Cumin seeds', amount: 1, unit: 'teaspoon', originalString: '1 teaspoon cumin seeds' }
    ],
    ingredientNames: ['chole', 'chickpeas', 'chana', 'onion', 'tomato', 'ginger', 'garlic', 'chole masala', 'red chili powder', 'turmeric', 'cumin'],
    nutrition: { calories: 210, protein: 11, carbs: 35, fat: 4, fiber: 9 },
    source: 'north-indian-traditional',
    tags: ['north-indian', 'chole', 'chickpeas', 'spicy', 'protein-rich']
  }
];

const mockRecipes = [
  ...indianRecipes,
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
      recipe.summary.toLowerCase().includes(searchTerm) ||
      (recipe.ingredientNames && recipe.ingredientNames.some(ing =>
        ing.toLowerCase().includes(searchTerm)
      )) ||
      (recipe.extendedIngredients && recipe.extendedIngredients.some(ing =>
        ing.name.toLowerCase().includes(searchTerm)
      )) ||
      (recipe.cuisines && recipe.cuisines.some(cuisine =>
        cuisine.toLowerCase().includes(searchTerm)
      )) ||
      (recipe.dishTypes && recipe.dishTypes.some(type =>
        type.toLowerCase().includes(searchTerm)
      ))
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

// Enhanced ingredient-based search for mock mode
const searchByIngredients = (ingredients = [], options = {}) => {
  const { matchType = 'any', limit = 20 } = options;
  let results = [...mockRecipes];

  if (ingredients && ingredients.length > 0) {
    const searchIngredients = ingredients.map(ing => ing.toLowerCase());

    results = results.filter(recipe => {
      if (!recipe.ingredientNames && !recipe.extendedIngredients) return false;

      const recipeIngredients = [
        ...(recipe.ingredientNames || []),
        ...(recipe.extendedIngredients || []).map(ing => ing.name.toLowerCase())
      ];

      if (matchType === 'all') {
        // Must have ALL ingredients
        return searchIngredients.every(searchIng =>
          recipeIngredients.some(recipeIng =>
            recipeIng.includes(searchIng) || searchIng.includes(recipeIng)
          )
        );
      } else if (matchType === 'most') {
        // Must have at least 60% of ingredients
        const matchCount = searchIngredients.filter(searchIng =>
          recipeIngredients.some(recipeIng =>
            recipeIng.includes(searchIng) || searchIng.includes(recipeIng)
          )
        ).length;
        return matchCount / searchIngredients.length >= 0.6;
      } else {
        // Default 'any' - must have at least one ingredient
        return searchIngredients.some(searchIng =>
          recipeIngredients.some(recipeIng =>
            recipeIng.includes(searchIng) || searchIng.includes(recipeIng)
          )
        );
      }
    });

    // Calculate match scores and add matched/missing ingredients
    results = results.map(recipe => {
      const recipeIngredients = [
        ...(recipe.ingredientNames || []),
        ...(recipe.extendedIngredients || []).map(ing => ing.name.toLowerCase())
      ];

      const matchedIngredients = searchIngredients.filter(searchIng =>
        recipeIngredients.some(recipeIng =>
          recipeIng.includes(searchIng) || searchIng.includes(recipeIng)
        )
      );

      const missingIngredients = recipeIngredients.filter(recipeIng =>
        !searchIngredients.some(searchIng =>
          recipeIng.includes(searchIng) || searchIng.includes(recipeIng)
        )
      );

      const matchScore = matchedIngredients.length / Math.max(searchIngredients.length, 1);

      return {
        ...recipe,
        matchScore,
        matchedIngredients,
        missingIngredients: missingIngredients.slice(0, 5) // Limit to 5 missing ingredients
      };
    });

    // Sort by match score (highest first)
    results.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
  }

  // Limit results
  results = results.slice(0, limit);

  return results;
};

// Get all recipes (including comprehensive database)
const getAllRecipes = () => {
  return mockRecipes;
};

// Enhanced search specifically for cuisines
const searchByCuisine = (cuisine, limit = 50) => {
  const normalizedCuisine = cuisine.toLowerCase();

  let results = mockRecipes.filter(recipe =>
    (recipe.cuisines && recipe.cuisines.some(c => c.toLowerCase().includes(normalizedCuisine))) ||
    recipe.title.toLowerCase().includes(normalizedCuisine) ||
    recipe.summary.toLowerCase().includes(normalizedCuisine)
  );

  // Sort by popularity and rating
  results.sort((a, b) => {
    const scoreA = (a.popularityScore || 0) + (a.rating || 0) * 100;
    const scoreB = (b.popularityScore || 0) + (b.rating || 0) * 100;
    return scoreB - scoreA;
  });

  return results.slice(0, limit);
};

// Test function to check recipe database
const testRecipeDatabase = () => {
  const totalRecipes = mockRecipes.length;
  const gujaratiRecipes = searchByCuisine('gujarati');
  const italianRecipes = searchByCuisine('italian');
  const indianRecipes = searchByCuisine('indian');
  const chineseRecipes = searchByCuisine('chinese');

  console.log(`📊 Recipe Database Status:`);
  console.log(`   Total Recipes: ${totalRecipes}`);
  console.log(`   Gujarati Recipes: ${gujaratiRecipes.length}`);
  console.log(`   Italian Recipes: ${italianRecipes.length}`);
  console.log(`   Indian Recipes: ${indianRecipes.length}`);
  console.log(`   Chinese Recipes: ${chineseRecipes.length}`);

  return {
    total: totalRecipes,
    gujarati: gujaratiRecipes.length,
    italian: italianRecipes.length,
    indian: indianRecipes.length,
    chinese: chineseRecipes.length
  };
};

module.exports = {
  mockRecipes,
  getDailyRecipe,
  getRandomRecipes,
  getRecipeById,
  searchRecipes,
  searchByIngredients,
  getAllRecipes,
  searchByCuisine,
  testRecipeDatabase
};
