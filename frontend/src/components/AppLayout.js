import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Navbar from './Navbar';

const AppLayout = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  
  // Pages where navbar should not be shown
  const noNavbarPages = ['/welcome', '/login'];
  const shouldShowNavbar = isAuthenticated && !noNavbarPages.includes(location.pathname);

  return (
    <>
      {shouldShowNavbar && <Navbar />}
      {children}
    </>
  );
};

export default AppLayout;
