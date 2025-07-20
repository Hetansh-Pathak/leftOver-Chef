class RecipeBot {
  constructor() {
    this.recipes = [];
    this.favoriteRecipes = [];
    this.currentFilters = {
      category: "",
      difficulty: "",
      rating: "",
      search: "",
    };
    this.currentSort = "name";
    this.currentTab = "browse";
    this.selectedIngredients = [];
    this.timer = {
      interval: null,
      timeLeft: 0,
      isRunning: false,
    };
    this.init();
  }

  async init() {
    await this.loadRecipes();
    await this.loadFavorites();
    await this.loadFilters();
    await this.loadDailyRecipe();
    this.setupEventListeners();
    this.displayRecipes();
    this.updateStats();
  }

  async loadRecipes() {
    try {
      const response = await fetch("/api/recipes");
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      this.recipes = await response.json();
    } catch (error) {
      console.error("Error loading recipes:", error);
      this.recipes = [];
    }
  }

  async loadFavorites() {
    try {
      const response = await fetch("/api/favorites");
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      this.favoriteRecipes = await response.json();
    } catch (error) {
      console.error("Error loading favorites:", error);
      this.favoriteRecipes = [];
    }
  }

  async loadFilters() {
    try {
      const response = await fetch("/api/filters");
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const filters = await response.json();

      this.populateFilterOptions("categoryFilter", filters.categories);
      this.populateFilterOptions("difficultyFilter", filters.difficulties);
    } catch (error) {
      console.error("Error loading filters:", error);
    }
  }

  async loadDailyRecipe() {
    try {
      const response = await fetch("/api/recipe-of-the-day");
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const dailyRecipe = await response.json();
      this.displayDailyRecipe(dailyRecipe);
    } catch (error) {
      console.error("Error loading daily recipe:", error);
    }
  }

  populateFilterOptions(selectId, options) {
    const select = document.getElementById(selectId);
    options.forEach((option) => {
      const optionElement = document.createElement("option");
      optionElement.value = option;
      optionElement.textContent = option;
      select.appendChild(optionElement);
    });
  }

  setupEventListeners() {
    // Navigation tabs
    document.querySelectorAll(".nav-tab").forEach((tab) => {
      tab.addEventListener("click", (e) => {
        this.switchTab(e.target.dataset.tab);
      });
    });

    // Search and filters
    document
      .getElementById("searchBtn")
      .addEventListener("click", () => this.applyFilters());
    document.getElementById("searchInput").addEventListener("keypress", (e) => {
      if (e.key === "Enter") this.applyFilters();
    });
    document
      .getElementById("searchInput")
      .addEventListener("input", () => this.applyFilters());

    // Filter controls
    document
      .getElementById("categoryFilter")
      .addEventListener("change", () => this.applyFilters());
    document
      .getElementById("difficultyFilter")
      .addEventListener("change", () => this.applyFilters());
    document
      .getElementById("ratingFilter")
      .addEventListener("change", () => this.applyFilters());
    document
      .getElementById("clearFilters")
      .addEventListener("click", () => this.clearFilters());
    document.getElementById("sortBy").addEventListener("change", (e) => {
      this.currentSort = e.target.value;
      this.displayRecipes();
    });

    // Add recipe form
    document.getElementById("addRecipeForm").addEventListener("submit", (e) => {
      e.preventDefault();
      this.addNewRecipe();
    });

    

    // Smart Recipe Finder controls
    document
      .getElementById("addIngredientBtn")
      .addEventListener("click", () => this.addIngredient());
    document
      .getElementById("ingredientInput")
      .addEventListener("keypress", (e) => {
        if (e.key === "Enter") this.addIngredient();
      });
    document
      .getElementById("findRecipesBtn")
      .addEventListener("click", () => this.findSmartRecipes());
    document
      .getElementById("clearFinderBtn")
      .addEventListener("click", () => this.clearSmartFinder());

    // Nutrition sliders
    document.getElementById("maxCalories").addEventListener("input", (e) => {
      document.getElementById("caloriesValue").textContent = e.target.value;
    });
    document.getElementById("minProtein").addEventListener("input", (e) => {
      document.getElementById("proteinValue").textContent = e.target.value;
    });
    document.getElementById("maxCarbs").addEventListener("input", (e) => {
      document.getElementById("carbsValue").textContent = e.target.value;
    });

    // Quick ingredient suggestions
    document.querySelectorAll(".suggestion-tag").forEach((tag) => {
      tag.addEventListener("click", (e) => {
        const ingredient = e.target.dataset.ingredient;
        this.addIngredientFromSuggestion(ingredient);
      });
    });

    // Modal controls
    document
      .getElementById("closeModal")
      .addEventListener("click", () => this.closeModal());
    document
      .getElementById("recipeDetailModal")
      .addEventListener("click", (e) => {
        if (e.target.id === "recipeDetailModal") this.closeModal();
      });

    // Timer controls
    document
      .getElementById("fabTimer")
      .addEventListener("click", () => this.showTimer());
    document
      .getElementById("closeTimer")
      .addEventListener("click", () => this.hideTimer());
    document
      .getElementById("startTimer")
      .addEventListener("click", () => this.startTimer());
    document
      .getElementById("pauseTimer")
      .addEventListener("click", () => this.pauseTimer());
    document
      .getElementById("resetTimer")
      .addEventListener("click", () => this.resetTimer());
    document.getElementById("timerModal").addEventListener("click", (e) => {
      if (e.target.id === "timerModal") this.hideTimer();
    });
  }

  switchTab(tabName) {
    // Update active tab
    document
      .querySelectorAll(".nav-tab")
      .forEach((tab) => tab.classList.remove("active"));
    document.querySelector(`[data-tab="${tabName}"]`).classList.add("active");

    // Show corresponding content
    document
      .querySelectorAll(".tab-content")
      .forEach((content) => content.classList.remove("active"));
    document.getElementById(`${tabName}-tab`).classList.add("active");

    this.currentTab = tabName;

    // Load specific content
    if (tabName === "favorites") {
      this.displayFavorites();
    } else if (tabName === "browse") {
      this.displayRecipes();
    
  }

  applyFilters() {
    this.currentFilters = {
      category: document.getElementById("categoryFilter").value,
      difficulty: document.getElementById("difficultyFilter").value,
      rating: parseFloat(document.getElementById("ratingFilter").value) || 0,
      search: document.getElementById("searchInput").value.toLowerCase().trim(),
    };
    this.displayRecipes();
  }

  clearFilters() {
    document.getElementById("categoryFilter").value = "";
    document.getElementById("difficultyFilter").value = "";
    document.getElementById("ratingFilter").value = "";
    document.getElementById("searchInput").value = "";
    this.currentFilters = {
      category: "",
      difficulty: "",
      rating: "",
      search: "",
    };
    this.displayRecipes();
  }

  filterRecipes(recipes) {
    return recipes.filter((recipe) => {
      // Category filter
      if (
        this.currentFilters.category &&
        recipe.category !== this.currentFilters.category
      ) {
        return false;
      }

      // Difficulty filter
      if (
        this.currentFilters.difficulty &&
        recipe.difficulty !== this.currentFilters.difficulty
      ) {
        return false;
      }

      // Rating filter
      if (
        this.currentFilters.rating &&
        recipe.rating < this.currentFilters.rating
      ) {
        return false;
      }

      // Search filter
      if (this.currentFilters.search) {
        const searchTerm = this.currentFilters.search;
        const searchIn = [
          recipe.name,
          recipe.category,
          ...(recipe.ingredients || []),
          ...(recipe.tags || []),
          recipe.instructions,
        ]
          .join(" ")
          .toLowerCase();

        if (!searchIn.includes(searchTerm)) {
          return false;
        }
      }

      return true;
    });
  }

  sortRecipes(recipes) {
    return [...recipes].sort((a, b) => {
      switch (this.currentSort) {
        case "rating":
          return b.rating - a.rating;
        case "cookTime":
          return parseInt(a.cookTime) - parseInt(b.cookTime);
        case "difficulty":
          const difficultyOrder = { Easy: 1, Medium: 2, Hard: 3 };
          return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
        case "name":
        default:
          return a.name.localeCompare(b.name);
      }
    });
  }

  displayRecipes() {
    const filteredRecipes = this.filterRecipes(this.recipes);
    const sortedRecipes = this.sortRecipes(filteredRecipes);

    document.getElementById("recipesCount").textContent = sortedRecipes.length;

    const recipeGrid = document.getElementById("recipeGrid");

    if (sortedRecipes.length === 0) {
      recipeGrid.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-search" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.3;"></i>
                    <h3>No recipes found</h3>
                    <p>Try adjusting your search criteria or filters</p>
                </div>
            `;
      return;
    }

    recipeGrid.innerHTML = sortedRecipes
      .map((recipe) => this.createRecipeCard(recipe))
      .join("");
  }

  displayFavorites() {
    const favoritesGrid = document.getElementById("favoritesGrid");

    if (this.favoriteRecipes.length === 0) {
      favoritesGrid.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-heart" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.3;"></i>
                    <h3>No favorite recipes yet</h3>
                    <p>Start adding recipes to your favorites to see them here</p>
                </div>
            `;
      return;
    }

    favoritesGrid.innerHTML = this.favoriteRecipes
      .map((recipe) => this.createRecipeCard(recipe))
      .join("");
  }

  createRecipeCard(recipe) {
    const isFavorite = this.favoriteRecipes.some((fav) => fav.id === recipe.id);
    const stars =
      "★".repeat(Math.floor(recipe.rating)) +
      "☆".repeat(5 - Math.floor(recipe.rating));

    return `
            <div class="recipe-card" onclick="recipeBot.showRecipeDetail(${recipe.id})">
                <img src="${recipe.image}" alt="${recipe.name}" class="recipe-image" onerror="this.src='https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400'">
                <div class="recipe-card-content">
                    <div class="recipe-card-header">
                        <h3 class="recipe-name">${recipe.name}</h3>
                        <button class="favorite-btn ${isFavorite ? "favorited" : ""}" onclick="event.stopPropagation(); recipeBot.toggleFavorite(${recipe.id})" title="${isFavorite ? "Remove from favorites" : "Add to favorites"}">
                            <i class="fas fa-heart"></i>
                        </button>
                    </div>
                    
                    <div class="recipe-rating">
                        <span class="stars">${stars}</span>
                        <span class="rating-value">${recipe.rating}</span>
                    </div>
                    
                    <div class="recipe-meta">
                        <span class="recipe-category">${recipe.category}</span>
                        <span class="recipe-difficulty ${recipe.difficulty}">${recipe.difficulty}</span>
                    </div>
                    
                    <div class="recipe-times">
                        <span><i class="fas fa-clock"></i> Prep: ${recipe.prepTime}</span>
                        <span><i class="fas fa-fire"></i> Cook: ${recipe.cookTime}</span>
                        <span><i class="fas fa-users"></i> Serves: ${recipe.servings}</span>
                    </div>
                    
                                        <div class="recipe-tags">
                        ${(recipe.tags || []).map((tag) => `<span class="recipe-tag">${tag}</span>`).join("")}
                    </div>
                </div>
            </div>
        `;
  }

  async showRecipeDetail(recipeId) {
    try {
      const response = await fetch(`/api/recipes/${recipeId}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const recipe = await response.json();

      const isFavorite = this.favoriteRecipes.some(
        (fav) => fav.id === recipe.id,
      );
      const stars =
        "★".repeat(Math.floor(recipe.rating)) +
        "☆".repeat(5 - Math.floor(recipe.rating));

      document.getElementById("recipeDetailContent").innerHTML = `
                <div class="recipe-detail-content">
                    <div class="recipe-detail-header">
                        <img src="${recipe.image}" alt="${recipe.name}" class="recipe-detail-image" onerror="this.src='https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400'">
                        <h2 class="recipe-detail-title">${recipe.name}</h2>
                        
                        <div class="recipe-rating">
                            <span class="stars" style="font-size: 1.5rem;">${stars}</span>
                            <span class="rating-value" style="font-size: 1.2rem;">${recipe.rating}</span>
                        </div>
                        
                        <div class="recipe-meta" style="justify-content: center; margin-bottom: 1rem;">
                            <span class="recipe-category">${recipe.category}</span>
                            <span class="recipe-difficulty ${recipe.difficulty}">${recipe.difficulty}</span>
                        </div>
                        
                        <div class="recipe-times" style="justify-content: center; font-size: 1rem;">
                            <span><i class="fas fa-clock"></i> Prep: ${recipe.prepTime}</span>
                            <span><i class="fas fa-fire"></i> Cook: ${recipe.cookTime}</span>
                            <span><i class="fas fa-users"></i> Serves: ${recipe.servings}</span>
                        </div>
                        
                        <div class="recipe-detail-actions">
                            <button class="action-btn favorite ${isFavorite ? "favorited" : ""}" onclick="recipeBot.toggleFavorite(${recipe.id})">
                                <i class="fas fa-heart"></i>
                                ${isFavorite ? "Remove Favorite" : "Add Favorite"}
                            </button>
                            <button class="action-btn timer" onclick="recipeBot.showTimer(${parseInt(recipe.cookTime)})">
                                <i class="fas fa-clock"></i>
                                Start Timer
                            </button>
                        </div>
                    </div>

                    <div class="nutrition-info">
                        <h3 class="section-title"><i class="fas fa-chart-pie"></i> Nutrition (per serving)</h3>
                        <div class="nutrition-grid">
                            <div class="nutrition-item">
                                <div class="nutrition-value">${recipe.calories}</div>
                                <div class="nutrition-label">Calories</div>
                            </div>
                            <div class="nutrition-item">
                                <div class="nutrition-value">${recipe.nutrition.protein}</div>
                                <div class="nutrition-label">Protein</div>
                            </div>
                            <div class="nutrition-item">
                                <div class="nutrition-value">${recipe.nutrition.carbs}</div>
                                <div class="nutrition-label">Carbs</div>
                            </div>
                            <div class="nutrition-item">
                                <div class="nutrition-value">${recipe.nutrition.fat}</div>
                                <div class="nutrition-label">Fat</div>
                            </div>
                            <div class="nutrition-item">
                                <div class="nutrition-value">${recipe.nutrition.fiber}</div>
                                <div class="nutrition-label">Fiber</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="ingredients-section">
                        <h3 class="section-title"><i class="fas fa-list"></i> Ingredients</h3>
                        <div class="ingredients-grid">
                            ${recipe.ingredients
                              .map(
                                (ingredient, index) => `
                                <div class="ingredient-item">
                                    <input type="checkbox" class="ingredient-checkbox" id="ingredient-${index}">
                                    <label for="ingredient-${index}" class="ingredient-text">${ingredient}</label>
                                </div>
                            `,
                              )
                              .join("")}
                        </div>
                    </div>
                    
                    <div class="instructions-section">
                        <h3 class="section-title"><i class="fas fa-list-ol"></i> Instructions</h3>
                        <div class="instructions-text">${recipe.instructions}</div>
                    </div>

                    <div class="rating-section">
                        <h3 class="section-title">Rate this Recipe</h3>
                        <div class="rate-recipe">
                            ${[1, 2, 3, 4, 5]
                              .map(
                                (star) => `
                                <span class="rate-star" data-rating="${star}" onclick="recipeBot.rateRecipe(${recipe.id}, ${star})">★</span>
                            `,
                              )
                              .join("")}
                        </div>
                        <p>Click a star to rate this recipe</p>
                    </div>
                </div>
            `;

      document.getElementById("recipeDetailModal").style.display = "flex";

      // Add ingredient checkbox listeners
      document.querySelectorAll(".ingredient-checkbox").forEach((checkbox) => {
        checkbox.addEventListener("change", (e) => {
          const label = e.target.nextElementSibling;
          if (e.target.checked) {
            label.classList.add("checked");
          } else {
            label.classList.remove("checked");
          }
        });
      });
    } catch (error) {
      console.error("Error loading recipe details:", error);
    }
  }

  closeModal() {
    document.getElementById("recipeDetailModal").style.display = "none";
  }

  async toggleFavorite(recipeId) {
    try {
      const response = await fetch(`/api/recipes/${recipeId}/favorite`, {
        method: "POST",
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const result = await response.json();

      // Refresh favorites list
      await this.loadFavorites();

      // Update UI
      if (this.currentTab === "favorites") {
        this.displayFavorites();
      } else {
        this.displayRecipes();
      }

      this.updateStats();

      // Update modal if open
      const modal = document.getElementById("recipeDetailModal");
      if (modal.style.display === "flex") {
        this.showRecipeDetail(recipeId);
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  }

  async rateRecipe(recipeId, rating) {
    try {
      const response = await fetch(`/api/recipes/${recipeId}/rate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ rating }),
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      if (response.ok) {
        // Refresh recipes
        await this.loadRecipes();
        this.displayRecipes();

        // Show feedback
        alert(`Thank you for rating this recipe ${rating} stars!`);

        // Refresh modal
        this.showRecipeDetail(recipeId);
      }
    } catch (error) {
      console.error("Error rating recipe:", error);
    }
  }

  async addNewRecipe() {
    const formData = {
      name: document.getElementById("recipeName").value,
      category: document.getElementById("recipeCategory").value,
      difficulty: document.getElementById("recipeDifficulty").value,
      servings: parseInt(document.getElementById("recipeServings").value),
      prepTime: document.getElementById("recipePrepTime").value,
      cookTime: document.getElementById("recipeCookTime").value,
      ingredients: document
        .getElementById("recipeIngredients")
        .value.split("\n")
        .filter((i) => i.trim()),
      instructions: document.getElementById("recipeInstructions").value,
      tags: document
        .getElementById("recipeTags")
        .value.split(",")
        .map((t) => t.trim())
        .filter((t) => t),
      calories: 0,
      nutrition: {
        protein: "0g",
        carbs: "0g",
        fat: "0g",
        fiber: "0g",
      },
    };

    try {
      const response = await fetch("/api/recipes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      if (response.ok) {
        alert("Recipe added successfully!");
        document.getElementById("addRecipeForm").reset();
        await this.loadRecipes();
        this.switchTab("browse");
        this.displayRecipes();
        this.updateStats();
      }
    } catch (error) {
      console.error("Error adding recipe:", error);
      alert("Error adding recipe. Please try again.");
    }
  }

  displayDailyRecipe(recipe) {
    const dailyContainer = document.getElementById("dailyRecipe");
    dailyContainer.innerHTML = `
            <div class="daily-recipe-badge">
                <i class="fas fa-star"></i> TODAY'S FEATURED RECIPE
            </div>
            <div style="padding: 2rem;">
                ${this.createRecipeCard(recipe)}
            </div>
        `;
  }

  updateStats() {
    document.getElementById("totalRecipes").textContent = this.recipes.length;
    document.getElementById("totalFavorites").textContent =
      this.favoriteRecipes.length;
  }

  // Timer functionality
  showTimer(defaultMinutes = null) {
    document.getElementById("timerModal").style.display = "flex";
    if (defaultMinutes) {
      document.getElementById("timerMinutes").value = defaultMinutes;
    }
  }

  hideTimer() {
    document.getElementById("timerModal").style.display = "none";
    this.resetTimer();
  }

  startTimer() {
    const minutes = parseInt(document.getElementById("timerMinutes").value);
    if (!minutes || minutes <= 0) {
      alert("Please enter a valid number of minutes");
      return;
    }

    if (!this.timer.isRunning) {
      this.timer.timeLeft = minutes * 60;
    }

    this.timer.isRunning = true;
    document.getElementById("startTimer").style.display = "none";
    document.getElementById("pauseTimer").style.display = "inline-flex";

    this.timer.interval = setInterval(() => {
      this.timer.timeLeft--;
      this.updateTimerDisplay();

      if (this.timer.timeLeft <= 0) {
        this.timerFinished();
      }
    }, 1000);
  }

  pauseTimer() {
    this.timer.isRunning = false;
    clearInterval(this.timer.interval);
    document.getElementById("startTimer").style.display = "inline-flex";
    document.getElementById("pauseTimer").style.display = "none";
  }

  resetTimer() {
    this.timer.isRunning = false;
    this.timer.timeLeft = 0;
    clearInterval(this.timer.interval);
    document.getElementById("startTimer").style.display = "inline-flex";
    document.getElementById("pauseTimer").style.display = "none";
    document.getElementById("timerDisplay").textContent = "00:00";
  }

  updateTimerDisplay() {
    const minutes = Math.floor(this.timer.timeLeft / 60);
    const seconds = this.timer.timeLeft % 60;
    document.getElementById("timerDisplay").textContent =
      `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }

  timerFinished() {
    this.resetTimer();
    alert("⏰ Timer finished! Your cooking time is up!");

    // Play a notification sound if available
    try {
      const audio = new Audio(
        "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmccETOU2u2Ohk0M",
      );
      audio.play();
    } catch (e) {
      // Silent fail if audio doesn't work
    }
  }

  

  // Smart Recipe Finder Methods
  addIngredient() {
    const input = document.getElementById("ingredientInput");
    const ingredient = input.value.trim().toLowerCase();

    if (ingredient && !this.selectedIngredients.includes(ingredient)) {
      this.selectedIngredients = this.selectedIngredients || [];
      this.selectedIngredients.push(ingredient);
      this.updateIngredientTags();
      input.value = "";
    }
  }

  addIngredientFromSuggestion(ingredient) {
    if (!this.selectedIngredients.includes(ingredient.toLowerCase())) {
      this.selectedIngredients = this.selectedIngredients || [];
      this.selectedIngredients.push(ingredient.toLowerCase());
      this.updateIngredientTags();
    }
  }

  removeIngredient(ingredient) {
    this.selectedIngredients = this.selectedIngredients.filter(
      (ing) => ing !== ingredient,
    );
    this.updateIngredientTags();
  }

  updateIngredientTags() {
    const container = document.getElementById("selectedIngredients");
    container.innerHTML = this.selectedIngredients
      .map(
        (ingredient) => `
      <div class="ingredient-tag">
        <span>${ingredient}</span>
        <button class="remove-ingredient" onclick="recipeBot.removeIngredient('${ingredient}')">×</button>
      </div>
    `,
      )
      .join("");
  }

  async findSmartRecipes() {
    if (!this.selectedIngredients || this.selectedIngredients.length === 0) {
      alert("Please add at least one ingredient to search for recipes.");
      return;
    }

    const findBtn = document.getElementById("findRecipesBtn");
    findBtn.disabled = true;
    findBtn.innerHTML =
      '<i class="fas fa-spinner fa-spin"></i> Finding Recipes...';

    try {
      // Gather search criteria
      const criteria = {
        ingredients: this.selectedIngredients,
        matchType: document.getElementById("matchType").value,
        dietaryRestrictions: {
          vegetarian: document.getElementById("vegetarian").checked,
          vegan: document.getElementById("vegan").checked,
          glutenFree: document.getElementById("gluten-free").checked,
          dairyFree: document.getElementById("dairy-free").checked,
        },
        allergenAvoidance: [
          document.getElementById("no-nuts").checked && "nuts",
          document.getElementById("no-shellfish").checked && "shellfish",
          document.getElementById("no-eggs").checked && "eggs",
          document.getElementById("no-soy").checked && "soy",
        ].filter(Boolean),
        nutritionGoals: {
          maxCalories: parseInt(document.getElementById("maxCalories").value),
          minProtein: parseInt(document.getElementById("minProtein").value),
          maxCarbs: parseInt(document.getElementById("maxCarbs").value),
        },
      };

      const response = await fetch("/api/find-recipes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(criteria),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      this.displaySmartResults(result);
    } catch (error) {
      console.error("Error finding recipes:", error);
      alert("Error finding recipes. Please try again.");
    } finally {
      findBtn.disabled = false;
      findBtn.innerHTML = '<i class="fas fa-search"></i> Find Recipes';
    }
  }

  displaySmartResults(result) {
    const resultsSection = document.getElementById("smartResults");
    const resultsCount = document.getElementById("resultsCount");
    const resultsGrid = document.getElementById("smartRecipeGrid");

    resultsCount.textContent = result.totalFound;
    resultsSection.style.display = "block";

    if (result.recipes.length === 0) {
      resultsGrid.innerHTML = `
        <div class="no-results">
          <i class="fas fa-search" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.3;"></i>
          <h3>No recipes found</h3>
          <p>Try adjusting your ingredients or search criteria</p>
        </div>
      `;
      return;
    }

    resultsGrid.innerHTML = result.recipes
      .map((recipe) => this.createSmartRecipeCard(recipe))
      .join("");
  }

  createSmartRecipeCard(recipe) {
    const matchPercentage = Math.round(recipe.matchScore * 100);
    let matchClass = "partial";
    let matchText = `${matchPercentage}% Match`;

    if (recipe.matchScore >= 0.8) {
      matchClass = "perfect";
      matchText = "Perfect Match!";
    } else if (recipe.matchScore >= 0.6) {
      matchClass = "good";
      matchText = "Great Match";
    }

    const stars =
      "★".repeat(Math.floor(recipe.rating)) +
      "☆".repeat(5 - Math.floor(recipe.rating));
    const isFavorite = this.favoriteRecipes.some((fav) => fav.id === recipe.id);

    return `
      <div class="smart-recipe-card ${matchClass}-match" onclick="recipeBot.showRecipeDetail(${recipe.id})">
        <div class="match-indicator ${matchClass}">${matchText}</div>
        <img src="${recipe.image}" alt="${recipe.name}" class="recipe-image" onerror="this.src='https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400'">

        <div class="recipe-card-content">
          <div class="recipe-card-header">
            <h3 class="recipe-name">${recipe.name}</h3>
            <button class="favorite-btn ${isFavorite ? "favorited" : ""}" onclick="event.stopPropagation(); recipeBot.toggleFavorite(${recipe.id})">
              <i class="fas fa-heart"></i>
            </button>
          </div>

          <div class="recipe-rating">
            <span class="stars">${stars}</span>
            <span class="rating-value">${recipe.rating}</span>
          </div>

          <div class="recipe-meta">
            <span class="recipe-category">${recipe.category}</span>
            <span class="recipe-difficulty ${recipe.difficulty}">${recipe.difficulty}</span>
          </div>

          <div class="ingredient-matches">
            <h5>✅ You have: ${recipe.matchedIngredients.length} ingredients</h5>
            <div class="matched-ingredients">
              ${recipe.matchedIngredients.map((ing) => `<span class="matched-ingredient">${ing}</span>`).join("")}
            </div>
            ${
              recipe.missingIngredients.length > 0
                ? `
              <div class="missing-ingredients">
                <h5>🛒 You'll need: ${recipe.missingIngredients.length} more</h5>
                <div class="matched-ingredients">
                  ${recipe.missingIngredients.map((ing) => `<span class="missing-ingredient">${ing}</span>`).join("")}
                </div>
              </div>
            `
                : ""
            }
          </div>

          <div class="nutrition-highlight">
            <div class="nutrition-grid-small">
              <div class="nutrition-item-small">
                <div class="nutrition-value-small">${recipe.calories}</div>
                <div class="nutrition-label-small">Calories</div>
              </div>
              <div class="nutrition-item-small">
                <div class="nutrition-value-small">${recipe.nutrition.protein}</div>
                <div class="nutrition-label-small">Protein</div>
              </div>
              <div class="nutrition-item-small">
                <div class="nutrition-value-small">${recipe.nutrition.carbs}</div>
                <div class="nutrition-label-small">Carbs</div>
              </div>
              <div class="nutrition-item-small">
                <div class="nutrition-value-small">${recipe.nutrition.fat}</div>
                <div class="nutrition-label-small">Fat</div>
              </div>
            </div>
          </div>

          ${
            recipe.allergens && recipe.allergens.length > 0
              ? `
            <div class="allergen-warnings">
              <h5>⚠️ Contains Allergens</h5>
              <div class="allergen-list">
                ${recipe.allergens.map((allergen) => `<span class="allergen-tag">${allergen}</span>`).join("")}
              </div>
            </div>
          `
              : ""
          }

          <div class="recipe-times">
            <span><i class="fas fa-clock"></i> ${recipe.prepTime}</span>
            <span><i class="fas fa-fire"></i> ${recipe.cookTime}</span>
            <span><i class="fas fa-users"></i> ${recipe.servings}</span>
          </div>
        </div>
      </div>
    `;
  }

  clearSmartFinder() {
    this.selectedIngredients = [];
    this.updateIngredientTags();
    document.getElementById("ingredientInput").value = "";
    document.getElementById("smartResults").style.display = "none";

    // Reset checkboxes
    document
      .querySelectorAll('#smart-finder-tab input[type="checkbox"]')
      .forEach((checkbox) => {
        checkbox.checked = false;
      });

    // Reset sliders
    document.getElementById("maxCalories").value = 800;
    document.getElementById("minProtein").value = 20;
    document.getElementById("maxCarbs").value = 60;
    document.getElementById("caloriesValue").textContent = "800";
    document.getElementById("proteinValue").textContent = "20";
    document.getElementById("carbsValue").textContent = "60";

    // Reset match type
    document.getElementById("matchType").value = "any";
  }
}

// Initialize the app
const recipeBot = new RecipeBot();