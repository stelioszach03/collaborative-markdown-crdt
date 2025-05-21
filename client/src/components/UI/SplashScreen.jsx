import { Box, Center, Spinner, Text, VStack } from '@chakra-ui/react';
import Logo from './Logo';
import { useTheme } from '../../context/ThemeContext';

const SplashScreen = () => {
  const { theme } = useTheme();
  
  return (
    <Center 
      h="100vh" 
      w="100vw" 
      bg={theme === 'dark' ? 'gray.900' : 'gray.50'}
    >
      <VStack spacing={5}>
        <Logo height="80px" />
        
        <Text 
          fontSize="2xl" 
          fontWeight="bold"
          color={theme === 'dark' ? 'white' : 'gray.800'}
        >
          Collaborative Markdown Editor
        </Text>
        
        <Spinner 
          thickness="4px"
          speed="0.8s"
          emptyColor={theme === 'dark' ? 'gray.700' : 'gray.200'}
          color="primary.500"
          size="xl"
        />
        
        <Text 
          color={theme === 'dark' ? 'gray.300' : 'gray.600'}
        >
          Loading your workspace...
        </Text>
      </VStack>
    </Center>
  );
};

export default SplashScreen;