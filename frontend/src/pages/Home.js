import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { 
  FaBrain, 
  FaHeart, 
  FaPlus, 
  FaStar, 
  FaUtensils,
  FaClock,
  FaLeaf,
  FaFire
} from 'react-icons/fa';
import axios from 'axios';

const HomeContainer = styled(motion.div)`
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
  min-height: calc(100vh - 80px);
`;

const HeroSection = styled(motion.section)`
  text-align: center;
  padding: 4rem 0;
  margin-bottom: 4rem;
`;

const HeroTitle = styled(motion.h1)`
  font-size: 4rem;
  font-weight: 800;
  margin-bottom: 1rem;
  background: ${props => props.theme.colors.gradient};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1.2;

  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    font-size: 2.5rem;
  }
`;

const HeroSubtitle = styled(motion.p)`
  font-size: 1.5rem;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 3rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.4;

  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    font-size: 1.2rem;
    margin-bottom: 2rem;
  }
`;

const StatsContainer = styled(motion.div)`
  display: flex;
  justify-content: center;
  gap: 3rem;
  margin-bottom: 4rem;
  flex-wrap: wrap;

  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    gap: 1.5rem;
  }
`;

const StatCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(20px);
  padding: 2rem;
  border-radius: ${props => props.theme.borderRadius};
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.2);
  min-width: 150px;

  .stat-icon {
    font-size: 2rem;
    color: white;
    margin-bottom: 1rem;
    animation: float 3s ease-in-out infinite;
  }

  .stat-number {
    font-size: 2rem;
    font-weight: 700;
    color: white;
    margin-bottom: 0.5rem;
  }

  .stat-label {
    color: rgba(255, 255, 255, 0.8);
    font-size: 0.9rem;
    font-weight: 500;
  }
`;

const QuickActionsGrid = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 4rem;
`;

const ActionCard = styled(motion.div)`
  background: white;
  border-radius: ${props => props.theme.borderRadius};
  padding: 2rem;
  box-shadow: ${props => props.theme.shadows.card};
  cursor: pointer;
  transition: ${props => props.theme.transitions.default};
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 4px;
    background: ${props => props.$gradient || props.theme.colors.primary};
  }

  &:hover {
    transform: translateY(-5px);
    box-shadow: ${props => props.theme.shadows.cardHover};
  }

  .action-icon {
    font-size: 2.5rem;
    margin-bottom: 1rem;
    color: ${props => props.$color || props.theme.colors.primary};
    animation: pulse 2s ease-in-out infinite;
  }

  .action-title {
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 1rem;
    color: ${props => props.theme.colors.textDark};
  }

  .action-description {
    color: ${props => props.theme.colors.textLight};
    line-height: 1.6;
    margin-bottom: 1.5rem;
  }

  .action-button {
    background: ${props => props.$buttonColor || props.theme.colors.primary};
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 25px;
    font-weight: 500;
    cursor: pointer;
    transition: ${props => props.theme.transitions.default};
    display: flex;
    align-items: center;
    gap: 0.5rem;

    &:hover {
      transform: scale(1.05);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }
  }
`;

const FeaturedRecipeSection = styled(motion.section)`
  background: white;
  border-radius: ${props => props.theme.borderRadius};
  padding: 2rem;
  box-shadow: ${props => props.theme.shadows.card};
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h2`
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 2rem;
  color: ${props => props.theme.colors.textDark};
  text-align: center;
  
  .title-icon {
    margin-right: 0.5rem;
    color: ${props => props.theme.colors.gold};
  }
`;

const RecipeCard = styled(motion.div)`
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 2rem;
  align-items: center;

  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    grid-template-columns: 1fr;
    text-align: center;
  }

  .recipe-image {
    width: 100%;
    height: 200px;
    object-fit: cover;
    border-radius: ${props => props.theme.borderRadius};
    box-shadow: ${props => props.theme.shadows.card};
  }

  .recipe-content {
    .recipe-title {
      font-size: 1.8rem;
      font-weight: 600;
      margin-bottom: 1rem;
      color: ${props => props.theme.colors.textDark};
    }

    .recipe-description {
      color: ${props => props.theme.colors.textLight};
      margin-bottom: 1.5rem;
      line-height: 1.6;
    }

    .recipe-meta {
      display: flex;
      gap: 2rem;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;

      .meta-item {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: ${props => props.theme.colors.textLight};

        .meta-icon {
          color: ${props => props.theme.colors.primary};
        }
      }
    }

    .recipe-button {
      background: ${props => props.theme.colors.gradient};
      color: white;
      border: none;
      padding: 0.75rem 2rem;
      border-radius: 25px;
      font-weight: 600;
      cursor: pointer;
      transition: ${props => props.theme.transitions.default};
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      text-decoration: none;

      &:hover {
        transform: translateY(-2px);
        box-shadow: ${props => props.theme.shadows.cardHover};
      }
    }
  }
`;

const FloatingElements = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: -1;

  .floating-icon {
    position: absolute;
    font-size: 2rem;
    color: rgba(255, 255, 255, 0.1);
    animation: float 6s ease-in-out infinite;

    &:nth-child(1) {
      top: 20%;
      left: 10%;
      animation-delay: 0s;
    }

    &:nth-child(2) {
      top: 60%;
      right: 15%;
      animation-delay: 1s;
    }

    &:nth-child(3) {
      bottom: 30%;
      left: 20%;
      animation-delay: 2s;
    }

    &:nth-child(4) {
      top: 40%;
      right: 30%;
      animation-delay: 3s;
    }
  }
`;

const Home = () => {
  const [dailyRecipe, setDailyRecipe] = useState(null);
  const [stats, setStats] = useState({
    totalRecipes: 0,
    totalUsers: 0,
    savedMeals: 0
  });

  useEffect(() => {
    // Fetch daily recipe
    const fetchDailyRecipe = async () => {
      try {
        const response = await axios.get('/api/recipes/daily/featured');
        setDailyRecipe(response.data);
      } catch (error) {
        console.error('Error fetching daily recipe:', error);
        // Set mock data
        setDailyRecipe({
          _id: '1',
          name: 'Leftover Vegetable Stir Fry',
          description: 'A quick and delicious way to use up leftover vegetables',
          image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&h=300&fit=crop',
          prepTime: 10,
          cookTime: 8,
          servings: 4,
          difficulty: 'Easy'
        });
      }
    };

    fetchDailyRecipe();

    // Animate stats
    const animateStats = () => {
      setTimeout(() => setStats(prev => ({ ...prev, totalRecipes: 1247 })), 500);
      setTimeout(() => setStats(prev => ({ ...prev, totalUsers: 892 })), 1000);
      setTimeout(() => setStats(prev => ({ ...prev, savedMeals: 5634 })), 1500);
    };

    animateStats();
  }, []);

  const actionCards = [
    {
      icon: FaBrain,
      title: 'Smart Recipe Finder',
      description: 'Tell us what ingredients you have, and we\'ll find the perfect recipes to transform your leftovers into delicious meals.',
      color: '#9c27b0',
      buttonColor: 'linear-gradient(45deg, #667eea, #764ba2)',
      gradient: 'linear-gradient(45deg, #667eea, #764ba2)',
      link: '/smart-finder'
    },
    {
      icon: FaHeart,
      title: 'Your Favorites',
      description: 'Keep track of your favorite leftover recipes and never lose that perfect combination again.',
      color: '#ff6b6b',
      buttonColor: '#ff6b6b',
      gradient: 'linear-gradient(45deg, #ff6b6b, #ff8e8e)',
      link: '/favorites'
    },
    {
      icon: FaPlus,
      title: 'Add Recipe',
      description: 'Share your own creative leftover recipes with the community and help others reduce food waste.',
      color: '#4caf50',
      buttonColor: '#4caf50',
      gradient: 'linear-gradient(45deg, #4caf50, #66bb6a)',
      link: '/add-recipe'
    },
    {
      icon: FaStar,
      title: 'Daily Recipe',
      description: 'Discover a new featured recipe every day, specially selected for using common leftover ingredients.',
      color: '#ffd700',
      buttonColor: '#ff9800',
      gradient: 'linear-gradient(45deg, #ffd700, #ffb300)',
      link: '/daily'
    }
  ];

  return (
    <HomeContainer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <FloatingElements>
        <FaUtensils className="floating-icon" />
        <FaLeaf className="floating-icon" />
        <FaFire className="floating-icon" />
        <FaClock className="floating-icon" />
      </FloatingElements>

      <HeroSection>
        <HeroTitle
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          Turn Leftovers Into Magic
        </HeroTitle>
        <HeroSubtitle
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
        >
          Never waste food again! Our smart recipe finder transforms your leftover ingredients into delicious, creative meals.
        </HeroSubtitle>

        <StatsContainer>
          <StatCard
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            whileHover={{ scale: 1.05 }}
          >
            <FaUtensils className="stat-icon" />
            <div className="stat-number">{stats.totalRecipes.toLocaleString()}</div>
            <div className="stat-label">Recipes</div>
          </StatCard>

          <StatCard
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            whileHover={{ scale: 1.05 }}
          >
            <FaHeart className="stat-icon" />
            <div className="stat-number">{stats.totalUsers.toLocaleString()}</div>
            <div className="stat-label">Happy Cooks</div>
          </StatCard>

          <StatCard
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.0, duration: 0.5 }}
            whileHover={{ scale: 1.05 }}
          >
            <FaLeaf className="stat-icon" />
            <div className="stat-number">{stats.savedMeals.toLocaleString()}</div>
            <div className="stat-label">Meals Saved</div>
          </StatCard>
        </StatsContainer>
      </HeroSection>

      <QuickActionsGrid>
                {actionCards.map((card, index) => {
          const IconComponent = card.icon;
          return (
            <Link key={card.title} to={card.link} style={{ textDecoration: 'none' }}>
              <ActionCard
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 * index, duration: 0.6 }}
                whileHover={{ scale: 1.03 }}
                $color={card.color}
                $buttonColor={card.buttonColor}
                $gradient={card.gradient}
              >
                <IconComponent className="action-icon" />
                <div className="action-title">{card.title}</div>
                <div className="action-description">{card.description}</div>
                <div className="action-button">
                  Get Started
                  <IconComponent />
                </div>
              </ActionCard>
            </Link>
          );
        })}
      </QuickActionsGrid>

      {dailyRecipe && (
        <FeaturedRecipeSection
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <SectionTitle>
            <FaStar className="title-icon" />
            Today's Featured Recipe
          </SectionTitle>
          
          <RecipeCard>
            <motion.img
              src={dailyRecipe.image}
              alt={dailyRecipe.name}
              className="recipe-image"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            />
            
            <div className="recipe-content">
              <div className="recipe-title">{dailyRecipe.name}</div>
              <div className="recipe-description">{dailyRecipe.description}</div>
              
              <div className="recipe-meta">
                <div className="meta-item">
                  <FaClock className="meta-icon" />
                  <span>{dailyRecipe.prepTime + dailyRecipe.cookTime} min</span>
                </div>
                <div className="meta-item">
                  <FaUtensils className="meta-icon" />
                  <span>{dailyRecipe.servings} servings</span>
                </div>
                <div className="meta-item">
                  <FaFire className="meta-icon" />
                  <span>{dailyRecipe.difficulty}</span>
                </div>
              </div>
              
              <Link
                to={`/recipe/${dailyRecipe._id}`}
                className="recipe-button"
              >
                View Recipe
                <FaStar />
              </Link>
            </div>
          </RecipeCard>
        </FeaturedRecipeSection>
      )}
    </HomeContainer>
  );
};

export default Home;
