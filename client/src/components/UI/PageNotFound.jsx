import React from 'react';
import {
  Box, Heading, Text, Button, VStack, Center, useColorModeValue,
  Icon, Container, Link
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { FaHome, FaRegSadTear } from 'react-icons/fa';
import { motion } from 'framer-motion';

const PageNotFound = () => {
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const textColor = useColorModeValue('gray.800', 'white');
  const mutedColor = useColorModeValue('gray.500', 'gray.400');
  
  return (
    <Box
      height="100%"
      width="100%"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg={bgColor}
      p={8}
    >
      <Container maxW="container.md">
        <Center>
          <VStack spacing={8} textAlign="center">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
            >
              <Icon as={FaRegSadTear} boxSize="100px" color="blue.400" />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Heading as="h1" size="2xl" color={textColor}>404</Heading>
              <Heading as="h2" size="xl" mt="2" mb="4" color={textColor}>
                Page Not Found
              </Heading>
              <Text fontSize="xl" color={mutedColor} maxW="lg" mb="8">
                Oops! The page you're looking for doesn't exist or has been moved.
              </Text>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Button
                as={RouterLink}
                to="/"
                size="lg"
                colorScheme="blue"
                leftIcon={<FaHome />}
                fontWeight="bold"
              >
                Back to Home
              </Button>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <Text fontSize="sm" color={mutedColor} mt="4">
                Need help? <Link color="blue.500" href="mailto:support@example.com">Contact Support</Link>
              </Text>
            </motion.div>
          </VStack>
        </Center>
      </Container>
    </Box>
  );
};

export default PageNotFound;