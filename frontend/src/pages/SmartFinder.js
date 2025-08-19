import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaSearch,
  FaPlus,
  FaTimes,
  FaClock,
  FaUsers,
  FaStar,
  FaUtensils,
  FaGlobe,
  FaHeart,
  FaEye
} from 'react-icons/fa';
import axios from 'axios';
import toast from 'react-hot-toast';

const FinderContainer = styled(motion.div)`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  min-height: calc(100vh - 80px);
`;

const Header = styled(motion.div)`
  text-align: center;
  margin-bottom: 3rem;
  
  .main-title {
    font-size: 3rem;
    font-weight: 700;
    color: ${props => props.theme.colors.primary};
    background: ${props => props.theme.colors.gradient};
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 1rem;

    @supports not (-webkit-background-clip: text) {
      color: ${props => props.theme.colors.primary};
      background: none;
    }
  }
  
  .subtitle {
    font-size: 1.2rem;
    color: rgba(255, 255, 255, 0.9);
    max-width: 600px;
    margin: 0 auto;
  }
`;

const SearchSection = styled(motion.div)`
  background: white;
  border-radius: 20px;
  padding: 2rem;
  box-shadow: ${props => props.theme.shadows.card};
  margin-bottom: 2rem;
`;

const IngredientInput = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  
  .input-field {
    flex: 1;
    padding: 1rem 1.5rem;
    border: 2px solid #e1e5e9;
    border-radius: 15px;
    font-size: 1.1rem;
    transition: all 0.3s ease;
    
    &:focus {
      outline: none;
      border-color: ${props => props.theme.colors.primary};
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }
    
    &::placeholder {
      color: #999;
    }
  }
  
  .add-btn {
    background: ${props => props.theme.colors.success};
    color: white;
    border: none;
    padding: 1rem 2rem;
    border-radius: 15px;
    cursor: pointer;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.3s ease;
    
    &:hover {
      background: #45a049;
      transform: translateY(-2px);
    }
    
    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }
`;

const IngredientTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  min-height: 50px;
  padding: 1rem;
  border: 2px dashed #e1e5e9;
  border-radius: 15px;
  background: #f8f9fa;
`;

const IngredientTag = styled(motion.div)`
  background: ${props => props.theme.colors.primary};
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 25px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  
  .remove-btn {
    background: none;
    border: none;
    color: white;
    cursor: pointer;
    padding: 0;
    opacity: 0.8;
    
    &:hover {
      opacity: 1;
    }
  }
`;

const SearchButton = styled(motion.button)`
  background: ${props => props.theme.colors.gradient};
  color: white;
  border: none;
  padding: 1.2rem 3rem;
  border-radius: 25px;
  font-size: 1.2rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 0 auto;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: ${props => props.theme.shadows.cardHover};
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const QuickSuggestions = styled.div`
  margin-top: 2rem;
  
  .suggestions-title {
    font-size: 1.1rem;
    font-weight: 600;
    margin-bottom: 1rem;
    color: ${props => props.theme.colors.textDark};
  }
  
  .suggestions-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
  }
  
  .suggestion-category {
    h4 {
      color: ${props => props.theme.colors.textDark};
      margin-bottom: 0.75rem;
      font-size: 0.95rem;
    }
    
    .suggestion-items {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }
  }
`;

const SuggestionChip = styled(motion.button)`
  background: ${props => props.theme.colors.backgroundLight};
  color: ${props => props.theme.colors.textDark};
  border: 1px solid #ddd;
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => props.theme.colors.primary};
    color: white;
    transform: translateY(-1px);
  }
`;

const ResultsSection = styled(motion.div)`
  background: white;
  border-radius: 20px;
  padding: 2rem;
  box-shadow: ${props => props.theme.shadows.card};
`;

const ResultsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  
  .results-title {
    font-size: 1.5rem;
    font-weight: 600;
    color: ${props => props.theme.colors.textDark};
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .results-count {
    color: ${props => props.theme.colors.primary};
  }
`;

const RecipeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1.5rem;
`;

const RecipeCard = styled(motion.div)`
  background: white;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid #f0f0f0;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    border-color: ${props => props.theme.colors.primary};
  }
  
  .recipe-image {
    width: 100%;
    height: 200px;
    object-fit: cover;
  }
  
  .recipe-content {
    padding: 1.5rem;
    
    .recipe-title {
      font-size: 1.2rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
      color: ${props => props.theme.colors.textDark};
      line-height: 1.3;
    }
    
    .recipe-summary {
      color: ${props => props.theme.colors.textLight};
      font-size: 0.9rem;
      margin-bottom: 1rem;
      line-height: 1.4;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    
    .recipe-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      font-size: 0.9rem;
      color: ${props => props.theme.colors.textLight};
      
      .meta-item {
        display: flex;
        align-items: center;
        gap: 0.3rem;
        
        .meta-icon {
          color: ${props => props.theme.colors.primary};
        }
      }
    }
    
    .recipe-rating {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 1rem;
      
      .stars {
        color: #ffd700;
      }
      
      .rating-value {
        font-weight: 600;
        color: ${props => props.theme.colors.textDark};
      }
    }
    
    .recipe-actions {
      display: flex;
      gap: 0.5rem;
      
      .action-btn {
        flex: 1;
        background: ${props => props.theme.colors.backgroundLight};
        border: 1px solid #ddd;
        color: ${props => props.theme.colors.textDark};
        padding: 0.5rem;
        border-radius: 8px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.3rem;
        font-size: 0.85rem;
        transition: all 0.2s ease;
        
        &:hover {
          background: ${props => props.theme.colors.primary};
          color: white;
          border-color: ${props => props.theme.colors.primary};
        }
        
        &.favorited {
          background: ${props => props.theme.colors.accent};
          color: white;
          border-color: ${props => props.theme.colors.accent};
        }
      }
    }
  }
`;

const LoadingSpinner = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  
  .spinner {
    font-size: 3rem;
    margin-bottom: 1rem;
  }
  
  .loading-text {
    color: ${props => props.theme.colors.textLight};
    font-size: 1.1rem;
  }
`;

const EmptyState = styled(motion.div)`
  text-align: center;
  padding: 3rem;
  color: ${props => props.theme.colors.textMuted};
  
  .empty-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
    opacity: 0.3;
  }
  
  h3 {
    margin-bottom: 0.5rem;
    color: ${props => props.theme.colors.textDark};
  }
  
  p {
    max-width: 400px;
    margin: 0 auto;
    line-height: 1.5;
  }
`;

const SmartFinder = () => {
  const [ingredients, setIngredients] = useState([]);
  const [currentInput, setCurrentInput] = useState('');
  const [recipes, setRecipes] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [favorites, setFavorites] = useState(new Set());

  // Quick suggestion categories
  const suggestionCategories = [
    {
      title: 'Popular',
      items: ['rice', 'chicken', 'tomato', 'onion', 'garlic', 'potato']
    },
    {
      title: 'Proteins',
      items: ['beef', 'pork', 'fish', 'eggs', 'tofu', 'paneer']
    },
    {
      title: 'Vegetables',
      items: ['spinach', 'broccoli', 'carrot', 'bell pepper', 'mushroom', 'corn']
    },
    {
      title: 'Grains',
      items: ['pasta', 'bread', 'quinoa', 'oats', 'noodles', 'flour']
    },
    {
      title: 'Indian',
      items: ['dal', 'roti', 'curry leaves', 'turmeric', 'cumin', 'garam masala']
    },
    {
      title: 'Italian',
      items: ['basil', 'mozzarella', 'parmesan', 'olive oil', 'oregano', 'balsamic']
    }
  ];

  const addIngredient = () => {
    const ingredient = currentInput.trim().toLowerCase();
    if (ingredient && !ingredients.includes(ingredient)) {
      setIngredients(prev => [...prev, ingredient]);
      setCurrentInput('');
      toast.success(`Added "${ingredient}"`);
    } else if (ingredients.includes(ingredient)) {
      toast.error('Ingredient already added!');
    }
  };

  const removeIngredient = (ingredient) => {
    setIngredients(prev => prev.filter(ing => ing !== ingredient));
    toast.success(`Removed "${ingredient}"`);
  };

  const addSuggestion = (ingredient) => {
    if (!ingredients.includes(ingredient.toLowerCase())) {
      setIngredients(prev => [...prev, ingredient.toLowerCase()]);
      toast.success(`Added "${ingredient}"`);
    }
  };

  const searchRecipes = async () => {
    if (ingredients.length === 0) {
      toast.error('Please add at least one ingredient!');
      return;
    }

    setIsSearching(true);
    setHasSearched(true);

    try {
      // Use the enhanced search endpoint that combines local + Spoonacular
      const response = await axios.post('/api/recipes/search-by-ingredients', {
        ingredients,
        matchType: 'any',
        useSpoonacular: true,
        limit: 50 // Get more results to ensure variety
      });

      const foundRecipes = response.data.recipes || [];
      
      if (foundRecipes.length === 0) {
        // Fallback: try global search if local search fails
        try {
          const globalResponse = await axios.post('/api/recipes/search/global', {
            ingredients,
            number: 20
          });
          
          const globalRecipes = globalResponse.data.recipes || [];
          setRecipes(globalRecipes);
          
          if (globalRecipes.length > 0) {
            toast.success(`Found ${globalRecipes.length} recipes from global search!`);
          } else {
            toast.error('No recipes found. Try different ingredients.');
          }
        } catch (globalError) {
          console.error('Global search failed:', globalError);
          toast.error('No recipes found. Try different ingredients.');
          setRecipes([]);
        }
      } else {
        setRecipes(foundRecipes);
        toast.success(`Found ${foundRecipes.length} recipes!`);
      }

    } catch (error) {
      console.error('Search error:', error);
      toast.error('Search failed. Please try again.');
      setRecipes([]);
    } finally {
      setIsSearching(false);
    }
  };

  const toggleFavorite = (recipeId) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(recipeId)) {
      newFavorites.delete(recipeId);
      toast.success('Removed from favorites');
    } else {
      newFavorites.add(recipeId);
      toast.success('Added to favorites');
    }
    setFavorites(newFavorites);
  };

  const viewRecipe = (recipe) => {
    // Open recipe in new tab or modal
    if (recipe.sourceUrl) {
      window.open(recipe.sourceUrl, '_blank');
    } else {
      toast.info('Recipe details not available');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      addIngredient();
    }
  };

  const clearAll = () => {
    setIngredients([]);
    setCurrentInput('');
    setRecipes([]);
    setHasSearched(false);
    toast.success('Cleared all ingredients');
  };

  const generateStars = (rating) => {
    const stars = Math.floor(rating || 0);
    return '★'.repeat(stars) + '☆'.repeat(5 - stars);
  };

  return (
    <FinderContainer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <Header
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.8 }}
      >
        <h1 className="main-title">Recipe Finder</h1>
        <p className="subtitle">
          Enter your available ingredients and discover delicious recipes from around the world
        </p>
      </Header>

      <SearchSection
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.8 }}
      >
        <IngredientInput>
          <input
            type="text"
            className="input-field"
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter an ingredient (e.g., rice, chicken, tomato)..."
          />
          <button
            className="add-btn"
            onClick={addIngredient}
            disabled={!currentInput.trim()}
          >
            <FaPlus />
            Add
          </button>
        </IngredientInput>

        <IngredientTags>
          <AnimatePresence>
            {ingredients.map((ingredient, index) => (
              <IngredientTag
                key={ingredient}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
              >
                <span>{ingredient}</span>
                <button
                  className="remove-btn"
                  onClick={() => removeIngredient(ingredient)}
                >
                  <FaTimes />
                </button>
              </IngredientTag>
            ))}
          </AnimatePresence>
          {ingredients.length === 0 && (
            <div style={{ 
              color: '#999', 
              fontStyle: 'italic',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              minHeight: '40px'
            }}>
              Add ingredients to start searching...
            </div>
          )}
        </IngredientTags>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <SearchButton
            onClick={searchRecipes}
            disabled={ingredients.length === 0 || isSearching}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isSearching ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <FaSearch />
                </motion.div>
                Searching...
              </>
            ) : (
              <>
                <FaSearch />
                Find Recipes
              </>
            )}
          </SearchButton>

          {ingredients.length > 0 && (
            <motion.button
              onClick={clearAll}
              style={{
                background: '#6c757d',
                color: 'white',
                border: 'none',
                padding: '1.2rem 2rem',
                borderRadius: '25px',
                cursor: 'pointer',
                fontWeight: '600'
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Clear All
            </motion.button>
          )}
        </div>

        <QuickSuggestions>
          <div className="suggestions-title">Quick suggestions:</div>
          <div className="suggestions-grid">
            {suggestionCategories.map((category, index) => (
              <motion.div
                key={category.title}
                className="suggestion-category"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index, duration: 0.5 }}
              >
                <h4>{category.title}</h4>
                <div className="suggestion-items">
                  {category.items.map((item) => (
                    <SuggestionChip
                      key={item}
                      onClick={() => addSuggestion(item)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {item}
                    </SuggestionChip>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </QuickSuggestions>
      </SearchSection>

      <AnimatePresence>
        {hasSearched && (
          <ResultsSection
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.5 }}
          >
            <ResultsHeader>
              <div className="results-title">
                <FaUtensils />
                <span className="results-count">{recipes.length}</span> Recipes Found
              </div>
            </ResultsHeader>

            {isSearching ? (
              <LoadingSpinner>
                <motion.div
                  className="spinner"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  🔍
                </motion.div>
                <div className="loading-text">Searching for recipes...</div>
              </LoadingSpinner>
            ) : recipes.length > 0 ? (
              <RecipeGrid>
                {recipes.map((recipe, index) => (
                  <RecipeCard
                    key={recipe._id || recipe.id || index}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <img
                      src={recipe.image || 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop'}
                      alt={recipe.title || recipe.name}
                      className="recipe-image"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop';
                      }}
                    />
                    
                    <div className="recipe-content">
                      <div className="recipe-title">{recipe.title || recipe.name}</div>
                      
                      {recipe.summary && (
                        <div className="recipe-summary">
                          {recipe.summary.replace(/<[^>]*>/g, '').substring(0, 100)}...
                        </div>
                      )}
                      
                      <div className="recipe-meta">
                        <div className="meta-item">
                          <FaClock className="meta-icon" />
                          <span>{recipe.readyInMinutes || recipe.totalTime || 30} min</span>
                        </div>
                        <div className="meta-item">
                          <FaUsers className="meta-icon" />
                          <span>{recipe.servings || 4} servings</span>
                        </div>
                        {recipe.cuisines && recipe.cuisines.length > 0 && (
                          <div className="meta-item">
                            <FaGlobe className="meta-icon" />
                            <span>{recipe.cuisines[0]}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="recipe-rating">
                        <span className="stars">{generateStars(recipe.rating || recipe.spoonacularScore/20 || 4)}</span>
                        <span className="rating-value">
                          {(recipe.rating || recipe.spoonacularScore/20 || 4).toFixed(1)}
                        </span>
                      </div>
                      
                      <div className="recipe-actions">
                        <button
                          className={`action-btn ${favorites.has(recipe._id || recipe.id) ? 'favorited' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(recipe._id || recipe.id);
                          }}
                        >
                          <FaHeart />
                          {favorites.has(recipe._id || recipe.id) ? 'Favorited' : 'Favorite'}
                        </button>
                        
                        <button
                          className="action-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            viewRecipe(recipe);
                          }}
                        >
                          <FaEye />
                          View Recipe
                        </button>
                      </div>
                    </div>
                  </RecipeCard>
                ))}
              </RecipeGrid>
            ) : (
              <EmptyState
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <FaSearch className="empty-icon" />
                <h3>No recipes found</h3>
                <p>
                  Try different ingredients or check the spelling. 
                  We search through thousands of recipes worldwide!
                </p>
              </EmptyState>
            )}
          </ResultsSection>
        )}
      </AnimatePresence>
    </FinderContainer>
  );
};

export default SmartFinder;