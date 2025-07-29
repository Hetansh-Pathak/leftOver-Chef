// Spell Correction Service for ingredient input
// Uses Levenshtein distance and phonetic matching for better ingredient recognition

class SpellCorrectionService {
  constructor() {
    // Comprehensive ingredient dictionary with common misspellings
    this.ingredientDictionary = [
      // Proteins
      'chicken', 'beef', 'pork', 'fish', 'salmon', 'tuna', 'shrimp', 'crab', 'lobster',
      'eggs', 'tofu', 'tempeh', 'beans', 'lentils', 'chickpeas', 'turkey', 'duck', 'lamb',
      'bacon', 'sausage', 'ham', 'cod', 'tilapia', 'sardines', 'anchovy', 'mussels',
      
      // Vegetables
      'onion', 'garlic', 'tomato', 'potato', 'carrot', 'celery', 'bell pepper', 'pepper',
      'broccoli', 'cauliflower', 'spinach', 'lettuce', 'cucumber', 'zucchini', 'eggplant',
      'mushroom', 'corn', 'peas', 'green beans', 'asparagus', 'cabbage', 'kale', 'okra',
      'beetroot', 'radish', 'turnip', 'parsnip', 'leek', 'scallion', 'chives', 'fennel',
      'artichoke', 'brussels sprouts', 'sweet potato', 'yam', 'squash', 'pumpkin',
      
      // Indian/Gujarati vegetables
      'bhindi', 'karela', 'tinda', 'lauki', 'dudhi', 'parwal', 'turai', 'gilki',
      'methi', 'palak', 'saag', 'bathua', 'chaulai', 'rajgira', 'suva', 'dhania',
      
      // Fruits
      'apple', 'banana', 'orange', 'lemon', 'lime', 'berries', 'strawberry', 'blueberry',
      'grape', 'pineapple', 'mango', 'avocado', 'coconut', 'cherry', 'peach', 'pear',
      'pomegranate', 'fig', 'date', 'raisin', 'cranberry', 'raspberry', 'blackberry',
      
      // Grains & Starches
      'rice', 'pasta', 'bread', 'flour', 'quinoa', 'oats', 'barley', 'noodles',
      'spaghetti', 'macaroni', 'wheat', 'couscous', 'bulgur', 'millet', 'buckwheat',
      'bajra', 'jowar', 'ragi', 'makka', 'chavdar', 'rajgira', 'amaranth',
      
      // Indian grains
      'basmati', 'jasmine rice', 'brown rice', 'red rice', 'black rice', 'poha',
      'upma rava', 'sooji', 'besan', 'maida', 'atta', 'daliya', 'lapsi',
      
      // Dairy
      'milk', 'cheese', 'butter', 'cream', 'yogurt', 'sour cream', 'mozzarella',
      'cheddar', 'parmesan', 'feta', 'ricotta', 'cottage cheese', 'paneer',
      'ghee', 'buttermilk', 'kheer', 'malai', 'rabdi', 'shrikhand',
      
      // Indian dairy
      'dahi', 'chaas', 'lassi', 'kulfi', 'khoa', 'mawa', 'chenna',
      
      // Spices & Herbs (Indian/International)
      'turmeric', 'cumin', 'coriander', 'cardamom', 'cinnamon', 'cloves', 'nutmeg',
      'bay leaves', 'oregano', 'basil', 'thyme', 'rosemary', 'sage', 'parsley',
      'mint', 'cilantro', 'dill', 'tarragon', 'chervil', 'chili powder', 'paprika',
      'cayenne', 'black pepper', 'white pepper', 'mustard seeds', 'fennel seeds',
      'fenugreek', 'asafoetida', 'curry leaves', 'dried red chilies', 'green chilies',
      
      // Indian spices
      'haldi', 'jeera', 'dhania', 'elaichi', 'dalchini', 'laung', 'jaiphal',
      'tejpatta', 'hing', 'methi dana', 'kalonji', 'til', 'khus khus', 'saunf',
      'ajwain', 'kala jeera', 'shah jeera', 'javitri', 'star anise', 'mace',
      'garam masala', 'chaat masala', 'tandoori masala', 'kitchen king masala',
      
      // Pantry Items
      'oil', 'olive oil', 'vegetable oil', 'coconut oil', 'mustard oil', 'sesame oil',
      'vinegar', 'balsamic vinegar', 'apple cider vinegar', 'soy sauce', 'salt', 
      'sugar', 'brown sugar', 'honey', 'maple syrup', 'vanilla', 'baking powder',
      'baking soda', 'yeast', 'cornstarch', 'tapioca', 'gelatin', 'agar',
      
      // Indian pantry
      'jaggery', 'gud', 'khajur', 'imli', 'tamarind', 'kokum', 'amchur', 'kachri',
      'dried mango powder', 'black salt', 'rock salt', 'sendha namak',
      
      // Nuts & Seeds
      'almonds', 'walnuts', 'pecans', 'peanuts', 'cashews', 'pine nuts', 'hazelnuts',
      'brazil nuts', 'macadamia', 'pistachios', 'sesame seeds', 'sunflower seeds',
      'pumpkin seeds', 'chia seeds', 'flax seeds', 'hemp seeds', 'poppy seeds',
      
      // Indian nuts
      'badaam', 'akhrot', 'kaju', 'pista', 'moongfali', 'til', 'khus khus',
      'charoli', 'supari', 'coconut', 'nariyal', 'dried coconut', 'copra',
      
      // Legumes & Pulses
      'chickpeas', 'black beans', 'kidney beans', 'navy beans', 'pinto beans',
      'lima beans', 'black eyed peas', 'green lentils', 'red lentils', 'split peas',
      
      // Indian dals
      'chana dal', 'moong dal', 'masoor dal', 'toor dal', 'urad dal', 'arhar dal',
      'kala chana', 'safed chana', 'rajma', 'chole', 'kabuli chana', 'black gram',
      'green gram', 'yellow lentils', 'black lentils', 'horse gram', 'kulthi',
      
      // International cuisines
      'basil', 'oregano', 'mozzarella', 'parmesan', 'prosciutto', 'pancetta',
      'mortadella', 'salami', 'bresaola', 'gorgonzola', 'ricotta', 'mascarpone',
      'pecorino', 'parmigiano', 'balsamic', 'risotto', 'arborio', 'polenta',
      
      // Common cooking liquids
      'water', 'broth', 'stock', 'wine', 'beer', 'juice', 'coconut milk', 'almond milk',
      'cashew milk', 'rice milk', 'soy milk', 'vegetable broth', 'chicken broth',
      'beef broth', 'bone broth', 'fish stock', 'dashi', 'miso', 'sake', 'mirin'
    ];

    // Common misspellings map
    this.commonMisspellings = new Map([
      // Vegetables
      ['tomatoe', 'tomato'],
      ['potatoe', 'potato'],
      ['onoin', 'onion'],
      ['garilc', 'garlic'],
      ['brocoli', 'broccoli'],
      ['cauli flower', 'cauliflower'],
      ['mushrom', 'mushroom'],
      ['carot', 'carrot'],
      ['carrit', 'carrot'],
      
      // Proteins
      ['chiken', 'chicken'],
      ['chikken', 'chicken'],
      ['checken', 'chicken'],
      ['beff', 'beef'],
      ['beaf', 'beef'],
      ['samon', 'salmon'],
      ['salman', 'salmon'],
      ['shrimps', 'shrimp'],
      
      // Indian ingredients
      ['panir', 'paneer'],
      ['paner', 'paneer'],
      ['ghi', 'ghee'],
      ['daal', 'dal'],
      ['dall', 'dal'],
      ['haldie', 'haldi'],
      ['haldee', 'haldi'],
      ['jeara', 'jeera'],
      ['jira', 'jeera'],
      ['dhanya', 'dhania'],
      ['corainder', 'coriander'],
      ['corriander', 'coriander'],
      
      // Spices
      ['cummin', 'cumin'],
      ['tumeric', 'turmeric'],
      ['coriender', 'coriander'],
      ['cardamon', 'cardamom'],
      ['cinammon', 'cinnamon'],
      ['cinamon', 'cinnamon'],
      
      // Common typos
      ['chease', 'cheese'],
      ['cheeze', 'cheese'],
      ['resins', 'raisins'],
      ['ricesz', 'rice'],
      ['onoins', 'onions'],
      ['lemmon', 'lemon']
    ]);

    // Phonetic replacements for better matching
    this.phoneticReplacements = [
      ['ph', 'f'],
      ['ck', 'k'],
      ['c', 'k'],
      ['z', 's'],
      ['x', 'ks'],
      ['qu', 'kw']
    ];
  }

  // Calculate Levenshtein distance between two strings
  levenshteinDistance(str1, str2) {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            matrix[i][j - 1] + 1,     // insertion
            matrix[i - 1][j] + 1      // deletion
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  // Apply phonetic transformations
  phoneticTransform(word) {
    let transformed = word.toLowerCase();
    for (const [pattern, replacement] of this.phoneticReplacements) {
      transformed = transformed.replace(new RegExp(pattern, 'g'), replacement);
    }
    return transformed;
  }

  // Find the best match for a given input
  findBestMatch(input) {
    const normalizedInput = input.toLowerCase().trim();
    
    // Check for exact match first
    if (this.ingredientDictionary.includes(normalizedInput)) {
      return { suggestion: normalizedInput, confidence: 1.0, type: 'exact' };
    }

    // Check common misspellings
    if (this.commonMisspellings.has(normalizedInput)) {
      return { 
        suggestion: this.commonMisspellings.get(normalizedInput), 
        confidence: 0.95, 
        type: 'common_misspelling' 
      };
    }

    // Find closest matches using Levenshtein distance
    const matches = [];
    const phoneticInput = this.phoneticTransform(normalizedInput);

    for (const ingredient of this.ingredientDictionary) {
      const distance = this.levenshteinDistance(normalizedInput, ingredient);
      const phoneticDistance = this.levenshteinDistance(phoneticInput, this.phoneticTransform(ingredient));
      
      // Calculate confidence based on distance and word length
      const maxLength = Math.max(normalizedInput.length, ingredient.length);
      const confidence = Math.max(0, 1 - (Math.min(distance, phoneticDistance) / maxLength));
      
      if (confidence > 0.6) { // Only consider matches with >60% confidence
        matches.push({
          suggestion: ingredient,
          confidence: confidence,
          distance: Math.min(distance, phoneticDistance),
          type: distance < phoneticDistance ? 'spelling' : 'phonetic'
        });
      }
    }

    // Sort by confidence and distance
    matches.sort((a, b) => {
      if (b.confidence !== a.confidence) {
        return b.confidence - a.confidence;
      }
      return a.distance - b.distance;
    });

    // Return best match if confidence is high enough
    if (matches.length > 0 && matches[0].confidence > 0.7) {
      return matches[0];
    }

    // If no good match found, return suggestions
    return {
      suggestion: null,
      confidence: 0,
      type: 'no_match',
      suggestions: matches.slice(0, 3).map(m => m.suggestion)
    };
  }

  // Auto-correct an ingredient with multiple suggestions
  autoCorrect(input) {
    const result = this.findBestMatch(input);
    
    if (result.confidence >= 0.9) {
      // High confidence - auto-correct
      return {
        corrected: result.suggestion,
        autoChanged: true,
        confidence: result.confidence,
        original: input
      };
    } else if (result.confidence >= 0.7) {
      // Medium confidence - suggest correction
      return {
        corrected: input,
        autoChanged: false,
        suggestion: result.suggestion,
        confidence: result.confidence,
        original: input
      };
    } else {
      // Low confidence - provide multiple suggestions
      return {
        corrected: input,
        autoChanged: false,
        suggestions: result.suggestions || [],
        confidence: result.confidence,
        original: input
      };
    }
  }

  // Batch process multiple ingredients
  correctIngredients(ingredients) {
    return ingredients.map(ingredient => {
      const correctionResult = this.autoCorrect(ingredient);
      return {
        original: ingredient,
        ...correctionResult
      };
    });
  }

  // Suggest ingredients based on partial input
  suggestIngredients(partialInput) {
    const normalized = partialInput.toLowerCase().trim();
    
    if (normalized.length < 2) return [];

    const suggestions = this.ingredientDictionary
      .filter(ingredient => ingredient.toLowerCase().startsWith(normalized))
      .slice(0, 8) // Limit to 8 suggestions
      .sort((a, b) => a.length - b.length); // Prefer shorter matches

    return suggestions;
  }
}

module.exports = new SpellCorrectionService();
