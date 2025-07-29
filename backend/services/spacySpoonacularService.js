// Enhanced SpaCy API + Spoonacular Integration Service
// Combines NLP processing with external recipe APIs for comprehensive results

const axios = require('axios');
const nlpService = require('./nlpService');
const spellCorrectionService = require('./spellCorrectionService');

class SpacySpoonacularService {
  constructor() {
    this.spoonacularApiKey = process.env.SPOONACULAR_API_KEY || 'demo-key';
    this.spoonacularBaseUrl = 'https://api.spoonacular.com/recipes';
    
    // Enhanced ingredient mapping for better API calls
    this.ingredientMappings = new Map([
      // Common ingredient variations
      ['tomato', ['tomatoes', 'tomato', 'fresh tomatoes', 'cherry tomatoes']],
      ['potato', ['potatoes', 'potato', 'sweet potato', 'baby potatoes']],
      ['onion', ['onions', 'onion', 'red onion', 'white onion', 'yellow onion']],
      ['chicken', ['chicken breast', 'chicken thigh', 'chicken', 'whole chicken']],
      ['cheese', ['cheddar cheese', 'mozzarella', 'parmesan', 'cheese']],
      
      // Indian/Gujarati specific mappings
      ['paneer', ['cottage cheese', 'paneer', 'indian cottage cheese']],
      ['dal', ['lentils', 'dal', 'split lentils', 'red lentils']],
      ['jeera', ['cumin', 'cumin seeds', 'jeera']],
      ['haldi', ['turmeric', 'turmeric powder', 'haldi']],
      ['dhania', ['coriander', 'coriander seeds', 'cilantro']],
      ['methi', ['fenugreek', 'fenugreek leaves', 'methi']],
      ['hing', ['asafoetida', 'hing']],
      
      // Italian specific mappings  
      ['basil', ['fresh basil', 'basil leaves', 'sweet basil']],
      ['mozzarella', ['fresh mozzarella', 'mozzarella cheese', 'buffalo mozzarella']],
      ['parmesan', ['parmigiano reggiano', 'parmesan cheese', 'grated parmesan']],
      
      // Chinese specific mappings
      ['soy sauce', ['light soy sauce', 'dark soy sauce', 'tamari']],
      ['sesame oil', ['toasted sesame oil', 'sesame seed oil']],
      ['ginger', ['fresh ginger', 'ginger root', 'ground ginger']]
    ]);

    // Cuisine-specific search enhancements
    this.cuisineEnhancements = {
      'gujarati': {
        additionalIngredients: ['jaggery', 'curry leaves', 'mustard seeds', 'turmeric'],
        searchTerms: ['gujarati', 'indian vegetarian', 'dhokla', 'khichdi', 'kadhi'],
        spiceProfile: 'mild and sweet'
      },
      'italian': {
        additionalIngredients: ['olive oil', 'garlic', 'basil', 'parmesan'],
        searchTerms: ['italian', 'pasta', 'pizza', 'risotto'],
        spiceProfile: 'herbs and garlic'
      },
      'indian': {
        additionalIngredients: ['garam masala', 'turmeric', 'cumin', 'coriander'],
        searchTerms: ['indian', 'curry', 'dal', 'biryani'],
        spiceProfile: 'aromatic spices'
      },
      'chinese': {
        additionalIngredients: ['soy sauce', 'sesame oil', 'ginger', 'garlic'],
        searchTerms: ['chinese', 'stir fry', 'wok', 'asian'],
        spiceProfile: 'savory and umami'
      }
    };
  }

  // Enhanced ingredient processing with NLP and spell correction
  async processIngredientsWithNLP(ingredients) {
    console.log('🔍 Processing ingredients with enhanced NLP...');
    
    const processedIngredients = [];
    const corrections = [];
    const suggestions = [];

    for (const ingredient of ingredients) {
      // Step 1: Spell correction
      const spellCheck = spellCorrectionService.autoCorrect(ingredient);
      
      // Step 2: NLP processing
      const nlpResult = nlpService.processIngredientInput(
        spellCheck.autoChanged ? spellCheck.corrected : ingredient
      );

      // Step 3: Enhance with mapping
      const enhancedIngredient = this.enhanceIngredientWithMapping(nlpResult.normalized);

      const processedIngredient = {
        original: ingredient,
        corrected: spellCheck.corrected,
        normalized: nlpResult.normalized,
        enhanced: enhancedIngredient,
        autoChanged: spellCheck.autoChanged,
        confidence: spellCheck.confidence,
        alternatives: this.ingredientMappings.get(nlpResult.normalized) || []
      };

      processedIngredients.push(processedIngredient);

      // Track corrections and suggestions
      if (spellCheck.autoChanged) {
        corrections.push({
          from: ingredient,
          to: spellCheck.corrected,
          confidence: spellCheck.confidence
        });
      }

      if (spellCheck.suggestion && !spellCheck.autoChanged) {
        suggestions.push({
          original: ingredient,
          suggestion: spellCheck.suggestion,
          confidence: spellCheck.confidence
        });
      }
    }

    return {
      processedIngredients,
      corrections,
      suggestions,
      enhancedIngredientList: processedIngredients.map(p => p.enhanced)
    };
  }

  // Enhance ingredient with mapping alternatives
  enhanceIngredientWithMapping(ingredient) {
    const mappedAlternatives = this.ingredientMappings.get(ingredient.toLowerCase());
    return mappedAlternatives ? mappedAlternatives[0] : ingredient;
  }

  // Search Spoonacular with enhanced parameters
  async searchSpoonacularRecipes(processedIngredients, options = {}) {
    console.log('🌐 Searching Spoonacular with enhanced parameters...');
    
    try {
      const {
        cuisine = '',
        diet = '',
        intolerances = '',
        maxReadyTime = '',
        maxCalories = '',
        number = 20,
        sort = 'popularity',
        includeIngredients = true
      } = options;

      // Prepare ingredient string for API
      const ingredientString = processedIngredients
        .map(ing => ing.enhanced || ing.normalized || ing.original)
        .join(',');

      // Build API parameters
      const params = {
        apiKey: this.spoonacularApiKey,
        number: number,
        sort: sort,
        addRecipeInformation: true,
        addRecipeNutrition: true,
        fillIngredients: true
      };

      // Add ingredients if specified
      if (includeIngredients && ingredientString) {
        params.includeIngredients = ingredientString;
      }

      // Add optional parameters
      if (cuisine) params.cuisine = cuisine;
      if (diet) params.diet = diet;
      if (intolerances) params.intolerances = intolerances;
      if (maxReadyTime) params.maxReadyTime = maxReadyTime;
      if (maxCalories) params.maxCalories = maxCalories;

      console.log('📡 Spoonacular API params:', params);

      // Make API call
      const response = await axios.get(`${this.spoonacularBaseUrl}/complexSearch`, {
        params: params,
        timeout: 10000
      });

      const recipes = response.data.results || [];
      
      console.log(`✅ Found ${recipes.length} recipes from Spoonacular`);

      // Enhance recipes with additional data
      const enhancedRecipes = await Promise.all(
        recipes.map(recipe => this.enhanceSpoonacularRecipe(recipe, processedIngredients))
      );

      return {
        recipes: enhancedRecipes,
        totalResults: response.data.totalResults || recipes.length,
        apiUsed: 'spoonacular',
        searchParams: params,
        enhancedIngredients: processedIngredients
      };

    } catch (error) {
      console.error('❌ Spoonacular API Error:', error.message);
      
      // Return fallback response
      return {
        recipes: [],
        totalResults: 0,
        error: error.message,
        apiUsed: 'spoonacular',
        fallback: true
      };
    }
  }

  // Enhance Spoonacular recipe with additional processing
  async enhanceSpoonacularRecipe(recipe, processedIngredients) {
    try {
      // Calculate ingredient match score
      const matchData = this.calculateIngredientMatch(recipe, processedIngredients);
      
      // Enhance recipe object
      const enhancedRecipe = {
        _id: `spoonacular-${recipe.id}`,
        id: recipe.id,
        title: recipe.title,
        name: recipe.title,
        image: recipe.image,
        summary: recipe.summary || 'Delicious recipe from Spoonacular',
        readyInMinutes: recipe.readyInMinutes || 30,
        prepTime: Math.floor((recipe.readyInMinutes || 30) * 0.3),
        cookTime: Math.floor((recipe.readyInMinutes || 30) * 0.7),
        servings: recipe.servings || 4,
        rating: recipe.spoonacularScore ? recipe.spoonacularScore / 20 : 4.0, // Convert to 5-star scale
        ratingCount: recipe.aggregateLikes || 100,
        sourceUrl: recipe.sourceUrl,
        spoonacularSourceUrl: recipe.spoonacularSourceUrl,
        
        // Match information
        matchScore: matchData.matchScore,
        matchedIngredients: matchData.matchedIngredients,
        missingIngredients: matchData.missingIngredients,
        
        // Recipe details
        extendedIngredients: recipe.extendedIngredients || [],
        ingredientNames: recipe.extendedIngredients ? 
          recipe.extendedIngredients.map(ing => ing.name.toLowerCase()) : [],
        analyzedInstructions: recipe.analyzedInstructions || [],
        
        // Dietary information
        vegetarian: recipe.vegetarian || false,
        vegan: recipe.vegan || false,
        glutenFree: recipe.glutenFree || false,
        dairyFree: recipe.dairyFree || false,
        
        // Additional metadata
        cuisines: recipe.cuisines || [],
        dishTypes: recipe.dishTypes || [],
        difficulty: this.calculateDifficulty(recipe),
        
        // Nutrition
        nutrition: recipe.nutrition ? this.parseNutrition(recipe.nutrition) : {
          calories: recipe.nutrition?.calories || 0,
          protein: 0,
          carbs: 0,
          fat: 0
        },
        
        // Source information
        source: 'spoonacular',
        creditsText: recipe.creditsText,
        license: recipe.license,
        
        // Enhanced with NLP processing
        nlpProcessed: true,
        enhancedIngredients: processedIngredients
      };

      return enhancedRecipe;

    } catch (error) {
      console.error('❌ Error enhancing recipe:', error);
      return recipe;
    }
  }

  // Calculate ingredient match score
  calculateIngredientMatch(recipe, processedIngredients) {
    const userIngredients = processedIngredients.map(p => 
      (p.enhanced || p.normalized || p.original).toLowerCase()
    );
    
    const recipeIngredients = recipe.extendedIngredients ? 
      recipe.extendedIngredients.map(ing => ing.name.toLowerCase()) : 
      recipe.missedIngredients ? recipe.missedIngredients.map(ing => ing.name.toLowerCase()) : [];

    const matchedIngredients = [];
    const missingIngredients = [];

    // Check for matches
    userIngredients.forEach(userIng => {
      const found = recipeIngredients.find(recipeIng => 
        recipeIng.includes(userIng) || userIng.includes(recipeIng) ||
        this.areIngredientsRelated(userIng, recipeIng)
      );
      
      if (found) {
        matchedIngredients.push(userIng);
      }
    });

    // Find missing ingredients
    recipeIngredients.forEach(recipeIng => {
      const found = userIngredients.find(userIng => 
        recipeIng.includes(userIng) || userIng.includes(recipeIng) ||
        this.areIngredientsRelated(recipeIng, userIng)
      );
      
      if (!found && !this.isCommonPantryItem(recipeIng)) {
        missingIngredients.push(recipeIng);
      }
    });

    const matchScore = userIngredients.length > 0 ? 
      matchedIngredients.length / userIngredients.length : 0;

    return {
      matchScore,
      matchedIngredients,
      missingIngredients: missingIngredients.slice(0, 5) // Limit to 5 missing
    };
  }

  // Check if ingredients are related
  areIngredientsRelated(ing1, ing2) {
    const synonymGroups = [
      ['tomato', 'tomatoes', 'cherry tomato', 'roma tomato'],
      ['onion', 'onions', 'yellow onion', 'white onion', 'red onion'],
      ['garlic', 'garlic clove', 'garlic cloves', 'minced garlic'],
      ['chicken', 'chicken breast', 'chicken thigh', 'chicken drumstick'],
      ['cheese', 'cheddar', 'mozzarella', 'parmesan', 'swiss cheese']
    ];

    return synonymGroups.some(group => 
      group.includes(ing1.toLowerCase()) && group.includes(ing2.toLowerCase())
    );
  }

  // Check if ingredient is common pantry item
  isCommonPantryItem(ingredient) {
    const pantryItems = [
      'salt', 'pepper', 'oil', 'water', 'sugar', 'flour', 'butter',
      'olive oil', 'vegetable oil', 'black pepper', 'garlic powder',
      'onion powder', 'vanilla extract', 'baking powder', 'baking soda'
    ];
    
    return pantryItems.some(item => ingredient.toLowerCase().includes(item));
  }

  // Calculate recipe difficulty
  calculateDifficulty(recipe) {
    const readyTime = recipe.readyInMinutes || 30;
    const ingredientCount = recipe.extendedIngredients ? recipe.extendedIngredients.length : 5;
    
    if (readyTime <= 20 && ingredientCount <= 7) return 'easy';
    if (readyTime <= 45 && ingredientCount <= 12) return 'medium';
    return 'hard';
  }

  // Parse nutrition information
  parseNutrition(nutrition) {
    const nutrients = nutrition.nutrients || [];
    
    const findNutrient = (name) => {
      const nutrient = nutrients.find(n => n.name.toLowerCase().includes(name.toLowerCase()));
      return nutrient ? Math.round(nutrient.amount) : 0;
    };

    return {
      calories: findNutrient('calories'),
      protein: findNutrient('protein'),
      carbs: findNutrient('carbohydrates'),
      fat: findNutrient('fat'),
      fiber: findNutrient('fiber'),
      sugar: findNutrient('sugar'),
      sodium: findNutrient('sodium')
    };
  }

  // Enhanced search with multiple strategies
  async enhancedRecipeSearch(ingredients, options = {}) {
    console.log('🚀 Starting enhanced recipe search with SpaCy + Spoonacular...');
    
    try {
      // Step 1: Process ingredients with NLP
      const nlpResult = await this.processIngredientsWithNLP(ingredients);
      
      // Step 2: Search Spoonacular
      const spoonacularResult = await this.searchSpoonacularRecipes(
        nlpResult.processedIngredients, 
        options
      );

      // Step 3: Enhance search based on cuisine
      let enhancedResult = spoonacularResult;
      if (options.cuisine && this.cuisineEnhancements[options.cuisine]) {
        enhancedResult = await this.enhanceSearchByCuisine(
          nlpResult.processedIngredients,
          options.cuisine,
          options
        );
      }

      // Step 4: Compile final result
      const finalResult = {
        ...enhancedResult,
        nlpProcessing: {
          originalIngredients: ingredients,
          processedIngredients: nlpResult.processedIngredients,
          corrections: nlpResult.corrections,
          suggestions: nlpResult.suggestions
        },
        searchMetadata: {
          totalProcessed: ingredients.length,
          correctionsMade: nlpResult.corrections.length,
          suggestionsAvailable: nlpResult.suggestions.length,
          enhancementStrategy: options.cuisine ? 'cuisine-enhanced' : 'standard',
          timestamp: new Date().toISOString()
        }
      };

      console.log(`✅ Enhanced search completed: ${finalResult.recipes.length} recipes found`);
      return finalResult;

    } catch (error) {
      console.error('❌ Enhanced search error:', error);
      
      return {
        recipes: [],
        totalResults: 0,
        error: error.message,
        nlpProcessing: { originalIngredients: ingredients },
        searchMetadata: { 
          totalProcessed: 0,
          error: true,
          timestamp: new Date().toISOString()
        }
      };
    }
  }

  // Enhance search based on specific cuisine
  async enhanceSearchByCuisine(processedIngredients, cuisine, options) {
    console.log(`🌍 Enhancing search for ${cuisine} cuisine...`);
    
    const enhancement = this.cuisineEnhancements[cuisine];
    if (!enhancement) return await this.searchSpoonacularRecipes(processedIngredients, options);

    // Add cuisine-specific ingredients to search
    const enhancedIngredients = [
      ...processedIngredients,
      ...enhancement.additionalIngredients.map(ing => ({
        original: ing,
        enhanced: ing,
        normalized: ing
      }))
    ];

    // Search with cuisine-specific parameters
    const cuisineOptions = {
      ...options,
      cuisine: cuisine,
      query: enhancement.searchTerms.join(' OR ')
    };

    return await this.searchSpoonacularRecipes(enhancedIngredients, cuisineOptions);
  }

  // Get recipe details with full instructions
  async getRecipeDetails(recipeId) {
    console.log(`📖 Getting detailed recipe information for ID: ${recipeId}`);
    
    try {
      const response = await axios.get(`${this.spoonacularBaseUrl}/${recipeId}/information`, {
        params: {
          apiKey: this.spoonacularApiKey,
          includeNutrition: true
        },
        timeout: 8000
      });

      const recipe = response.data;
      
      // Enhanced recipe details
      return {
        ...recipe,
        enhancedInstructions: this.enhanceInstructions(recipe.analyzedInstructions),
        nutritionEnhanced: this.parseNutrition(recipe.nutrition),
        timingBreakdown: this.calculateTimingBreakdown(recipe),
        source: 'spoonacular-detailed'
      };

    } catch (error) {
      console.error('❌ Error getting recipe details:', error);
      throw new Error(`Failed to get recipe details: ${error.message}`);
    }
  }

  // Enhance recipe instructions with better formatting
  enhanceInstructions(analyzedInstructions) {
    if (!analyzedInstructions || analyzedInstructions.length === 0) return [];

    return analyzedInstructions.map(instructionSet => ({
      name: instructionSet.name || 'Main Preparation',
      steps: instructionSet.steps.map(step => ({
        number: step.number,
        step: step.step,
        ingredients: step.ingredients || [],
        equipment: step.equipment || [],
        length: step.length || null
      }))
    }));
  }

  // Calculate timing breakdown
  calculateTimingBreakdown(recipe) {
    const total = recipe.readyInMinutes || 30;
    const prep = recipe.preparationMinutes || Math.floor(total * 0.3);
    const cook = recipe.cookingMinutes || (total - prep);
    
    return {
      total: total,
      preparation: prep,
      cooking: cook,
      active: Math.floor(total * 0.7), // Estimated active time
      passive: Math.floor(total * 0.3)  // Estimated passive time
    };
  }
}

module.exports = new SpacySpoonacularService();
