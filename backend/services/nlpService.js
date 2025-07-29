// NLP Service for ingredient recognition and recipe text processing
// This service uses spaCy-like functionality for ingredient extraction
const spellCorrectionService = require('./spellCorrectionService');

class NLPService {
  constructor() {
    // Common ingredient keywords and food terms
    this.ingredientKeywords = [
      // Proteins
      'chicken', 'beef', 'pork', 'fish', 'salmon', 'tuna', 'shrimp', 'crab', 'lobster',
      'eggs', 'tofu', 'tempeh', 'beans', 'lentils', 'chickpeas', 'turkey', 'duck',
      
      // Vegetables
      'onion', 'garlic', 'tomato', 'potato', 'carrot', 'celery', 'bell pepper', 'pepper',
      'broccoli', 'cauliflower', 'spinach', 'lettuce', 'cucumber', 'zucchini', 'eggplant',
      'mushroom', 'corn', 'peas', 'green beans', 'asparagus', 'cabbage', 'kale',
      
      // Fruits
      'apple', 'banana', 'orange', 'lemon', 'lime', 'berries', 'strawberry', 'blueberry',
      'grape', 'pineapple', 'mango', 'avocado', 'coconut', 'cherry', 'peach', 'pear',
      
      // Grains & Starches
      'rice', 'pasta', 'bread', 'flour', 'quinoa', 'oats', 'barley', 'noodles',
      'spaghetti', 'macaroni', 'wheat', 'couscous', 'bulgur',
      
      // Dairy
      'milk', 'cheese', 'butter', 'cream', 'yogurt', 'sour cream', 'mozzarella',
      'cheddar', 'parmesan', 'feta', 'ricotta', 'cottage cheese',
      
      // Pantry Items
      'oil', 'olive oil', 'vegetable oil', 'vinegar', 'soy sauce', 'salt', 'pepper',
      'sugar', 'honey', 'vanilla', 'cinnamon', 'oregano', 'basil', 'thyme', 'rosemary',
      
      // Nuts & Seeds
      'almonds', 'walnuts', 'pecans', 'peanuts', 'cashews', 'pine nuts', 'sesame seeds',
      'sunflower seeds', 'chia seeds', 'flax seeds',
      
      // Liquids
      'water', 'broth', 'stock', 'wine', 'beer', 'juice', 'coconut milk', 'almond milk'
    ];

    // Cooking methods and descriptors
    this.cookingMethods = [
      'grilled', 'baked', 'fried', 'roasted', 'steamed', 'boiled', 'sautéed',
      'braised', 'stewed', 'poached', 'broiled', 'smoked', 'barbecued'
    ];

    // Quantity indicators
    this.quantities = [
      'cup', 'cups', 'tablespoon', 'tablespoons', 'teaspoon', 'teaspoons',
      'pound', 'pounds', 'ounce', 'ounces', 'gram', 'grams', 'kilogram',
      'piece', 'pieces', 'slice', 'slices', 'clove', 'cloves', 'bunch'
    ];
  }

  // Extract ingredients from natural language text
  extractIngredients(text) {
    if (!text || typeof text !== 'string') return [];

    const normalizedText = text.toLowerCase();
    const words = normalizedText.split(/[\s,.-]+/);
    const foundIngredients = [];

    // Look for ingredient keywords
    this.ingredientKeywords.forEach(ingredient => {
      const regex = new RegExp(`\\b${ingredient}\\b`, 'gi');
      if (regex.test(normalizedText)) {
        foundIngredients.push(ingredient);
      }
    });

    // Look for compound ingredients (e.g., "chicken breast", "olive oil")
    const compoundIngredients = [
      'chicken breast', 'chicken thigh', 'ground beef', 'ground turkey',
      'olive oil', 'vegetable oil', 'coconut oil', 'sesame oil',
      'soy sauce', 'fish sauce', 'hot sauce', 'tomato sauce',
      'bell pepper', 'green beans', 'sweet potato', 'cherry tomato',
      'cottage cheese', 'cream cheese', 'sour cream', 'heavy cream'
    ];

    compoundIngredients.forEach(compound => {
      const regex = new RegExp(`\\b${compound}\\b`, 'gi');
      if (regex.test(normalizedText)) {
        foundIngredients.push(compound);
      }
    });

    // Remove duplicates and return
    return [...new Set(foundIngredients)];
  }

  // Parse recipe instructions to extract cooking methods and times
  parseInstructions(instructions) {
    if (!instructions || typeof instructions !== 'string') return {};

    const normalizedText = instructions.toLowerCase();
    
    // Extract cooking methods
    const methods = this.cookingMethods.filter(method => 
      normalizedText.includes(method)
    );

    // Extract cooking times (e.g., "cook for 20 minutes", "bake 30 min")
    const timeMatches = normalizedText.match(/(\d+)\s*(minutes?|mins?|hours?|hrs?)/g);
    const times = timeMatches ? timeMatches.map(match => {
      const [, number, unit] = match.match(/(\d+)\s*(minutes?|mins?|hours?|hrs?)/);
      return { duration: parseInt(number), unit: unit.startsWith('h') ? 'hours' : 'minutes' };
    }) : [];

    // Extract temperatures (e.g., "350°F", "180°C")
    const tempMatches = normalizedText.match(/(\d+)\s*°?\s*([cf])/g);
    const temperatures = tempMatches ? tempMatches.map(match => {
      const [, temp, unit] = match.match(/(\d+)\s*°?\s*([cf])/);
      return { temperature: parseInt(temp), unit: unit.toUpperCase() };
    }) : [];

    return {
      cookingMethods: methods,
      times,
      temperatures
    };
  }

  // Enhanced ingredient search with fuzzy matching
  searchIngredients(query, availableIngredients) {
    if (!query || !availableIngredients) return [];

    const normalizedQuery = query.toLowerCase();
    const results = [];

    availableIngredients.forEach(ingredient => {
      const normalizedIngredient = ingredient.toLowerCase();
      
      // Exact match
      if (normalizedIngredient.includes(normalizedQuery)) {
        results.push({ ingredient, score: 1.0, matchType: 'exact' });
      }
      // Partial match
      else if (this.calculateSimilarity(normalizedQuery, normalizedIngredient) > 0.6) {
        results.push({ 
          ingredient, 
          score: this.calculateSimilarity(normalizedQuery, normalizedIngredient),
          matchType: 'partial'
        });
      }
    });

    return results.sort((a, b) => b.score - a.score);
  }

  // Calculate string similarity using Levenshtein distance
  calculateSimilarity(str1, str2) {
    const matrix = [];
    const len1 = str1.length;
    const len2 = str2.length;

    if (len1 === 0) return len2 === 0 ? 1 : 0;
    if (len2 === 0) return 0;

    // Initialize matrix
    for (let i = 0; i <= len1; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= len2; j++) {
      matrix[0][j] = j;
    }

    // Fill matrix
    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + cost
        );
      }
    }

    const distance = matrix[len1][len2];
    const maxLen = Math.max(len1, len2);
    return 1 - (distance / maxLen);
  }

  // Extract recipe metadata from text
  extractRecipeMetadata(text) {
    if (!text || typeof text !== 'string') return {};

    const normalizedText = text.toLowerCase();
    const metadata = {};

    // Extract serving size
    const servingMatches = normalizedText.match(/serves?\s+(\d+)|(\d+)\s+servings?/);
    if (servingMatches) {
      metadata.servings = parseInt(servingMatches[1] || servingMatches[2]);
    }

    // Extract difficulty
    const difficultyKeywords = {
      'easy': ['easy', 'simple', 'quick', 'basic'],
      'medium': ['medium', 'intermediate', 'moderate'],
      'hard': ['hard', 'difficult', 'advanced', 'complex', 'challenging']
    };

    for (const [level, keywords] of Object.entries(difficultyKeywords)) {
      if (keywords.some(keyword => normalizedText.includes(keyword))) {
        metadata.difficulty = level;
        break;
      }
    }

    // Extract dietary information
    const dietaryKeywords = {
      vegetarian: ['vegetarian', 'veggie'],
      vegan: ['vegan'],
      glutenFree: ['gluten-free', 'gluten free', 'no gluten'],
      dairyFree: ['dairy-free', 'dairy free', 'no dairy', 'lactose free'],
      lowCarb: ['low-carb', 'low carb', 'keto', 'ketogenic'],
      healthy: ['healthy', 'nutritious', 'wholesome']
    };

    for (const [diet, keywords] of Object.entries(dietaryKeywords)) {
      if (keywords.some(keyword => normalizedText.includes(keyword))) {
        metadata[diet] = true;
      }
    }

    return metadata;
  }

  // Generate recipe suggestions based on ingredients
  generateRecipeSuggestions(ingredients) {
    if (!ingredients || ingredients.length === 0) return [];

    const suggestions = [];

    // Basic recipe patterns
    const recipePatterns = [
      {
        name: 'Stir Fry',
        requiredIngredients: ['oil'],
        optionalIngredients: ['vegetables', 'soy sauce', 'garlic', 'ginger'],
        description: 'Quick and easy stir fry with your available ingredients'
      },
      {
        name: 'Pasta Dish',
        requiredIngredients: ['pasta'],
        optionalIngredients: ['cheese', 'tomato', 'garlic', 'oil'],
        description: 'Delicious pasta recipe using your ingredients'
      },
      {
        name: 'Salad',
        requiredIngredients: ['lettuce'],
        optionalIngredients: ['tomato', 'cucumber', 'cheese', 'oil', 'vinegar'],
        description: 'Fresh salad with available ingredients'
      },
      {
        name: 'Soup',
        requiredIngredients: ['broth'],
        optionalIngredients: ['vegetables', 'chicken', 'noodles', 'herbs'],
        description: 'Warming soup made with your ingredients'
      },
      {
        name: 'Omelet',
        requiredIngredients: ['eggs'],
        optionalIngredients: ['cheese', 'vegetables', 'herbs', 'milk'],
        description: 'Fluffy omelet with your favorite fillings'
      }
    ];

    const availableIngredients = ingredients.map(ing => ing.toLowerCase());

    recipePatterns.forEach(pattern => {
      const hasRequired = pattern.requiredIngredients.some(req =>
        availableIngredients.some(avail => avail.includes(req) || req.includes(avail))
      );

      if (hasRequired) {
        const matchingOptional = pattern.optionalIngredients.filter(opt =>
          availableIngredients.some(avail => avail.includes(opt) || opt.includes(avail))
        );

        if (matchingOptional.length > 0) {
          suggestions.push({
            ...pattern,
            matchingIngredients: matchingOptional,
            confidence: matchingOptional.length / pattern.optionalIngredients.length
          });
        }
      }
    });

    return suggestions.sort((a, b) => b.confidence - a.confidence);
  }

  // Clean and normalize ingredient text
  normalizeIngredient(ingredient) {
    if (!ingredient || typeof ingredient !== 'string') return '';

    // Remove quantities and measurements
    const quantityPattern = /^\d+\s*(cup|cups|tablespoon|tablespoons|teaspoon|teaspoons|pound|pounds|ounce|ounces|gram|grams|piece|pieces|slice|slices|clove|cloves)s?\s*/i;
    
    let normalized = ingredient
      .toLowerCase()
      .replace(quantityPattern, '')
      .replace(/[,.-]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    // Remove common descriptors
    const descriptors = ['fresh', 'dried', 'frozen', 'canned', 'organic', 'raw', 'cooked'];
    descriptors.forEach(desc => {
      normalized = normalized.replace(new RegExp(`\\b${desc}\\b`, 'g'), '').trim();
    });

    return normalized;
  }

  // Auto-correct ingredient spelling with spell checking
  correctIngredientSpelling(ingredient) {
    const correctionResult = spellCorrectionService.autoCorrect(ingredient);
    return correctionResult;
  }

  // Get ingredient suggestions for autocomplete
  getIngredientSuggestions(partialInput) {
    return spellCorrectionService.suggestIngredients(partialInput);
  }

  // Process and correct multiple ingredients
  processIngredientsWithCorrection(ingredients) {
    return spellCorrectionService.correctIngredients(ingredients);
  }

  // Enhanced ingredient processing with spell correction
  processIngredientInput(input) {
    if (!input || typeof input !== 'string') return null;

    // First try spell correction
    const correctionResult = this.correctIngredientSpelling(input);

    // If high confidence correction, use corrected version
    const processedInput = correctionResult.autoChanged ? correctionResult.corrected : input;

    // Then normalize
    const normalized = this.normalizeIngredient(processedInput);

    return {
      original: input,
      corrected: correctionResult.corrected,
      normalized: normalized,
      autoChanged: correctionResult.autoChanged,
      suggestion: correctionResult.suggestion,
      suggestions: correctionResult.suggestions,
      confidence: correctionResult.confidence
    };
  }
}

module.exports = new NLPService();
