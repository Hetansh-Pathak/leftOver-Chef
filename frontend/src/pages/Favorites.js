import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaHeart, FaStar, FaClock, FaUsers, FaEye, FaTimes } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const FavoritesContainer = styled(motion.div)`
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
      color: #ff6b6b;
      animation: pulse 2s ease-in-out infinite;
    }
  }
`;

const EmptyState = styled(motion.div)`
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: ${props => props.theme.borderRadius};
  box-shadow: ${props => props.theme.shadows.card};
  
  .empty-icon {
    font-size: 4rem;
    color: #ff6b6b;
    margin-bottom: 2rem;
    opacity: 0.3;
  }
  
  h2 {
    font-size: 2rem;
    margin-bottom: 1rem;
    color: ${props => props.theme.colors.textDark};
  }
  
  p {
    font-size: 1.1rem;
    color: ${props => props.theme.colors.textLight};
    margin-bottom: 2rem;
    max-width: 500px;
    margin-left: auto;
    margin-right: auto;
  }
  
  .cta-button {
    background: ${props => props.theme.colors.gradient};
    color: white;
    border: none;
    padding: 1rem 2rem;
    border-radius: 25px;
    font-size: 1.1rem;
    font-weight: 600;
    cursor: pointer;
    transition: ${props => props.theme.transitions.default};
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: ${props => props.theme.shadows.cardHover};
    }
  }
`;

const FavoriteCard = styled(motion.div)`
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid #E2E8F0;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  }

  .recipe-image-container {
    position: relative;
    height: 200px;
    overflow: hidden;

    .recipe-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .remove-favorite {
      position: absolute;
      top: 1rem;
      right: 1rem;
      background: rgba(0, 0, 0, 0.7);
      color: white;
      border: none;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s ease;

      &:hover {
        background: #F56565;
        transform: scale(1.1);
      }
    }
  }

  .recipe-content {
    padding: 1.5rem;

    .recipe-title {
      font-size: 1.2rem;
      font-weight: 700;
      margin-bottom: 1rem;
      color: #2D3748;
      line-height: 1.3;
    }

    .recipe-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;

      .meta-item {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.9rem;
        color: #718096;

        .meta-icon {
          color: #667eea;
        }
      }
    }

    .added-date {
      font-size: 0.8rem;
      color: #A0AEC0;
      margin-bottom: 1rem;
    }

    .recipe-actions {
      display: flex;
      gap: 1rem;

      .action-btn {
        flex: 1;
        padding: 0.75rem;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        font-size: 0.9rem;

        &.view {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;

          &:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
          }
        }

        &.remove {
          background: #F7FAFC;
          color: #F56565;
          border: 2px solid #F56565;

          &:hover {
            background: #F56565;
            color: white;
          }
        }
      }
    }
  }
`;

const FavoritesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
`;

const Favorites = () => {
  const { getFavoriteRecipes, toggleFavorite } = useAuth();
  const [favoriteRecipes, setFavoriteRecipes] = useState([]);

  useEffect(() => {
    const recipes = getFavoriteRecipes();
    setFavoriteRecipes(recipes);
  }, []);

  const handleRemoveFavorite = (recipe) => {
    toggleFavorite(recipe);
    const updatedRecipes = getFavoriteRecipes();
    setFavoriteRecipes(updatedRecipes);

    toast.success('Removed from favorites', {
      icon: '💔',
      style: {
        borderRadius: '12px',
        background: '#718096',
        color: '#fff',
        fontWeight: '600'
      },
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <FavoritesContainer
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
          <FaHeart className="title-icon" />
          Your Favorite Recipes ({favoriteRecipes.length})
        </h1>
      </PageHeader>

      {favoriteRecipes.length === 0 ? (
        <EmptyState
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
        >
          <FaHeart className="empty-icon" />
          <h2>No favorites yet!</h2>
          <p>
            Start exploring recipes and add your favorites to build your personal collection.
            Find recipes that transform your leftovers into amazing meals!
          </p>
          <a href="/smart-finder" className="cta-button">
            <FaStar />
            Find Recipes
          </a>
        </EmptyState>
      ) : (
        <FavoritesGrid>
          {favoriteRecipes.map((recipe, index) => (
            <FavoriteCard
              key={recipe.id}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="recipe-image-container">
                <img
                  src={recipe.image || 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=636&h=393&fit=crop&auto=format&q=80'}
                  alt={recipe.title}
                  className="recipe-image"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=636&h=393&fit=crop&auto=format&q=80';
                  }}
                />
                <button
                  className="remove-favorite"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveFavorite(recipe);
                  }}
                >
                  <FaTimes />
                </button>
              </div>

              <div className="recipe-content">
                <div className="recipe-title">{recipe.title}</div>

                <div className="recipe-meta">
                  <div className="meta-item">
                    <FaClock className="meta-icon" />
                    {recipe.readyInMinutes || 30}m
                  </div>
                  <div className="meta-item">
                    <FaUsers className="meta-icon" />
                    Serves {recipe.servings || 4}
                  </div>
                  <div className="meta-item">
                    <FaStar className="meta-icon" />
                    {(recipe.rating || 4).toFixed(1)}
                  </div>
                </div>

                {recipe.addedAt && (
                  <div className="added-date">
                    Added on {formatDate(recipe.addedAt)}
                  </div>
                )}

                <div className="recipe-actions">
                  <button className="action-btn view">
                    <FaEye />
                    View Recipe
                  </button>
                  <button
                    className="action-btn remove"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFavorite(recipe);
                    }}
                  >
                    <FaTimes />
                    Remove
                  </button>
                </div>
              </div>
            </FavoriteCard>
          ))}
        </FavoritesGrid>
      )}
    </FavoritesContainer>
  );
};

export default Favorites;
