import React, { useState, useEffect, useRef } from 'react';
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
  FaEye,
  FaFilter,
  FaSortAmountDown,
  FaCheckCircle,
  FaMagic,
  FaLeaf,
  FaBolt,
  FaDollarSign,
  FaFire
} from 'react-icons/fa';
import axios from 'axios';
import toast from 'react-hot-toast';

const FinderContainer = styled(motion.div)`
  max-width: 1400px;
  margin: 0 auto;
  padding: 1rem;
  min-height: calc(100vh - 80px);
  
  @media (min-width: 768px) {
    padding: 2rem;
  }
`;

const Header = styled(motion.div)`
  text-align: center;
  margin-bottom: 2rem;
  
  .main-title {
    font-size: 2.5rem;
    font-weight: 700;
    color: ${props => props.theme.colors.primary};
    background: ${props => props.theme.colors.gradient};
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 0.5rem;

    @supports not (-webkit-background-clip: text) {
      color: ${props => props.theme.colors.primary};
      background: none;
    }
    
    @media (min-width: 768px) {
      font-size: 3rem;
    }
  }
  
  .subtitle {
    font-size: 1rem;
    color: rgba(255, 255, 255, 0.9);
    max-width: 600px;
    margin: 0 auto;
    
    @media (min-width: 768px) {
      font-size: 1.2rem;
    }
  }
  
  .stats {
    display: flex;
    justify-content: center;
    gap: 2rem;
    margin-top: 1rem;
    flex-wrap: wrap;
    
    .stat-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: rgba(255, 255, 255, 0.8);
      font-size: 0.9rem;
      
      .stat-icon {
        color: ${props => props.theme.colors.accent};
      }
    }
  }
`;

const SearchSection = styled(motion.div)`
  background: white;
  border-radius: 20px;
  padding: 1.5rem;
  box-shadow: ${props => props.theme.shadows.card};
  margin-bottom: 2rem;
  
  @media (min-width: 768px) {
    padding: 2rem;
  }
`;

const SearchBar = styled.div`
  position: relative;
  margin-bottom: 1.5rem;
  
  .search-input {
    width: 100%;
    padding: 1rem 1.5rem 1rem 3rem;
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
  
  .search-icon {
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: ${props => props.theme.colors.primary};
    font-size: 1.2rem;
  }
  
  .suggestions-dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: white;
    border: 1px solid #e1e5e9;
    border-radius: 10px;
    max-height: 200px;
    overflow-y: auto;
    z-index: 1000;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    
    .suggestion-item {
      padding: 0.75rem 1rem;
      cursor: pointer;
      border-bottom: 1px solid #f0f0f0;
      transition: background 0.2s ease;
      
      &:hover {
        background: ${props => props.theme.colors.backgroundLight};
      }
      
      &:last-child {
        border-bottom: none;
      }
      
      .suggestion-text {
        font-weight: 500;
      }
      
      .suggestion-category {
        font-size: 0.8rem;
        color: ${props => props.theme.colors.textMuted};
      }
    }
  }
`;

const IngredientTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  min-height: 60px;
  padding: 1rem;
  border: 2px dashed #e1e5e9;
  border-radius: 15px;
  background: linear-gradient(135deg, #f8f9fa 0%, #fff 100%);
  
  &.has-ingredients {
    border-color: ${props => props.theme.colors.primary};
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, #fff 100%);
  }
`;

const IngredientTag = styled(motion.div)`
  background: ${props => props.theme.colors.primary};
  color: white;
  padding: 0.6rem 1rem;
  border-radius: 25px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  font-size: 0.9rem;
  box-shadow: 0 2px 4px rgba(102, 126, 234, 0.2);
  
  .remove-btn {
    background: none;
    border: none;
    color: rgba(255, 255, 255, 0.8);
    cursor: pointer;
    padding: 0;
    display: flex;
    align-items: center;
    
    &:hover {
      color: white;
      transform: scale(1.1);
    }
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 2rem;
`;

const ActionButton = styled(motion.button)`
  background: ${props => props.primary ? props.theme.colors.gradient : '#6c757d'};
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 25px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  transition: all 0.3s ease;
  min-width: 150px;
  justify-content: center;
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
  
  .button-icon {
    font-size: 1.1rem;
  }
`;

const FilterSection = styled(motion.div)`
  background: white;
  border-radius: 15px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  
  .filter-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
    font-weight: 600;
    color: ${props => props.theme.colors.textDark};
  }
  
  .filter-options {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    
    .filter-group {
      .filter-label {
        font-size: 0.9rem;
        font-weight: 500;
        margin-bottom: 0.5rem;
        color: ${props => props.theme.colors.textDark};
      }
      
      .filter-select {
        width: 100%;
        padding: 0.75rem;
        border: 1px solid #ddd;
        border-radius: 8px;
        font-size: 0.9rem;
        
        &:focus {
          outline: none;
          border-color: ${props => props.theme.colors.primary};
        }
      }
    }
  }
`;

const QuickSuggestions = styled.div`
  margin-top: 2rem;
  
  .suggestions-title {
    font-size: 1.1rem;
    font-weight: 600;
    margin-bottom: 1rem;
    color: ${props => props.theme.colors.textDark};
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .suggestions-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
  }
  
  .suggestion-category {
    .category-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.75rem;
      
      .category-icon {
        color: ${props => props.theme.colors.primary};
      }
      
      h4 {
        color: ${props => props.theme.colors.textDark};
        font-size: 0.95rem;
        margin: 0;
      }
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
  padding: 0.5rem 0.8rem;
  border-radius: 20px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => props.theme.colors.primary};
    color: white;
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(102, 126, 234, 0.3);
  }
`;

const ResultsSection = styled(motion.div)`
  background: white;
  border-radius: 20px;
  padding: 1.5rem;
  box-shadow: ${props => props.theme.shadows.card};
  
  @media (min-width: 768px) {
    padding: 2rem;
  }
`;

const ResultsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
  
  .results-title {
    font-size: 1.3rem;
    font-weight: 600;
    color: ${props => props.theme.colors.textDark};
    display: flex;
    align-items: center;
    gap: 0.5rem;
    
    @media (min-width: 768px) {
      font-size: 1.5rem;
    }
  }
  
  .results-count {
    color: ${props => props.theme.colors.primary};
    font-weight: 700;
  }
  
  .sort-controls {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    
    .sort-select {
      padding: 0.5rem;
      border: 1px solid #ddd;
      border-radius: 8px;
      font-size: 0.9rem;
      
      &:focus {
        outline: none;
        border-color: ${props => props.theme.colors.primary};
      }
    }
  }
`;

const RecipeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1.5rem;
  
  @media (min-width: 1200px) {
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  }
`;

const RecipeCard = styled(motion.div)`
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid #f0f0f0;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
    border-color: ${props => props.theme.colors.primary};
  }
  
  .recipe-image-container {
    position: relative;
    height: 220px;
    overflow: hidden;
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    
    .recipe-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
    }
    
    &:hover .recipe-image {
      transform: scale(1.05);
    }
    
    .recipe-badges {
      position: absolute;
      top: 0.75rem;
      left: 0.75rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    
    .recipe-badge {
      background: rgba(255, 255, 255, 0.95);
      color: ${props => props.theme.colors.textDark};
      padding: 0.3rem 0.6rem;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 600;
      backdrop-filter: blur(10px);
      
      &.quick {
        background: rgba(76, 175, 80, 0.9);
        color: white;
      }
      
      &.healthy {
        background: rgba(76, 175, 80, 0.9);
        color: white;
      }
      
      &.popular {
        background: rgba(255, 152, 0, 0.9);
        color: white;
      }
    }
    
    .favorite-btn {
      position: absolute;
      top: 0.75rem;
      right: 0.75rem;
      background: rgba(255, 255, 255, 0.9);
      border: none;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s ease;
      backdrop-filter: blur(10px);
      
      &:hover {
        background: white;
        transform: scale(1.1);
      }
      
      &.favorited {
        background: ${props => props.theme.colors.accent};
        color: white;
      }
    }
  }
  
  .recipe-content {
    padding: 1.5rem;
    
    .recipe-title {
      font-size: 1.2rem;
      font-weight: 600;
      margin-bottom: 0.75rem;
      color: ${props => props.theme.colors.textDark};
      line-height: 1.3;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
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
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0.5rem;
      margin-bottom: 1rem;
      
      .meta-item {
        text-align: center;
        
        .meta-icon {
          color: ${props => props.theme.colors.primary};
          margin-bottom: 0.25rem;
          font-size: 1.1rem;
        }
        
        .meta-label {
          font-size: 0.75rem;
          color: ${props => props.theme.colors.textMuted};
          margin-bottom: 0.1rem;
        }
        
        .meta-value {
          font-size: 0.85rem;
          font-weight: 600;
          color: ${props => props.theme.colors.textDark};
        }
      }
    }
    
    .recipe-rating {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      margin-bottom: 1rem;
      padding: 0.5rem;
      background: ${props => props.theme.colors.backgroundLight};
      border-radius: 8px;
      
      .stars {
        color: #ffd700;
        font-size: 0.9rem;
      }
      
      .rating-value {
        font-weight: 600;
        color: ${props => props.theme.colors.textDark};
        font-size: 0.9rem;
      }
    }
    
    .recipe-actions {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.75rem;
      
      .action-btn {
        background: ${props => props.theme.colors.backgroundLight};
        border: 1px solid #ddd;
        color: ${props => props.theme.colors.textDark};
        padding: 0.75rem;
        border-radius: 10px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        font-size: 0.85rem;
        font-weight: 500;
        transition: all 0.2s ease;
        
        &:hover {
          background: ${props => props.theme.colors.primary};
          color: white;
          border-color: ${props => props.theme.colors.primary};
          transform: translateY(-1px);
        }
        
        &.favorited {
          background: ${props => props.theme.colors.accent};
          color: white;
          border-color: ${props => props.theme.colors.accent};
        }
        
        &.primary {
          background: ${props => props.theme.colors.primary};
          color: white;
          border-color: ${props => props.theme.colors.primary};
          
          &:hover {
            background: ${props => props.theme.colors.secondary};
            border-color: ${props => props.theme.colors.secondary};
          }
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
  padding: 4rem 2rem;
  
  .spinner {
    font-size: 3rem;
    margin-bottom: 1rem;
  }
  
  .loading-text {
    color: ${props => props.theme.colors.textLight};
    font-size: 1.1rem;
    text-align: center;
  }
  
  .loading-tip {
    color: ${props => props.theme.colors.textMuted};
    font-size: 0.9rem;
    margin-top: 0.5rem;
    text-align: center;
  }
`;

const EmptyState = styled(motion.div)`
  text-align: center;
  padding: 4rem 2rem;
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
  
  .empty-suggestions {
    margin-top: 2rem;
    
    .suggestion-list {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 0.5rem;
      margin-top: 1rem;
    }
  }
`;

const SmartFinder = () => {
  const [ingredients, setIngredients] = useState([]);
  const [currentInput, setCurrentInput] = useState('');
  const [recipes, setRecipes] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [favorites, setFavorites] = useState(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('relevance');
  const [filters, setFilters] = useState({
    cuisine: '',
    diet: '',
    maxTime: '',
    difficulty: ''
  });
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef(null);

  // Enhanced suggestion categories with icons
  const suggestionCategories = [
    {
      title: 'Popular Ingredients',
      icon: <FaFire />,
      items: ['rice', 'chicken', 'tomato', 'onion', 'garlic', 'potato', 'cheese', 'pasta']
    },
    {
      title: 'Proteins',
      icon: <FaBolt />,
      items: ['beef', 'pork', 'fish', 'eggs', 'tofu', 'paneer', 'turkey', 'lamb']
    },
    {
      title: 'Fresh Vegetables',
      icon: <FaLeaf />,
      items: ['spinach', 'broccoli', 'carrot', 'bell pepper', 'mushroom', 'corn', 'zucchini', 'cucumber']
    },
    {
      title: 'Pantry Staples',
      icon: <FaUtensils />,
      items: ['bread', 'quinoa', 'oats', 'noodles', 'flour', 'lentils', 'beans', 'coconut milk']
    },
    {
      title: 'Indian Spices',
      icon: <FaMagic />,
      items: ['turmeric', 'cumin', 'coriander', 'garam masala', 'curry leaves', 'mustard seeds']
    },
    {
      title: 'International',
      icon: <FaGlobe />,
      items: ['basil', 'oregano', 'soy sauce', 'ginger', 'lime', 'coconut', 'sesame oil', 'miso']
    }
  ];

  // Auto-complete suggestions
  const allIngredients = suggestionCategories.flatMap(cat => cat.items);
  const filteredSuggestions = allIngredients.filter(item => 
    item.toLowerCase().includes(currentInput.toLowerCase()) && 
    !ingredients.includes(item.toLowerCase())
  ).slice(0, 6);

  const addIngredient = (ingredient = currentInput.trim().toLowerCase()) => {
    if (ingredient && !ingredients.includes(ingredient)) {
      setIngredients(prev => [...prev, ingredient]);
      setCurrentInput('');
      setShowSuggestions(false);
      toast.success(`Added "${ingredient}"`, {
        icon: '✅',
        style: {
          borderRadius: '10px',
          background: '#4caf50',
          color: '#fff',
        },
      });
    } else if (ingredients.includes(ingredient)) {
      toast.error('Ingredient already added!', {
        icon: '⚠️',
      });
    }
  };

  const removeIngredient = (ingredient) => {
    setIngredients(prev => prev.filter(ing => ing !== ingredient));
    toast.success(`Removed "${ingredient}"`, {
      icon: '🗑️',
    });
  };

  const addSuggestion = (ingredient) => {
    addIngredient(ingredient.toLowerCase());
  };

  const searchRecipes = async () => {
    if (ingredients.length === 0) {
      toast.error('Please add at least one ingredient!', {
        icon: '🥘',
      });
      return;
    }

    setIsSearching(true);
    setHasSearched(true);

    try {
      const response = await axios.post('/api/recipes/search-by-ingredients', {
        ingredients,
        matchType: 'any',
        useSpoonacular: true,
        limit: 50,
        filters
      });

      const foundRecipes = response.data.recipes || [];
      
      if (foundRecipes.length === 0) {
        // Fallback: try global search
        try {
          const globalResponse = await axios.post('/api/recipes/search/global', {
            ingredients,
            number: 20
          });
          
          const globalRecipes = globalResponse.data.recipes || [];
          setRecipes(globalRecipes);
          
          if (globalRecipes.length > 0) {
            toast.success(`Found ${globalRecipes.length} recipes from global search!`, {
              icon: '🌍',
            });
          } else {
            toast.error('No recipes found. Try different ingredients.', {
              icon: '😔',
            });
          }
        } catch (globalError) {
          console.error('Global search failed:', globalError);
          toast.error('No recipes found. Try different ingredients.', {
            icon: '😔',
          });
          setRecipes([]);
        }
      } else {
        setRecipes(foundRecipes);
        toast.success(`Found ${foundRecipes.length} delicious recipes!`, {
          icon: '🎉',
          style: {
            borderRadius: '10px',
            background: '#4caf50',
            color: '#fff',
          },
        });
      }

    } catch (error) {
      console.error('Search error:', error);
      toast.error('Search failed. Please try again.', {
        icon: '❌',
      });
      setRecipes([]);
    } finally {
      setIsSearching(false);
    }
  };

  const toggleFavorite = (recipeId) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(recipeId)) {
      newFavorites.delete(recipeId);
      toast.success('Removed from favorites', {
        icon: '💔',
      });
    } else {
      newFavorites.add(recipeId);
      toast.success('Added to favorites', {
        icon: '❤️',
      });
    }
    setFavorites(newFavorites);
  };

  const viewRecipe = (recipe) => {
    if (recipe.sourceUrl) {
      window.open(recipe.sourceUrl, '_blank');
    } else {
      toast('Recipe details not available', {
        icon: 'ℹ️',
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
      });
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
    setFilters({
      cuisine: '',
      diet: '',
      maxTime: '',
      difficulty: ''
    });
    toast.success('Cleared all ingredients', {
      icon: '🧹',
    });
  };

  const generateStars = (rating) => {
    const stars = Math.floor(rating || 0);
    return '★'.repeat(stars) + '☆'.repeat(5 - stars);
  };

  const sortRecipes = (recipesToSort) => {
    const sorted = [...recipesToSort];
    switch (sortBy) {
      case 'rating':
        return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      case 'time':
        return sorted.sort((a, b) => (a.readyInMinutes || 30) - (b.readyInMinutes || 30));
      case 'popularity':
        return sorted.sort((a, b) => (b.aggregateLikes || 0) - (a.aggregateLikes || 0));
      case 'relevance':
      default:
        return sorted.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
    }
  };

  const getRecipeBadges = (recipe) => {
    const badges = [];
    if (recipe.readyInMinutes && recipe.readyInMinutes <= 30) {
      badges.push({ text: 'Quick', className: 'quick' });
    }
    if (recipe.healthScore && recipe.healthScore > 70) {
      badges.push({ text: 'Healthy', className: 'healthy' });
    }
    if (recipe.aggregateLikes && recipe.aggregateLikes > 100) {
      badges.push({ text: 'Popular', className: 'popular' });
    }
    return badges;
  };

  const sortedRecipes = sortRecipes(recipes);

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
        <h1 className="main-title">Smart Recipe Finder</h1>
        <p className="subtitle">
          Enter your available ingredients and discover amazing recipes from around the world
        </p>
        <div className="stats">
          <div className="stat-item">
            <FaUtensils className="stat-icon" />
            <span>10,000+ Recipes</span>
          </div>
          <div className="stat-item">
            <FaGlobe className="stat-icon" />
            <span>World Cuisines</span>
          </div>
          <div className="stat-item">
            <FaMagic className="stat-icon" />
            <span>AI-Powered</span>
          </div>
        </div>
      </Header>

      <SearchSection
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.8 }}
      >
        <SearchBar>
          <FaSearch className="search-icon" />
          <input
            ref={inputRef}
            type="text"
            className="search-input"
            value={currentInput}
            onChange={(e) => {
              setCurrentInput(e.target.value);
              setShowSuggestions(e.target.value.length > 0);
            }}
            onKeyPress={handleKeyPress}
            onFocus={() => setShowSuggestions(currentInput.length > 0)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder="Type an ingredient (e.g., chicken, rice, tomato)..."
          />
          {showSuggestions && filteredSuggestions.length > 0 && (
            <div className="suggestions-dropdown">
              {filteredSuggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="suggestion-item"
                  onClick={() => addIngredient(suggestion)}
                >
                  <div className="suggestion-text">{suggestion}</div>
                  <div className="suggestion-category">
                    {suggestionCategories.find(cat => cat.items.includes(suggestion))?.title || 'Ingredient'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </SearchBar>

        <IngredientTags className={ingredients.length > 0 ? 'has-ingredients' : ''}>
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
              minHeight: '40px',
              textAlign: 'center'
            }}>
              Add ingredients above to start finding recipes...
            </div>
          )}
        </IngredientTags>

        <ActionButtons>
          <ActionButton
            primary
            onClick={searchRecipes}
            disabled={ingredients.length === 0 || isSearching}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isSearching ? (
              <>
                <motion.div
                  className="button-icon"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <FaSearch />
                </motion.div>
                Searching...
              </>
            ) : (
              <>
                <FaSearch className="button-icon" />
                Find Recipes
              </>
            )}
          </ActionButton>

          <ActionButton
            onClick={() => setShowFilters(!showFilters)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaFilter className="button-icon" />
            Filters
          </ActionButton>

          {ingredients.length > 0 && (
            <ActionButton
              onClick={clearAll}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaTimes className="button-icon" />
              Clear All
            </ActionButton>
          )}
        </ActionButtons>

        <AnimatePresence>
          {showFilters && (
            <FilterSection
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="filter-header">
                <FaFilter />
                Filter Options
              </div>
              <div className="filter-options">
                <div className="filter-group">
                  <div className="filter-label">Cuisine Type</div>
                  <select
                    className="filter-select"
                    value={filters.cuisine}
                    onChange={(e) => setFilters(prev => ({ ...prev, cuisine: e.target.value }))}
                  >
                    <option value="">Any Cuisine</option>
                    <option value="indian">Indian</option>
                    <option value="italian">Italian</option>
                    <option value="chinese">Chinese</option>
                    <option value="mexican">Mexican</option>
                    <option value="thai">Thai</option>
                    <option value="american">American</option>
                  </select>
                </div>
                <div className="filter-group">
                  <div className="filter-label">Diet Type</div>
                  <select
                    className="filter-select"
                    value={filters.diet}
                    onChange={(e) => setFilters(prev => ({ ...prev, diet: e.target.value }))}
                  >
                    <option value="">Any Diet</option>
                    <option value="vegetarian">Vegetarian</option>
                    <option value="vegan">Vegan</option>
                    <option value="glutenFree">Gluten Free</option>
                    <option value="ketogenic">Keto</option>
                    <option value="paleo">Paleo</option>
                  </select>
                </div>
                <div className="filter-group">
                  <div className="filter-label">Max Cook Time</div>
                  <select
                    className="filter-select"
                    value={filters.maxTime}
                    onChange={(e) => setFilters(prev => ({ ...prev, maxTime: e.target.value }))}
                  >
                    <option value="">Any Time</option>
                    <option value="15">Under 15 mins</option>
                    <option value="30">Under 30 mins</option>
                    <option value="45">Under 45 mins</option>
                    <option value="60">Under 1 hour</option>
                  </select>
                </div>
                <div className="filter-group">
                  <div className="filter-label">Difficulty</div>
                  <select
                    className="filter-select"
                    value={filters.difficulty}
                    onChange={(e) => setFilters(prev => ({ ...prev, difficulty: e.target.value }))}
                  >
                    <option value="">Any Level</option>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>
            </FilterSection>
          )}
        </AnimatePresence>

        <QuickSuggestions>
          <div className="suggestions-title">
            <FaMagic />
            Quick Add Ingredients
          </div>
          <div className="suggestions-grid">
            {suggestionCategories.map((category, index) => (
              <motion.div
                key={category.title}
                className="suggestion-category"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index, duration: 0.5 }}
              >
                <div className="category-header">
                  <div className="category-icon">{category.icon}</div>
                  <h4>{category.title}</h4>
                </div>
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
                <span className="results-count">{sortedRecipes.length}</span> 
                {sortedRecipes.length === 1 ? 'Recipe Found' : 'Recipes Found'}
              </div>
              {sortedRecipes.length > 0 && (
                <div className="sort-controls">
                  <FaSortAmountDown />
                  <select
                    className="sort-select"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="relevance">Best Match</option>
                    <option value="rating">Highest Rated</option>
                    <option value="time">Quickest</option>
                    <option value="popularity">Most Popular</option>
                  </select>
                </div>
              )}
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
                <div className="loading-text">Searching for amazing recipes...</div>
                <div className="loading-tip">This may take a moment as we search worldwide!</div>
              </LoadingSpinner>
            ) : sortedRecipes.length > 0 ? (
              <RecipeGrid>
                {sortedRecipes.map((recipe, index) => {
                  const badges = getRecipeBadges(recipe);
                  const recipeId = recipe._id || recipe.id || index;
                  
                  return (
                    <RecipeCard
                      key={recipeId}
                      initial={{ opacity: 0, y: 50 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.5 }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="recipe-image-container">
                        <img
                          src={recipe.image || `https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop&auto=format&q=80`}
                          alt={recipe.title || recipe.name}
                          className="recipe-image"
                          onError={(e) => {
                            e.target.src = `https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop&auto=format&q=80`;
                          }}
                        />
                        
                        <div className="recipe-badges">
                          {badges.map((badge, idx) => (
                            <div key={idx} className={`recipe-badge ${badge.className}`}>
                              {badge.text}
                            </div>
                          ))}
                        </div>
                        
                        <button
                          className={`favorite-btn ${favorites.has(recipeId) ? 'favorited' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(recipeId);
                          }}
                        >
                          <FaHeart />
                        </button>
                      </div>
                      
                      <div className="recipe-content">
                        <div className="recipe-title">{recipe.title || recipe.name}</div>
                        
                        {recipe.summary && (
                          <div className="recipe-summary">
                            {recipe.summary.replace(/<[^>]*>/g, '').substring(0, 120)}...
                          </div>
                        )}
                        
                        <div className="recipe-meta">
                          <div className="meta-item">
                            <FaClock className="meta-icon" />
                            <div className="meta-label">Time</div>
                            <div className="meta-value">{recipe.readyInMinutes || 30}m</div>
                          </div>
                          <div className="meta-item">
                            <FaUsers className="meta-icon" />
                            <div className="meta-label">Serves</div>
                            <div className="meta-value">{recipe.servings || 4}</div>
                          </div>
                          <div className="meta-item">
                            <FaGlobe className="meta-icon" />
                            <div className="meta-label">Cuisine</div>
                            <div className="meta-value">
                              {recipe.cuisines?.[0] || 'Global'}
                            </div>
                          </div>
                        </div>
                        
                        <div className="recipe-rating">
                          <span className="stars">
                            {generateStars(recipe.rating || recipe.spoonacularScore/20 || 4)}
                          </span>
                          <span className="rating-value">
                            {(recipe.rating || recipe.spoonacularScore/20 || 4).toFixed(1)}
                          </span>
                        </div>
                        
                        <div className="recipe-actions">
                          <button
                            className={`action-btn ${favorites.has(recipeId) ? 'favorited' : ''}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(recipeId);
                            }}
                          >
                            <FaHeart />
                            {favorites.has(recipeId) ? 'Saved' : 'Save'}
                          </button>
                          
                          <button
                            className="action-btn primary"
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
                  );
                })}
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
                  Don't worry! Try different ingredients or check the spelling. 
                  We search through thousands of recipes worldwide!
                </p>
                <div className="empty-suggestions">
                  <p>Try popular combinations:</p>
                  <div className="suggestion-list">
                    {['chicken + rice', 'tomato + pasta', 'potato + onion', 'egg + bread'].map((combo) => (
                      <SuggestionChip
                        key={combo}
                        onClick={() => {
                          const ingredients = combo.split(' + ');
                          setIngredients(ingredients);
                          toast.success(`Added: ${combo}`, { icon: '✨' });
                        }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {combo}
                      </SuggestionChip>
                    ))}
                  </div>
                </div>
              </EmptyState>
            )}
          </ResultsSection>
        )}
      </AnimatePresence>
    </FinderContainer>
  );
};

export default SmartFinder;
