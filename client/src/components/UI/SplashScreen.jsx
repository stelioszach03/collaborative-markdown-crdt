import React from 'react';
import { Box, Heading, VStack, Text, Flex, useColorModeValue } from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { motion } from 'framer-motion';
import Logo from './Logo';

const fadeIn = keyframes`
  0% { opacity: 0; }
  100% { opacity: 1; }
`;

const SplashScreen = ({ setShowSplash }) => {
  const bgColor = useColorModeValue('white', 'gray.900');
  const textColor = useColorModeValue('gray.800', 'white');
  const mutedColor = useColorModeValue('gray.500', 'gray.400');
  
  return (
    <Flex 
      height="100vh" 
      width="100vw" 
      justifyContent="center" 
      alignItems="center"
      bg={bgColor}
      flexDirection="column"
      animation={`${fadeIn} 0.8s ease-in-out`}
      as={motion.div}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <VStack spacing="6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
        >
          <Logo height="80px" />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <VStack spacing="1">
            <Heading size="xl" color={textColor}>CollabMD</Heading>
            <Text color={mutedColor} fontWeight="medium">
              Collaborative Markdown Editor
            </Text>
          </VStack>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <Text fontSize="sm" color={mutedColor}>
            Real-time collaborative editing for your documents
          </Text>
        </motion.div>
      </VStack>
    </Flex>
  );
};

export default SplashScreen;