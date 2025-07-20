const express = require("express");
const path = require("path");
const compression = require('compression');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(compression());
app.use(express.json({ limit: '10mb' }));

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Cache control middleware
app.use('/api', (req, res, next) => {
  // Cache API responses for 5 minutes
  res.setHeader('Cache-Control', 'public, max-age=300');
  next();
});

// Static file caching
app.use(express.static('public', {
  maxAge: '1d', // Cache static files for 1 day
  etag: true,
  lastModified: true
}));

// Enhanced recipes data with additional features
let recipes = [
  {
    id: 1,
    name: "Spaghetti Carbonara",
    category: "Italian",
    difficulty: "Medium",
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1621996346565-e3dbc353d461?w=400",
    ingredients: [
      "400g spaghetti",
      "4 large eggs",
      "200g bacon",
      "100g parmesan cheese",
      "black pepper",
      "salt",
    ],
    instructions:
      "1. Boil salted water and cook spaghetti until al dente. 2. Fry bacon until crispy. 3. Beat eggs with grated parmesan and black pepper. 4. Drain pasta, reserving some pasta water. 5. Mix hot pasta with egg mixture, adding pasta water as needed. 6. Add crispy bacon and serve immediately.",
    cookTime: "20 minutes",
    prepTime: "10 minutes",
    servings: 4,
    calories: 520,
    nutrition: {
      protein: "22g",
      carbs: "58g",
      fat: "18g",
      fiber: "3g",
    },
    tags: ["pasta", "quick", "comfort food"],
    allergens: ["eggs", "dairy"],
    dietaryInfo: {
      vegetarian: false,
      vegan: false,
      glutenFree: false,
      dairyFree: false,
    },
    matchableIngredients: [
      "spaghetti",
      "pasta",
      "eggs",
      "bacon",
      "parmesan",
      "cheese",
      "black pepper",
      "salt",
    ],
  },
  {
    id: 2,
    name: "Chicken Caesar Salad",
    category: "Salads",
    difficulty: "Easy",
    rating: 4.5,
    image: "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400",
    ingredients: [
      "2 chicken breasts",
      "1 head romaine lettuce",
      "1 cup croutons",
      "50g parmesan cheese",
      "caesar dressing",
      "olive oil",
      "salt and pepper",
    ],
    instructions:
      "1. Season chicken breasts with salt, pepper, and olive oil. 2. Grill chicken for 6-8 minutes per side until cooked through. 3. Let chicken rest, then slice. 4. Wash and chop romaine lettuce. 5. Toss lettuce with caesar dressing. 6. Top with sliced chicken, croutons, and grated parmesan.",
    cookTime: "15 minutes",
    prepTime: "10 minutes",
    servings: 2,
    calories: 380,
    nutrition: {
      protein: "35g",
      carbs: "12g",
      fat: "22g",
      fiber: "4g",
    },
    tags: ["healthy", "protein", "low carb"],
    allergens: ["dairy"],
    dietaryInfo: {
      vegetarian: false,
      vegan: false,
      glutenFree: true,
      dairyFree: false,
    },
    matchableIngredients: [
      "chicken",
      "lettuce",
      "romaine",
      "croutons",
      "parmesan",
      "cheese",
      "caesar dressing",
      "olive oil",
    ],
  },
  {
    id: 3,
    name: "Chocolate Chip Cookies",
    category: "Desserts",
    difficulty: "Easy",
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400",
    ingredients: [
      "2¼ cups all-purpose flour",
      "1 cup butter, softened",
      "¾ cup brown sugar",
      "¾ cup white sugar",
      "2 large eggs",
      "2 tsp vanilla extract",
      "1 tsp baking soda",
      "1 tsp salt",
      "2 cups chocolate chips",
    ],
    instructions:
      "1. Preheat oven to 375°F. 2. Mix flour, baking soda, and salt in a bowl. 3. Cream butter and sugars until fluffy. 4. Beat in eggs and vanilla. 5. Gradually mix in flour mixture. 6. Stir in chocolate chips. 7. Drop rounded tablespoons onto ungreased baking sheets. 8. Bake 9-11 minutes until golden brown.",
    cookTime: "11 minutes",
    prepTime: "15 minutes",
    servings: 24,
    calories: 280,
    nutrition: {
      protein: "3g",
      carbs: "35g",
      fat: "14g",
      fiber: "1g",
    },
    tags: ["dessert", "baking", "sweet"],
    allergens: ["eggs", "dairy", "gluten"],
    dietaryInfo: {
      vegetarian: true,
      vegan: false,
      glutenFree: false,
      dairyFree: false,
    },
    matchableIngredients: [
      "flour",
      "butter",
      "sugar",
      "brown sugar",
      "eggs",
      "vanilla",
      "baking soda",
      "chocolate chips",
    ],
  },
  {
    id: 4,
    name: "Vegetable Stir Fry",
    category: "Asian",
    difficulty: "Easy",
    rating: 4.3,
    image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400",
    ingredients: [
      "2 cups mixed vegetables",
      "2 tbsp vegetable oil",
      "2 cloves garlic, minced",
      "1 inch ginger, grated",
      "2 tbsp soy sauce",
      "1 tbsp sesame oil",
      "1 tsp cornstarch",
      "green onions for garnish",
    ],
    instructions:
      "1. Heat oil in a large wok or skillet over high heat. 2. Add garlic and ginger, stir-fry for 30 seconds. 3. Add vegetables and stir-fry for 3-4 minutes. 4. Mix soy sauce, sesame oil, and cornstarch. 5. Pour sauce over vegetables and toss to coat. 6. Cook for another 1-2 minutes. 7. Garnish with green onions and serve.",
    cookTime: "8 minutes",
    prepTime: "10 minutes",
    servings: 3,
    calories: 150,
    nutrition: {
      protein: "4g",
      carbs: "18g",
      fat: "8g",
      fiber: "6g",
    },
    tags: ["vegetarian", "healthy", "quick"],
    allergens: ["soy"],
    dietaryInfo: {
      vegetarian: true,
      vegan: true,
      glutenFree: true,
      dairyFree: true,
    },
    matchableIngredients: [
      "vegetables",
      "mixed vegetables",
      "oil",
      "garlic",
      "ginger",
      "soy sauce",
      "sesame oil",
      "green onions",
    ],
  },
  {
    id: 5,
    name: "Beef Tacos",
    category: "Mexican",
    difficulty: "Medium",
    rating: 4.6,
    image: "https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=400",
    ingredients: [
      "1 lb ground beef",
      "8 taco shells",
      "1 packet taco seasoning",
      "1 cup shredded lettuce",
      "1 cup diced tomatoes",
      "1 cup shredded cheese",
      "sour cream",
      "salsa",
    ],
    instructions:
      "1. Brown ground beef in a large skillet over medium-high heat. 2. Drain fat and add taco seasoning with water according to package directions. 3. Simmer until sauce thickens. 4. Warm taco shells according to package directions. 5. Fill shells with meat mixture. 6. Top with lettuce, tomatoes, cheese, sour cream, and salsa as desired.",
    cookTime: "15 minutes",
    prepTime: "10 minutes",
    servings: 4,
    calories: 420,
    nutrition: {
      protein: "28g",
      carbs: "32g",
      fat: "18g",
      fiber: "4g",
    },
    tags: ["mexican", "meat", "family-friendly"],
    allergens: ["dairy", "gluten"],
    dietaryInfo: {
      vegetarian: false,
      vegan: false,
      glutenFree: false,
      dairyFree: false,
    },
    matchableIngredients: [
      "ground beef",
      "beef",
      "taco shells",
      "lettuce",
      "tomatoes",
      "cheese",
      "sour cream",
      "salsa",
      "taco seasoning",
    ],
  },
  {
    id: 6,
    name: "Roti with Dal Curry",
    category: "Indian",
    difficulty: "Easy",
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400",
    ingredients: [
      "4 roti",
      "1 cup dal (lentils)",
      "2 cups water",
      "1 onion, chopped",
      "2 tomatoes, chopped",
      "2 cloves garlic",
      "1 inch ginger",
      "1 tsp turmeric",
      "1 tsp cumin seeds",
      "curry leaves",
      "salt to taste",
      "2 tbsp oil",
    ],
    instructions:
      "1. Wash and cook dal with water and turmeric until soft. 2. Heat oil in a pan, add cumin seeds and curry leaves. 3. Add chopped onions, ginger, and garlic. Cook until golden. 4. Add tomatoes and cook until mushy. 5. Add cooked dal and simmer for 10 minutes. 6. Season with salt. 7. Warm roti and serve with dal curry.",
    cookTime: "25 minutes",
    prepTime: "15 minutes",
    servings: 4,
    calories: 320,
    nutrition: {
      protein: "18g",
      carbs: "55g",
      fat: "8g",
      fiber: "12g",
    },
    tags: ["indian", "vegetarian", "healthy", "traditional"],
    allergens: ["gluten"],
    dietaryInfo: {
      vegetarian: true,
      vegan: true,
      glutenFree: false,
      dairyFree: true,
    },
    matchableIngredients: [
      "roti",
      "dal",
      "lentils",
      "onion",
      "tomatoes",
      "garlic",
      "ginger",
      "turmeric",
      "cumin",
      "curry leaves",
      "oil",
    ],
  },
  {
    id: 7,
    name: "Paneer Roti Wrap",
    category: "Indian",
    difficulty: "Medium",
    rating: 4.6,
    image: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400",
    ingredients: [
      "4 roti",
      "200g paneer, cubed",
      "1 bell pepper, sliced",
      "1 onion, sliced",
      "2 tbsp yogurt",
      "1 tsp garam masala",
      "1 tsp red chili powder",
      "1 tsp coriander powder",
      "2 tbsp oil",
      "fresh coriander leaves",
      "salt to taste",
    ],
    instructions:
      "1. Marinate paneer cubes with yogurt, garam masala, chili powder, and salt for 15 minutes. 2. Heat oil in a pan and cook marinated paneer until golden. 3. In the same pan, sauté onions and bell peppers until tender. 4. Warm the roti. 5. Place paneer and vegetables on roti, sprinkle fresh coriander. 6. Roll tightly and serve hot.",
    cookTime: "20 minutes",
    prepTime: "20 minutes",
    servings: 2,
    calories: 450,
    nutrition: {
      protein: "22g",
      carbs: "48g",
      fat: "18g",
      fiber: "6g",
    },
    tags: ["indian", "vegetarian", "protein-rich", "wrap"],
    allergens: ["dairy", "gluten"],
    dietaryInfo: {
      vegetarian: true,
      vegan: false,
      glutenFree: false,
      dairyFree: false,
    },
    matchableIngredients: [
      "roti",
      "paneer",
      "bell pepper",
      "onion",
      "yogurt",
      "garam masala",
      "chili powder",
      "coriander",
      "oil",
    ],
  },
  {
    id: 8,
    name: "Aloo Roti (Potato Stuffed Flatbread)",
    category: "Indian",
    difficulty: "Medium",
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1574653491798-40b6e4b1d9ad?w=400",
    ingredients: [
      "2 cups wheat flour",
      "3 large potatoes, boiled",
      "1 onion, finely chopped",
      "2 green chilies, chopped",
      "1 tsp cumin seeds",
      "1 tsp coriander seeds",
      "1 tsp red chili powder",
      "1/2 tsp turmeric",
      "fresh coriander leaves",
      "ghee or oil",
      "salt to taste",
    ],
    instructions:
      "1. Make dough with flour, salt, and water. Rest for 30 minutes. 2. Mash boiled potatoes with spices, onions, and herbs. 3. Roll dough into circles, place potato filling, and seal edges. 4. Roll gently to flatten. 5. Cook on hot tawa with ghee until golden spots appear. 6. Serve hot with yogurt or pickle.",
    cookTime: "30 minutes",
    prepTime: "45 minutes",
    servings: 6,
    calories: 280,
    nutrition: {
      protein: "8g",
      carbs: "52g",
      fat: "6g",
      fiber: "4g",
    },
    tags: ["indian", "vegetarian", "comfort food", "traditional"],
    allergens: ["gluten", "dairy"],
    dietaryInfo: {
      vegetarian: true,
      vegan: false,
      glutenFree: false,
      dairyFree: false,
    },
    matchableIngredients: [
      "wheat flour",
      "flour",
      "potatoes",
      "aloo",
      "onion",
      "green chilies",
      "cumin",
      "coriander",
      "chili powder",
      "turmeric",
      "ghee",
      "roti",
    ],
  },
];

// User favorites storage (in production, this would be in a database)
let userFavorites = [];

// Recipe of the day
let recipeOfTheDay = recipes[Math.floor(Math.random() * recipes.length)];

// Categories
const categories = [...new Set(recipes.map((recipe) => recipe.category))];
const difficulties = [...new Set(recipes.map((recipe) => recipe.difficulty))];
const tags = [...new Set(recipes.flatMap((recipe) => recipe.tags))];

// API Routes
app.get("/api/recipes", (req, res) => {
  res.json(recipes);
});

app.get("/api/recipes/:id", (req, res) => {
  const recipe = recipes.find((r) => r.id === parseInt(req.params.id));
  if (!recipe) {
    return res.status(404).json({ error: "Recipe not found" });
  }
  res.json(recipe);
});

// Get recipe of the day
app.get("/api/recipe-of-the-day", (req, res) => {
  res.json(recipeOfTheDay);
});

// Get categories, difficulties, and tags
app.get("/api/filters", (req, res) => {
  res.json({ categories, difficulties, tags });
});

// Add new recipe
app.post("/api/recipes", (req, res) => {
  const newRecipe = {
    id: recipes.length + 1,
    ...req.body,
    rating: 0,
    tags: req.body.tags || [],
    ingredients: req.body.ingredients || [],
    image:
      req.body.image ||
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400",
  };
  recipes.push(newRecipe);
  res.status(201).json(newRecipe);
});

// Rate a recipe
app.post("/api/recipes/:id/rate", (req, res) => {
  const recipeId = parseInt(req.params.id);
  const { rating } = req.body;
  const recipe = recipes.find((r) => r.id === recipeId);

  if (!recipe) {
    return res.status(404).json({ error: "Recipe not found" });
  }

  if (rating < 1 || rating > 5) {
    return res.status(400).json({ error: "Rating must be between 1 and 5" });
  }

  // Simple rating update (in production, you'd calculate average from all user ratings)
  recipe.rating = (recipe.rating * 10 + rating) / 11;
  recipe.rating = Math.round(recipe.rating * 10) / 10;

  res.json({ message: "Rating updated", rating: recipe.rating });
});

// Toggle favorite
app.post("/api/recipes/:id/favorite", (req, res) => {
  const recipeId = parseInt(req.params.id);
  const index = userFavorites.indexOf(recipeId);

  if (index > -1) {
    userFavorites.splice(index, 1);
    res.json({ isFavorite: false });
  } else {
    userFavorites.push(recipeId);
    res.json({ isFavorite: true });
  }
});

// Get favorites
app.get("/api/favorites", (req, res) => {
  const favoriteRecipes = recipes.filter((recipe) =>
    userFavorites.includes(recipe.id),
  );
  res.json(favoriteRecipes);
});





// Smart recipe finder endpoint
app.post("/api/find-recipes", (req, res) => {
  const {
    ingredients = [],
    matchType = "any",
    dietaryRestrictions = {},
    allergenAvoidance = [],
    nutritionGoals = {},
  } = req.body;

  if (!ingredients || ingredients.length === 0) {
    return res.json({
      recipes: [],
      message: "Please provide at least one ingredient",
    });
  }

  let matchedRecipes = recipes.map((recipe) => {
    const recipeIngredients = recipe.matchableIngredients || [];
    const matchedIngredients = ingredients.filter((ingredient) =>
      recipeIngredients.some(
        (recipeIng) =>
          recipeIng.toLowerCase().includes(ingredient.toLowerCase()) ||
          ingredient.toLowerCase().includes(recipeIng.toLowerCase()),
      ),
    );

    const matchScore = matchedIngredients.length / ingredients.length;
    const totalIngredientMatch =
      matchedIngredients.length / recipeIngredients.length;

    return {
      ...recipe,
      matchedIngredients,
      missingIngredients: ingredients.filter(
        (ing) => !matchedIngredients.includes(ing),
      ),
      matchScore,
      totalIngredientMatch,
      overallScore: matchScore * 0.7 + totalIngredientMatch * 0.3,
    };
  });

  // Filter based on match type
  switch (matchType) {
    case "all":
      matchedRecipes = matchedRecipes.filter(
        (recipe) => recipe.matchScore === 1,
      );
      break;
    case "most":
      matchedRecipes = matchedRecipes.filter(
        (recipe) => recipe.matchScore >= 0.6,
      );
      break;
    case "any":
    default:
      matchedRecipes = matchedRecipes.filter((recipe) => recipe.matchScore > 0);
      break;
  }

  // Filter by dietary restrictions
  if (dietaryRestrictions.vegetarian) {
    matchedRecipes = matchedRecipes.filter(
      (recipe) => recipe.dietaryInfo?.vegetarian,
    );
  }
  if (dietaryRestrictions.vegan) {
    matchedRecipes = matchedRecipes.filter(
      (recipe) => recipe.dietaryInfo?.vegan,
    );
  }
  if (dietaryRestrictions.glutenFree) {
    matchedRecipes = matchedRecipes.filter(
      (recipe) => recipe.dietaryInfo?.glutenFree,
    );
  }
  if (dietaryRestrictions.dairyFree) {
    matchedRecipes = matchedRecipes.filter(
      (recipe) => recipe.dietaryInfo?.dairyFree,
    );
  }

  // Filter by allergen avoidance
  if (allergenAvoidance.length > 0) {
    matchedRecipes = matchedRecipes.filter((recipe) => {
      const recipeAllergens = recipe.allergens || [];
      return !allergenAvoidance.some((allergen) =>
        recipeAllergens.includes(allergen),
      );
    });
  }

  // Filter by nutrition goals
  if (nutritionGoals.maxCalories) {
    matchedRecipes = matchedRecipes.filter(
      (recipe) => recipe.calories <= nutritionGoals.maxCalories,
    );
  }
  if (nutritionGoals.minProtein) {
    matchedRecipes = matchedRecipes.filter((recipe) => {
      const protein = parseInt(recipe.nutrition?.protein) || 0;
      return protein >= nutritionGoals.minProtein;
    });
  }
  if (nutritionGoals.maxCarbs) {
    matchedRecipes = matchedRecipes.filter((recipe) => {
      const carbs = parseInt(recipe.nutrition?.carbs) || 0;
      return carbs <= nutritionGoals.maxCarbs;
    });
  }

  // Sort by match score (best matches first)
  matchedRecipes.sort((a, b) => b.overallScore - a.overallScore);

  res.json({
    recipes: matchedRecipes,
    totalFound: matchedRecipes.length,
    searchCriteria: {
      ingredients,
      matchType,
      dietaryRestrictions,
      allergenAvoidance,
      nutritionGoals,
    },
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Catch-all handler for React Router (if needed)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Recipe Bot server running on http://localhost:${PORT}`);
});
