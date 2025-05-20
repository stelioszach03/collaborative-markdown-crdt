import React, { useState } from 'react';
import {
  Box, Heading, Text, Button, VStack, Flex, useColorModeValue,
  Input, InputGroup, InputLeftElement, Divider, HStack, Icon,
  SimpleGrid, Card, CardBody, CardFooter, CardHeader, Image,
  Tag, IconButton, useToken
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { AddIcon, SearchIcon, ChevronRightIcon } from '@chakra-ui/icons';
import { FaRegFileAlt, FaMarkdown, FaRegEdit, FaUserFriends, FaRegClock } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const WelcomeScreen = ({ onCreateDocument }) => {
  const [documentName, setDocumentName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const navigate = useNavigate();
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'white');
  const mutedColor = useColorModeValue('gray.500', 'gray.400');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const [blue500] = useToken('colors', ['blue.500']);

  const handleCreateDocument = async () => {
    if (isCreating) return;
    
    setIsCreating(true);
    const name = documentName.trim() || 'Untitled Document';
    const doc = await onCreateDocument(name);
    setIsCreating(false);
    
    if (doc) {
      navigate(`/documents/${doc.id}`);
    }
  };

  const templates = [
    {
      title: 'Blank Document',
      icon: FaRegFileAlt,
      description: 'Start with a clean slate',
      color: 'blue.500'
    },
    {
      title: 'Meeting Notes',
      icon: FaRegEdit,
      description: 'Template for meeting notes',
      color: 'green.500'
    },
    {
      title: 'Project README',
      icon: FaMarkdown,
      description: 'Standard README format',
      color: 'purple.500'
    },
    {
      title: 'Team Wiki',
      icon: FaUserFriends,
      description: 'Knowledge base template',
      color: 'orange.500'
    }
  ];

  return (
    <Box 
      height="100%" 
      p={{ base: 4, md: 8 }} 
      bg={bgColor}
      overflowY="auto"
    >
      <VStack spacing="8" align="center" maxW="1200px" mx="auto" w="full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ width: '100%', maxWidth: '700px' }}
        >
          {/* Welcome header */}
          <VStack spacing="3" textAlign="center" mb="8">
            <Heading as="h1" size="xl" color={textColor}>
              Welcome to CollabMD
            </Heading>
            <Text color={mutedColor} fontSize="lg">
              Create, edit, and collaborate on Markdown documents in real-time
            </Text>
          </VStack>
          
          {/* Create document input */}
          <Flex 
            direction={{ base: 'column', md: 'row' }}
            shadow="md"
            borderRadius="lg"
            bg={cardBg}
            p="6"
            mb="8"
            align="center"
            justify="space-between"
            border="1px"
            borderColor={borderColor}
          >
            <VStack align="start" spacing="1" mb={{ base: 4, md: 0 }} mr={{ md: 4 }} flex="1">
              <Heading size="md">Start a new document</Heading>
              <Text color={mutedColor}>Create a document and share it with others</Text>
            </VStack>
            <Flex width={{ base: 'full', md: 'auto' }}>
              <InputGroup size="md">
                <InputLeftElement>
                  <FaRegFileAlt color={blue500} />
                </InputLeftElement>
                <Input
                  placeholder="Document name"
                  value={documentName}
                  onChange={(e) => setDocumentName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCreateDocument();
                  }}
                  mr="2"
                />
              </InputGroup>
              <Button
                colorScheme="blue"
                leftIcon={<AddIcon />}
                onClick={handleCreateDocument}
                isLoading={isCreating}
              >
                Create
              </Button>
            </Flex>
          </Flex>
        </motion.div>
        
        {/* Templates */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          style={{ width: '100%' }}
        >
          <Box mb="8">
            <Heading as="h2" size="md" mb="4">
              Start with a template
            </Heading>
            <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} spacing="4" width="full">
              {templates.map((template, index) => (
                <Card 
                  key={index} 
                  bg={cardBg} 
                  shadow="md" 
                  borderRadius="lg" 
                  borderWidth="1px"
                  borderColor={borderColor}
                  overflow="hidden"
                  transition="all 0.2s"
                  _hover={{ 
                    transform: 'translateY(-4px)',
                    shadow: 'lg',
                    borderColor: template.color 
                  }}
                  cursor="pointer"
                  onClick={() => onCreateDocument(template.title)}
                >
                  <CardHeader pb="0">
                    <Flex justifyContent="space-between" alignItems="center">
                      <Icon as={template.icon} boxSize="6" color={template.color} />
                      <IconButton
                        icon={<ChevronRightIcon />}
                        variant="ghost"
                        colorScheme="blue"
                        size="sm"
                        aria-label="Use template"
                      />
                    </Flex>
                  </CardHeader>
                  <CardBody>
                    <Heading size="sm" mb="2">{template.title}</Heading>
                    <Text fontSize="sm" color={mutedColor}>{template.description}</Text>
                  </CardBody>
                </Card>
              ))}
            </SimpleGrid>
          </Box>
        </motion.div>
        
        {/* Features section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          style={{ width: '100%' }}
        >
          <Box>
            <Heading as="h2" size="md" mb="6" textAlign="center">
              Key Features
            </Heading>
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing="6">
              <Feature 
                icon={FaMarkdown} 
                title="Markdown Support" 
                description="Full support for GitHub Flavored Markdown for rich document formatting"
              />
              <Feature 
                icon={FaUserFriends} 
                title="Real-time Collaboration" 
                description="See others typing in real-time with cursors and selections"
              />
              <Feature 
                icon={FaRegClock} 
                title="Edit History" 
                description="Track changes and see who contributed what to the document"
              />
            </SimpleGrid>
          </Box>
        </motion.div>
      </VStack>
    </Box>
  );
};

const Feature = ({ icon, title, description }) => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  return (
    <Box 
      p="6" 
      bg={cardBg} 
      borderRadius="lg" 
      shadow="md"
      borderWidth="1px"
      borderColor={borderColor}
      transition="all 0.2s"
      _hover={{ transform: 'translateY(-4px)', shadow: 'lg' }}
    >
      <Icon as={icon} boxSize="8" color="blue.500" mb="4" />
      <Heading as="h3" size="md" mb="2">{title}</Heading>
      <Text>{description}</Text>
    </Box>
  );
};

export default WelcomeScreen;