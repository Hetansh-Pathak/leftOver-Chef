import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUtensils, FaPlay, FaLeaf, FaClock, FaFire, FaHeart, FaStar } from 'react-icons/fa';

const float = keyframes`
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(180deg); }
`;

const sparkle = keyframes`
  0%, 100% { opacity: 0; transform: scale(0) rotate(0deg); }
  50% { opacity: 1; transform: scale(1) rotate(180deg); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
`;

const WelcomeContainer = styled(motion.div)`
  position: relative;
  width: 100vw;
  height: 100vh;
  background: ${props => props.theme.colors.gradient};
  background-size: 400% 400%;
  animation: gradientShift 10s ease infinite;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
`;

const FloatingParticles = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
`;

const Particle = styled(motion.div)`
  position: absolute;
  color: rgba(255, 255, 255, 0.6);
  font-size: ${props => props.size || '2rem'};
  animation: ${float} ${props => props.duration || '6s'} ease-in-out infinite;
  animation-delay: ${props => props.delay || '0s'};
`;

const Sparkle = styled(motion.div)`
  position: absolute;
  width: 4px;
  height: 4px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  animation: ${sparkle} 2s ease-in-out infinite;
  animation-delay: ${props => props.delay || '0s'};
`;

const MainContent = styled(motion.div)`
  text-align: center;
  z-index: 2;
  max-width: 600px;
  padding: 2rem;
`;

const LogoContainer = styled(motion.div)`
  margin-bottom: 3rem;
  position: relative;
`;

const LogoIcon = styled(motion.div)`
  font-size: 8rem;
  margin-bottom: 1rem;
  display: inline-block;
  filter: drop-shadow(0 10px 20px rgba(0, 0, 0, 0.2));
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    font-size: 6rem;
  }
`;

const AppName = styled(motion.h1)`
  font-size: 4rem;
  font-weight: 800;
  color: white;
  margin-bottom: 0.5rem;
  text-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  letter-spacing: -2px;
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    font-size: 3rem;
    letter-spacing: -1px;
  }
`;

const AppTagline = styled(motion.p)`
  font-size: 1.5rem;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 4rem;
  font-weight: 300;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  line-height: 1.4;
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    font-size: 1.2rem;
    margin-bottom: 3rem;
  }
`;

const StartButton = styled(motion.button)`
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(20px);
  border: 2px solid rgba(255, 255, 255, 0.3);
  color: white;
  font-size: 1.3rem;
  font-weight: 600;
  padding: 1.5rem 3rem;
  border-radius: 50px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 0 auto;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 1px;
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
    border-color: rgba(255, 255, 255, 0.5);
    transform: translateY(-5px);
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
  }
  
  .play-icon {
    animation: ${pulse} 2s ease-in-out infinite;
  }
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    font-size: 1.1rem;
    padding: 1.2rem 2.5rem;
  }
`;

const LoadingProgress = styled(motion.div)`
  position: absolute;
  bottom: 4rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
`;

const ProgressText = styled(motion.p)`
  color: rgba(255, 255, 255, 0.8);
  font-size: 1rem;
  font-weight: 500;
`;

const ProgressBar = styled(motion.div)`
  width: 200px;
  height: 4px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
  overflow: hidden;
`;

const ProgressFill = styled(motion.div)`
  height: 100%;
  background: linear-gradient(90deg, #fff, rgba(255, 255, 255, 0.7));
  border-radius: 2px;
`;

const Welcome = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);

  const particles = [
    { icon: FaUtensils, top: '10%', left: '15%', delay: '0s', duration: '8s', size: '2.5rem' },
    { icon: FaLeaf, top: '20%', right: '20%', delay: '1s', duration: '7s', size: '2rem' },
    { icon: FaClock, top: '60%', left: '10%', delay: '2s', duration: '9s', size: '2.2rem' },
    { icon: FaFire, top: '70%', right: '15%', delay: '3s', duration: '6s', size: '1.8rem' },
    { icon: FaHeart, top: '30%', left: '5%', delay: '4s', duration: '10s', size: '2.3rem' },
    { icon: FaStar, top: '50%', right: '8%', delay: '5s', duration: '8s', size: '2rem' },
  ];

  const sparkles = Array.from({ length: 20 }, (_, i) => ({
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 3}s`,
  }));

  const handleStart = () => {
    setIsLoading(true);
    
    // Simulate loading progress
    const interval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            navigate('/login');
          }, 500);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 100);
  };

  return (
    <WelcomeContainer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
    >
      <FloatingParticles>
        {particles.map((particle, index) => {
          const IconComponent = particle.icon;
          return (
            <Particle
              key={index}
              style={{
                top: particle.top,
                left: particle.left,
                right: particle.right,
              }}
              delay={particle.delay}
              duration={particle.duration}
              size={particle.size}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 + index * 0.2, duration: 0.8 }}
            >
              <IconComponent />
            </Particle>
          );
        })}
        
        {sparkles.map((sparkle, index) => (
          <Sparkle
            key={index}
            style={{
              top: sparkle.top,
              left: sparkle.left,
            }}
            delay={sparkle.delay}
          />
        ))}
      </FloatingParticles>

      <MainContent>
        <LogoContainer>
          <LogoIcon
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ 
              delay: 0.5, 
              duration: 1.2, 
              type: "spring", 
              stiffness: 200 
            }}
            whileHover={{ 
              scale: 1.1, 
              rotate: 360,
              transition: { duration: 0.6 }
            }}
          >
            🍳
          </LogoIcon>
        </LogoContainer>

        <AppName
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.8 }}
        >
          Leftover Chef
        </AppName>

        <AppTagline
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3, duration: 0.8 }}
        >
          Turn Your Leftovers Into Delicious Meals
        </AppTagline>

        <AnimatePresence>
          {!isLoading ? (
            <StartButton
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ delay: 1.6, duration: 0.6 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleStart}
            >
              <FaPlay className="play-icon" />
              Start Cooking
            </StartButton>
          ) : (
            <LoadingProgress
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <ProgressText>Preparing your kitchen...</ProgressText>
              <ProgressBar>
                <ProgressFill
                  initial={{ width: 0 }}
                  animate={{ width: `${loadingProgress}%` }}
                  transition={{ duration: 0.2 }}
                />
              </ProgressBar>
            </LoadingProgress>
          )}
        </AnimatePresence>
      </MainContent>
    </WelcomeContainer>
  );
};

export default Welcome;
