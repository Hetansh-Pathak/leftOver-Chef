const axios = require('axios');
const Recipe = require('../models/Recipe');

const SPOONACULAR_API_KEY = process.env.SPOONACULAR_API_KEY;

class RecipeService {
  constructor() {
    this.spoonacularBaseUrl = 'https://api.spoonacular.com/recipes';
  }

  // Main ingredient search function
  async searchByIngredients(ingredients, options = {}) {
    try {
      if (!SPOONACULAR_API_KEY) {
        console.log('⚠️ Spoonacular API key not provided, using local recipes only');
        return await this.searchLocalRecipesByIngredients(ingredients, options);
      }

      const {
        ranking = 1,
        ignorePantry = true,
        number = 20
      } = options;

      const ingredientString = Array.isArray(ingredients) ? ingredients.join(',') : ingredients;

      console.log(`🌐 Searching Spoonacular for: ${ingredientString}`);

      const response = await axios.get(`${this.spoonacularBaseUrl}/findByIngredients`, {
        params: {
          ingredients: ingredientString,
          ranking,
          ignorePantry,
          number,
          apiKey: SPOONACULAR_API_KEY
        },
        timeout: 10000
      });

      const recipes = response.data || [];
      console.log(`✅ Spoonacular returned ${recipes.length} recipes`);

      // Get detailed information for each recipe
      const enhancedRecipes = await this.enhanceRecipesWithDetails(recipes);
      
      // Save to local database for caching
      if (enhancedRecipes.length > 0) {
        await this.saveRecipesToDatabase(enhancedRecipes);
      }

      return enhancedRecipes;
    } catch (error) {
      console.error('❌ Spoonacular search error:', error.message);
      return await this.searchLocalRecipesByIngredients(ingredients, options);
    }
  }

  // Get detailed recipe information
  async getRecipeDetails(spoonacularId) {
    try {
      if (!SPOONACULAR_API_KEY) {
        return await Recipe.findOne({ spoonacularId });
      }

      console.log(`📖 Getting details for recipe ID: ${spoonacularId}`);

      const response = await axios.get(`${this.spoonacularBaseUrl}/${spoonacularId}/information`, {
        params: {
          includeNutrition: true,
          apiKey: SPOONACULAR_API_KEY
        },
        timeout: 8000
      });

      const recipeData = this.formatSpoonacularRecipe(response.data);
      
      // Save or update in database
      const existingRecipe = await Recipe.findOne({ spoonacularId });
      if (existingRecipe) {
        Object.assign(existingRecipe, recipeData);
        await existingRecipe.save();
        return existingRecipe;
      } else {
        const newRecipe = new Recipe(recipeData);
        await newRecipe.save();
        return newRecipe;
      }
    } catch (error) {
      console.error('❌ Error getting recipe details:', error.message);
      return await Recipe.findOne({ spoonacularId });
    }
  }

  // Enhance recipes with detailed information
  async enhanceRecipesWithDetails(recipes) {
    const enhancedRecipes = [];

    for (const recipe of recipes.slice(0, 10)) { // Limit to prevent too many API calls
      try {
        if (recipe.id) {
          const detailedRecipe = await this.getRecipeDetails(recipe.id);
          if (detailedRecipe) {
            enhancedRecipes.push(detailedRecipe);
          }
        } else {
          enhancedRecipes.push(this.formatBasicRecipe(recipe));
        }
      } catch (error) {
        console.error(`Error enhancing recipe ${recipe.id}:`, error.message);
        enhancedRecipes.push(this.formatBasicRecipe(recipe));
      }
    }

    return enhancedRecipes;
  }

  // Format Spoonacular recipe data
  formatSpoonacularRecipe(spoonacularData) {
    return {
      spoonacularId: spoonacularData.id,
      title: spoonacularData.title,
      summary: spoonacularData.summary ? this.stripHtml(spoonacularData.summary) : this.generateDefaultSummary(spoonacularData),
      readyInMinutes: spoonacularData.readyInMinutes || 30,
      servings: spoonacularData.servings || 4,
      sourceUrl: spoonacularData.sourceUrl,
      spoonacularSourceUrl: spoonacularData.spoonacularSourceUrl,
      image: this.getOptimizedImageUrl(spoonacularData.image, spoonacularData.title),

      cuisines: spoonacularData.cuisines || [],
      dishTypes: spoonacularData.dishTypes || [],

      vegetarian: spoonacularData.vegetarian || false,
      vegan: spoonacularData.vegan || false,
      glutenFree: spoonacularData.glutenFree || false,
      dairyFree: spoonacularData.dairyFree || false,

      extendedIngredients: this.formatIngredients(spoonacularData.extendedIngredients || []),
      analyzedInstructions: this.formatInstructions(spoonacularData.analyzedInstructions || []),
      instructions: spoonacularData.instructions || '',

      nutrition: this.formatNutrition(spoonacularData.nutrition),

      rating: spoonacularData.spoonacularScore ? spoonacularData.spoonacularScore / 20 : 4.0,
      healthScore: spoonacularData.healthScore || 50,
      aggregateLikes: spoonacularData.aggregateLikes || 0,

      source: 'spoonacular',
      difficulty: this.calculateDifficulty(spoonacularData),
      leftoverFriendly: true,
      quickMeal: (spoonacularData.readyInMinutes || 30) <= 30,

      // Enhanced metadata
      matchScore: 0,
      tags: this.generateTags(spoonacularData),
      lastUpdated: new Date()
    };
  }

  // Format ingredients
  formatIngredients(spoonacularIngredients) {
    return spoonacularIngredients.map(ing => ({
      name: ing.name || ing.originalName || '',
      amount: ing.amount || 0,
      unit: ing.unit || '',
      originalString: ing.original || '',
      metaInformation: ing.meta || []
    }));
  }

  // Format instructions
  formatInstructions(spoonacularInstructions) {
    if (!spoonacularInstructions || spoonacularInstructions.length === 0) {
      return [];
    }

    const allSteps = [];
    spoonacularInstructions.forEach(instruction => {
      if (instruction.steps) {
        instruction.steps.forEach(step => {
          allSteps.push({
            number: step.number,
            step: step.step,
            ingredients: step.ingredients || [],
            equipment: step.equipment || []
          });
        });
      }
    });

    return allSteps;
  }

  // Format nutrition data
  formatNutrition(spoonacularNutrition) {
    if (!spoonacularNutrition || !spoonacularNutrition.nutrients) {
      return {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: 0
      };
    }

    const nutrients = spoonacularNutrition.nutrients;
    const findNutrient = (name) => {
      const nutrient = nutrients.find(n => n.name.toLowerCase().includes(name.toLowerCase()));
      return nutrient ? Math.round(nutrient.amount) : 0;
    };

    return {
      calories: findNutrient('Calories'),
      protein: findNutrient('Protein'),
      carbs: findNutrient('Carbohydrates'),
      fat: findNutrient('Fat'),
      fiber: findNutrient('Fiber'),
      sugar: findNutrient('Sugar'),
      sodium: findNutrient('Sodium')
    };
  }

  // Calculate difficulty
  calculateDifficulty(recipeData) {
    const ingredientCount = (recipeData.extendedIngredients || []).length;
    const cookTime = recipeData.readyInMinutes || 30;
    
    if (ingredientCount <= 5 && cookTime <= 30) return 'Easy';
    if (ingredientCount <= 10 && cookTime <= 60) return 'Medium';
    return 'Hard';
  }

  // Search local recipes (fallback)
  async searchLocalRecipesByIngredients(ingredients, options = {}) {
    const { limit = 20 } = options;

    if (global.MOCK_MODE) {
      const mockData = require('../mockData');
      return mockData.searchByIngredients(ingredients, { limit });
    }

    return await Recipe.findByIngredients({
      ingredients,
      limit
    });
  }

  // Save recipes to database
  async saveRecipesToDatabase(recipes) {
    if (global.MOCK_MODE) {
      return recipes; // Don't save in mock mode
    }

    const savePromises = recipes.map(async (recipeData) => {
      try {
        const existingRecipe = await Recipe.findOne({ 
          spoonacularId: recipeData.spoonacularId 
        });

        if (existingRecipe) {
          Object.assign(existingRecipe, recipeData);
          existingRecipe.lastUpdated = new Date();
          return await existingRecipe.save();
        } else {
          const newRecipe = new Recipe(recipeData);
          return await newRecipe.save();
        }
      } catch (error) {
        console.error('Error saving recipe:', error.message);
        return recipeData; // Return original data if save fails
      }
    });

    return await Promise.all(savePromises);
  }

  // Format basic recipe when detailed info is not available
  formatBasicRecipe(basicData) {
    return {
      spoonacularId: basicData.id,
      title: basicData.title || 'Recipe',
      image: basicData.image,
      readyInMinutes: 30,
      servings: 4,
      rating: 4.0,
      source: 'spoonacular',
      difficulty: 'Medium',
      leftoverFriendly: true
    };
  }

  // Get featured recipe of the day
  async getFeaturedRecipeOfTheDay() {
    try {
      if (global.MOCK_MODE) {
        return require('../mockData').getDailyRecipe();
      }

      // Try to get a trending recipe
      const trendingRecipe = await Recipe.findOne({
        rating: { $gte: 4.0 }
      }).sort({
        popularityScore: -1,
        rating: -1
      });

      if (trendingRecipe) {
        return trendingRecipe;
      }

      // Fallback to Spoonacular random recipe
      if (SPOONACULAR_API_KEY) {
        try {
          const response = await axios.get(`${this.spoonacularBaseUrl}/random`, {
            params: {
              number: 1,
              tags: 'healthy,quick',
              apiKey: SPOONACULAR_API_KEY
            }
          });

          if (response.data.recipes && response.data.recipes.length > 0) {
            const recipe = this.formatSpoonacularRecipe(response.data.recipes[0]);
            const savedRecipes = await this.saveRecipesToDatabase([recipe]);
            return savedRecipes[0];
          }
        } catch (apiError) {
          console.error('Spoonacular random recipe error:', apiError.message);
        }
      }

      return await Recipe.findOne().sort({ rating: -1 });
    } catch (error) {
      console.error('Error getting featured recipe:', error.message);
      return null;
    }
  }

  // Strip HTML tags
  stripHtml(html) {
    return html.replace(/<[^>]*>/g, '').trim();
  }
}

module.exports = new RecipeService();
