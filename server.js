const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

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

// Recipe Generator Data
const recipeTemplates = {
  proteins: [
    "chicken",
    "beef",
    "pork",
    "fish",
    "tofu",
    "shrimp",
    "turkey",
    "lamb",
    "duck",
    "salmon",
  ],
  vegetables: [
    "broccoli",
    "carrots",
    "spinach",
    "bell peppers",
    "onions",
    "garlic",
    "mushrooms",
    "zucchini",
    "tomatoes",
    "cauliflower",
  ],
  grains: [
    "rice",
    "pasta",
    "quinoa",
    "couscous",
    "bulgur",
    "barley",
    "farro",
    "noodles",
    "bread",
    "potatoes",
  ],
  cuisines: [
    "Italian",
    "Asian",
    "Mexican",
    "Mediterranean",
    "Indian",
    "French",
    "Thai",
    "Greek",
    "American",
    "Japanese",
  ],
  cookingMethods: [
    "grilled",
    "roasted",
    "sautéed",
    "braised",
    "fried",
    "baked",
    "steamed",
    "stir-fried",
    "poached",
    "smoked",
  ],
  seasonings: [
    "garlic",
    "herbs",
    "spices",
    "lemon",
    "ginger",
    "soy sauce",
    "olive oil",
    "parmesan",
    "chili",
    "curry",
  ],
  difficulties: ["Easy", "Medium", "Hard"],
  cookTimes: [
    "15 minutes",
    "20 minutes",
    "30 minutes",
    "45 minutes",
    "1 hour",
    "1.5 hours",
  ],
  prepTimes: [
    "10 minutes",
    "15 minutes",
    "20 minutes",
    "30 minutes",
    "45 minutes",
  ],
  servings: [2, 3, 4, 5, 6, 8],
  tags: [
    "quick",
    "healthy",
    "comfort food",
    "vegetarian",
    "gluten-free",
    "low-carb",
    "high-protein",
    "spicy",
    "sweet",
    "savory",
  ],
};

function generateRandomRecipe(id) {
  const protein =
    recipeTemplates.proteins[
      Math.floor(Math.random() * recipeTemplates.proteins.length)
    ];
  const vegetable =
    recipeTemplates.vegetables[
      Math.floor(Math.random() * recipeTemplates.vegetables.length)
    ];
  const grain =
    recipeTemplates.grains[
      Math.floor(Math.random() * recipeTemplates.grains.length)
    ];
  const cuisine =
    recipeTemplates.cuisines[
      Math.floor(Math.random() * recipeTemplates.cuisines.length)
    ];
  const method =
    recipeTemplates.cookingMethods[
      Math.floor(Math.random() * recipeTemplates.cookingMethods.length)
    ];
  const seasoning =
    recipeTemplates.seasonings[
      Math.floor(Math.random() * recipeTemplates.seasonings.length)
    ];

  const name = `${method.charAt(0).toUpperCase() + method.slice(1)} ${protein.charAt(0).toUpperCase() + protein.slice(1)} with ${vegetable.charAt(0).toUpperCase() + vegetable.slice(1)} and ${grain.charAt(0).toUpperCase() + grain.slice(1)}`;

  const ingredients = [
    `1 lb ${protein}`,
    `2 cups ${vegetable}`,
    `1 cup ${grain}`,
    `2 tbsp ${seasoning}`,
    "1 tbsp olive oil",
    "salt and pepper to taste",
    "1 onion, diced",
    "2 cloves garlic, minced",
  ];

  const instructions = `1. Prepare all ingredients by washing and chopping as needed. 2. Heat olive oil in a large pan over medium heat. 3. Add onion and garlic, cook for 2-3 minutes. 4. Add ${protein} and cook until ${method}. 5. Add ${vegetable} and cook for 5-7 minutes. 6. Season with ${seasoning}, salt, and pepper. 7. Serve over ${grain} and enjoy!`;

  return {
    id: id,
    name: name,
    category: cuisine,
    difficulty:
      recipeTemplates.difficulties[
        Math.floor(Math.random() * recipeTemplates.difficulties.length)
      ],
    rating: Math.round((Math.random() * 2 + 3) * 10) / 10, // 3.0 to 5.0
    image: `https://images.unsplash.com/photo-${Math.floor(Math.random() * 1000000000000)}?w=400`,
    ingredients: ingredients,
    instructions: instructions,
    cookTime:
      recipeTemplates.cookTimes[
        Math.floor(Math.random() * recipeTemplates.cookTimes.length)
      ],
    prepTime:
      recipeTemplates.prepTimes[
        Math.floor(Math.random() * recipeTemplates.prepTimes.length)
      ],
    servings:
      recipeTemplates.servings[
        Math.floor(Math.random() * recipeTemplates.servings.length)
      ],
    calories: Math.floor(Math.random() * 400 + 200), // 200-600 calories
    nutrition: {
      protein: `${Math.floor(Math.random() * 30 + 15)}g`,
      carbs: `${Math.floor(Math.random() * 50 + 20)}g`,
      fat: `${Math.floor(Math.random() * 25 + 10)}g`,
      fiber: `${Math.floor(Math.random() * 8 + 2)}g`,
    },
    tags: [
      recipeTemplates.tags[
        Math.floor(Math.random() * recipeTemplates.tags.length)
      ],
      recipeTemplates.tags[
        Math.floor(Math.random() * recipeTemplates.tags.length)
      ],
    ].filter((tag, index, self) => self.indexOf(tag) === index), // Remove duplicates
  };
}

// Generate bulk recipes endpoint
app.post("/api/generate-recipes", (req, res) => {
  const { count = 100 } = req.body;
  const maxCount = Math.min(count, 50000); // Limit to prevent server overload

  console.log(`Generating ${maxCount} recipes...`);

  const newRecipes = [];
  const startId = recipes.length + 1;

  for (let i = 0; i < maxCount; i++) {
    const recipe = generateRandomRecipe(startId + i);
    newRecipes.push(recipe);
  }

  recipes.push(...newRecipes);

  // Update categories, difficulties, and tags
  const newCategories = [...new Set(recipes.map((recipe) => recipe.category))];
  const newDifficulties = [
    ...new Set(recipes.map((recipe) => recipe.difficulty)),
  ];
  const newTags = [...new Set(recipes.flatMap((recipe) => recipe.tags || []))];

  console.log(
    `Generated ${maxCount} recipes successfully! Total recipes: ${recipes.length}`,
  );

  res.json({
    message: `Successfully generated ${maxCount} recipes`,
    totalRecipes: recipes.length,
    generatedCount: maxCount,
    categories: newCategories,
    difficulties: newDifficulties,
    tags: newTags,
  });
});

// Get recipe stats
app.get("/api/stats", (req, res) => {
  res.json({
    totalRecipes: recipes.length,
    totalFavorites: userFavorites.length,
    categories: categories.length,
    averageRating: (
      recipes.reduce((sum, recipe) => sum + recipe.rating, 0) / recipes.length
    ).toFixed(1),
  });
});

// Serve static files (after API routes)
app.use(express.static("public"));

// Catch-all handler for React Router (if needed)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Recipe Bot server running on http://localhost:${PORT}`);
});
