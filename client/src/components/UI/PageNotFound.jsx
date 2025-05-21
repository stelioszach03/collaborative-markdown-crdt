import { Box, Heading, Text, Button, VStack } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { FaHome } from 'react-icons/fa';

const PageNotFound = () => {
  return (
    <Box 
      height="calc(100vh - 64px)" 
      display="flex" 
      alignItems="center" 
      justifyContent="center" 
      p={6}
    >
      <VStack spacing={6} textAlign="center">
        <Heading as="h1" size="4xl" color="primary.500">404</Heading>
        
        <Heading as="h2" size="xl" mb={2}>
          Page Not Found
        </Heading>
        
        <Text fontSize="lg" color="gray.600" _dark={{ color: "gray.400" }} maxW="500px">
          The document or page you're looking for doesn't exist or has been moved.
        </Text>
        
        <Button 
          as={RouterLink} 
          to="/" 
          colorScheme="blue" 
          size="lg" 
          leftIcon={<FaHome />}
          mt={4}
        >
          Return Home
        </Button>
      </VStack>
    </Box>
  );
};

export default PageNotFound;