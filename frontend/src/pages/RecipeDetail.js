import React from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaClock, FaUsers, FaFire, FaStar, FaHeart, FaUtensils } from 'react-icons/fa';

const DetailContainer = styled(motion.div)`
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem;
`;

const RecipeHeader = styled(motion.div)`
  text-align: center;
  margin-bottom: 3rem;
  
  .recipe-title {
    font-size: 3rem;
    font-weight: 700;
    margin-bottom: 1rem;
    color: ${props => props.theme.colors.textDark};
  }
  
  .recipe-image {
    width: 100%;
    max-width: 600px;
    height: 400px;
    object-fit: cover;
    border-radius: ${props => props.theme.borderRadius};
    box-shadow: ${props => props.theme.shadows.card};
    margin-bottom: 2rem;
  }
  
  .recipe-meta {
    display: flex;
    justify-content: center;
    gap: 2rem;
    flex-wrap: wrap;
    
    .meta-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: white;
      padding: 1rem 1.5rem;
      border-radius: 25px;
      box-shadow: ${props => props.theme.shadows.card};
      
      .meta-icon {
        color: ${props => props.theme.colors.primary};
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

const RecipeDetail = () => {
  const { id } = useParams();

  // Mock recipe data - in real app, fetch from API using id
  const recipe = {
    name: 'Leftover Vegetable Stir Fry',
    image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=600&h=400&fit=crop',
    prepTime: 10,
    cookTime: 8,
    servings: 4,
    difficulty: 'Easy',
    rating: 4.5,
    description: 'A quick and delicious way to use up leftover vegetables with a perfect blend of Asian flavors.',
    ingredients: [
      '2 cups mixed leftover vegetables',
      '2 tbsp soy sauce',
      '2 cloves garlic, minced',
      '1 inch ginger, minced',
      '1 tbsp oil'
    ],
    instructions: [
      'Heat oil in a large pan or wok over high heat',
      'Add minced garlic and ginger, stir for 30 seconds',
      'Add vegetables and stir-fry for 3-4 minutes',
      'Add soy sauce and toss to combine',
      'Serve hot over rice or noodles'
    ]
  };

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
        <h1 className="recipe-title">{recipe.name}</h1>
        
        <motion.img
          src={recipe.image}
          alt={recipe.name}
          className="recipe-image"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.3 }}
        />
        
        <div className="recipe-meta">
          <div className="meta-item">
            <FaClock className="meta-icon" />
            <span>{recipe.prepTime + recipe.cookTime} min</span>
          </div>
          <div className="meta-item">
            <FaUsers className="meta-icon" />
            <span>{recipe.servings} servings</span>
          </div>
          <div className="meta-item">
            <FaFire className="meta-icon" />
            <span>{recipe.difficulty}</span>
          </div>
          <div className="meta-item">
            <FaStar className="meta-icon" style={{ color: '#ffd700' }} />
            <span>{recipe.rating}/5</span>
          </div>
        </div>
      </RecipeHeader>

      <ContentSection
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.8 }}
      >
        <h2 className="section-title">
          <FaUtensils className="section-icon" />
          Ingredients
        </h2>
        <ul style={{ lineHeight: 2, fontSize: '1.1rem' }}>
          {recipe.ingredients.map((ingredient, index) => (
            <li key={index}>{ingredient}</li>
          ))}
        </ul>
      </ContentSection>

      <ContentSection
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.8 }}
      >
        <h2 className="section-title">
          <FaFire className="section-icon" />
          Instructions
        </h2>
        <ol style={{ lineHeight: 2, fontSize: '1.1rem' }}>
          {recipe.instructions.map((instruction, index) => (
            <li key={index} style={{ marginBottom: '1rem' }}>{instruction}</li>
          ))}
        </ol>
      </ContentSection>
    </DetailContainer>
  );
};

export default RecipeDetail;
