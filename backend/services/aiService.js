const OpenAI = require('openai');
const Recipe = require('../models/Recipe');

// TODO: Add your OpenAI API key here
const OPENAI_API_KEY = process.env.OPENAI_API_KEY; // Get your API key from https://platform.openai.com/

class AIService {
  constructor() {
    this.model = 'gpt-3.5-turbo';
    this._openai = null;
  }

  // Lazy initialization of OpenAI client
  getOpenAIClient() {
    if (!this._openai && OPENAI_API_KEY) {
      this._openai = new OpenAI({
        apiKey: OPENAI_API_KEY
      });
    }
    return this._openai;
  }

  // Generate personalized recipe recommendations using AI
  async generatePersonalizedRecommendations(user, availableIngredients = []) {
    try {
      if (!OPENAI_API_KEY) {
        console.log('OpenAI API key not provided, using rule-based recommendations');
        return await this.getRuleBasedRecommendations(user, availableIngredients);
      }

      const prompt = this.buildPersonalizationPrompt(user, availableIngredients);

      const response = await openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: "system",
            content: "You are a professional nutritionist and chef who specializes in creating personalized meal recommendations based on individual dietary needs, cooking skills, available ingredients, and food waste reduction."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.7
      });

      const aiRecommendations = response.choices[0].message.content;
      
      // Parse AI recommendations and match with database recipes
      return await this.matchAIRecommendationsWithRecipes(aiRecommendations, availableIngredients, user);
    } catch (error) {
      console.error('Error generating AI recommendations:', error.message);
      return await this.getRuleBasedRecommendations(user, availableIngredients);
    }
  }

  // Build personalization prompt based on user profile
  buildPersonalizationPrompt(user, availableIngredients) {
    let prompt = `Create personalized recipe recommendations for a user with the following profile:\n\n`;
    
    // Cooking skill level
    prompt += `Cooking Skill Level: ${user.cookingSkillLevel}\n`;
    
    // Dietary preferences
    const dietaryPrefs = Object.keys(user.dietaryPreferences)
      .filter(key => user.dietaryPreferences[key])
      .join(', ');
    if (dietaryPrefs) {
      prompt += `Dietary Preferences: ${dietaryPrefs}\n`;
    }
    
    // Allergens
    const allergens = Object.keys(user.allergens)
      .filter(key => user.allergens[key])
      .join(', ');
    if (allergens) {
      prompt += `Allergens to Avoid: ${allergens}\n`;
    }
    
    // Nutrition goals
    if (user.nutritionGoals) {
      prompt += `Daily Calorie Goal: ${user.nutritionGoals.dailyCalories}\n`;
      prompt += `Protein Target: ${user.nutritionGoals.proteinPercentage}% of calories\n`;
    }
    
    // Cooking preferences
    if (user.recommendationPreferences) {
      if (user.recommendationPreferences.preferQuickMeals) {
        prompt += `Prefers quick meals (under 30 minutes)\n`;
      }
      if (user.recommendationPreferences.preferHealthyOptions) {
        prompt += `Prefers healthy, nutritious options\n`;
      }
      if (user.recommendationPreferences.preferBudgetFriendly) {
        prompt += `Prefers budget-friendly recipes\n`;
      }
    }
    
    // Available ingredients
    if (availableIngredients.length > 0) {
      prompt += `Available Ingredients: ${availableIngredients.join(', ')}\n`;
    }
    
    // Recent cooking history for variety
    if (user.cookingHistory && user.cookingHistory.length > 0) {
      const recentCuisines = user.cookingHistory
        .slice(0, 5)
        .map(history => history.notes)
        .filter(Boolean)
        .join(', ');
      if (recentCuisines) {
        prompt += `Recently Cooked: ${recentCuisines} (suggest different cuisines for variety)\n`;
      }
    }
    
    prompt += `\nPlease recommend 5-8 specific recipe names that:\n`;
    prompt += `1. Match their skill level and preferences\n`;
    prompt += `2. Use available ingredients when possible\n`;
    prompt += `3. Meet dietary restrictions and avoid allergens\n`;
    prompt += `4. Provide nutritional variety\n`;
    prompt += `5. Are suitable for reducing food waste\n`;
    prompt += `6. Include different cooking methods and cuisines\n\n`;
    prompt += `Format: Just list the recipe names, one per line, without numbers or extra text.`;
    
    return prompt;
  }

  // Match AI recommendations with database recipes
  async matchAIRecommendationsWithRecipes(aiRecommendations, availableIngredients, user) {
    const recipeNames = aiRecommendations
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0 && !line.match(/^\d+\./) && line.length < 100);

    const matchedRecipes = [];

    for (const recipeName of recipeNames) {
      // Try exact text search first
      let recipes = await Recipe.find({
        $text: { $search: recipeName }
      }).limit(2);

      // If no exact matches, try partial matches
      if (recipes.length === 0) {
        const keywords = recipeName.split(' ').filter(word => word.length > 3);
        if (keywords.length > 0) {
          recipes = await Recipe.find({
            title: { $regex: keywords.join('|'), $options: 'i' }
          }).limit(2);
        }
      }

      // Add match scores and AI context
      recipes.forEach(recipe => {
        const recipeObj = recipe.toObject();
        recipeObj.aiRecommended = true;
        recipeObj.aiReason = `Personalized recommendation based on your ${user.cookingSkillLevel} skill level and preferences`;
        
        if (availableIngredients.length > 0) {
          recipeObj.matchScore = recipe.calculateIngredientMatchScore(availableIngredients);
        }
        
        matchedRecipes.push(recipeObj);
      });
    }

    // If no matches found, fall back to ingredient-based search
    if (matchedRecipes.length === 0 && availableIngredients.length > 0) {
      return await Recipe.findByIngredients({
        ingredients: availableIngredients,
        preferences: {
          dietary: user.dietaryPreferences,
          allergens: user.allergens
        },
        limit: 8
      });
    }

    // Sort by relevance and return top results
    return matchedRecipes
      .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))
      .slice(0, 8);
  }

  // Generate cooking tips and suggestions using AI
  async generateCookingTips(recipe, userSkillLevel = 'Beginner') {
    try {
      if (!OPENAI_API_KEY) {
        return this.getBasicCookingTips(recipe, userSkillLevel);
      }

      const prompt = `Generate helpful cooking tips for this recipe:
      
Recipe: ${recipe.title}
Cooking Time: ${recipe.readyInMinutes} minutes
Difficulty: ${recipe.difficulty}
User Skill Level: ${userSkillLevel}

Ingredients: ${recipe.extendedIngredients?.map(ing => ing.name).join(', ') || 'Various ingredients'}

Instructions summary: ${recipe.instructions?.substring(0, 200) || 'Standard cooking instructions'}

Please provide:
1. 3-4 practical cooking tips specific to this recipe
2. Common mistakes to avoid
3. Ingredient substitution suggestions
4. Tips for meal prep and storage
5. Ways to use leftovers creatively

Format as a JSON object with keys: tips, mistakes, substitutions, mealPrep, leftovers`;

      const response = await openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: "system",
            content: "You are a professional chef providing helpful, practical cooking advice. Always prioritize food safety and provide beginner-friendly alternatives."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 800,
        temperature: 0.7
      });

      const aiTips = response.choices[0].message.content;
      
      try {
        return JSON.parse(aiTips);
      } catch (parseError) {
        // If JSON parsing fails, return structured text
        return {
          tips: [aiTips.substring(0, 200)],
          mistakes: [],
          substitutions: [],
          mealPrep: '',
          leftovers: ''
        };
      }
    } catch (error) {
      console.error('Error generating cooking tips:', error.message);
      return this.getBasicCookingTips(recipe, userSkillLevel);
    }
  }

  // Generate meal plan using AI
  async generateAIMealPlan(user, days = 7) {
    try {
      if (!OPENAI_API_KEY) {
        return await user.generateMealPlan(days);
      }

      const availableIngredients = user.getAvailableIngredients();
      const ingredientNames = availableIngredients.map(item => item.ingredient);

      const prompt = `Create a ${days}-day meal plan for a user with this profile:

Skill Level: ${user.cookingSkillLevel}
Dietary Preferences: ${Object.keys(user.dietaryPreferences).filter(key => user.dietaryPreferences[key]).join(', ') || 'None'}
Allergens to Avoid: ${Object.keys(user.allergens).filter(key => user.allergens[key]).join(', ') || 'None'}
Available Ingredients: ${ingredientNames.join(', ') || 'Standard pantry items'}
Daily Calorie Goal: ${user.nutritionGoals?.dailyCalories || 2000}

Requirements:
1. Balance nutrition across the week
2. Use available ingredients efficiently to minimize waste
3. Vary cuisines and cooking methods
4. Consider skill level for recipe complexity
5. Plan for leftovers and ingredient overlap

For each day, suggest:
- Breakfast
- Lunch  
- Dinner

Format as JSON with structure:
{
  "day1": {
    "breakfast": "Recipe Name",
    "lunch": "Recipe Name", 
    "dinner": "Recipe Name"
  },
  ...
}`;

      const response = await openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: "system",
            content: "You are a professional meal planning nutritionist who creates balanced, practical meal plans that minimize food waste and match user preferences."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 1200,
        temperature: 0.7
      });

      const aiMealPlan = response.choices[0].message.content;
      
      try {
        const mealPlanData = JSON.parse(aiMealPlan);
        return await this.convertAIMealPlanToDatabase(mealPlanData, user);
      } catch (parseError) {
        console.error('Error parsing AI meal plan:', parseError);
        return await user.generateMealPlan(days);
      }
    } catch (error) {
      console.error('Error generating AI meal plan:', error.message);
      return await user.generateMealPlan(days);
    }
  }

  // Convert AI meal plan to database format
  async convertAIMealPlanToDatabase(aiMealPlan, user) {
    const mealPlan = [];
    const mealTypes = ['breakfast', 'lunch', 'dinner'];
    
    for (let day = 1; day <= Object.keys(aiMealPlan).length; day++) {
      const dayKey = `day${day}`;
      const dayMeals = aiMealPlan[dayKey];
      
      if (dayMeals) {
        const date = new Date();
        date.setDate(date.getDate() + day - 1);
        
        for (const mealType of mealTypes) {
          if (dayMeals[mealType]) {
            // Find matching recipe in database
            const recipe = await Recipe.findOne({
              title: { $regex: dayMeals[mealType], $options: 'i' }
            });
            
            if (recipe) {
              mealPlan.push({
                date,
                mealType,
                recipeId: recipe._id,
                servings: user.appSettings?.defaultServingSize || 4,
                notes: 'AI-generated meal plan'
              });
            }
          }
        }
      }
    }
    
    user.mealPlan = mealPlan;
    await user.save();
    return mealPlan;
  }

  // Enhance recipe with AI-generated content
  async enhanceRecipeWithAI(recipe) {
    try {
      if (!OPENAI_API_KEY) {
        return recipe;
      }

      const enhancements = await Promise.all([
        this.generateRecipeSummary(recipe),
        this.generateLeftoverTips(recipe),
        this.generateNutritionalInsights(recipe)
      ]);

      const [summary, leftoverTips, nutritionalInsights] = enhancements;

      recipe.aiEnhanced = true;
      recipe.aiSummary = summary;
      recipe.leftoverTips = leftoverTips;
      recipe.aiTips = nutritionalInsights;

      await recipe.save();
      return recipe;
    } catch (error) {
      console.error('Error enhancing recipe with AI:', error.message);
      return recipe;
    }
  }

  // Generate recipe summary
  async generateRecipeSummary(recipe) {
    try {
      const prompt = `Write a concise, appealing summary for this recipe:

Title: ${recipe.title}
Cooking Time: ${recipe.readyInMinutes} minutes
Ingredients: ${recipe.extendedIngredients?.slice(0, 5).map(ing => ing.name).join(', ') || 'Various ingredients'}

The summary should be 2-3 sentences that highlight what makes this recipe special, its flavor profile, and why someone would want to cook it. Focus on appetizing descriptions and practical benefits.`;

      const response = await openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: "system",
            content: "You are a food writer who creates engaging, mouth-watering recipe descriptions that make people excited to cook."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 150,
        temperature: 0.8
      });

      return response.choices[0].message.content.trim();
    } catch (error) {
      console.error('Error generating recipe summary:', error.message);
      return '';
    }
  }

  // Generate leftover tips
  async generateLeftoverTips(recipe) {
    try {
      const prompt = `Generate 3-4 creative ways to use leftovers from this recipe:

Recipe: ${recipe.title}
Serving size: ${recipe.servings} servings
Main ingredients: ${recipe.extendedIngredients?.slice(0, 5).map(ing => ing.name).join(', ') || 'Various ingredients'}

Focus on practical transformation ideas that create completely different meals from the leftovers. Include storage tips and how long leftovers will keep.

Format as an array of strings.`;

      const response = await openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: "system",
            content: "You are a sustainability-focused chef who specializes in creative leftover transformations and food waste reduction."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 300,
        temperature: 0.8
      });

      const tipsText = response.choices[0].message.content;
      
      // Parse into array
      return tipsText
        .split('\n')
        .map(tip => tip.replace(/^\d+\.\s*/, '').trim())
        .filter(tip => tip.length > 10);
    } catch (error) {
      console.error('Error generating leftover tips:', error.message);
      return [];
    }
  }

  // Generate nutritional insights
  async generateNutritionalInsights(recipe) {
    try {
      const nutrition = recipe.nutrition;
      if (!nutrition) return [];

      const prompt = `Provide 2-3 key nutritional insights for this recipe:

Calories: ${nutrition.calories}
Protein: ${nutrition.protein}g
Carbs: ${nutrition.carbs}g
Fat: ${nutrition.fat}g
Fiber: ${nutrition.fiber}g

Highlight the nutritional benefits, what makes it healthy or indulgent, and any notable nutritional facts. Keep it positive and informative.

Format as an array of strings.`;

      const response = await openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: "system",
            content: "You are a registered dietitian providing helpful, accurate nutritional information in an accessible way."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 200,
        temperature: 0.7
      });

      const insightsText = response.choices[0].message.content;
      
      return insightsText
        .split('\n')
        .map(insight => insight.replace(/^\d+\.\s*/, '').trim())
        .filter(insight => insight.length > 10);
    } catch (error) {
      console.error('Error generating nutritional insights:', error.message);
      return [];
    }
  }

  // Rule-based recommendations fallback
  async getRuleBasedRecommendations(user, availableIngredients) {
    const query = {};
    
    // Apply dietary preferences
    Object.keys(user.dietaryPreferences).forEach(diet => {
      if (user.dietaryPreferences[diet]) {
        query[diet] = true;
      }
    });
    
    // Apply allergen restrictions
    Object.keys(user.allergens).forEach(allergen => {
      if (user.allergens[allergen]) {
        query[`allergens.${allergen}`] = { $ne: true };
      }
    });
    
    // Apply skill level
    const skillMapping = {
      'Beginner': ['Easy'],
      'Intermediate': ['Easy', 'Medium'],
      'Advanced': ['Easy', 'Medium', 'Hard'],
      'Expert': ['Easy', 'Medium', 'Hard']
    };
    
    const allowedDifficulties = skillMapping[user.cookingSkillLevel] || ['Easy'];
    query.difficulty = { $in: allowedDifficulties };
    
    // Prefer highly rated recipes
    query.rating = { $gte: 4.0 };
    
    if (availableIngredients.length > 0) {
      return await Recipe.findByIngredients({
        ingredients: availableIngredients,
        preferences: {
          dietary: user.dietaryPreferences,
          allergens: user.allergens
        },
        limit: 8
      });
    } else {
      return await Recipe.find(query)
        .sort({ rating: -1, healthScore: -1 })
        .limit(8);
    }
  }

  // Basic cooking tips fallback
  getBasicCookingTips(recipe, userSkillLevel) {
    const tips = {
      tips: [
        "Read through the entire recipe before starting",
        "Prep all ingredients before you begin cooking",
        "Taste and adjust seasoning throughout the cooking process"
      ],
      mistakes: [
        "Don't overcrowd the pan when cooking",
        "Avoid cooking on heat that's too high"
      ],
      substitutions: [],
      mealPrep: "Store leftovers in the refrigerator for up to 3 days",
      leftovers: "Transform leftovers into sandwiches, salads, or fried rice"
    };

    // Add skill-specific tips
    if (userSkillLevel === 'Beginner') {
      tips.tips.push("Use a timer to avoid overcooking");
      tips.tips.push("Keep the heat at medium to avoid burning");
    }

    return tips;
  }
}

module.exports = new AIService();
