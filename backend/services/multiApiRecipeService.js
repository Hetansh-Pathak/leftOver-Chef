const axios = require('axios');
const Recipe = require('../models/Recipe');

const SPOONACULAR_API_KEY = process.env.SPOONACULAR_API_KEY;
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || 'your-rapidapi-key-here';
const EDAMAM_APP_ID = process.env.EDAMAM_APP_ID || 'your-edamam-app-id';
const EDAMAM_APP_KEY = process.env.EDAMAM_APP_KEY || 'your-edamam-app-key';

class MultiApiRecipeService {
  constructor() {
    this.spoonacularBaseUrl = 'https://api.spoonacular.com/recipes';
    this.recipePuppyUrl = 'https://recipe-puppy.p.rapidapi.com';
    this.edamamUrl = 'https://api.edamam.com';
    this.timeout = 8000;
  }

  // Enhanced search that combines multiple APIs
  async searchRecipesFromMultipleAPIs(ingredients, options = {}) {
    const {
      limit = 30,
      includeSpoonacular = true,
      includeRecipePuppy = true,
      includeEdamam = true,
      filters = {}
    } = options;

    const allRecipes = [];
    const searchPromises = [];

    console.log(`🔍 Multi-API search for: [${ingredients.join(', ')}]`);

    // API 1: Spoonacular (Primary)
    if (includeSpoonacular) {
      searchPromises.push(
        this.searchSpoonacular(ingredients, { limit: Math.ceil(limit * 0.5) })
          .catch(error => {
            console.log('Spoonacular API failed:', error.message);
            return [];
          })
      );
    }

    // API 2: Recipe Puppy (Backup)
    if (includeRecipePuppy) {
      searchPromises.push(
        this.searchRecipePuppy(ingredients, { limit: Math.ceil(limit * 0.3) })
          .catch(error => {
            console.log('Recipe Puppy API failed:', error.message);
            return [];
          })
      );
    }

    // API 3: Edamam (Additional)
    if (includeEdamam) {
      searchPromises.push(
        this.searchEdamam(ingredients, { limit: Math.ceil(limit * 0.2) })
          .catch(error => {
            console.log('Edamam API failed:', error.message);
            return [];
          })
      );
    }

    // Execute all searches in parallel
    try {
      const results = await Promise.allSettled(searchPromises);
      
      results.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value) {
          allRecipes.push(...result.value);
        }
      });

      // Remove duplicates by title
      const uniqueRecipes = this.removeDuplicates(allRecipes);
      
      // Apply filters
      const filteredRecipes = this.applyFilters(uniqueRecipes, filters);
      
      // Sort by relevance
      const sortedRecipes = this.sortByRelevance(filteredRecipes, ingredients);

      console.log(`✅ Multi-API search completed: ${sortedRecipes.length} unique recipes found`);
      
      return sortedRecipes.slice(0, limit);

    } catch (error) {
      console.error('Multi-API search error:', error);
      return [];
    }
  }

  // Spoonacular API search
  async searchSpoonacular(ingredients, options = {}) {
    if (!SPOONACULAR_API_KEY || SPOONACULAR_API_KEY === 'your-spoonacular-api-key') {
      console.log('⚠️ Spoonacular API key not configured');
      return [];
    }

    try {
      const { limit = 15 } = options;
      const ingredientString = ingredients.join(',');

      const response = await axios.get(`${this.spoonacularBaseUrl}/findByIngredients`, {
        params: {
          ingredients: ingredientString,
          number: limit,
          ranking: 1,
          ignorePantry: true,
          apiKey: SPOONACULAR_API_KEY
        },
        timeout: this.timeout
      });

      const recipes = response.data || [];
      console.log(`📊 Spoonacular: ${recipes.length} recipes`);

      // Get detailed information for some recipes
      const enhancedRecipes = await this.enhanceSpoonacularRecipes(recipes.slice(0, 8));
      
      return enhancedRecipes.map(recipe => ({
        ...recipe,
        source: 'spoonacular',
        apiSource: 'spoonacular'
      }));

    } catch (error) {
      console.error('Spoonacular search error:', error.message);
      return [];
    }
  }

  // Recipe Puppy API search
  async searchRecipePuppy(ingredients, options = {}) {
    try {
      const { limit = 10 } = options;
      const ingredientString = ingredients.slice(0, 3).join(','); // Recipe Puppy has limits

      // Note: Recipe Puppy API is often unstable, so we'll simulate it
      // In production, you'd use the actual API with your RapidAPI key
      const simulatedRecipes = this.generateRecipePuppySimulation(ingredients, limit);
      
      console.log(`📊 Recipe Puppy (simulated): ${simulatedRecipes.length} recipes`);
      return simulatedRecipes;

    } catch (error) {
      console.error('Recipe Puppy search error:', error.message);
      return [];
    }
  }

  // Edamam API search
  async searchEdamam(ingredients, options = {}) {
    if (!EDAMAM_APP_ID || EDAMAM_APP_ID === 'your-edamam-app-id') {
      console.log('⚠️ Edamam API credentials not configured');
      return this.generateEdamamSimulation(ingredients, options.limit || 8);
    }

    try {
      const { limit = 8 } = options;
      const query = ingredients.join(' ');

      const response = await axios.get(`${this.edamamUrl}/search`, {
        params: {
          q: query,
          app_id: EDAMAM_APP_ID,
          app_key: EDAMAM_APP_KEY,
          from: 0,
          to: limit,
          health: 'vegetarian' // Can be parameterized
        },
        timeout: this.timeout
      });

      const hits = response.data?.hits || [];
      console.log(`📊 Edamam: ${hits.length} recipes`);

      return hits.map((hit, index) => this.formatEdamamRecipe(hit.recipe, index));

    } catch (error) {
      console.error('Edamam search error:', error.message);
      return this.generateEdamamSimulation(ingredients, options.limit || 8);
    }
  }

  // Enhance Spoonacular recipes with detailed info
  async enhanceSpoonacularRecipes(basicRecipes) {
    const enhancedRecipes = [];

    for (const recipe of basicRecipes) {
      try {
        if (recipe.id && SPOONACULAR_API_KEY) {
          const detailResponse = await axios.get(`${this.spoonacularBaseUrl}/${recipe.id}/information`, {
            params: {
              includeNutrition: true,
              apiKey: SPOONACULAR_API_KEY
            },
            timeout: 5000
          });

          enhancedRecipes.push(this.formatSpoonacularRecipe(detailResponse.data));
        } else {
          enhancedRecipes.push(this.formatBasicSpoonacularRecipe(recipe));
        }
      } catch (error) {
        console.error(`Error enhancing recipe ${recipe.id}:`, error.message);
        enhancedRecipes.push(this.formatBasicSpoonacularRecipe(recipe));
      }
    }

    return enhancedRecipes;
  }

  // Format Spoonacular recipe data
  formatSpoonacularRecipe(data) {
    return {
      id: `spoon_${data.id}`,
      spoonacularId: data.id,
      title: data.title,
      summary: data.summary ? this.stripHtml(data.summary) : '',
      image: this.getOptimizedImageUrl(data.image, data.title),
      readyInMinutes: data.readyInMinutes || 30,
      servings: data.servings || 4,
      sourceUrl: data.sourceUrl || data.spoonacularSourceUrl,
      rating: data.spoonacularScore ? data.spoonacularScore / 20 : 4.0,
      cuisines: data.cuisines || [],
      dishTypes: data.dishTypes || [],
      vegetarian: data.vegetarian || false,
      vegan: data.vegan || false,
      glutenFree: data.glutenFree || false,
      dairyFree: data.dairyFree || false,
      healthScore: data.healthScore || 50,
      aggregateLikes: data.aggregateLikes || 0,
      extendedIngredients: data.extendedIngredients || [],
      analyzedInstructions: data.analyzedInstructions || [],
      nutrition: this.formatNutrition(data.nutrition),
      source: 'spoonacular'
    };
  }

  // Format basic Spoonacular recipe (without detailed info)
  formatBasicSpoonacularRecipe(data) {
    return {
      id: `spoon_basic_${data.id}`,
      spoonacularId: data.id,
      title: data.title,
      summary: 'A delicious recipe found through ingredient matching.',
      image: this.getOptimizedImageUrl(data.image, data.title),
      readyInMinutes: 30,
      servings: 4,
      rating: 4.0,
      cuisines: [],
      source: 'spoonacular'
    };
  }

  // Format Edamam recipe data
  formatEdamamRecipe(data, index) {
    return {
      id: `edamam_${index}_${Date.now()}`,
      title: data.label,
      summary: `A nutritious ${data.label} recipe with ${data.ingredientLines?.length || 'several'} ingredients.`,
      image: this.getOptimizedImageUrl(data.image, data.label),
      readyInMinutes: data.totalTime || 45,
      servings: data.yield || 4,
      sourceUrl: data.url,
      rating: 4.2,
      cuisines: data.cuisineType || [],
      dishTypes: data.dishType || [],
      vegetarian: data.healthLabels?.includes('Vegetarian') || false,
      vegan: data.healthLabels?.includes('Vegan') || false,
      glutenFree: data.healthLabels?.includes('Gluten-Free') || false,
      dairyFree: data.healthLabels?.includes('Dairy-Free') || false,
      healthLabels: data.healthLabels || [],
      calories: Math.round(data.calories / (data.yield || 4)),
      source: 'edamam'
    };
  }

  // Generate Recipe Puppy simulation (for demo purposes)
  generateRecipePuppySimulation(ingredients, limit) {
    const recipeTemplates = [
      { title: '{ingredient} Curry', cuisine: 'Indian', time: 35 },
      { title: 'Spiced {ingredient} Rice', cuisine: 'Indian', time: 25 },
      { title: '{ingredient} Stir Fry', cuisine: 'Asian', time: 20 },
      { title: 'Roasted {ingredient} with Herbs', cuisine: 'Mediterranean', time: 40 },
      { title: '{ingredient} Soup', cuisine: 'International', time: 30 }
    ];

    const recipes = [];
    for (let i = 0; i < Math.min(limit, 5); i++) {
      const template = recipeTemplates[i % recipeTemplates.length];
      const ingredient = ingredients[i % ingredients.length];
      
      recipes.push({
        id: `recipepuppy_${i}_${Date.now()}`,
        title: template.title.replace('{ingredient}', ingredient.charAt(0).toUpperCase() + ingredient.slice(1)),
        summary: `A delicious ${template.cuisine.toLowerCase()} style recipe featuring ${ingredient}.`,
        image: this.getIngredientBasedImage(ingredient),
        readyInMinutes: template.time,
        servings: 4,
        rating: 3.8 + Math.random() * 1.2,
        cuisines: [template.cuisine],
        source: 'recipepuppy',
        sourceUrl: `https://example.com/recipe-${i}`
      });
    }

    return recipes;
  }

  // Generate Edamam simulation (for demo purposes)
  generateEdamamSimulation(ingredients, limit) {
    const healthyTemplates = [
      { title: 'Healthy {ingredient} Bowl', health: ['Low-Carb', 'High-Protein'], time: 25 },
      { title: 'Organic {ingredient} Salad', health: ['Vegetarian', 'Gluten-Free'], time: 15 },
      { title: 'Superfood {ingredient} Smoothie', health: ['Vegan', 'Raw'], time: 10 },
      { title: 'Grilled {ingredient} with Quinoa', health: ['High-Fiber', 'Low-Fat'], time: 30 }
    ];

    const recipes = [];
    for (let i = 0; i < Math.min(limit, 4); i++) {
      const template = healthyTemplates[i % healthyTemplates.length];
      const ingredient = ingredients[i % ingredients.length];
      
      recipes.push({
        id: `edamam_sim_${i}_${Date.now()}`,
        title: template.title.replace('{ingredient}', ingredient.charAt(0).toUpperCase() + ingredient.slice(1)),
        summary: `A nutritious and healthy recipe featuring ${ingredient} with focus on wellness.`,
        image: this.getIngredientBasedImage(ingredient),
        readyInMinutes: template.time,
        servings: 2,
        rating: 4.3 + Math.random() * 0.7,
        healthLabels: template.health,
        calories: 150 + Math.floor(Math.random() * 200),
        vegetarian: template.health.includes('Vegetarian') || template.health.includes('Vegan'),
        vegan: template.health.includes('Vegan'),
        glutenFree: template.health.includes('Gluten-Free'),
        source: 'edamam'
      });
    }

    return recipes;
  }

  // Get ingredient-based fallback image
  getIngredientBasedImage(ingredient) {
    const imageMap = {
      // Indian ingredients
      'rice': 'https://images.unsplash.com/photo-1596560548464-f010549b84d7?w=400&h=300&fit=crop',
      'dal': 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&h=300&fit=crop',
      'chapati': 'https://images.unsplash.com/photo-1574653969094-61d25fa49eaf?w=400&h=300&fit=crop',
      'roti': 'https://images.unsplash.com/photo-1574653969094-61d25fa49eaf?w=400&h=300&fit=crop',
      'paneer': 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&h=300&fit=crop',
      'curry': 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&h=300&fit=crop',
      // Common ingredients
      'chicken': 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop',
      'tomato': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop',
      'onion': 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400&h=300&fit=crop',
      'potato': 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400&h=300&fit=crop',
      // Default
      'default': 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop'
    };

    const key = ingredient.toLowerCase();
    return imageMap[key] || imageMap['default'];
  }

  // Utility functions
  getOptimizedImageUrl(originalImage, title = '') {
    if (originalImage && originalImage.includes('spoonacular')) {
      return originalImage.replace(/(\d+x\d+)/, '636x393');
    }
    
    if (originalImage) {
      return originalImage;
    }
    
    // Generate based on title keywords
    const titleLower = title.toLowerCase();
    if (titleLower.includes('curry') || titleLower.includes('indian')) {
      return 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=636&h=393&fit=crop&auto=format&q=80';
    }
    if (titleLower.includes('rice')) {
      return 'https://images.unsplash.com/photo-1596560548464-f010549b84d7?w=636&h=393&fit=crop&auto=format&q=80';
    }
    if (titleLower.includes('bread') || titleLower.includes('chapati') || titleLower.includes('roti')) {
      return 'https://images.unsplash.com/photo-1574653969094-61d25fa49eaf?w=636&h=393&fit=crop&auto=format&q=80';
    }
    
    return 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=636&h=393&fit=crop&auto=format&q=80';
  }

  stripHtml(html) {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, '').trim();
  }

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

  removeDuplicates(recipes) {
    const seen = new Set();
    return recipes.filter(recipe => {
      const key = recipe.title.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  applyFilters(recipes, filters) {
    if (!filters || Object.keys(filters).length === 0) {
      return recipes;
    }

    return recipes.filter(recipe => {
      // Cuisine filter
      if (filters.cuisine && recipe.cuisines) {
        const hasCuisine = recipe.cuisines.some(cuisine => 
          cuisine.toLowerCase().includes(filters.cuisine.toLowerCase())
        );
        if (!hasCuisine) return false;
      }

      // Diet filter
      if (filters.diet) {
        switch (filters.diet.toLowerCase()) {
          case 'vegetarian':
            if (!recipe.vegetarian) return false;
            break;
          case 'vegan':
            if (!recipe.vegan) return false;
            break;
          case 'glutenfree':
            if (!recipe.glutenFree) return false;
            break;
          case 'dairyfree':
            if (!recipe.dairyFree) return false;
            break;
        }
      }

      // Time filter
      if (filters.maxTime) {
        const maxTime = parseInt(filters.maxTime);
        if ((recipe.readyInMinutes || 30) > maxTime) return false;
      }

      return true;
    });
  }

  sortByRelevance(recipes, searchIngredients) {
    return recipes.sort((a, b) => {
      // Calculate relevance score
      let scoreA = 0;
      let scoreB = 0;

      // Title matching
      searchIngredients.forEach(ingredient => {
        if (a.title.toLowerCase().includes(ingredient.toLowerCase())) scoreA += 2;
        if (b.title.toLowerCase().includes(ingredient.toLowerCase())) scoreB += 2;
      });

      // Rating boost
      scoreA += (a.rating || 0) * 0.5;
      scoreB += (b.rating || 0) * 0.5;

      // Source priority (Spoonacular > Edamam > Recipe Puppy)
      if (a.source === 'spoonacular') scoreA += 1;
      if (b.source === 'spoonacular') scoreB += 1;
      if (a.source === 'edamam') scoreA += 0.5;
      if (b.source === 'edamam') scoreB += 0.5;

      return scoreB - scoreA;
    });
  }

  // Get featured recipe with multiple API support
  async getFeaturedRecipeOfTheDay() {
    try {
      // Try to get a popular Indian recipe
      const indianIngredients = ['paneer', 'dal', 'rice'];
      const recipes = await this.searchRecipesFromMultipleAPIs(indianIngredients, { 
        limit: 5,
        includeSpoonacular: true,
        includeRecipePuppy: false,
        includeEdamam: false
      });

      if (recipes && recipes.length > 0) {
        return recipes[0];
      }

      // Fallback to a default recipe
      return {
        id: 'featured-default',
        title: 'Dal Tadka - Comfort Food',
        summary: 'Traditional Indian lentil curry with aromatic spices. Perfect comfort food for any day.',
        image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=636&h=393&fit=crop&auto=format&q=80',
        readyInMinutes: 35,
        servings: 4,
        rating: 4.8,
        cuisines: ['Indian'],
        source: 'featured'
      };

    } catch (error) {
      console.error('Error getting featured recipe:', error);
      return null;
    }
  }
}

module.exports = new MultiApiRecipeService();
