import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Flex, 
  Heading, 
  Text, 
  useColorModeValue,
  VStack,
  Spinner,
  Image
} from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { motion } from 'framer-motion';
import Logo from './Logo';

/**
 * Modern SplashScreen Component - Initial loading screen with animations
 * 
 * @param {Object} props - Component properties
 * @param {Function} props.setShowSplash - Function to control splash screen visibility
 */
const SplashScreen = ({ setShowSplash }) => {
  // Colors based on the current color mode (dark/light)
  const bgColor = useColorModeValue('white', 'gray.900');
  const textColor = useColorModeValue('gray.800', 'white');
  const accentColor = useColorModeValue('blue.500', 'blue.400');
  const mutedColor = useColorModeValue('gray.500', 'gray.400');
  
  // State for animation sequence
  const [isExiting, setIsExiting] = useState(false);
  const [loadingText, setLoadingText] = useState('Loading application');
  const [loadingProgress, setLoadingProgress] = useState(0);
  
  // Simulated loading progress
  useEffect(() => {
    const timer = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + 5;
      });
    }, 100);
    
    return () => clearInterval(timer);
  }, []);
  
  // Loading text animation
  useEffect(() => {
    const texts = [
      'Loading application',
      'Initializing editor',
      'Setting up collaboration',
      'Almost ready'
    ];
    
    let currentIndex = 0;
    const interval = setInterval(() => {
      currentIndex = (currentIndex + 1) % texts.length;
      setLoadingText(texts[currentIndex]);
    }, 1200);
    
    return () => clearInterval(interval);
  }, []);
  
  // Exit animation sequence
  useEffect(() => {
    // Start exit animation after loading reaches 100%
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
    }, 2500);
    
    // Hide splash completely after exit animation
    const hideTimer = setTimeout(() => {
      setShowSplash(false);
    }, 3000);
    
    return () => {
      clearTimeout(exitTimer);
      clearTimeout(hideTimer);
    };
  }, [setShowSplash]);
  
  // Custom pulse animation using emotion keyframes
  const pulse = keyframes`
    0% { transform: scale(0.95); }
    50% { transform: scale(1.05); }
    100% { transform: scale(0.95); }
  `;
  
  const pulseAnimation = `${pulse} 3s infinite ease-in-out`;
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999
      }}
    >
      <Flex 
        position="fixed"
        top="0"
        left="0"
        right="0"
        bottom="0"
        height="100vh" 
        width="100vw" 
        justifyContent="center" 
        alignItems="center"
        bg={bgColor}
        color={textColor}
        opacity={isExiting ? 0 : 1}
        transition="opacity 0.5s ease-in-out"
      >
        <VStack spacing={6} align="center" textAlign="center" maxW="400px">
          <Box 
            opacity={isExiting ? 0 : 1}
            transform={isExiting ? 'scale(0.9)' : 'scale(1)'}
            transition="all 0.5s ease-in-out"
            animation={pulseAnimation}
          >
            <Logo height="90px" />
          </Box>
          
          <VStack spacing={1} mt={4}>
            <Heading 
              size="xl" 
              color={textColor}
              fontWeight="bold"
              letterSpacing="tight"
              opacity={isExiting ? 0 : 1}
              transform={isExiting ? 'translateY(-10px)' : 'translateY(0)'}
              transition="all 0.5s ease-in-out"
            >
              CollabMD
            </Heading>
            <Text 
              color={accentColor} 
              fontWeight="medium"
              fontSize="lg"
              opacity={isExiting ? 0 : 1}
              transition="all 0.5s ease-in-out 0.1s"
            >
              Collaborative Markdown Editor
            </Text>
          </VStack>
          
          {/* Loading bar */}
          <Box 
            w="250px" 
            h="3px" 
            bg={useColorModeValue('gray.100', 'gray.700')} 
            borderRadius="full"
            overflow="hidden"
            mt={6}
            opacity={isExiting ? 0 : 1}
            transition="opacity 0.5s ease-in-out"
          >
            <Box 
              h="100%" 
              w={`${loadingProgress}%`} 
              bg={accentColor} 
              borderRadius="full"
              transition="width 0.3s ease-out"
            />
          </Box>
          
          <Text 
            fontSize="sm" 
            color={mutedColor} 
            mt={2}
            opacity={isExiting ? 0 : 1}
            transition="all 0.5s ease-in-out 0.2s"
          >
            {loadingText}
          </Text>
          
          <Text 
            fontSize="xs" 
            color={mutedColor} 
            mt={4}
            opacity={isExiting ? 0 : loadingProgress < 100 ? 0.7 : 0}
            transition="all 0.5s ease-in-out"
          >
            Real-time collaboration for teams
          </Text>
        </VStack>
      </Flex>
    </motion.div>
  );
};

export default SplashScreen;