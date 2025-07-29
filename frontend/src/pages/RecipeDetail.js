import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { 
  FaClock, 
  FaUsers, 
  FaFire, 
  FaStar, 
  FaHeart, 
  FaUtensils, 
  FaInfoCircle,
  FaBreadSlice,
  FaAppleAlt,
  FaLeaf,
  FaChartPie,
  FaThumbsUp,
  FaShoppingCart,
  FaBookmark,
  FaShare,
  FaPrint
} from 'react-icons/fa';
import axios from 'axios';
import toast from 'react-hot-toast';

const DetailContainer = styled(motion.div)`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const RecipeHeader = styled(motion.div)`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  margin-bottom: 3rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  
  .image-section {
    .recipe-image {
      width: 100%;
      height: 400px;
      object-fit: cover;
      border-radius: ${props => props.theme.borderRadius};
      box-shadow: ${props => props.theme.shadows.card};
    }
    
    .image-actions {
      display: flex;
      gap: 1rem;
      margin-top: 1rem;
      justify-content: center;
      
      .action-btn {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem 1.5rem;
        border: none;
        border-radius: 25px;
        cursor: pointer;
        font-weight: 500;
        transition: all 0.3s ease;
        
        &.favorite {
          background: ${props => props.theme.colors.danger};
          color: white;
          
          &:hover {
            background: #c62828;
          }
        }
        
        &.share {
          background: ${props => props.theme.colors.info};
          color: white;
          
          &:hover {
            background: #1565c0;
          }
        }
        
        &.print {
          background: ${props => props.theme.colors.textMuted};
          color: white;
          
          &:hover {
            background: #424242;
          }
        }
      }
    }
  }
  
  .info-section {
    .recipe-title {
      font-size: 2.5rem;
      font-weight: 700;
      margin-bottom: 1rem;
      color: ${props => props.theme.colors.textDark};
      line-height: 1.2;
    }
    
    .recipe-summary {
      font-size: 1.1rem;
      color: ${props => props.theme.colors.textLight};
      margin-bottom: 2rem;
      line-height: 1.6;
    }
    
    .recipe-meta {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
      
      .meta-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.5rem;
        background: white;
        padding: 1.5rem 1rem;
        border-radius: 12px;
        box-shadow: ${props => props.theme.shadows.card};
        text-align: center;
        
        .meta-icon {
          color: ${props => props.theme.colors.primary};
          font-size: 1.5rem;
        }
        
        .meta-label {
          font-size: 0.9rem;
          color: ${props => props.theme.colors.textMuted};
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .meta-value {
          font-weight: 600;
          font-size: 1.1rem;
          color: ${props => props.theme.colors.textDark};
        }
      }
    }
    
    .recipe-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-bottom: 2rem;
      
      .tag {
        padding: 0.4rem 1rem;
        background: ${props => props.theme.colors.backgroundLight};
        color: ${props => props.theme.colors.primary};
        border-radius: 20px;
        font-size: 0.85rem;
        font-weight: 500;
        border: 1px solid ${props => props.theme.colors.primary};
      }
    }
  }
`;

const ContentSection = styled(motion.div)`
  background: white;
  border-radius: ${props => props.theme.borderRadius};
  padding: 2rem;
  box-shadow: ${props => props.theme.shadows.card};
  margin-bottom: 2rem;
  
  .section-title {
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
  }
`;

const IngredientsList = styled.ul`
  list-style: none;
  padding: 0;
  
  .ingredient-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    margin-bottom: 0.5rem;
    background: ${props => props.theme.colors.backgroundLight};
    border-radius: 8px;
    font-size: 1.1rem;
    
    .ingredient-checkbox {
      width: 20px;
      height: 20px;
      border: 2px solid ${props => props.theme.colors.primary};
      border-radius: 4px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      
      &.checked {
        background: ${props => props.theme.colors.primary};
        color: white;
      }
    }
    
    .ingredient-text {
      flex: 1;
      
      &.checked {
        text-decoration: line-through;
        opacity: 0.6;
      }
    }
    
    .ingredient-amount {
      font-weight: 600;
      color: ${props => props.theme.colors.primary};
    }
  }
`;

const InstructionsList = styled.ol`
  list-style: none;
  padding: 0;
  counter-reset: step-counter;
  
  .instruction-item {
    counter-increment: step-counter;
    display: flex;
    gap: 1.5rem;
    margin-bottom: 2rem;
    
    &::before {
      content: counter(step-counter);
      background: ${props => props.theme.colors.primary};
      color: white;
      width: 2.5rem;
      height: 2.5rem;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      flex-shrink: 0;
      margin-top: 0.25rem;
    }
    
    .instruction-text {
      flex: 1;
      font-size: 1.1rem;
      line-height: 1.6;
      color: ${props => props.theme.colors.textDark};
    }
  }
`;

const NutritionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  
  .nutrition-item {
    text-align: center;
    padding: 1rem;
    background: ${props => props.theme.colors.backgroundLight};
    border-radius: 8px;
    
    .nutrition-value {
      font-size: 1.5rem;
      font-weight: 700;
      color: ${props => props.theme.colors.primary};
      display: block;
    }
    
    .nutrition-label {
      font-size: 0.9rem;
      color: ${props => props.theme.colors.textMuted};
      margin-top: 0.25rem;
    }
    
    .nutrition-unit {
      font-size: 0.8rem;
      color: ${props => props.theme.colors.textLight};
    }
  }
`;

const LoadingSpinner = styled(motion.div)`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  font-size: 2rem;
`;

const ErrorMessage = styled.div`
  text-align: center;
  padding: 2rem;
  color: ${props => props.theme.colors.danger};
  background: #ffebee;
  border-radius: 8px;
  margin: 2rem 0;
`;

const RecipeDetail = () => {
  const { id } = useParams();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [checkedIngredients, setCheckedIngredients] = useState(new Set());
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/recipes/${id}`);
        setRecipe(response.data);
        setError(null);
      } catch (error) {
        console.error('Error fetching recipe:', error);
        setError('Recipe not found or could not be loaded');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchRecipe();
    }
  }, [id]);

  const toggleIngredient = (index) => {
    const newChecked = new Set(checkedIngredients);
    if (newChecked.has(index)) {
      newChecked.delete(index);
    } else {
      newChecked.add(index);
    }
    setCheckedIngredients(newChecked);
  };

  const toggleFavorite = async () => {
    try {
      const response = await axios.post(`/api/recipes/${id}/favorite`);
      setIsFavorite(response.data.isFavorite);
      toast.success(response.data.message);
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Please log in to add favorites');
    }
  };

  const shareRecipe = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: recipe.title,
          text: recipe.summary || recipe.title,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast.success('Recipe link copied to clipboard!');
    }
  };

  const printRecipe = () => {
    window.print();
  };

  if (loading) {
    return (
      <LoadingSpinner
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      >
        🍳
      </LoadingSpinner>
    );
  }

  if (error || !recipe) {
    return (
      <DetailContainer>
        <ErrorMessage>
          <h2>Recipe Not Found</h2>
          <p>{error || 'The recipe you are looking for could not be found.'}</p>
        </ErrorMessage>
      </DetailContainer>
    );
  }

  return (
    <DetailContainer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <RecipeHeader
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.8 }}
      >
        <div className="image-section">
          <motion.img
            src={recipe.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&h=400&fit=crop'}
            alt={recipe.title}
            className="recipe-image"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
          />
          
          <div className="image-actions">
            <button className="action-btn favorite" onClick={toggleFavorite}>
              <FaHeart />
              {isFavorite ? 'Favorited' : 'Add to Favorites'}
            </button>
            <button className="action-btn share" onClick={shareRecipe}>
              <FaShare />
              Share
            </button>
            <button className="action-btn print" onClick={printRecipe}>
              <FaPrint />
              Print
            </button>
          </div>
        </div>
        
        <div className="info-section">
          <h1 className="recipe-title">{recipe.title}</h1>
          
          {recipe.summary && (
            <p className="recipe-summary">
              {recipe.summary.replace(/<[^>]*>/g, '')}
            </p>
          )}
          
          <div className="recipe-meta">
            <div className="meta-item">
              <FaClock className="meta-icon" />
              <span className="meta-label">Total Time</span>
              <span className="meta-value">{recipe.readyInMinutes || recipe.totalTime || 30} min</span>
            </div>
            <div className="meta-item">
              <FaUsers className="meta-icon" />
              <span className="meta-label">Servings</span>
              <span className="meta-value">{recipe.servings}</span>
            </div>
            <div className="meta-item">
              <FaFire className="meta-icon" />
              <span className="meta-label">Difficulty</span>
              <span className="meta-value">{recipe.difficulty}</span>
            </div>
            <div className="meta-item">
              <FaStar className="meta-icon" style={{ color: '#ffd700' }} />
              <span className="meta-label">Rating</span>
              <span className="meta-value">{recipe.rating?.toFixed(1) || 'N/A'}/5</span>
            </div>
            {recipe.preparationMinutes && (
              <div className="meta-item">
                <FaUtensils className="meta-icon" />
                <span className="meta-label">Prep Time</span>
                <span className="meta-value">{recipe.preparationMinutes} min</span>
              </div>
            )}
            {recipe.cookingMinutes && (
              <div className="meta-item">
                <FaFire className="meta-icon" />
                <span className="meta-label">Cook Time</span>
                <span className="meta-value">{recipe.cookingMinutes} min</span>
              </div>
            )}
          </div>
          
          <div className="recipe-tags">
            {recipe.vegetarian && <span className="tag">🌱 Vegetarian</span>}
            {recipe.vegan && <span className="tag">🌿 Vegan</span>}
            {recipe.glutenFree && <span className="tag">🌾 Gluten-Free</span>}
            {recipe.dairyFree && <span className="tag">🥛 Dairy-Free</span>}
            {recipe.leftoverFriendly && <span className="tag">♻️ Leftover-Friendly</span>}
            {recipe.quickMeal && <span className="tag">⚡ Quick Meal</span>}
            {recipe.dishTypes?.map((type, index) => (
              <span key={index} className="tag">{type}</span>
            ))}
          </div>
        </div>
      </RecipeHeader>

      {recipe.nutrition && (
        <ContentSection
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
        >
          <h2 className="section-title">
            <FaChartPie className="section-icon" />
            Nutrition Information (per serving)
          </h2>
          <NutritionGrid>
            <div className="nutrition-item">
              <span className="nutrition-value">{Math.round(recipe.nutrition.calories)}</span>
              <div className="nutrition-label">Calories</div>
            </div>
            <div className="nutrition-item">
              <span className="nutrition-value">{Math.round(recipe.nutrition.protein)}<span className="nutrition-unit">g</span></span>
              <div className="nutrition-label">Protein</div>
            </div>
            <div className="nutrition-item">
              <span className="nutrition-value">{Math.round(recipe.nutrition.carbs)}<span className="nutrition-unit">g</span></span>
              <div className="nutrition-label">Carbs</div>
            </div>
            <div className="nutrition-item">
              <span className="nutrition-value">{Math.round(recipe.nutrition.fat)}<span className="nutrition-unit">g</span></span>
              <div className="nutrition-label">Fat</div>
            </div>
            {recipe.nutrition.fiber > 0 && (
              <div className="nutrition-item">
                <span className="nutrition-value">{Math.round(recipe.nutrition.fiber)}<span className="nutrition-unit">g</span></span>
                <div className="nutrition-label">Fiber</div>
              </div>
            )}
            {recipe.nutrition.sodium > 0 && (
              <div className="nutrition-item">
                <span className="nutrition-value">{Math.round(recipe.nutrition.sodium)}<span className="nutrition-unit">mg</span></span>
                <div className="nutrition-label">Sodium</div>
              </div>
            )}
          </NutritionGrid>
        </ContentSection>
      )}

      <ContentSection
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.8 }}
      >
        <h2 className="section-title">
          <FaShoppingCart className="section-icon" />
          Ingredients ({recipe.extendedIngredients?.length || 0} items)
        </h2>
        <IngredientsList>
          {recipe.extendedIngredients?.map((ingredient, index) => (
            <li key={index} className="ingredient-item">
              <div 
                className={`ingredient-checkbox ${checkedIngredients.has(index) ? 'checked' : ''}`}
                onClick={() => toggleIngredient(index)}
              >
                {checkedIngredients.has(index) && '✓'}
              </div>
              <span className={`ingredient-text ${checkedIngredients.has(index) ? 'checked' : ''}`}>
                {ingredient.originalString || `${ingredient.amount} ${ingredient.unit} ${ingredient.name}`}
              </span>
            </li>
          )) || (
            <li className="ingredient-item">
              <div className="ingredient-text">No detailed ingredients available</div>
            </li>
          )}
        </IngredientsList>
      </ContentSection>

      <ContentSection
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.8 }}
      >
        <h2 className="section-title">
          <FaUtensils className="section-icon" />
          Instructions
        </h2>
        <InstructionsList>
          {recipe.analyzedInstructions?.[0]?.steps?.map((step, index) => (
            <li key={index} className="instruction-item">
              <div className="instruction-text">{step.step}</div>
            </li>
          )) || (
            recipe.instructions ? (
              <li className="instruction-item">
                <div className="instruction-text">{recipe.instructions.replace(/<[^>]*>/g, '')}</div>
              </li>
            ) : (
              <li className="instruction-item">
                <div className="instruction-text">Instructions not available for this recipe.</div>
              </li>
            )
          )}
        </InstructionsList>
      </ContentSection>

      {recipe.cookingTips && (
        <ContentSection
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0, duration: 0.8 }}
        >
          <h2 className="section-title">
            <FaInfoCircle className="section-icon" />
            Cooking Tips
          </h2>
          <ul style={{ lineHeight: 2, fontSize: '1.1rem' }}>
            {recipe.cookingTips.tips?.map((tip, index) => (
              <li key={index} style={{ marginBottom: '0.5rem' }}>{tip}</li>
            ))}
          </ul>
        </ContentSection>
      )}
    </DetailContainer>
  );
};

export default RecipeDetail;
