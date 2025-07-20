const axios = require('axios');
const Recipe = require('../models/Recipe');
const OpenAI = require('openai');

// TODO: Add your Spoonacular API key here
const SPOONACULAR_API_KEY = process.env.SPOONACULAR_API_KEY; // Get your API key from https://spoonacular.com/food-api

// TODO: Add your OpenAI API key here  
const OPENAI_API_KEY = process.env.OPENAI_API_KEY; // Get your API key from https://platform.openai.com/

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY
});

class RecipeService {
  constructor() {
    this.spoonacularBaseUrl = 'https://api.spoonacular.com/recipes';
    this.defaultHeaders = {
      'X-RapidAPI-Key': SPOONACULAR_API_KEY,
      'Content-Type': 'application/json'
    };
  }

  // Search recipes by ingredients using Spoonacular API
  async searchByIngredients(ingredients, options = {}) {
    try {
      if (!SPOONACULAR_API_KEY) {
        console.log('Spoonacular API key not provided, using local recipes');
        return await this.searchLocalRecipesByIngredients(ingredients, options);
      }

      const {
        ranking = 1, // 1 = maximize used ingredients, 2 = minimize missing ingredients
        ignorePantry = true,
        number = 20,
        limitLicense = true,
        fillIngredients = true
      } = options;

      const ingredientString = Array.isArray(ingredients) ? ingredients.join(',') : ingredients;

      const response = await axios.get(`${this.spoonacularBaseUrl}/findByIngredients`, {
        params: {
          ingredients: ingredientString,
          ranking,
          ignorePantry,
          number,
          limitLicense,
          fillIngredients,
          apiKey: SPOONACULAR_API_KEY
        }
      });

      // Enhance recipes with additional information
      const enhancedRecipes = await this.enhanceRecipesWithDetails(response.data);
      
      // Save to local database for caching and future use
      await this.saveRecipesToDatabase(enhancedRecipes);

      return enhancedRecipes;
    } catch (error) {
      console.error('Error searching recipes by ingredients:', error.message);
      // Fallback to local search
      return await this.searchLocalRecipesByIngredients(ingredients, options);
    }
  }

  // Get detailed recipe information from Spoonacular
  async getRecipeDetails(spoonacularId) {
    try {
      if (!SPOONACULAR_API_KEY) {
        return await Recipe.findOne({ spoonacularId });
      }

      const response = await axios.get(`${this.spoonacularBaseUrl}/${spoonacularId}/information`, {
        params: {
          includeNutrition: true,
          apiKey: SPOONACULAR_API_KEY
        }
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
      console.error('Error getting recipe details:', error.message);
      return await Recipe.findOne({ spoonacularId });
    }
  }

  // Enhance recipes with additional details
  async enhanceRecipesWithDetails(recipes) {
    const enhancedRecipes = [];

    for (const recipe of recipes) {
      try {
        const detailedRecipe = await this.getRecipeDetails(recipe.id);
        if (detailedRecipe) {
          enhancedRecipes.push(detailedRecipe);
        }
      } catch (error) {
        console.error(`Error enhancing recipe ${recipe.id}:`, error.message);
        // Add basic recipe without full details
        enhancedRecipes.push(this.formatBasicRecipe(recipe));
      }
    }

    return enhancedRecipes;
  }

  // Format Spoonacular recipe data to our schema
  formatSpoonacularRecipe(spoonacularData) {
    const formatted = {
      spoonacularId: spoonacularData.id,
      title: spoonacularData.title,
      summary: spoonacularData.summary ? this.stripHtml(spoonacularData.summary) : '',
      readyInMinutes: spoonacularData.readyInMinutes || 30,
      servings: spoonacularData.servings || 4,
      sourceUrl: spoonacularData.sourceUrl,
      image: spoonacularData.image,
      imageType: spoonacularData.imageType || 'jpg',
      
      preparationMinutes: spoonacularData.preparationMinutes || 0,
      cookingMinutes: spoonacularData.cookingMinutes || 0,
      aggregateLikes: spoonacularData.aggregateLikes || 0,
      healthScore: spoonacularData.healthScore || 50,
      spoonacularScore: spoonacularData.spoonacularScore || 50,
      pricePerServing: spoonacularData.pricePerServing || 0,
      
      cuisines: spoonacularData.cuisines || [],
      dishTypes: spoonacularData.dishTypes || [],
      diets: spoonacularData.diets || [],
      occasions: spoonacularData.occasions || [],
      
      vegetarian: spoonacularData.vegetarian || false,
      vegan: spoonacularData.vegan || false,
      glutenFree: spoonacularData.glutenFree || false,
      dairyFree: spoonacularData.dairyFree || false,
      veryHealthy: spoonacularData.veryHealthy || false,
      cheap: spoonacularData.cheap || false,
      veryPopular: spoonacularData.veryPopular || false,
      sustainable: spoonacularData.sustainable || false,
      lowFodmap: spoonacularData.lowFodmap || false,
      ketogenic: spoonacularData.ketogenic || false,
      whole30: spoonacularData.whole30 || false,
      
      // Extract allergen information from ingredients and summary
      allergens: this.extractAllergens(spoonacularData),
      
      extendedIngredients: this.formatIngredients(spoonacularData.extendedIngredients || []),
      analyzedInstructions: this.formatInstructions(spoonacularData.analyzedInstructions || []),
      instructions: spoonacularData.instructions || '',
      
      nutrition: this.formatNutrition(spoonacularData.nutrition),
      
      source: 'spoonacular',
      leftoverFriendly: this.assessLeftoverFriendliness(spoonacularData),
      quickMeal: (spoonacularData.readyInMinutes || 30) <= 30,
      difficulty: this.calculateDifficulty(spoonacularData)
    };

    return formatted;
  }

  // Format ingredients from Spoonacular format
  formatIngredients(spoonacularIngredients) {
    return spoonacularIngredients.map(ing => ({
      name: ing.name || ing.originalName || '',
      amount: ing.amount || 0,
      unit: ing.unit || '',
      originalString: ing.original || '',
      metaInformation: ing.meta || [],
      measures: {
        us: ing.measures?.us || {},
        metric: ing.measures?.metric || {}
      }
    }));
  }

  // Format instructions from Spoonacular format
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
            equipment: step.equipment || [],
            length: step.length,
            temperature: step.temperature
          });
        });
      }
    });

    return allSteps;
  }

  // Format nutrition data from Spoonacular format
  formatNutrition(spoonacularNutrition) {
    if (!spoonacularNutrition || !spoonacularNutrition.nutrients) {
      return {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: 0,
        sugar: 0,
        sodium: 0,
        cholesterol: 0,
        saturatedFat: 0
      };
    }

    const nutrients = spoonacularNutrition.nutrients;
    const findNutrient = (name) => {
      const nutrient = nutrients.find(n => n.name.toLowerCase().includes(name.toLowerCase()));
      return nutrient ? nutrient.amount : 0;
    };

    return {
      calories: findNutrient('Calories'),
      protein: findNutrient('Protein'),
      carbs: findNutrient('Carbohydrates'),
      fat: findNutrient('Fat'),
      fiber: findNutrient('Fiber'),
      sugar: findNutrient('Sugar'),
      sodium: findNutrient('Sodium'),
      cholesterol: findNutrient('Cholesterol'),
      saturatedFat: findNutrient('Saturated Fat'),
      vitaminA: findNutrient('Vitamin A'),
      vitaminC: findNutrient('Vitamin C'),
      calcium: findNutrient('Calcium'),
      iron: findNutrient('Iron')
    };
  }

  // Extract allergen information from recipe data
  extractAllergens(recipeData) {
    const allergens = {
      nuts: false,
      shellfish: false,
      eggs: false,
      soy: false,
      sesame: false,
      fish: false
    };

    const ingredients = recipeData.extendedIngredients || [];
    const allergenKeywords = {
      nuts: ['nuts', 'almond', 'walnut', 'pecan', 'cashew', 'pistachio', 'hazelnut', 'peanut'],
      shellfish: ['shrimp', 'crab', 'lobster', 'oyster', 'mussel', 'clam', 'scallop'],
      eggs: ['egg', 'eggs', 'mayonnaise'],
      soy: ['soy', 'tofu', 'tempeh', 'miso', 'tamari'],
      sesame: ['sesame', 'tahini'],
      fish: ['fish', 'salmon', 'tuna', 'cod', 'tilapia', 'anchovy']
    };

    ingredients.forEach(ingredient => {
      const ingredientName = (ingredient.name || ingredient.originalName || '').toLowerCase();
      
      Object.keys(allergenKeywords).forEach(allergen => {
        if (allergenKeywords[allergen].some(keyword => ingredientName.includes(keyword))) {
          allergens[allergen] = true;
        }
      });
    });

    return allergens;
  }

  // Assess if recipe is leftover-friendly
  assessLeftoverFriendliness(recipeData) {
    const leftoverFriendlyKeywords = [
      'leftover', 'leftover', 'fried rice', 'stir fry', 'casserole', 'soup', 'stew',
      'pasta', 'sandwich', 'wrap', 'salad', 'bowl'
    ];

    const title = (recipeData.title || '').toLowerCase();
    const summary = (recipeData.summary || '').toLowerCase();
    
    return leftoverFriendlyKeywords.some(keyword => 
      title.includes(keyword) || summary.includes(keyword)
    ) || (recipeData.readyInMinutes || 30) <= 30;
  }

  // Calculate difficulty based on recipe complexity
  calculateDifficulty(recipeData) {
    const ingredientCount = (recipeData.extendedIngredients || []).length;
    const cookTime = recipeData.readyInMinutes || 30;
    const hasComplexTechniques = this.hasComplexTechniques(recipeData);

    if (ingredientCount <= 5 && cookTime <= 30 && !hasComplexTechniques) {
      return 'Easy';
    } else if (ingredientCount <= 10 && cookTime <= 60) {
      return 'Medium';
    } else {
      return 'Hard';
    }
  }

  // Check for complex cooking techniques
  hasComplexTechniques(recipeData) {
    const complexKeywords = [
      'braise', 'confit', 'sous vide', 'flambé', 'julienne', 'brunoise',
      'tempering', 'reduction', 'emulsify', 'clarify'
    ];

    const instructions = recipeData.instructions || '';
    return complexKeywords.some(keyword => 
      instructions.toLowerCase().includes(keyword)
    );
  }

  // Search local recipes by ingredients (fallback when API is not available)
  async searchLocalRecipesByIngredients(ingredients, options = {}) {
    const {
      preferences = {},
      nutrition = {},
      matchType = 'any',
      limit = 20,
      offset = 0
    } = options;

    return await Recipe.findByIngredients({
      ingredients,
      matchType,
      preferences,
      nutrition,
      limit,
      offset
    });
  }

  // Save recipes to local database
  async saveRecipesToDatabase(recipes) {
    const savePromises = recipes.map(async (recipeData) => {
      try {
        const existingRecipe = await Recipe.findOne({ 
          spoonacularId: recipeData.spoonacularId 
        });

        if (existingRecipe) {
          // Update existing recipe
          Object.assign(existingRecipe, recipeData);
          existingRecipe.lastUpdated = new Date();
          return await existingRecipe.save();
        } else {
          // Create new recipe
          const newRecipe = new Recipe(recipeData);
          return await newRecipe.save();
        }
      } catch (error) {
        console.error('Error saving recipe:', error.message);
        return null;
      }
    });

    return await Promise.all(savePromises);
  }

  // Generate AI-enhanced recipe suggestions using OpenAI
  async generateAIRecipeSuggestions(userPreferences, availableIngredients) {
    try {
      if (!OPENAI_API_KEY) {
        console.log('OpenAI API key not provided, using standard recommendations');
        return await this.getStandardRecommendations(userPreferences, availableIngredients);
      }

      const prompt = this.buildAIPrompt(userPreferences, availableIngredients);

      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a professional chef and nutritionist who specializes in creating recipes that minimize food waste and use leftover ingredients creatively."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 1500,
        temperature: 0.7
      });

      const aiSuggestion = response.choices[0].message.content;
      
      // Parse AI response and find matching recipes in database
      const suggestedRecipes = await this.parseAISuggestionsAndMatchRecipes(aiSuggestion, availableIngredients);
      
      return suggestedRecipes;
    } catch (error) {
      console.error('Error generating AI suggestions:', error.message);
      return await this.getStandardRecommendations(userPreferences, availableIngredients);
    }
  }

  // Build AI prompt based on user preferences and ingredients
  buildAIPrompt(userPreferences, availableIngredients) {
    const ingredientList = availableIngredients.join(', ');
    
    let prompt = `I have these ingredients available: ${ingredientList}\n\n`;
    
    if (userPreferences.dietary) {
      const dietaryRestrictions = Object.keys(userPreferences.dietary)
        .filter(key => userPreferences.dietary[key])
        .join(', ');
      if (dietaryRestrictions) {
        prompt += `Dietary restrictions: ${dietaryRestrictions}\n`;
      }
    }
    
    if (userPreferences.allergens) {
      const allergens = Object.keys(userPreferences.allergens)
        .filter(key => userPreferences.allergens[key])
        .map(key => key.replace('no', '').toLowerCase())
        .join(', ');
      if (allergens) {
        prompt += `Avoid these allergens: ${allergens}\n`;
      }
    }
    
    if (userPreferences.nutrition) {
      prompt += `Nutrition goals: `;
      if (userPreferences.nutrition.maxCalories) {
        prompt += `max ${userPreferences.nutrition.maxCalories} calories, `;
      }
      if (userPreferences.nutrition.minProtein) {
        prompt += `at least ${userPreferences.nutrition.minProtein}g protein, `;
      }
      if (userPreferences.nutrition.maxCarbs) {
        prompt += `max ${userPreferences.nutrition.maxCarbs}g carbs`;
      }
      prompt += '\n';
    }
    
    prompt += `\nPlease suggest 3-5 creative recipes that:\n`;
    prompt += `1. Use as many of the available ingredients as possible\n`;
    prompt += `2. Are designed to minimize food waste\n`;
    prompt += `3. Are practical for home cooking\n`;
    prompt += `4. Include cooking time and difficulty level\n`;
    prompt += `5. Respect all dietary restrictions and allergen requirements\n\n`;
    prompt += `For each recipe, provide: recipe name, main ingredients used, cooking time, difficulty level, and a brief description.`;
    
    return prompt;
  }

  // Parse AI suggestions and match with database recipes
  async parseAISuggestionsAndMatchRecipes(aiSuggestion, availableIngredients) {
    // Extract recipe names from AI response
    const recipeNames = this.extractRecipeNamesFromAI(aiSuggestion);
    
    // Search for similar recipes in database
    const matchedRecipes = [];
    
    for (const recipeName of recipeNames) {
      const recipes = await Recipe.find({
        $text: { $search: recipeName }
      }).limit(2);
      
      if (recipes.length > 0) {
        // Calculate match scores for available ingredients
        recipes.forEach(recipe => {
          recipe.matchScore = recipe.calculateIngredientMatchScore(availableIngredients);
          recipe.aiSuggested = true;
          recipe.aiReason = `AI suggested based on your available ingredients: ${availableIngredients.slice(0, 3).join(', ')}`;
        });
        
        matchedRecipes.push(...recipes);
      }
    }
    
    // If no matches found, search by ingredients
    if (matchedRecipes.length === 0) {
      return await this.searchLocalRecipesByIngredients(availableIngredients, { limit: 5 });
    }
    
    // Sort by match score and return top results
    return matchedRecipes
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 8);
  }

  // Extract recipe names from AI response
  extractRecipeNamesFromAI(aiResponse) {
    const lines = aiResponse.split('\n');
    const recipeNames = [];
    
    lines.forEach(line => {
      // Look for patterns like "1. Recipe Name" or "Recipe Name:"
      const match = line.match(/^\d+\.\s*([^:]+)|^([^:]+):/);
      if (match) {
        const recipeName = (match[1] || match[2]).trim();
        if (recipeName.length > 3 && recipeName.length < 100) {
          recipeNames.push(recipeName);
        }
      }
    });
    
    return recipeNames;
  }

  // Standard recommendations fallback
  async getStandardRecommendations(userPreferences, availableIngredients) {
    return await this.searchLocalRecipesByIngredients(availableIngredients, {
      preferences: userPreferences,
      limit: 10
    });
  }

  // Generate shopping list based on recipe and available ingredients
  async generateShoppingList(recipeId, userInventory = []) {
    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      throw new Error('Recipe not found');
    }
    
    const userIngredients = userInventory.map(item => item.ingredient.toLowerCase());
    const shoppingList = [];
    
    recipe.extendedIngredients.forEach(ingredient => {
      const hasIngredient = userIngredients.some(userIng =>
        userIng.includes(ingredient.name.toLowerCase()) ||
        ingredient.name.toLowerCase().includes(userIng)
      );
      
      if (!hasIngredient) {
        shoppingList.push({
          ingredient: ingredient.name,
          quantity: ingredient.amount.toString(),
          unit: ingredient.unit,
          category: this.categorizeIngredient(ingredient.name),
          addedFrom: 'recipe',
          recipeId: recipe._id
        });
      }
    });
    
    return shoppingList;
  }

  // Categorize ingredient for shopping list organization
  categorizeIngredient(ingredientName) {
    const categories = {
      vegetables: ['onion', 'tomato', 'carrot', 'potato', 'bell pepper', 'garlic', 'celery', 'broccoli', 'spinach', 'lettuce'],
      fruits: ['apple', 'banana', 'lemon', 'lime', 'orange', 'berries', 'grapes'],
      proteins: ['chicken', 'beef', 'pork', 'fish', 'eggs', 'tofu', 'beans', 'lentils'],
      dairy: ['milk', 'cheese', 'butter', 'yogurt', 'cream'],
      grains: ['rice', 'pasta', 'bread', 'flour', 'quinoa', 'oats'],
      spices: ['salt', 'pepper', 'herbs', 'spices', 'vanilla', 'cinnamon'],
      oils: ['oil', 'olive oil', 'coconut oil', 'vinegar']
    };
    
    const lowerName = ingredientName.toLowerCase();
    
    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => lowerName.includes(keyword))) {
        return category;
      }
    }
    
    return 'other';
  }

  // Format basic recipe when detailed info is not available
  formatBasicRecipe(basicData) {
    return {
      spoonacularId: basicData.id,
      title: basicData.title || 'Unknown Recipe',
      image: basicData.image,
      usedIngredientCount: basicData.usedIngredientCount || 0,
      missedIngredientCount: basicData.missedIngredientCount || 0,
      readyInMinutes: 30,
      servings: 4,
      source: 'spoonacular',
      leftoverFriendly: true,
      difficulty: 'Medium'
    };
  }

  // Strip HTML tags from text
  stripHtml(html) {
    return html.replace(/<[^>]*>/g, '').trim();
  }

  // Bulk import recipes from Spoonacular for initial seeding
  async bulkImportRecipes(query = 'leftover', number = 100) {
    try {
      if (!SPOONACULAR_API_KEY) {
        console.log('Cannot bulk import without Spoonacular API key');
        return [];
      }

      const response = await axios.get(`${this.spoonacularBaseUrl}/complexSearch`, {
        params: {
          query,
          number,
          addRecipeInformation: true,
          fillIngredients: true,
          addRecipeNutrition: true,
          apiKey: SPOONACULAR_API_KEY
        }
      });

      const recipes = response.data.results || [];
      const formattedRecipes = recipes.map(recipe => this.formatSpoonacularRecipe(recipe));
      
      return await this.saveRecipesToDatabase(formattedRecipes);
    } catch (error) {
      console.error('Error bulk importing recipes:', error.message);
      return [];
    }
  }

  // Get recipe of the day (trending or highly rated)
  async getRecipeOfTheDay() {
    try {
      // Try to get a trending recipe from Spoonacular
      if (SPOONACULAR_API_KEY) {
        const response = await axios.get(`${this.spoonacularBaseUrl}/random`, {
          params: {
            number: 1,
            tags: 'leftover,quick,easy',
            apiKey: SPOONACULAR_API_KEY
          }
        });

        if (response.data.recipes && response.data.recipes.length > 0) {
          const recipe = this.formatSpoonacularRecipe(response.data.recipes[0]);
          await this.saveRecipesToDatabase([recipe]);
          return recipe;
        }
      }

      // Fallback to local database
      const randomRecipes = await Recipe.aggregate([
        { $match: { leftoverFriendly: true, rating: { $gte: 4.0 } } },
        { $sample: { size: 1 } }
      ]);

      return randomRecipes[0] || null;
    } catch (error) {
      console.error('Error getting recipe of the day:', error.message);
      return await Recipe.findOne({ leftoverFriendly: true }).sort({ rating: -1 });
    }
  }
}

module.exports = new RecipeService();
