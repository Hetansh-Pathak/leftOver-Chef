import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import styled, { ThemeProvider, createGlobalStyle } from 'styled-components';
import { motion } from 'framer-motion';

// Components
import Navbar from './components/Navbar';
import Home from './pages/Home';
import SmartFinder from './pages/SmartFinder';
import Favorites from './pages/Favorites';
import AddRecipe from './pages/AddRecipe';
import RecipeDetail from './pages/RecipeDetail';
import DailyRecipe from './pages/DailyRecipe';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Theme
const theme = {
  colors: {
    primary: '#667eea',
    secondary: '#764ba2',
    accent: '#ff6b6b',
    success: '#4caf50',
    warning: '#ff9800',
    danger: '#f44336',
    gold: '#ffd700',
    textDark: '#333',
    textLight: '#666',
    textMuted: '#999',
    backgroundLight: '#f8f9fa',
    white: '#ffffff',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%)'
  },
  breakpoints: {
    mobile: '768px',
    tablet: '1024px',
    desktop: '1200px'
  },
  borderRadius: '12px',
  shadows: {
    card: '0 8px 16px rgba(0, 0, 0, 0.1)',
    cardHover: '0 12px 24px rgba(0, 0, 0, 0.15)'
  },
  transitions: {
    default: 'all 0.3s ease',
    fast: 'all 0.2s ease',
    slow: 'all 0.5s ease'
  }
};

// Global Styles
const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background: ${props => props.theme.colors.gradient};
    background-size: 400% 400%;
    animation: gradientShift 15s ease infinite;
    min-height: 100vh;
    color: ${props => props.theme.colors.textDark};
    line-height: 1.6;
    overflow-x: hidden;
  }

  @keyframes gradientShift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }

  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }

  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  }

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes slideInLeft {
    from {
      opacity: 0;
      transform: translateX(-30px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  .fade-in-up {
    animation: fadeInUp 0.6s ease-out;
  }

  .slide-in-left {
    animation: slideInLeft 0.6s ease-out;
  }

  .float {
    animation: float 3s ease-in-out infinite;
  }

  .pulse {
    animation: pulse 2s ease-in-out infinite;
  }

  /* Scrollbar Styles */
  ::-webkit-scrollbar {
    width: 8px;
  }

  ::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 4px;
    
    &:hover {
      background: rgba(255, 255, 255, 0.5);
    }
  }
`;

const AppContainer = styled(motion.div)`
  min-height: 100vh;
  position: relative;
`;

const BackgroundDecorations = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 1px, transparent 1px);
    background-size: 50px 50px;
    animation: float 20s linear infinite;
  }

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: radial-gradient(ellipse at top, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
  }
`;

const ContentWrapper = styled.div`
  position: relative;
  z-index: 1;
  min-height: 100vh;
`;

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <GlobalStyle />
        <Router>
          <AppContainer
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <BackgroundDecorations />
            <ContentWrapper>
              <Navbar />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/smart-finder" element={<SmartFinder />} />
                <Route path="/favorites" element={<Favorites />} />
                <Route path="/add-recipe" element={<AddRecipe />} />
                <Route path="/recipe/:id" element={<RecipeDetail />} />
                <Route path="/daily" element={<DailyRecipe />} />
              </Routes>
            </ContentWrapper>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: theme.colors.white,
                  color: theme.colors.textDark,
                  boxShadow: theme.shadows.card,
                  borderRadius: theme.borderRadius,
                },
              }}
            />
          </AppContainer>
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
