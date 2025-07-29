import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaTimes,
  FaClock,
  FaUsers,
  FaFire,
  FaStar,
  FaHeart,
  FaShare,
  FaBookmark,
  FaUtensils,
  FaPrint,
  FaShoppingCart,
  FaPlay,
  FaPause
} from 'react-icons/fa';
import axios from 'axios';
import toast from 'react-hot-toast';

const ModalOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 2rem;

  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    padding: 1rem;
  }
`;

const ModalContainer = styled(motion.div)`
  background: white;
  border-radius: 20px;
  max-width: 900px;
  max-height: 90vh;
  width: 100%;
  overflow: hidden;
  position: relative;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
`;

const ModalHeader = styled.div`
  position: relative;
  height: 300px;
  background: linear-gradient(135deg, rgba(0,0,0,0.3), rgba(0,0,0,0.6));
  
  .recipe-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    position: absolute;
    top: 0;
    left: 0;
    z-index: -1;
  }
  
  .header-content {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 2rem;
    background: linear-gradient(transparent, rgba(0,0,0,0.8));
    color: white;
  }
  
  .recipe-title {
    font-size: 2rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
    text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
  }
  
  .recipe-meta {
    display: flex;
    gap: 2rem;
    align-items: center;
    flex-wrap: wrap;
    
    .meta-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.9rem;
      
      .meta-icon {
        color: #ffd700;
      }
    }
  }
`;

const CloseButton = styled(motion.button)`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: rgba(0, 0, 0, 0.5);
  border: none;
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  
  &:hover {
    background: rgba(0, 0, 0, 0.7);
  }
`;

const ActionButtons = styled.div`
  position: absolute;
  top: 1rem;
  left: 1rem;
  display: flex;
  gap: 0.5rem;
  z-index: 10;
`;

const ActionButton = styled(motion.button)`
  background: rgba(255, 255, 255, 0.9);
  border: none;
  color: ${props => props.theme.colors.textDark};
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  
  &:hover {
    background: white;
    color: ${props => props.theme.colors.primary};
  }
  
  &.active {
    background: ${props => props.theme.colors.primary};
    color: white;
  }
`;

const ModalContent = styled.div`
  max-height: calc(90vh - 300px);
  overflow-y: auto;
  padding: 0;
`;

const ContentSection = styled.div`
  padding: 2rem;
  border-bottom: 1px solid #f0f0f0;
  
  &:last-child {
    border-bottom: none;
  }
  
  h3 {
    font-size: 1.3rem;
    font-weight: 600;
    color: ${props => props.theme.colors.textDark};
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    
    .section-icon {
      color: ${props => props.theme.colors.primary};
    }
  }
`;

const TimingSection = styled(ContentSection)`
  background: linear-gradient(135deg, #f8f9ff, #e8f2ff);
  
  .timing-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1rem;
  }
  
  .timing-item {
    background: white;
    padding: 1rem;
    border-radius: 12px;
    text-align: center;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    
    .timing-value {
      font-size: 1.5rem;
      font-weight: 700;
      color: ${props => props.theme.colors.primary};
      margin-bottom: 0.25rem;
    }
    
    .timing-label {
      font-size: 0.9rem;
      color: ${props => props.theme.colors.textMuted};
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
  }
`;

const NutritionSection = styled(ContentSection)`
  .nutrition-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 1rem;
  }
  
  .nutrition-item {
    background: ${props => props.theme.colors.backgroundLight};
    padding: 1rem;
    border-radius: 8px;
    text-align: center;
    
    .nutrition-value {
      font-size: 1.2rem;
      font-weight: 600;
      color: ${props => props.theme.colors.textDark};
      margin-bottom: 0.25rem;
    }
    
    .nutrition-label {
      font-size: 0.8rem;
      color: ${props => props.theme.colors.textMuted};
    }
  }
`;

const IngredientsSection = styled(ContentSection)`
  .ingredients-list {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 0.75rem;
  }
  
  .ingredient-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem;
    background: ${props => props.theme.colors.backgroundLight};
    border-radius: 8px;
    transition: all 0.2s;
    
    &:hover {
      background: #e8f2ff;
    }
    
    .ingredient-checkbox {
      input[type="checkbox"] {
        display: none;
      }
      
      .checkmark {
        width: 20px;
        height: 20px;
        border: 2px solid #ddd;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s;
        
        &::after {
          content: "";
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: ${props => props.theme.colors.success};
          opacity: 0;
          transition: opacity 0.2s;
        }
      }
      
      input[type="checkbox"]:checked + .checkmark {
        border-color: ${props => props.theme.colors.success};
        
        &::after {
          opacity: 1;
        }
      }
    }
    
    .ingredient-text {
      flex: 1;
      font-size: 0.95rem;
      color: ${props => props.theme.colors.textDark};
      
      .ingredient-amount {
        font-weight: 600;
        color: ${props => props.theme.colors.primary};
      }
    }
  }
`;

const InstructionsSection = styled(ContentSection)`
  .instructions-list {
    counter-reset: step-counter;
  }
  
  .instruction-step {
    display: flex;
    gap: 1rem;
    margin-bottom: 1.5rem;
    padding: 1rem;
    background: ${props => props.theme.colors.backgroundLight};
    border-radius: 12px;
    position: relative;
    
    &.completed {
      background: rgba(76, 175, 80, 0.1);
      border-left: 4px solid ${props => props.theme.colors.success};
    }
    
    .step-number {
      counter-increment: step-counter;
      width: 32px;
      height: 32px;
      background: ${props => props.theme.colors.primary};
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 0.9rem;
      flex-shrink: 0;
      
      &::before {
        content: counter(step-counter);
      }
    }
    
    .step-content {
      flex: 1;
      
      .step-text {
        font-size: 1rem;
        line-height: 1.6;
        color: ${props => props.theme.colors.textDark};
        margin-bottom: 0.5rem;
      }
      
      .step-meta {
        display: flex;
        gap: 1rem;
        font-size: 0.85rem;
        color: ${props => props.theme.colors.textMuted};
        
        .step-time {
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }
      }
    }
    
    .step-checkbox {
      position: absolute;
      top: 1rem;
      right: 1rem;
      
      input[type="checkbox"] {
        display: none;
      }
      
      .checkmark {
        width: 24px;
        height: 24px;
        border: 2px solid #ddd;
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s;
        
        &::after {
          content: "✓";
          color: white;
          font-weight: bold;
          opacity: 0;
          transition: opacity 0.2s;
        }
      }
      
      input[type="checkbox"]:checked + .checkmark {
        background: ${props => props.theme.colors.success};
        border-color: ${props => props.theme.colors.success};
        
        &::after {
          opacity: 1;
        }
      }
    }
  }
`;

const TagsSection = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1rem;
  
  .tag {
    padding: 0.25rem 0.75rem;
    background: ${props => props.theme.colors.primary};
    color: white;
    border-radius: 15px;
    font-size: 0.8rem;
    font-weight: 500;
    
    &.dietary {
      background: ${props => props.theme.colors.success};
    }
    
    &.cuisine {
      background: ${props => props.theme.colors.accent};
    }
    
    &.difficulty {
      background: ${props => props.theme.colors.warning};
    }
  }
`;

const CookingTimer = styled.div`
  position: sticky;
  top: 0;
  background: ${props => props.theme.colors.primary};
  color: white;
  padding: 1rem;
  text-align: center;
  z-index: 100;
  
  .timer-display {
    font-size: 1.5rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
  }
  
  .timer-controls {
    display: flex;
    justify-content: center;
    gap: 1rem;
    
    button {
      background: rgba(255, 255, 255, 0.2);
      border: none;
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 6px;
      cursor: pointer;
      
      &:hover {
        background: rgba(255, 255, 255, 0.3);
      }
    }
  }
`;

const RecipeDetailModal = ({ recipe, isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [checkedIngredients, setCheckedIngredients] = useState(new Set());
  const [isFavorited, setIsFavorited] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [cookingTimer, setCookingTimer] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [recipeDetails, setRecipeDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (recipe && isOpen) {
      fetchRecipeDetails();
    }
  }, [recipe, isOpen]);

  useEffect(() => {
    let interval;
    if (timerRunning && cookingTimer > 0) {
      interval = setInterval(() => {
        setCookingTimer(prev => {
          if (prev <= 1) {
            setTimerRunning(false);
            toast.success('⏰ Cooking timer finished!', {
              duration: 5000,
              icon: '🔔'
            });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning, cookingTimer]);

  const fetchRecipeDetails = async () => {
    if (!recipe) return;
    
    try {
      setLoading(true);
      
      // If recipe already has detailed instructions, use it
      if (recipe.analyzedInstructions && recipe.analyzedInstructions.length > 0) {
        setRecipeDetails(recipe);
        return;
      }

      // Otherwise fetch detailed data
      const response = await axios.get(`/api/recipes/details/${recipe.id || recipe._id}`);
      
      if (response.data.success) {
        setRecipeDetails(response.data.recipe);
      } else {
        setRecipeDetails(recipe); // Fallback to original recipe
      }
    } catch (error) {
      console.error('Error fetching recipe details:', error);
      setRecipeDetails(recipe); // Fallback to original recipe
      toast.error('Could not load detailed instructions');
    } finally {
      setLoading(false);
    }
  };

  const toggleStepComplete = (stepIndex) => {
    const newCompleted = new Set(completedSteps);
    if (newCompleted.has(stepIndex)) {
      newCompleted.delete(stepIndex);
    } else {
      newCompleted.add(stepIndex);
      toast.success('Step completed! 🎉');
    }
    setCompletedSteps(newCompleted);
  };

  const toggleIngredientCheck = (ingredientIndex) => {
    const newChecked = new Set(checkedIngredients);
    if (newChecked.has(ingredientIndex)) {
      newChecked.delete(ingredientIndex);
    } else {
      newChecked.add(ingredientIndex);
    }
    setCheckedIngredients(newChecked);
  };

  const startTimer = (minutes) => {
    setCookingTimer(minutes * 60);
    setTimerRunning(true);
    toast.success(`Timer started for ${minutes} minutes!`);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleFavorite = () => {
    setIsFavorited(!isFavorited);
    toast.success(isFavorited ? 'Removed from favorites' : 'Added to favorites!');
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    toast.success(isBookmarked ? 'Bookmark removed' : 'Recipe bookmarked!');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: recipe?.title || recipe?.name,
        text: recipe?.summary,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Recipe link copied to clipboard!');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!recipe || !isOpen) return null;

  const displayRecipe = recipeDetails || recipe;
  const instructions = displayRecipe.analyzedInstructions || [];
  const ingredients = displayRecipe.extendedIngredients || [];

  return (
    <AnimatePresence>
      <ModalOverlay
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <ModalContainer
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <ModalHeader>
            <img 
              src={displayRecipe.image} 
              alt={displayRecipe.title || displayRecipe.name}
              className="recipe-image"
            />
            
            <CloseButton
              onClick={onClose}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <FaTimes />
            </CloseButton>

            <ActionButtons>
              <ActionButton
                onClick={handleFavorite}
                className={isFavorited ? 'active' : ''}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <FaHeart />
              </ActionButton>
              
              <ActionButton
                onClick={handleBookmark}
                className={isBookmarked ? 'active' : ''}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <FaBookmark />
              </ActionButton>
              
              <ActionButton
                onClick={handleShare}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <FaShare />
              </ActionButton>
              
              <ActionButton
                onClick={handlePrint}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <FaPrint />
              </ActionButton>
            </ActionButtons>

            <div className="header-content">
              <h1 className="recipe-title">{displayRecipe.title || displayRecipe.name}</h1>
              <div className="recipe-meta">
                <div className="meta-item">
                  <FaClock className="meta-icon" />
                  <span>{displayRecipe.readyInMinutes || displayRecipe.prepTime + displayRecipe.cookTime} min</span>
                </div>
                <div className="meta-item">
                  <FaUsers className="meta-icon" />
                  <span>{displayRecipe.servings} servings</span>
                </div>
                <div className="meta-item">
                  <FaFire className="meta-icon" />
                  <span>{displayRecipe.difficulty}</span>
                </div>
                <div className="meta-item">
                  <FaStar className="meta-icon" />
                  <span>{displayRecipe.rating}/5</span>
                </div>
              </div>
            </div>
          </ModalHeader>

          {cookingTimer > 0 && (
            <CookingTimer>
              <div className="timer-display">{formatTime(cookingTimer)}</div>
              <div className="timer-controls">
                <button onClick={() => setTimerRunning(!timerRunning)}>
                  {timerRunning ? <FaPause /> : <FaPlay />}
                  {timerRunning ? ' Pause' : ' Resume'}
                </button>
                <button onClick={() => { setCookingTimer(0); setTimerRunning(false); }}>
                  Stop Timer
                </button>
              </div>
            </CookingTimer>
          )}

          <ModalContent>
            {loading && (
              <ContentSection>
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                  Loading detailed instructions...
                </div>
              </ContentSection>
            )}

            {/* Timing Information */}
            <TimingSection>
              <h3>
                <FaClock className="section-icon" />
                Timing Breakdown
              </h3>
              <div className="timing-grid">
                <div className="timing-item">
                  <div className="timing-value">{displayRecipe.prepTime || Math.floor((displayRecipe.readyInMinutes || 30) * 0.3)}</div>
                  <div className="timing-label">Prep Time</div>
                </div>
                <div className="timing-item">
                  <div className="timing-value">{displayRecipe.cookTime || Math.floor((displayRecipe.readyInMinutes || 30) * 0.7)}</div>
                  <div className="timing-label">Cook Time</div>
                </div>
                <div className="timing-item">
                  <div className="timing-value">{displayRecipe.readyInMinutes || (displayRecipe.prepTime + displayRecipe.cookTime)}</div>
                  <div className="timing-label">Total Time</div>
                </div>
                <div className="timing-item">
                  <div className="timing-value">{displayRecipe.servings}</div>
                  <div className="timing-label">Servings</div>
                </div>
              </div>
            </TimingSection>

            {/* Nutrition Information */}
            {displayRecipe.nutrition && (
              <NutritionSection>
                <h3>
                  <FaUtensils className="section-icon" />
                  Nutrition Information
                </h3>
                <div className="nutrition-grid">
                  <div className="nutrition-item">
                    <div className="nutrition-value">{displayRecipe.nutrition.calories}</div>
                    <div className="nutrition-label">Calories</div>
                  </div>
                  <div className="nutrition-item">
                    <div className="nutrition-value">{displayRecipe.nutrition.protein}g</div>
                    <div className="nutrition-label">Protein</div>
                  </div>
                  <div className="nutrition-item">
                    <div className="nutrition-value">{displayRecipe.nutrition.carbs}g</div>
                    <div className="nutrition-label">Carbs</div>
                  </div>
                  <div className="nutrition-item">
                    <div className="nutrition-value">{displayRecipe.nutrition.fat}g</div>
                    <div className="nutrition-label">Fat</div>
                  </div>
                  {displayRecipe.nutrition.fiber && (
                    <div className="nutrition-item">
                      <div className="nutrition-value">{displayRecipe.nutrition.fiber}g</div>
                      <div className="nutrition-label">Fiber</div>
                    </div>
                  )}
                  {displayRecipe.nutrition.sugar && (
                    <div className="nutrition-item">
                      <div className="nutrition-value">{displayRecipe.nutrition.sugar}g</div>
                      <div className="nutrition-label">Sugar</div>
                    </div>
                  )}
                </div>
              </NutritionSection>
            )}

            {/* Ingredients */}
            <IngredientsSection>
              <h3>
                <FaShoppingCart className="section-icon" />
                Ingredients ({ingredients.length})
              </h3>
              <div className="ingredients-list">
                {ingredients.map((ingredient, index) => (
                  <div key={index} className="ingredient-item">
                    <label className="ingredient-checkbox">
                      <input 
                        type="checkbox" 
                        checked={checkedIngredients.has(index)}
                        onChange={() => toggleIngredientCheck(index)}
                      />
                      <span className="checkmark"></span>
                    </label>
                    <div className="ingredient-text">
                      <span className="ingredient-amount">
                        {ingredient.amount} {ingredient.unit}
                      </span>{' '}
                      {ingredient.name}
                    </div>
                  </div>
                ))}
              </div>
            </IngredientsSection>

            {/* Instructions */}
            <InstructionsSection>
              <h3>
                <FaUtensils className="section-icon" />
                Instructions
                <button 
                  onClick={() => startTimer(displayRecipe.readyInMinutes || 30)}
                  style={{ 
                    marginLeft: 'auto', 
                    background: '#4caf50', 
                    color: 'white', 
                    border: 'none', 
                    padding: '0.5rem 1rem', 
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  Start Cooking Timer
                </button>
              </h3>
              <div className="instructions-list">
                {instructions.length > 0 ? (
                  instructions.map((instructionSet, setIndex) => 
                    instructionSet.steps ? instructionSet.steps.map((step, stepIndex) => (
                      <div 
                        key={`${setIndex}-${stepIndex}`} 
                        className={`instruction-step ${completedSteps.has(`${setIndex}-${stepIndex}`) ? 'completed' : ''}`}
                      >
                        <div className="step-number"></div>
                        <div className="step-content">
                          <div className="step-text">{step.step}</div>
                          {step.length && (
                            <div className="step-meta">
                              <div className="step-time">
                                <FaClock />
                                {step.length.number} {step.length.unit}
                              </div>
                            </div>
                          )}
                        </div>
                        <label className="step-checkbox">
                          <input 
                            type="checkbox" 
                            checked={completedSteps.has(`${setIndex}-${stepIndex}`)}
                            onChange={() => toggleStepComplete(`${setIndex}-${stepIndex}`)}
                          />
                          <span className="checkmark"></span>
                        </label>
                      </div>
                    )) : []
                  )
                ) : (
                  // Fallback instructions if analyzedInstructions not available
                  displayRecipe.instructions ? (
                    displayRecipe.instructions.split('.').filter(step => step.trim()).map((step, index) => (
                      <div 
                        key={index} 
                        className={`instruction-step ${completedSteps.has(index) ? 'completed' : ''}`}
                      >
                        <div className="step-number"></div>
                        <div className="step-content">
                          <div className="step-text">{step.trim()}.</div>
                        </div>
                        <label className="step-checkbox">
                          <input 
                            type="checkbox" 
                            checked={completedSteps.has(index)}
                            onChange={() => toggleStepComplete(index)}
                          />
                          <span className="checkmark"></span>
                        </label>
                      </div>
                    ))
                  ) : (
                    <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                      Detailed instructions not available for this recipe.
                    </div>
                  )
                )}
              </div>
            </InstructionsSection>

            {/* Tags */}
            <ContentSection>
              <h3>Recipe Information</h3>
              <TagsSection>
                {displayRecipe.cuisines?.map(cuisine => (
                  <span key={cuisine} className="tag cuisine">{cuisine}</span>
                ))}
                {displayRecipe.dishTypes?.map(type => (
                  <span key={type} className="tag">{type}</span>
                ))}
                <span className="tag difficulty">{displayRecipe.difficulty}</span>
                {displayRecipe.vegetarian && <span className="tag dietary">Vegetarian</span>}
                {displayRecipe.vegan && <span className="tag dietary">Vegan</span>}
                {displayRecipe.glutenFree && <span className="tag dietary">Gluten-Free</span>}
                {displayRecipe.dairyFree && <span className="tag dietary">Dairy-Free</span>}
                {displayRecipe.quickMeal && <span className="tag">Quick Meal</span>}
                {displayRecipe.leftoverFriendly && <span className="tag">Leftover Friendly</span>}
              </TagsSection>
            </ContentSection>
          </ModalContent>
        </ModalContainer>
      </ModalOverlay>
    </AnimatePresence>
  );
};

export default RecipeDetailModal;
