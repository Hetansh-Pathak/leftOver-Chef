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

  // Get optimized image URL with fallbacks
  getOptimizedImageUrl(originalImage, recipeTitle = '') {
    // If we have a Spoonacular image, optimize it
    if (originalImage && originalImage.includes('spoonacular')) {
      // Spoonacular images can be resized by changing the size parameter
      return originalImage.replace(/(\d+x\d+)/, '636x393');
    }

    // If we have any other image, return it
    if (originalImage) {
      return originalImage;
    }

    // Generate fallback image based on recipe type
    const fallbackImages = [
      'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=636&h=393&fit=crop&auto=format&q=80', // General food
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=636&h=393&fit=crop&auto=format&q=80', // Pizza
      'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=636&h=393&fit=crop&auto=format&q=80', // Burger
      'https://images.unsplash.com/photo-1563379091339-03246963d7d3?w=636&h=393&fit=crop&auto=format&q=80', // Pasta
      'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=636&h=393&fit=crop&auto=format&q=80', // Salad
      'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=636&h=393&fit=crop&auto=format&q=80', // Asian
      'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=636&h=393&fit=crop&auto=format&q=80', // Soup
      'https://images.unsplash.com/photo-1574484284002-952d92456975?w=636&h=393&fit=crop&auto=format&q=80'  // Curry
    ];

    // Use title to pick a more relevant fallback
    const title = (recipeTitle || '').toLowerCase();
    if (title.includes('pizza')) return fallbackImages[1];
    if (title.includes('burger') || title.includes('sandwich')) return fallbackImages[2];
    if (title.includes('pasta') || title.includes('spaghetti') || title.includes('noodle')) return fallbackImages[3];
    if (title.includes('salad')) return fallbackImages[4];
    if (title.includes('asian') || title.includes('chinese') || title.includes('thai')) return fallbackImages[5];
    if (title.includes('soup') || title.includes('broth')) return fallbackImages[6];
    if (title.includes('curry') || title.includes('indian')) return fallbackImages[7];

    // Default fallback
    return fallbackImages[0];
  }

  // Generate default summary if none provided
  generateDefaultSummary(recipeData) {
    const title = recipeData.title || 'This recipe';
    const cuisines = recipeData.cuisines || [];
    const time = recipeData.readyInMinutes || 30;
    const servings = recipeData.servings || 4;

    let summary = `${title} is a delicious`;

    if (cuisines.length > 0) {
      summary += ` ${cuisines[0].toLowerCase()}`;
    }

    summary += ` dish that serves ${servings} people and takes about ${time} minutes to prepare.`;

    if (recipeData.vegetarian) summary += ' This vegetarian-friendly recipe';
    if (recipeData.vegan) summary += ' This vegan recipe';
    if (recipeData.glutenFree) summary += ' This gluten-free option';

    summary += ' is perfect for a satisfying meal.';

    return summary;
  }

  // Generate tags for better categorization
  generateTags(recipeData) {
    const tags = [];

    // Diet tags
    if (recipeData.vegetarian) tags.push('vegetarian');
    if (recipeData.vegan) tags.push('vegan');
    if (recipeData.glutenFree) tags.push('gluten-free');
    if (recipeData.dairyFree) tags.push('dairy-free');

    // Time-based tags
    const time = recipeData.readyInMinutes || 30;
    if (time <= 15) tags.push('quick', 'fast');
    if (time <= 30) tags.push('easy');
    if (time >= 120) tags.push('slow-cooked');

    // Health tags
    const healthScore = recipeData.healthScore || 0;
    if (healthScore > 70) tags.push('healthy');
    if (healthScore > 85) tags.push('super-healthy');

    // Popularity tags
    const likes = recipeData.aggregateLikes || 0;
    if (likes > 100) tags.push('popular');
    if (likes > 500) tags.push('trending');

    // Cuisine tags
    if (recipeData.cuisines) {
      tags.push(...recipeData.cuisines.map(c => c.toLowerCase()));
    }

    // Dish type tags
    if (recipeData.dishTypes) {
      tags.push(...recipeData.dishTypes.map(d => d.toLowerCase()));
    }

    return [...new Set(tags)]; // Remove duplicates
  }

  // Enhanced basic recipe formatter
  formatBasicRecipe(basicRecipeData) {
    return {
      spoonacularId: basicRecipeData.id,
      title: basicRecipeData.title,
      summary: this.generateDefaultSummary(basicRecipeData),
      readyInMinutes: 30,
      servings: 4,
      image: this.getOptimizedImageUrl(basicRecipeData.image, basicRecipeData.title),
      rating: 4.0,
      source: 'spoonacular-basic',
      difficulty: 'Medium',
      leftoverFriendly: true,
      quickMeal: true,
      matchScore: 0,
      tags: [],
      lastUpdated: new Date()
    };
  }

  // Strip HTML tags from text
  stripHtml(html) {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, '').trim();
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
