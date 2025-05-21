import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Heading, 
  Text, 
  Flex, 
  useColorModeValue, 
  Spinner,
  Stack,
  VStack // Είναι σημαντικό να υπάρχει αυτό εδώ
} from '@chakra-ui/react';
import Logo from './Logo';

/**
 * SplashScreen Component - Εμφανίζεται κατά την αρχική φόρτωση της εφαρμογής
 * @param {Object} props - Component properties
 * @param {Function} props.setShowSplash - Function to control splash screen visibility
 */
const SplashScreen = ({ setShowSplash }) => {
  // Χρώματα με βάση το τρέχον color mode (dark/light)
  const bgColor = useColorModeValue('white', 'gray.900');
  const textColor = useColorModeValue('gray.800', 'white');
  const mutedColor = useColorModeValue('gray.500', 'gray.400');
  
  // State για animation κατά το κλείσιμο
  const [isExiting, setIsExiting] = useState(false);
  
  // Εξασφάλιση ότι το splash screen θα κλείσει μετά από προκαθορισμένο χρόνο
  useEffect(() => {
    console.log("SplashScreen mounted");
    
    // Ξεκίνημα animation εξόδου μετά από 2 δευτερόλεπτα
    const exitTimer = setTimeout(() => {
      console.log("SplashScreen: Starting exit animation");
      setIsExiting(true);
    }, 2000);
    
    // Κλείσιμο του SplashScreen μετά το animation (συνολικά 2.5 δευτερόλεπτα)
    const closeTimer = setTimeout(() => {
      console.log("SplashScreen: Closing splash screen");
      setShowSplash(false);
    }, 2500);
    
    // Cleanup για την αποφυγή memory leaks
    return () => {
      console.log("SplashScreen: Cleaning up timers");
      clearTimeout(exitTimer);
      clearTimeout(closeTimer);
    };
  }, [setShowSplash]);
  
  return (
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
      zIndex="9999"
      opacity={isExiting ? 0 : 1}
      transition="opacity 0.5s ease-in-out"
    >
      <VStack spacing={6} align="center" textAlign="center">
        <Box 
          opacity={isExiting ? 0 : 1}
          transform={isExiting ? 'scale(0.9)' : 'scale(1)'}
          transition="all 0.5s ease-in-out"
        >
          <Logo height="80px" />
        </Box>
        
        <VStack spacing={1}>
          <Heading 
            size="xl" 
            color={textColor}
            opacity={isExiting ? 0 : 1}
            transform={isExiting ? 'translateY(-10px)' : 'translateY(0)'}
            transition="all 0.5s ease-in-out"
          >
            CollabMD
          </Heading>
          <Text 
            color={mutedColor} 
            fontWeight="medium"
            opacity={isExiting ? 0 : 1}
            transition="all 0.5s ease-in-out 0.1s"
          >
            Collaborative Markdown Editor
          </Text>
        </VStack>
        
        <Box mt={6}>
          <Spinner 
            size="lg" 
            color="blue.500" 
            thickness="4px"
            speed="0.8s" 
          />
        </Box>
        
        <Text 
          fontSize="sm" 
          color={mutedColor} 
          mt={4}
          opacity={isExiting ? 0 : 1}
          transition="all 0.5s ease-in-out 0.2s"
        >
          Φόρτωση εφαρμογής...
        </Text>
      </VStack>
    </Flex>
  );
};

export default SplashScreen;