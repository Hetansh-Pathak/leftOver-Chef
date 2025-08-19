import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import styled, { ThemeProvider, createGlobalStyle } from 'styled-components';
import { motion } from 'framer-motion';

// Contexts
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Components
import AppLayout from './components/AppLayout';
import Welcome from './pages/Welcome';
import Login from './pages/Login';
import Home from './pages/Home';
import SmartFinder from './pages/SmartFinder';
import Favorites from './pages/Favorites';
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

const ContentWrapper = styled.div`
  position: relative;
  z-index: 1;
  min-height: 100vh;
`;

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%)'
      }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          style={{ fontSize: '3rem' }}
        >
          🍳
        </motion.div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/welcome" replace />;
};

// App Routes Component
const AppRoutes = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/welcome" element={<Welcome />} />
      <Route path="/login" element={<Login />} />

      {/* Protected Routes */}
      <Route path="/" element={
        <ProtectedRoute>
          <Home />
        </ProtectedRoute>
      } />
      <Route path="/smart-finder" element={
        <ProtectedRoute>
          <SmartFinder />
        </ProtectedRoute>
      } />
      <Route path="/favorites" element={
        <ProtectedRoute>
          <Favorites />
        </ProtectedRoute>
      } />
      <Route path="/daily" element={
        <ProtectedRoute>
          <DailyRecipe />
        </ProtectedRoute>
      } />

      {/* Redirect to welcome if not authenticated, otherwise to home */}
      <Route path="*" element={
        <Navigate to={isAuthenticated ? "/" : "/welcome"} replace />
      } />
    </Routes>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <GlobalStyle />
        <AuthProvider>
          <Router>
            <AppContainer
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <ContentWrapper>
                <AppLayout>
                  <AppRoutes />
                </AppLayout>
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
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;