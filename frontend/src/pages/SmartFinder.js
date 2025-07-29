import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import RecipeDetailModal from '../components/RecipeDetailModal';
import { 
  FaBrain, 
  FaPlus, 
  FaSearch, 
  FaTimes, 
  FaBroom, 
  FaUtensils,
  FaHeart,
  FaStar,
  FaClock,
  FaFire,
  FaUsers,
    FaLeaf,
  FaCheckCircle,
  FaShoppingCart,
    FaSeedling,
    FaBreadSlice,
  FaTint,
  FaExclamationTriangle,
  FaFish,
  FaEgg,
  FaChartPie,
  FaCarrot
} from 'react-icons/fa';
import axios from 'axios';
import toast from 'react-hot-toast';

const FinderContainer = styled(motion.div)`
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
`;

const PageHeader = styled(motion.div)`
  text-align: center;
  margin-bottom: 3rem;
  
  .page-title {
    font-size: 3rem;
    font-weight: 700;
    color: ${props => props.theme.colors.primary}; /* Fallback color */
    background: ${props => props.theme.colors.gradient};
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;

    /* Fallback for browsers that don't support background-clip */
    @supports not (-webkit-background-clip: text) {
      color: ${props => props.theme.colors.primary};
      background: none;
    }

    .title-icon {
      color: #9c27b0;
      animation: pulse 2s ease-in-out infinite;
    }
  }
  
  .page-subtitle {
    font-size: 1.2rem;
    color: rgba(255, 255, 255, 0.9);
    max-width: 600px;
    margin: 0 auto;
    line-height: 1.6;
  }
`;

const IngredientsSection = styled(motion.div)`
  background: white;
  border-radius: ${props => props.theme.borderRadius};
  padding: 2rem;
  box-shadow: ${props => props.theme.shadows.card};
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: ${props => props.theme.colors.textDark};
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  .section-icon {
    color: ${props => props.theme.colors.primary};
  }
`;

const IngredientInputContainer = styled.div`
  max-width: 600px;
  margin: 0 auto 2rem;
  position: relative;
`;

const IngredientInputRow = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const IngredientInput = styled.input`
  flex: 1;
  padding: 1rem;
  border: 2px solid #e1e5e9;
  border-radius: 12px;
  font-size: 1rem;
  transition: ${props => props.theme.transitions.default};
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
  
  &::placeholder {
    color: ${props => props.theme.colors.textMuted};
  }
`;

const AddButton = styled(motion.button)`
  background: ${props => props.theme.colors.success};
  color: white;
  border: none;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  cursor: pointer;
  transition: ${props => props.theme.transitions.default};
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  
  &:hover {
    background: #45a049;
    transform: translateY(-2px);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const IngredientTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  min-height: 60px;
  padding: 1rem;
  border: 2px dashed #e1e5e9;
  border-radius: 12px;
  background: #f8f9fa;
  margin-bottom: 1.5rem;
`;

const IngredientTag = styled(motion.div)`
  background: ${props => props.theme.colors.primary};
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 25px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  font-weight: 500;
  
  .remove-btn {
    background: none;
    border: none;
    color: white;
    cursor: pointer;
    padding: 0;
    margin-left: 0.3rem;
    opacity: 0.8;
    transition: opacity 0.2s;
    
    &:hover {
      opacity: 1;
    }
  }
`;

const QuickSuggestions = styled.div`
  .suggestions-title {
    font-size: 1.1rem;
    font-weight: 500;
    margin-bottom: 1rem;
    color: ${props => props.theme.colors.textDark};
  }
  
  .suggestions-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
  }
  
  .suggestion-category {
    h4 {
      color: ${props => props.theme.colors.textDark};
      margin-bottom: 0.75rem;
      font-size: 1rem;
    }
    
    .suggestion-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }
  }
`;

const SuggestionTag = styled(motion.button)`
  background: ${props => props.theme.colors.backgroundLight};
  color: ${props => props.theme.colors.textDark};
  border: 2px solid transparent;
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  cursor: pointer;
  transition: ${props => props.theme.transitions.default};
  font-size: 0.85rem;

  &:hover {
    background: ${props => props.theme.colors.primary};
    color: white;
    transform: translateY(-2px);
  }
`;

const SuggestionsDropdown = styled(motion.div)`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 100;
  max-height: 200px;
  overflow-y: auto;

  .suggestion-item {
    padding: 0.75rem 1rem;
    cursor: pointer;
    border-bottom: 1px solid #f0f0f0;
    transition: background 0.2s;

    &:hover {
      background: ${props => props.theme.colors.backgroundLight};
    }

    &:last-child {
      border-bottom: none;
    }

    .suggestion-text {
      font-size: 0.9rem;
      color: ${props => props.theme.colors.textDark};
    }
  }
`;

const SearchControls = styled(motion.div)`
  background: white;
  border-radius: ${props => props.theme.borderRadius};
  padding: 2rem;
  box-shadow: ${props => props.theme.shadows.card};
  margin-bottom: 2rem;
  
  .controls-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 2rem;
    flex-wrap: wrap;
    
    @media (max-width: ${props => props.theme.breakpoints.mobile}) {
      flex-direction: column;
      align-items: stretch;
    }
  }
  
  .search-buttons {
    display: flex;
    gap: 1rem;
    
    @media (max-width: ${props => props.theme.breakpoints.mobile}) {
      justify-content: center;
    }
  }
`;

const SearchButton = styled(motion.button)`
  background: ${props => props.theme.colors.gradient};
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 25px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: ${props => props.theme.transitions.default};
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadows.cardHover};
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const ClearButton = styled(motion.button)`
  background: ${props => props.theme.colors.textMuted};
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 25px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: ${props => props.theme.transitions.default};
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    background: #666;
    transform: translateY(-2px);
  }
`;

const DietaryPreferencesSection = styled(motion.div)`
  background: white;
  border-radius: ${props => props.theme.borderRadius};
  padding: 2rem;
  box-shadow: ${props => props.theme.shadows.card};
  margin-bottom: 2rem;
`;

const PreferencesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
`;

const PreferenceGroup = styled.div`
  h4 {
    color: ${props => props.theme.colors.textDark};
    margin-bottom: 1rem;
    font-size: 1.1rem;
    font-weight: 600;
  }
`;

const CheckboxGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 6px;
  transition: background 0.2s;
  position: relative;

  &:hover {
    background: ${props => props.theme.colors.backgroundLight};
  }

  input[type="checkbox"] {
    display: none;
  }

  .checkmark {
    width: 20px;
    height: 20px;
    border: 2px solid #ddd;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: ${props => props.theme.transitions.default};

    &::after {
      content: "";
      width: 6px;
      height: 10px;
      border: solid white;
      border-width: 0 2px 2px 0;
      transform: rotate(45deg);
      opacity: 0;
      transition: opacity 0.2s;
    }
  }

  input[type="checkbox"]:checked + .checkmark {
    background: ${props => props.theme.colors.primary};
    border-color: ${props => props.theme.colors.primary};

    &::after {
      opacity: 1;
    }
  }

  .checkbox-icon {
    color: ${props => props.theme.colors.primary};
    width: 16px;
  }

  .checkbox-text {
    font-weight: 500;
    color: ${props => props.theme.colors.textDark};
  }
`;

const NutritionSliders = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const SliderGroup = styled.div`
  label {
    display: block;
    margin-bottom: 0.5rem;
    color: ${props => props.theme.colors.textDark};
    font-weight: 500;
    font-size: 0.9rem;
  }

  .slider-value {
    color: ${props => props.theme.colors.primary};
    font-weight: 600;
  }
`;

const NutritionSlider = styled.input`
  width: 100%;
  height: 8px;
  border-radius: 5px;
  background: #ddd;
  outline: none;
  cursor: pointer;
  appearance: none;

  &::-webkit-slider-thumb {
    appearance: none;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: ${props => props.theme.colors.primary};
    cursor: pointer;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);

    &:hover {
      background: ${props => props.theme.colors.secondary};
    }
  }

  &::-moz-range-thumb {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: ${props => props.theme.colors.primary};
    cursor: pointer;
    border: none;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);

    &:hover {
      background: ${props => props.theme.colors.secondary};
    }
  }
`;

const MatchingOptions = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;

  label {
    font-weight: 500;
    color: ${props => props.theme.colors.textDark};
  }

  select {
    padding: 0.75rem;
    border: 2px solid #e1e5e9;
    border-radius: 8px;
    font-size: 1rem;
    min-width: 250px;
    background: white;
    transition: ${props => props.theme.transitions.default};

    &:focus {
      outline: none;
      border-color: ${props => props.theme.colors.primary};
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }
  }
`;

const ResultsSection = styled(motion.div)`
  background: white;
  border-radius: ${props => props.theme.borderRadius};
  padding: 2rem;
  box-shadow: ${props => props.theme.shadows.card};
`;

const ResultsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
  
  .results-title {
    font-size: 1.5rem;
    font-weight: 600;
    color: ${props => props.theme.colors.textDark};
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
`;

const RecipeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
`;

const RecipeCard = styled(motion.div)`
  background: white;
  border-radius: ${props => props.theme.borderRadius};
  overflow: hidden;
  box-shadow: ${props => props.theme.shadows.card};
  border: 2px solid ${props => {
    if (props.$matchScore >= 0.8) return props.theme.colors.success;
    if (props.$matchScore >= 0.6) return props.theme.colors.warning;
    return props.theme.colors.accent;
  }};
  position: relative;

  &:hover {
    transform: translateY(-5px);
    box-shadow: ${props => props.theme.shadows.cardHover};
  }

  .match-indicator {
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: ${props => {
      if (props.$matchScore >= 0.8) return props.theme.colors.success;
      if (props.$matchScore >= 0.6) return props.theme.colors.warning;
      return props.theme.colors.accent;
    }};
    color: white;
    padding: 0.3rem 0.8rem;
    border-radius: 15px;
    font-size: 0.8rem;
    font-weight: 600;
    z-index: 1;
  }
  
  .recipe-image {
    width: 100%;
    height: 200px;
    object-fit: cover;
  }
  
  .recipe-content {
    padding: 1.5rem;
    
    .recipe-name {
      font-size: 1.3rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
      color: ${props => props.theme.colors.textDark};
    }
    
    .recipe-rating {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 1rem;
      
      .stars {
        color: ${props => props.theme.colors.gold};
      }
    }
    
    .ingredient-matches {
      background: ${props => props.theme.colors.backgroundLight};
      padding: 1rem;
      border-radius: 8px;
      margin-bottom: 1rem;
      
      h5 {
        margin-bottom: 0.5rem;
        color: ${props => props.theme.colors.textDark};
        font-size: 0.9rem;
      }
      
      .matched-ingredients {
        display: flex;
        flex-wrap: wrap;
        gap: 0.3rem;
        margin-bottom: 0.5rem;
        
        .matched-ingredient {
          background: ${props => props.theme.colors.success};
          color: white;
          padding: 0.2rem 0.6rem;
          border-radius: 10px;
          font-size: 0.75rem;
        }
      }
      
      .missing-ingredients {
        .missing-ingredient {
          background: #ffebee;
          color: ${props => props.theme.colors.danger};
          padding: 0.2rem 0.6rem;
          border-radius: 10px;
          font-size: 0.75rem;
        }
      }
    }
    
    .recipe-meta {
      display: flex;
      gap: 1rem;
      margin-bottom: 1rem;
      color: ${props => props.theme.colors.textLight};
      font-size: 0.9rem;
      
      .meta-item {
        display: flex;
        align-items: center;
        gap: 0.3rem;
        
        .meta-icon {
          color: ${props => props.theme.colors.primary};
        }
      }
    }
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
`;

const SmartFinder = () => {
  const [ingredients, setIngredients] = useState([]);
  const [currentInput, setCurrentInput] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [matchType, setMatchType] = useState('any');
  const [searchMode, setSearchMode] = useState('local'); // 'local' or 'global'
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Dietary Preferences
  const [dietaryPreferences, setDietaryPreferences] = useState({
    vegetarian: false,
    vegan: false,
    glutenFree: false,
    dairyFree: false
  });

  // Allergen Restrictions
  const [allergenRestrictions, setAllergenRestrictions] = useState({
    noNuts: false,
    noShellfish: false,
    noEggs: false,
    noSoy: false
  });

  // Nutrition Goals
  const [nutritionGoals, setNutritionGoals] = useState({
    maxCalories: 800,
    minProtein: 20,
    maxCarbs: 60
  });

  const suggestionCategories = [
    {
      title: 'Common Leftovers',
      items: ['rice', 'chicken', 'pasta', 'bread', 'vegetables', 'cheese']
    },
    {
      title: 'Proteins',
      items: ['beef', 'pork', 'fish', 'eggs', 'tofu', 'beans']
    },
    {
      title: 'Vegetables',
      items: ['onions', 'tomatoes', 'carrots', 'broccoli', 'spinach', 'peppers']
    },
    {
      title: 'Pantry Staples',
      items: ['garlic', 'oil', 'salt', 'pepper', 'herbs', 'spices']
    }
  ];

  const addIngredient = async () => {
    const ingredient = currentInput.trim();
    if (!ingredient) return;

    try {
      // Check for spell correction
      const spellCheckResponse = await axios.post('/api/recipes/spell-check', {
        ingredient: ingredient
      });

      const { corrected, autoChanged, suggestion, confidence } = spellCheckResponse.data;

      let finalIngredient = ingredient.toLowerCase();

      if (autoChanged) {
        finalIngredient = corrected.toLowerCase();
        toast.success(`Auto-corrected "${ingredient}" to "${corrected}"`);
      } else if (suggestion && confidence > 0.7) {
        // Ask user for confirmation
        const confirmed = window.confirm(`Did you mean "${suggestion}"? Click OK to use "${suggestion}" or Cancel to use "${ingredient}"`);
        if (confirmed) {
          finalIngredient = suggestion.toLowerCase();
          toast.success(`Using "${suggestion}" instead of "${ingredient}"`);
        }
      }

      if (!ingredients.includes(finalIngredient)) {
        setIngredients(prev => [...prev, finalIngredient]);
        setCurrentInput('');
        setSuggestions([]);
        setShowSuggestions(false);
        toast.success(`Added "${finalIngredient}" to your ingredients!`);
      } else {
        toast.error(`"${finalIngredient}" is already in your list!`);
      }
    } catch (error) {
      // Fallback to original functionality
      const finalIngredient = ingredient.toLowerCase();
      if (!ingredients.includes(finalIngredient)) {
        setIngredients(prev => [...prev, finalIngredient]);
        setCurrentInput('');
        toast.success(`Added "${finalIngredient}" to your ingredients!`);
      }
    }
  };

  const removeIngredient = (ingredient) => {
    setIngredients(prev => prev.filter(ing => ing !== ingredient));
    toast.success(`Removed "${ingredient}" from your ingredients!`);
  };

  const addSuggestion = (ingredient) => {
    if (!ingredients.includes(ingredient.toLowerCase())) {
      setIngredients(prev => [...prev, ingredient.toLowerCase()]);
      toast.success(`Added "${ingredient}" to your ingredients!`);
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
      let response;

      if (searchMode === 'global') {
        // Enhanced SpaCy + Spoonacular search
        response = await axios.post('/api/recipes/search/enhanced', {
          ingredients,
          maxReadyTime: nutritionGoals.maxTime || undefined,
          maxCalories: nutritionGoals.maxCalories || undefined,
          diet: getDietString(),
          intolerances: getAllergenString(),
          number: 20
        });

        toast.success(`🌍 Found ${response.data.totalFound} recipes with enhanced SpaCy + Spoonacular search!`);

        // Show NLP processing results
        if (response.data.nlpProcessing?.corrections?.length > 0) {
          toast.success(`🔧 Auto-corrected ${response.data.nlpProcessing.corrections.length} ingredient spellings!`);
        }
      } else {
        // Local search with AI enhancement
        response = await axios.post('/api/recipes/search-by-ingredients', {
          ingredients,
          matchType,
          preferences: {
            dietary: dietaryPreferences,
            allergens: allergenRestrictions
          },
          nutrition: nutritionGoals,
          useAI: true,
          useSpoonacular: true,
          limit: 20
        });

        toast.success(`Found ${response.data.totalFound} recipes!`);

        // Show enhancement messages
        if (response.data.aiEnhanced) {
          toast.success('🤖 AI-enhanced results based on your preferences!');
        }
        if (response.data.globalSearch) {
          toast.success('🌐 Including global recipes from Spoonacular!');
        }
      }

      setResults(response.data.recipes || []);
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Error searching recipes. Please try again.');
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleRecipeClick = (recipe) => {
    setSelectedRecipe(recipe);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedRecipe(null);
  };

  const getDietString = () => {
    const diets = [];
    if (dietaryPreferences.vegetarian) diets.push('vegetarian');
    if (dietaryPreferences.vegan) diets.push('vegan');
    if (dietaryPreferences.glutenFree) diets.push('gluten free');
    return diets.join(',');
  };

  const getAllergenString = () => {
    const allergens = [];
    if (allergenRestrictions.noNuts) allergens.push('tree nut');
    if (allergenRestrictions.noShellfish) allergens.push('shellfish');
    if (allergenRestrictions.noEggs) allergens.push('egg');
    if (allergenRestrictions.noSoy) allergens.push('soy');
    return allergens.join(',');
  };

    const clearAll = () => {
    setIngredients([]);
    setCurrentInput('');
    setResults([]);
    setHasSearched(false);
    setDietaryPreferences({
      vegetarian: false,
      vegan: false,
      glutenFree: false,
      dairyFree: false
    });
    setAllergenRestrictions({
      noNuts: false,
      noShellfish: false,
      noEggs: false,
      noSoy: false
    });
    setNutritionGoals({
      maxCalories: 800,
      minProtein: 20,
      maxCarbs: 60
    });
    setMatchType('any');
    setSearchMode('local');
    toast.success('Cleared all preferences!');
  };

  const handleDietaryChange = (preference) => {
    setDietaryPreferences(prev => ({
      ...prev,
      [preference]: !prev[preference]
    }));
  };

  const handleAllergenChange = (allergen) => {
    setAllergenRestrictions(prev => ({
      ...prev,
      [allergen]: !prev[allergen]
    }));
  };

  const handleNutritionChange = (goal, value) => {
    setNutritionGoals(prev => ({
      ...prev,
      [goal]: parseInt(value)
    }));
  };

  const handleInputChange = async (e) => {
    const value = e.target.value;
    setCurrentInput(value);

    if (value.length >= 2) {
      try {
        const response = await axios.get(`/api/recipes/ingredient-suggestions?q=${value}`);
        setSuggestions(response.data.suggestions || []);
        setShowSuggestions(true);
      } catch (error) {
        setSuggestions([]);
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setCurrentInput(suggestion);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      addIngredient();
    } else if (e.key === 'Escape') {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const getMatchText = (score) => {
    if (score >= 0.8) return 'Perfect Match!';
    if (score >= 0.6) return 'Great Match';
    return `${Math.round(score * 100)}% Match`;
  };

  const generateStars = (rating) => {
    return '★'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating));
  };

  return (
    <FinderContainer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <PageHeader
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.8 }}
      >
        <h1 className="page-title">
          <FaBrain className="title-icon" />
          Smart Recipe Finder
        </h1>
        <p className="page-subtitle">
          Enter the ingredients you have at home, and we'll find the perfect recipes to transform your leftovers into delicious meals!
        </p>
      </PageHeader>

      <IngredientsSection
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.8 }}
      >
        <SectionTitle>
          <FaLeaf className="section-icon" />
          What ingredients do you have?
        </SectionTitle>

        <IngredientInputContainer>
          <IngredientInputRow>
            <IngredientInput
              type="text"
              value={currentInput}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              onFocus={() => currentInput.length >= 2 && setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              placeholder="Type an ingredient (e.g., chicken, rice, tomatoes)..."
            />

            {showSuggestions && suggestions.length > 0 && (
              <SuggestionsDropdown
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="suggestion-item"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    <div className="suggestion-text">{suggestion}</div>
                  </div>
                ))}
              </SuggestionsDropdown>
            )}
            <AddButton
              onClick={addIngredient}
              disabled={!currentInput.trim()}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaPlus />
              Add
            </AddButton>
          </IngredientInputRow>

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
          </IngredientTags>
        </IngredientInputContainer>

        <QuickSuggestions>
          <div className="suggestions-title">Quick suggestions:</div>
          <div className="suggestions-grid">
            {suggestionCategories.map((category, index) => (
              <motion.div
                key={category.title}
                className="suggestion-category"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index, duration: 0.5 }}
              >
                <h4>{category.title}</h4>
                <div className="suggestion-tags">
                  {category.items.map((item, itemIndex) => (
                    <SuggestionTag
                      key={item}
                      onClick={() => addSuggestion(item)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 * itemIndex, duration: 0.3 }}
                    >
                      {item}
                    </SuggestionTag>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Cuisine Browse Section */}
          <div className="suggestion-category" style={{ marginTop: '2rem' }}>
            <h4>🌍 Browse by Cuisine (Test All Recipes)</h4>
            <div className="suggestion-tags">
              {['Gujarati', 'Italian', 'Indian', 'Chinese', 'Mexican', 'Thai'].map((cuisine) => (
                <SuggestionTag
                  key={cuisine}
                  onClick={() => browseCuisine(cuisine)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    fontWeight: '600'
                  }}
                >
                  {cuisine} Recipes
                </SuggestionTag>
              ))}
            </div>
          </div>
        </QuickSuggestions>
            </IngredientsSection>

      <DietaryPreferencesSection
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.8 }}
      >
        <SectionTitle>
          <FaLeaf className="section-icon" />
          Dietary Preferences & Restrictions
        </SectionTitle>

        <PreferencesGrid>
          <PreferenceGroup>
            <h4>Diet Type</h4>
            <CheckboxGroup>
              <CheckboxLabel>
                <input
                  type="checkbox"
                  checked={dietaryPreferences.vegetarian}
                  onChange={() => handleDietaryChange('vegetarian')}
                />
                <span className="checkmark"></span>
                <FaSeedling className="checkbox-icon" />
                <span className="checkbox-text">Vegetarian</span>
              </CheckboxLabel>

              <CheckboxLabel>
                <input
                  type="checkbox"
                  checked={dietaryPreferences.vegan}
                  onChange={() => handleDietaryChange('vegan')}
                />
                <span className="checkmark"></span>
                <FaLeaf className="checkbox-icon" />
                <span className="checkbox-text">Vegan</span>
              </CheckboxLabel>

              <CheckboxLabel>
                <input
                  type="checkbox"
                  checked={dietaryPreferences.glutenFree}
                  onChange={() => handleDietaryChange('glutenFree')}
                />
                <span className="checkmark"></span>
                                <FaBreadSlice className="checkbox-icon" />
                <span className="checkbox-text">Gluten-Free</span>
              </CheckboxLabel>

              <CheckboxLabel>
                <input
                  type="checkbox"
                  checked={dietaryPreferences.dairyFree}
                  onChange={() => handleDietaryChange('dairyFree')}
                />
                <span className="checkmark"></span>
                                                <FaTint className="checkbox-icon" />
                <span className="checkbox-text">Dairy-Free</span>
              </CheckboxLabel>
            </CheckboxGroup>
          </PreferenceGroup>

          <PreferenceGroup>
            <h4>Allergen Warnings</h4>
            <CheckboxGroup>
              <CheckboxLabel>
                <input
                  type="checkbox"
                  checked={allergenRestrictions.noNuts}
                  onChange={() => handleAllergenChange('noNuts')}
                />
                <span className="checkmark"></span>
                <FaExclamationTriangle className="checkbox-icon" />
                <span className="checkbox-text">No Nuts</span>
              </CheckboxLabel>

              <CheckboxLabel>
                <input
                  type="checkbox"
                  checked={allergenRestrictions.noShellfish}
                  onChange={() => handleAllergenChange('noShellfish')}
                />
                <span className="checkmark"></span>
                <FaFish className="checkbox-icon" />
                <span className="checkbox-text">No Shellfish</span>
              </CheckboxLabel>

              <CheckboxLabel>
                <input
                  type="checkbox"
                  checked={allergenRestrictions.noEggs}
                  onChange={() => handleAllergenChange('noEggs')}
                />
                <span className="checkmark"></span>
                <FaEgg className="checkbox-icon" />
                <span className="checkbox-text">No Eggs</span>
              </CheckboxLabel>

              <CheckboxLabel>
                <input
                  type="checkbox"
                  checked={allergenRestrictions.noSoy}
                  onChange={() => handleAllergenChange('noSoy')}
                />
                <span className="checkmark"></span>
                <FaSeedling className="checkbox-icon" />
                <span className="checkbox-text">No Soy</span>
              </CheckboxLabel>
            </CheckboxGroup>
          </PreferenceGroup>

          <PreferenceGroup>
            <h4>Nutrition Goals</h4>
            <NutritionSliders>
              <SliderGroup>
                <label>
                  Max Calories: <span className="slider-value">{nutritionGoals.maxCalories}</span>
                </label>
                <NutritionSlider
                  type="range"
                  min="200"
                  max="1000"
                  value={nutritionGoals.maxCalories}
                  onChange={(e) => handleNutritionChange('maxCalories', e.target.value)}
                />
              </SliderGroup>

              <SliderGroup>
                <label>
                  Min Protein: <span className="slider-value">{nutritionGoals.minProtein}g</span>
                </label>
                <NutritionSlider
                  type="range"
                  min="5"
                  max="50"
                  value={nutritionGoals.minProtein}
                  onChange={(e) => handleNutritionChange('minProtein', e.target.value)}
                />
              </SliderGroup>

              <SliderGroup>
                <label>
                  Max Carbs: <span className="slider-value">{nutritionGoals.maxCarbs}g</span>
                </label>
                <NutritionSlider
                  type="range"
                  min="10"
                  max="100"
                  value={nutritionGoals.maxCarbs}
                  onChange={(e) => handleNutritionChange('maxCarbs', e.target.value)}
                />
              </SliderGroup>
            </NutritionSliders>
          </PreferenceGroup>
        </PreferencesGrid>
      </DietaryPreferencesSection>

      <SearchControls
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.8 }}
            >
        <div className="controls-row">
          <MatchingOptions>
            <label htmlFor="searchMode">Search Mode:</label>
            <select
              id="searchMode"
              value={searchMode}
              onChange={(e) => setSearchMode(e.target.value)}
            >
              <option value="local">Smart Local Search (AI + Local + Spoonacular)</option>
              <option value="global">Global Worldwide Search (Spoonacular API)</option>
            </select>
          </MatchingOptions>

          {searchMode === 'local' && (
            <MatchingOptions>
              <label htmlFor="matchType">Ingredient Matching:</label>
              <select
                id="matchType"
                value={matchType}
                onChange={(e) => setMatchType(e.target.value)}
              >
                <option value="any">Match ANY ingredient (more results)</option>
                <option value="all">Match ALL ingredients (exact matches)</option>
                <option value="most">Match MOST ingredients (recommended)</option>
              </select>
            </MatchingOptions>
          )}

          <div className="search-buttons">
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
                  {searchMode === 'global' ? 'Searching Worldwide...' : 'Searching...'}
                </>
              ) : (
                <>
                  <FaSearch />
                  {searchMode === 'global' ? 'Search Worldwide 🌍' : 'Find Recipes 🤖'}
                </>
              )}
            </SearchButton>

            <ClearButton
              onClick={clearAll}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaBroom />
              Clear All
            </ClearButton>
          </div>
        </div>
      </SearchControls>

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
                Found {results.length} Recipes
              </div>
            </ResultsHeader>

            {results.length > 0 ? (
              <RecipeGrid>
                {results.map((recipe, index) => (
                  <RecipeCard
                    key={recipe._id || recipe.id}
                    $matchScore={recipe.matchScore}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => handleRecipeClick(recipe)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="match-indicator">
                      {getMatchText(recipe.matchScore)}
                    </div>
                    
                    <img
                      src={recipe.image}
                      alt={recipe.name}
                      className="recipe-image"
                    />
                    
                    <div className="recipe-content">
                      <div className="recipe-name">{recipe.name}</div>
                      
                      <div className="recipe-rating">
                        <span className="stars">{generateStars(recipe.rating)}</span>
                        <span>{recipe.rating}</span>
                      </div>

                      <div className="ingredient-matches">
                        <h5>
                          <FaCheckCircle style={{ color: '#4caf50', marginRight: '0.5rem' }} />
                          You have: {recipe.matchedIngredients?.length || 0} ingredients
                        </h5>
                        <div className="matched-ingredients">
                          {recipe.matchedIngredients?.map((ing, i) => (
                            <span key={i} className="matched-ingredient">{ing}</span>
                          ))}
                        </div>
                        
                        {recipe.missingIngredients?.length > 0 && (
                          <div className="missing-ingredients">
                            <h5>
                              <FaShoppingCart style={{ color: '#ff9800', marginRight: '0.5rem' }} />
                              You'll need: {recipe.missingIngredients.length} more
                            </h5>
                            <div className="matched-ingredients">
                              {recipe.missingIngredients.map((ing, i) => (
                                <span key={i} className="missing-ingredient">{ing}</span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="recipe-meta">
                        <div className="meta-item">
                          <FaClock className="meta-icon" />
                          <span>{recipe.prepTime + recipe.cookTime} min</span>
                        </div>
                        <div className="meta-item">
                          <FaFire className="meta-icon" />
                          <span>{recipe.difficulty}</span>
                        </div>
                        <div className="meta-item">
                          <FaUsers className="meta-icon" />
                          <span>{recipe.servings}</span>
                        </div>
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
                <p>Try adjusting your ingredients or add more items to your list</p>
              </EmptyState>
            )}
          </ResultsSection>
        )}
      </AnimatePresence>

      {/* Recipe Detail Modal */}
      <RecipeDetailModal
        recipe={selectedRecipe}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </FinderContainer>
  );
};

export default SmartFinder;
