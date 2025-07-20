import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaBrain, 
  FaHeart, 
  FaPlus, 
  FaStar, 
  FaBars, 
  FaTimes,
  FaUtensils,
  FaHome,
  FaSignOutAlt,
  FaUser
} from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';

const NavbarContainer = styled(motion.nav)`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  padding: 1rem 2rem;
  box-shadow: ${props => props.theme.shadows.card};
  position: sticky;
  top: 0;
  z-index: 1000;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);

  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    padding: 1rem;
  }
`;

const NavContent = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Logo = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.8rem;
  font-weight: 700;
  color: ${props => props.theme.colors.primary};
  text-decoration: none;
  cursor: pointer;

  .logo-icon {
    font-size: 2rem;
    animation: float 3s ease-in-out infinite;
  }

  .logo-text {
    background: ${props => props.theme.colors.gradient};
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    font-size: 1.5rem;
    
    .logo-icon {
      font-size: 1.8rem;
    }
  }
`;

const NavLinks = styled.div`
  display: flex;
  gap: 2rem;
  align-items: center;

  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    display: none;
  }
`;

const NavLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 25px;
  text-decoration: none;
  color: ${props => props.theme.colors.textDark};
  font-weight: 500;
  position: relative;
  transition: ${props => props.theme.transitions.default};
  background: ${props => props.isActive ? 
    `linear-gradient(45deg, ${props.theme.colors.primary}, ${props.theme.colors.secondary})` : 
    'transparent'
  };
  color: ${props => props.isActive ? 'white' : props.theme.colors.textDark};
  transform: ${props => props.isActive ? 'translateY(-2px)' : 'translateY(0)'};
  box-shadow: ${props => props.isActive ? props.theme.shadows.cardHover : 'none'};

  &:hover {
    background: ${props => props.isActive ? 
      `linear-gradient(45deg, ${props.theme.colors.primary}, ${props.theme.colors.secondary})` : 
      'rgba(102, 126, 234, 0.1)'
    };
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadows.card};
  }

  .nav-icon {
    font-size: 1.1rem;
    transition: ${props => props.theme.transitions.fast};
  }

  &:hover .nav-icon {
    transform: scale(1.1);
  }
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const UserMenu = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 1rem;

  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    display: none;
  }
`;

const UserButton = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(102, 126, 234, 0.1);
  border: 1px solid rgba(102, 126, 234, 0.2);
  color: ${props => props.theme.colors.primary};
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 500;
  font-size: 0.9rem;
`;

const LogoutButton = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: 1px solid ${props => props.theme.colors.accent};
  color: ${props => props.theme.colors.accent};
  padding: 0.5rem 1rem;
  border-radius: 20px;
  cursor: pointer;
  font-weight: 500;
  font-size: 0.9rem;
  transition: ${props => props.theme.transitions.default};

  &:hover {
    background: ${props => props.theme.colors.accent};
    color: white;
    transform: translateY(-1px);
  }
`;

const MobileMenuButton = styled(motion.button)`
  display: none;
  background: none;
  border: none;
  font-size: 1.5rem;
  color: ${props => props.theme.colors.primary};
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: ${props => props.theme.transitions.fast};

  &:hover {
    background: rgba(102, 126, 234, 0.1);
  }

  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    display: block;
  }
`;

const MobileMenu = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(20px);
  z-index: 9999;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 2rem;
`;

const MobileNavLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 2rem;
  border-radius: 25px;
  text-decoration: none;
  color: ${props => props.theme.colors.textDark};
  font-weight: 600;
  font-size: 1.2rem;
  background: ${props => props.isActive ? 
    `linear-gradient(45deg, ${props.theme.colors.primary}, ${props.theme.colors.secondary})` : 
    'rgba(102, 126, 234, 0.1)'
  };
  color: ${props => props.isActive ? 'white' : props.theme.colors.textDark};
  width: 80%;
  max-width: 300px;
  text-align: center;
  justify-content: center;
  transition: ${props => props.theme.transitions.default};

  &:hover {
    background: linear-gradient(45deg, ${props => props.theme.colors.primary}, ${props => props.theme.colors.secondary});
    color: white;
    transform: scale(1.05);
  }

  .nav-icon {
    font-size: 1.3rem;
  }
`;

const MobileLogoutButton = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 2rem;
  border-radius: 25px;
  border: none;
  font-weight: 600;
  font-size: 1.2rem;
  background: linear-gradient(45deg, #ff6b6b, #ff8e8e);
  color: white;
  width: 80%;
  max-width: 300px;
  text-align: center;
  justify-content: center;
  cursor: pointer;
  transition: ${props => props.theme.transitions.default};

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 8px 25px rgba(255, 107, 107, 0.3);
  }

  .nav-icon {
    font-size: 1.3rem;
  }
`;

const CloseButton = styled(motion.button)`
  position: absolute;
  top: 2rem;
  right: 2rem;
  background: none;
  border: none;
  font-size: 2rem;
  color: ${props => props.theme.colors.primary};
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: ${props => props.theme.transitions.fast};

  &:hover {
    background: rgba(102, 126, 234, 0.1);
    transform: rotate(90deg);
  }
`;

const navItems = [
  { path: '/', label: 'Home', icon: FaHome },
  { path: '/smart-finder', label: 'Smart Finder', icon: FaBrain },
  { path: '/favorites', label: 'Favorites', icon: FaHeart },
  { path: '/add-recipe', label: 'Add Recipe', icon: FaPlus },
  { path: '/daily', label: 'Daily Recipe', icon: FaStar },
];

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <NavbarContainer
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        style={{
          background: scrolled ? 'rgba(255, 255, 255, 0.98)' : 'rgba(255, 255, 255, 0.95)',
          boxShadow: scrolled ? '0 12px 24px rgba(0, 0, 0, 0.15)' : '0 8px 16px rgba(0, 0, 0, 0.1)'
        }}
      >
        <NavContent>
          <Logo
            as={Link}
            to="/"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              className="logo-icon"
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
            >
              🍳
            </motion.div>
            <span className="logo-text">Leftover Chef</span>
          </Logo>

          <NavLinks>
            {navItems.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <motion.div
                  key={item.path}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                >
                  <NavLink
                    to={item.path}
                    isActive={location.pathname === item.path}
                  >
                    <IconComponent className="nav-icon" />
                    {item.label}
                  </NavLink>
                </motion.div>
              );
            })}
          </NavLinks>

          <RightSection>
            <UserMenu>
              <UserButton>
                <FaUser />
                {user?.name || 'User'}
              </UserButton>
              <LogoutButton
                onClick={handleLogout}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <FaSignOutAlt />
                Logout
              </LogoutButton>
            </UserMenu>

            <MobileMenuButton
              onClick={toggleMobileMenu}
              whileTap={{ scale: 0.9 }}
            >
              <FaBars />
            </MobileMenuButton>
          </RightSection>
        </NavContent>
      </NavbarContainer>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <MobileMenu
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
          >
            <CloseButton
              onClick={toggleMobileMenu}
              whileTap={{ scale: 0.9 }}
            >
              <FaTimes />
            </CloseButton>

            {navItems.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <motion.div
                  key={item.path}
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.3 }}
                >
                  <MobileNavLink
                    to={item.path}
                    isActive={location.pathname === item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <IconComponent className="nav-icon" />
                    {item.label}
                  </MobileNavLink>
                </motion.div>
              );
            })}
            
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: navItems.length * 0.1, duration: 0.3 }}
            >
              <MobileLogoutButton
                onClick={handleLogout}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <FaSignOutAlt className="nav-icon" />
                Logout
              </MobileLogoutButton>
            </motion.div>
          </MobileMenu>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
