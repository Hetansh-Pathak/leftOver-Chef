import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaHeart, FaStar } from 'react-icons/fa';

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

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    // In a real app, fetch user's favorites from API
    setFavorites([]);
  }, []);

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
          Your Favorite Recipes
        </h1>
      </PageHeader>

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
    </FavoritesContainer>
  );
};

export default Favorites;
