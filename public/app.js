class RecipeBot {
  constructor() {
    this.recipes = [];
    this.init();
  }

  async init() {
    await this.loadRecipes();
    this.setupEventListeners();
    this.displayRecipes();
  }

  async loadRecipes() {
    try {
      const response = await fetch("/api/recipes");
      this.recipes = await response.json();
    } catch (error) {
      console.error("Error loading recipes:", error);
      this.recipes = [];
    }
  }

  setupEventListeners() {
    const searchBtn = document.getElementById("searchBtn");
    const searchInput = document.getElementById("searchInput");
    const backBtn = document.getElementById("backBtn");

    searchBtn.addEventListener("click", () => this.searchRecipes());
    searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") this.searchRecipes();
    });
    backBtn.addEventListener("click", () => this.showRecipeList());
  }

  displayRecipes(recipesToShow = this.recipes) {
    const recipeGrid = document.getElementById("recipeGrid");

    if (recipesToShow.length === 0) {
      recipeGrid.innerHTML =
        '<div class="no-recipes">No recipes found. Try a different search term.</div>';
      return;
    }

    recipeGrid.innerHTML = recipesToShow
      .map(
        (recipe) => `
            <div class="recipe-card" onclick="recipeBot.showRecipeDetail(${recipe.id})">
                <h3 class="recipe-name">${recipe.name}</h3>
                <div class="recipe-meta">
                    <span class="ingredient-count">${recipe.ingredients.length} ingredients</span>
                    <span class="cook-time">⏱️ ${recipe.cookTime}</span>
                </div>
                <p class="recipe-preview">${recipe.instructions.substring(0, 100)}...</p>
            </div>
        `,
      )
      .join("");
  }

  searchRecipes() {
    const searchTerm = document
      .getElementById("searchInput")
      .value.toLowerCase()
      .trim();

    if (!searchTerm) {
      this.displayRecipes();
      return;
    }

    const filteredRecipes = this.recipes.filter(
      (recipe) =>
        recipe.name.toLowerCase().includes(searchTerm) ||
        recipe.ingredients.some((ingredient) =>
          ingredient.toLowerCase().includes(searchTerm),
        ),
    );

    this.displayRecipes(filteredRecipes);
  }

  async showRecipeDetail(recipeId) {
    try {
      const response = await fetch(`/api/recipes/${recipeId}`);
      const recipe = await response.json();

      document.getElementById("recipeGrid").style.display = "none";
      document.getElementById("recipeDetail").style.display = "block";

      document.getElementById("recipeContent").innerHTML = `
                <h2 class="recipe-title">${recipe.name}</h2>
                
                <div class="recipe-meta">
                    <span class="cook-time">⏱️ Cook Time: ${recipe.cookTime}</span>
                </div>
                
                <div class="ingredients-section">
                    <h3 class="section-title">🥘 Ingredients</h3>
                    <ul class="ingredients-list">
                        ${recipe.ingredients
                          .map(
                            (ingredient) =>
                              `<li class="ingredient-item">${ingredient}</li>`,
                          )
                          .join("")}
                    </ul>
                </div>
                
                <div class="instructions-section">
                    <h3 class="section-title">👨‍🍳 Instructions</h3>
                    <p class="instructions-text">${recipe.instructions}</p>
                </div>
            `;
    } catch (error) {
      console.error("Error loading recipe details:", error);
    }
  }

  showRecipeList() {
    document.getElementById("recipeDetail").style.display = "none";
    document.getElementById("recipeGrid").style.display = "grid";
    document.getElementById("searchInput").value = "";
    this.displayRecipes();
  }
}

// Initialize the app
const recipeBot = new RecipeBot();
