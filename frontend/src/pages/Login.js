import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaUser, 
  FaLock, 
  FaEye, 
  FaEyeSlash, 
  FaSignInAlt, 
  FaUserPlus,
  FaGoogle,
  FaFacebook,
  FaUtensils
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

const LoginContainer = styled(motion.div)`
  min-height: 100vh;
  background: ${props => props.theme.colors.gradient};
  background-size: 400% 400%;
  animation: gradientShift 15s ease infinite;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: radial-gradient(circle at 20% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
    pointer-events: none;
  }
`;

const LoginCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 3rem;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  max-width: 450px;
  width: 100%;
  position: relative;
  z-index: 1;

  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    padding: 2rem;
    margin: 1rem;
  }
`;

const BackButton = styled(motion.button)`
  position: absolute;
  top: 2rem;
  left: 2rem;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  transition: all 0.3s ease;
  z-index: 2;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateX(-5px);
  }
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 2.5rem;
`;

const Logo = styled(motion.div)`
  font-size: 4rem;
  margin-bottom: 1rem;
  display: inline-block;
`;

const Title = styled(motion.h1)`
  font-size: 2rem;
  font-weight: 700;
  color: ${props => props.theme.colors.textDark};
  margin-bottom: 0.5rem;
`;

const Subtitle = styled(motion.p)`
  color: ${props => props.theme.colors.textLight};
  font-size: 1rem;
`;

const TabContainer = styled.div`
  display: flex;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 50px;
  padding: 4px;
  margin-bottom: 2rem;
`;

const Tab = styled(motion.button)`
  flex: 1;
  background: ${props => props.active ? 'white' : 'transparent'};
  color: ${props => props.active ? props.theme.colors.primary : props.theme.colors.textLight};
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 50px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: ${props => props.active ? '0 4px 12px rgba(102, 126, 234, 0.2)' : 'none'};

  &:hover {
    background: ${props => props.active ? 'white' : 'rgba(255, 255, 255, 0.5)'};
  }
`;

const Form = styled(motion.form)`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const InputGroup = styled(motion.div)`
  position: relative;
`;

const InputIcon = styled.div`
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: ${props => props.theme.colors.textLight};
  font-size: 1.1rem;
  z-index: 1;
`;

const Input = styled(motion.input)`
  width: 100%;
  padding: 1rem 1rem 1rem 3rem;
  border: 2px solid rgba(102, 126, 234, 0.2);
  border-radius: 12px;
  font-size: 1rem;
  background: rgba(255, 255, 255, 0.8);
  color: ${props => props.theme.colors.textDark};
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    background: white;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  &::placeholder {
    color: ${props => props.theme.colors.textMuted};
  }
`;

const PasswordToggle = styled(motion.button)`
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: ${props => props.theme.colors.textLight};
  cursor: pointer;
  font-size: 1.1rem;
  padding: 0.25rem;
  border-radius: 4px;
  transition: all 0.2s ease;

  &:hover {
    color: ${props => props.theme.colors.primary};
    background: rgba(102, 126, 234, 0.1);
  }
`;

const SubmitButton = styled(motion.button)`
  background: ${props => props.theme.colors.gradient};
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1rem;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  margin: 1.5rem 0;
  
  &::before,
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: rgba(102, 126, 234, 0.2);
  }
  
  span {
    margin: 0 1rem;
    color: ${props => props.theme.colors.textLight};
    font-size: 0.9rem;
  }
`;

const SocialButtons = styled.div`
  display: flex;
  gap: 1rem;
`;

const SocialButton = styled(motion.button)`
  flex: 1;
  background: white;
  border: 2px solid rgba(102, 126, 234, 0.2);
  color: ${props => props.theme.colors.textDark};
  padding: 0.75rem;
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-weight: 500;
  transition: all 0.3s ease;

  &:hover {
    border-color: ${props => props.theme.colors.primary};
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }

  .social-icon {
    font-size: 1.2rem;
    
    &.google { color: #DB4437; }
    &.facebook { color: #4267B2; }
  }
`;

const ForgotPassword = styled(motion.button)`
  background: none;
  border: none;
  color: ${props => props.theme.colors.primary};
  cursor: pointer;
  font-size: 0.9rem;
  text-align: center;
  margin-top: 0.5rem;
  padding: 0.5rem;
  border-radius: 6px;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(102, 126, 234, 0.1);
  }
`;

const Login = () => {
  const navigate = useNavigate();
  const { loginUser, registerUser, googleAuth, facebookAuth } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });

  // Initialize Google API
  useEffect(() => {
    const initializeGapi = async () => {
      if (window.gapi) {
        await window.gapi.load('auth2', () => {
          window.gapi.auth2.init({
            client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID || 'demo-google-client-id'
          });
        });
      }
    };

    // Load Google API script if not already loaded
    if (!window.gapi) {
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = initializeGapi;
      document.body.appendChild(script);
    } else {
      initializeGapi();
    }
  }, []);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let result;
      
      if (isLogin) {
        // Login
        result = await loginUser({
          email: formData.email,
          password: formData.password
        });
      } else {
        // Registration
        result = await registerUser({
          name: formData.name,
          email: formData.email,
          password: formData.password
        });
      }
      
      setIsLoading(false);
      
      if (result.success) {
        toast.success(`${isLogin ? 'Login' : 'Registration'} successful!`);
        navigate('/');
      } else {
        // Handle specific error types
        if (result.userNotFound) {
          toast.error('No account found. Please sign up first!');
          setIsLogin(false); // Switch to signup mode
        } else if (result.invalidPassword) {
          toast.error('Invalid password. Please try again.');
        } else {
          toast.error(result.error || 'Something went wrong');
        }
      }
    } catch (error) {
      setIsLoading(false);
      toast.error('Network error. Please try again.');
      console.error('Authentication error:', error);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      if (!window.gapi || !window.gapi.auth2) {
        toast.error('Google API not loaded. Please refresh the page.');
        return;
      }

      const authInstance = window.gapi.auth2.getAuthInstance();
      const googleUser = await authInstance.signIn();
      const idToken = googleUser.getAuthResponse().id_token;

      setIsLoading(true);
      const result = await googleAuth(idToken, !isLogin);
      setIsLoading(false);

      if (result.success) {
        toast.success(`Google ${isLogin ? 'login' : 'registration'} successful!`);
        navigate('/');
      } else {
        if (result.userExists && !isLogin) {
          toast.error('Account already exists. Please sign in instead.');
          setIsLogin(true);
        } else if (result.userNotFound && isLogin) {
          toast.error('No account found. Please sign up first.');
          setIsLogin(false);
        } else {
          toast.error(result.error || 'Google authentication failed');
        }
      }
    } catch (error) {
      setIsLoading(false);
      console.error('Google login error:', error);
      toast.error('Google login failed. Please try again.');
    }
  };

  const handleFacebookLogin = () => {
    // For demo purposes, we'll simulate Facebook login
    // In production, you would integrate with Facebook SDK
    setIsLoading(true);
    
    setTimeout(async () => {
      const mockFacebookData = {
        accessToken: 'demo-facebook-token',
        userID: 'demo-user-' + Date.now()
      };

      const result = await facebookAuth(
        mockFacebookData.accessToken, 
        mockFacebookData.userID, 
        !isLogin
      );
      
      setIsLoading(false);

      if (result.success) {
        toast.success(`Facebook ${isLogin ? 'login' : 'registration'} successful!`);
        navigate('/');
      } else {
        if (result.userExists && !isLogin) {
          toast.error('Account already exists. Please sign in instead.');
          setIsLogin(true);
        } else if (result.userNotFound && isLogin) {
          toast.error('No account found. Please sign up first.');
          setIsLogin(false);
        } else {
          toast.error(result.error || 'Facebook authentication failed');
        }
      }
    }, 1000);
  };

  const handleBack = () => {
    navigate('/welcome');
  };

  return (
    <LoginContainer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <BackButton
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleBack}
      >
        ←
      </BackButton>

      <LoginCard
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        <Header>
          <Logo
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.4, duration: 0.8, type: "spring" }}
          >
            <FaUtensils />
          </Logo>
          <Title
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            Welcome Back!
          </Title>
          <Subtitle
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
          >
            Sign in to continue your culinary journey
          </Subtitle>
        </Header>

        <TabContainer>
          <Tab
            active={isLogin}
            onClick={() => setIsLogin(true)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Sign In
          </Tab>
          <Tab
            active={!isLogin}
            onClick={() => setIsLogin(false)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Sign Up
          </Tab>
        </TabContainer>

        <AnimatePresence mode="wait">
          <Form
            key={isLogin ? 'login' : 'signup'}
            initial={{ opacity: 0, x: isLogin ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: isLogin ? 20 : -20 }}
            transition={{ duration: 0.3 }}
            onSubmit={handleSubmit}
          >
            {!isLogin && (
              <InputGroup
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <InputIcon>
                  <FaUser />
                </InputIcon>
                <Input
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required={!isLogin}
                />
              </InputGroup>
            )}

            <InputGroup
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: isLogin ? 0.1 : 0.2 }}
            >
              <InputIcon>
                <FaUser />
              </InputIcon>
              <Input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </InputGroup>

            <InputGroup
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: isLogin ? 0.2 : 0.3 }}
            >
              <InputIcon>
                <FaLock />
              </InputIcon>
              <Input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
              <PasswordToggle
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </PasswordToggle>
            </InputGroup>

            <SubmitButton
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: isLogin ? 0.3 : 0.4 }}
            >
              {isLoading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  ⏳
                </motion.div>
              ) : (
                <>
                  {isLogin ? <FaSignInAlt /> : <FaUserPlus />}
                  {isLogin ? 'Sign In' : 'Create Account'}
                </>
              )}
            </SubmitButton>

            {isLogin && (
              <ForgotPassword
                type="button"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Forgot your password?
              </ForgotPassword>
            )}
          </Form>
        </AnimatePresence>

        <Divider>
          <span>or continue with</span>
        </Divider>

        <SocialButtons>
          <SocialButton
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleGoogleLogin}
            disabled={isLoading}
          >
            <FaGoogle className="social-icon google" />
            Google
          </SocialButton>
          <SocialButton
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleFacebookLogin}
            disabled={isLoading}
          >
            <FaFacebook className="social-icon facebook" />
            Facebook
          </SocialButton>
        </SocialButtons>
      </LoginCard>
    </LoginContainer>
  );
};

export default Login;
