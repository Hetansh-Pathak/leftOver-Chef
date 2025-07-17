const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.static("public"));
app.use(express.json());

// Sample recipes data
const recipes = [
  {
    id: 1,
    name: "Spaghetti Carbonara",
    ingredients: [
      "spaghetti",
      "eggs",
      "bacon",
      "parmesan cheese",
      "black pepper",
    ],
    instructions:
      "1. Cook pasta. 2. Fry bacon. 3. Mix eggs and cheese. 4. Combine all ingredients.",
    cookTime: "20 minutes",
  },
  {
    id: 2,
    name: "Chicken Caesar Salad",
    ingredients: [
      "chicken breast",
      "romaine lettuce",
      "croutons",
      "parmesan",
      "caesar dressing",
    ],
    instructions:
      "1. Grill chicken. 2. Chop lettuce. 3. Mix with dressing and toppings.",
    cookTime: "15 minutes",
  },
];

// Routes
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

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

app.listen(PORT, () => {
  console.log(`Recipe Bot server running on http://localhost:${PORT}`);
});
