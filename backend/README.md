# Leftover Chef Backend API

A comprehensive MERN stack backend for the Leftover Chef application - helping users transform leftovers into delicious meals while reducing food waste.

## 🚀 Features

### Core Functionality
- **Smart Recipe Search**: Advanced ingredient-based recipe discovery
- **AI-Powered Recommendations**: Personalized meal suggestions using OpenAI
- **Kitchen Inventory Management**: Track ingredients and expiration dates
- **Meal Planning**: AI-generated weekly meal plans
- **Shopping Lists**: Automated shopping list generation
- **Nutrition Tracking**: Comprehensive nutritional information
- **User Gamification**: Achievements, points, and cooking streaks

### External Integrations
- **Spoonacular API**: Real recipe data and nutrition information
- **OpenAI API**: AI-powered recommendations and meal planning
- **MongoDB**: Scalable data storage with optimized queries

## 🛠 Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud)
- npm or yarn

### Installation

1. **Clone and install dependencies**:
```bash
cd backend
npm install
```

2. **Set up environment variables**:
```bash
cp .env.example .env
```

3. **Configure API keys in `.env`**:
```env
# Required for full functionality
SPOONACULAR_API_KEY=your_spoonacular_api_key_here
OPENAI_API_KEY=your_openai_api_key_here

# Database
MONGODB_URI=mongodb://localhost:27017/leftover-chef

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key
```

4. **Start the server**:
```bash
npm run dev
```

The API will be available at `http://localhost:5000`

## 🔑 API Keys Setup

### Spoonacular API
1. Visit [https://spoonacular.com/food-api](https://spoonacular.com/food-api)
2. Create an account and get your API key
3. Add to `.env` as `SPOONACULAR_API_KEY`

**Enables**:
- Recipe search by ingredients
- Detailed recipe information
- Nutrition data
- Bulk recipe imports

### OpenAI API
1. Visit [https://platform.openai.com/](https://platform.openai.com/)
2. Create an account and get your API key
3. Add to `.env` as `OPENAI_API_KEY`

**Enables**:
- AI-powered recipe recommendations
- Personalized meal planning
- Cooking tips generation
- Recipe enhancement

## 📚 API Endpoints

### Authentication
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - User login

### Recipe Management
- `GET /api/recipes` - Get all recipes with filtering
- `GET /api/recipes/:id` - Get specific recipe
- `POST /api/recipes/search-by-ingredients` - Smart ingredient search
- `GET /api/recipes/daily/featured` - Daily featured recipe
- `GET /api/recipes/recommendations/personalized` - AI recommendations

### User Features
- `GET /api/users/inventory` - Kitchen inventory
- `POST /api/users/inventory` - Add to inventory
- `GET /api/users/shopping-list` - Shopping list
- `POST /api/users/meal-plan/generate` - Generate AI meal plan
- `GET /api/users/dashboard` - User dashboard
- `GET /api/users/achievements` - User achievements

### Utility Endpoints
- `GET /api/health` - Health check
- `GET /api/docs` - API documentation
- `GET /api/stats` - Usage statistics

## 🔍 Smart Recipe Search

The enhanced recipe search supports multiple parameters:

```javascript
POST /api/recipes/search-by-ingredients
{
  "ingredients": ["chicken", "rice", "vegetables"],
  "matchType": "any", // "any", "all", "most"
  "preferences": {
    "dietary": {
      "vegetarian": false,
      "vegan": false,
      "glutenFree": true,
      "dairyFree": false
    },
    "allergens": {
      "noNuts": true,
      "noShellfish": false,
      "noEggs": false,
      "noSoy": false
    }
  },
  "nutrition": {
    "maxCalories": 800,
    "minProtein": 20,
    "maxCarbs": 60
  },
  "useAI": true,
  "limit": 20
}
```

### Response Format
```javascript
{
  "recipes": [
    {
      "_id": "...",
      "title": "Recipe Name",
      "image": "...",
      "rating": 4.5,
      "readyInMinutes": 30,
      "nutrition": { "calories": 450, "protein": 25, "carbs": 35, "fat": 15 },
      "matchScore": 0.85,
      "matchedIngredients": ["chicken", "rice"],
      "missingIngredients": ["garlic", "soy sauce"],
      "aiRecommended": true,
      "aiReason": "Perfect for your skill level and preferences"
    }
  ],
  "totalFound": 15,
  "aiEnhanced": true
}
```

## 🤖 AI Features

### Personalized Recommendations
The AI service analyzes user preferences, cooking history, and available ingredients to provide personalized suggestions:

```javascript
GET /api/recipes/recommendations/personalized
Authorization: Bearer <token>

// Response includes recipes tailored to:
// - User's cooking skill level
// - Dietary preferences and restrictions
// - Available ingredients
// - Cooking history and preferences
// - Nutrition goals
```

### AI Meal Planning
Generate complete meal plans based on user profile:

```javascript
POST /api/users/meal-plan/generate
{
  "days": 7,
  "preferences": {
    "preferQuickMeals": true,
    "preferHealthyOptions": true
  }
}
```

## 💾 Database Models

### Recipe Schema
```javascript
{
  title: String,
  summary: String,
  readyInMinutes: Number,
  servings: Number,
  extendedIngredients: [IngredientSchema],
  analyzedInstructions: [InstructionSchema],
  nutrition: NutritionSchema,
  vegetarian: Boolean,
  vegan: Boolean,
  glutenFree: Boolean,
  dairyFree: Boolean,
  allergens: AllergenSchema,
  rating: Number,
  difficulty: String,
  leftoverFriendly: Boolean,
  aiEnhanced: Boolean
}
```

### User Schema
```javascript
{
  name: String,
  email: String,
  password: String,
  cookingSkillLevel: String,
  dietaryPreferences: Object,
  allergens: Object,
  nutritionGoals: Object,
  kitchenInventory: [InventoryItemSchema],
  shoppingList: [ShoppingItemSchema],
  mealPlan: [MealPlanSchema],
  cookingHistory: [CookingHistorySchema],
  achievements: [AchievementSchema],
  points: Number,
  level: Number
}
```

## 🔒 Authentication

The API uses JWT (JSON Web Tokens) for authentication:

1. Register or login to receive a token
2. Include in requests: `Authorization: Bearer <token>`
3. Tokens expire after 7 days

## 📊 Data Management

### Recipe Import
Bulk import recipes from Spoonacular:

```javascript
POST /api/recipes/import/bulk
{
  "query": "leftover",
  "count": 100
}
```

### Inventory Management
Track kitchen ingredients with expiration monitoring:

```javascript
POST /api/users/inventory
{
  "ingredients": [
    {
      "ingredient": "chicken breast",
      "quantity": "2 lbs",
      "expiryDate": "2024-01-15",
      "category": "proteins"
    }
  ]
}
```

## 🎮 Gamification

Users earn points and achievements for:
- Cooking recipes (+10 points)
- Adding inventory items (+5 points)
- Maintaining cooking streaks (bonus points)
- Reaching milestones (level bonuses)

## 🚨 Error Handling

The API provides detailed error responses:

```javascript
{
  "message": "Error description",
  "errors": ["Specific validation errors"],
  "field": "problematic_field"
}
```

Common HTTP status codes:
- `200` - Success
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error

## 🔍 Monitoring

### Health Check
```bash
GET /api/health
```

Returns server status, database connection, memory usage, and service availability.

### Statistics
```bash
GET /api/stats
```

Provides API usage statistics and database metrics.

## 🚀 Deployment

### Environment Setup
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://your-cluster.mongodb.net/leftover-chef
JWT_SECRET=production-secret-key
SPOONACULAR_API_KEY=your-production-key
OPENAI_API_KEY=your-production-key
```

### Production Considerations
- Use MongoDB Atlas or similar cloud database
- Set up proper logging and monitoring
- Configure CORS for your domain
- Use environment-specific API keys
- Enable rate limiting
- Set up SSL/TLS certificates

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## 📄 License

MIT License - feel free to use this code for your own projects!

## 🆘 Support

For issues or questions:
1. Check the API documentation at `/api/docs`
2. Verify environment variables are set correctly
3. Check server logs for detailed error information
4. Ensure MongoDB is running and accessible

---

**Leftover Chef** - Turn your leftovers into culinary masterpieces! 🍳✨
