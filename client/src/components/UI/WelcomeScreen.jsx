import React, { useState, useEffect } from 'react';
import {
  Box, 
  Heading, 
  Text, 
  Button, 
  VStack,
  Flex, 
  useColorModeValue,
  Input, 
  InputGroup, 
  InputLeftElement, 
  Divider, 
  SimpleGrid, 
  Card, 
  CardBody, 
  CardHeader, 
  IconButton,
  useToast,
  HStack,
  Container,
  Icon
} from '@chakra-ui/react';
import { AddIcon, SearchIcon, ChevronRightIcon } from '@chakra-ui/icons';
import { 
  FaRegFileAlt, 
  FaMarkdown, 
  FaRegEdit, 
  FaUserFriends,
  FaRegClock,
  FaCode,
  FaBrain
} from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Logo from './Logo';

/**
 * WelcomeScreen Component - Initial screen when no document is selected
 * 
 * @param {Object} props - Component properties
 * @param {Function} props.onCreateDocument - Function to create a new document
 */
const WelcomeScreen = ({ onCreateDocument }) => {
  const [documentName, setDocumentName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();
  
  // Colors
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'white');
  const mutedColor = useColorModeValue('gray.500', 'gray.400');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const primaryColor = useColorModeValue('blue.500', 'blue.400');

  // Animation effect after mounting
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  // Handle document creation
  const handleCreateDocument = async () => {
    if (isCreating) return;
    
    try {
      setIsCreating(true);
      const name = documentName.trim() || 'Untitled Document';
      const doc = await onCreateDocument(name);
      
      if (doc) {
        toast({
          title: "Document Created",
          description: `"${name}" has been created successfully.`,
          status: "success",
          duration: 3000,
          isClosable: true,
          position: "bottom-right"
        });
        navigate(`/documents/${doc.id}`);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create document. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-right"
      });
      console.error("Error creating document:", error);
    } finally {
      setIsCreating(false);
    }
  };

  // Create from template
  const createFromTemplate = (templateName) => {
    if (isCreating) return;
    
    setIsCreating(true);
    onCreateDocument(templateName)
      .then(doc => {
        if (doc) {
          toast({
            title: "Document Created",
            description: `"${templateName}" has been created successfully from template.`,
            status: "success",
            duration: 3000,
            isClosable: true,
            position: "bottom-right"
          });
          navigate(`/documents/${doc.id}`);
        }
      })
      .catch(error => {
        toast({
          title: "Error",
          description: "Failed to create document. Please try again.",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom-right"
        });
        console.error("Error creating document from template:", error);
      })
      .finally(() => {
        setIsCreating(false);
      });
  };

  // Document templates
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

  // Application features
  const features = [
    {
      icon: FaMarkdown,
      title: "Markdown Support",
      description: "Full support for GitHub Flavored Markdown for rich document formatting"
    },
    {
      icon: FaUserFriends,
      title: "Real-time Collaboration",
      description: "See others typing in real-time with cursors and selections"
    },
    {
      icon: FaRegClock,
      title: "Version History",
      description: "Track changes and see who contributed what to the document"
    },
    {
      icon: FaCode,
      title: "Code Highlighting",
      description: "Syntax highlighting for code blocks in various languages"
    },
    {
      icon: FaBrain,
      title: "Smart Features",
      description: "Analytics, statistics, and insights about your documents"
    }
  ];

  // Animation variants for staggered entrance
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  return (
    <Box 
      height="100%" 
      p={{ base: 4, md: 8 }} 
      bg={bgColor}
      overflowY="auto"
    >
      <Container maxW="1200px" h="full">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Welcome header */}
          <motion.div variants={itemVariants}>
            <Flex justifyContent="center" mb="8">
              <VStack>
                <Box mb="4">
                  <Logo height="60px" />
                </Box>
                <Heading as="h1" size="xl" color={textColor} textAlign="center">
                  Welcome to CollabMD
                </Heading>
                <Text color={mutedColor} fontSize="lg" textAlign="center">
                  Create, edit, and collaborate on Markdown documents in real-time
                </Text>
              </VStack>
            </Flex>
          </motion.div>
          
          {/* Create document input */}
          <motion.div variants={itemVariants}>
            <Card
              shadow="md"
              borderRadius="lg"
              bg={cardBg}
              p="6"
              mb="8"
              border="1px"
              borderColor={borderColor}
              overflow="hidden"
            >
              <Flex 
                direction={{ base: 'column', md: 'row' }}
                align="center"
                justify="space-between"
              >
                <Box mb={{ base: 4, md: 0 }} mr={{ md: 4 }} flex="1">
                  <Heading size="md">Start a new document</Heading>
                  <Text color={mutedColor}>Create a document and share it with others</Text>
                </Box>
                <Flex width={{ base: 'full', md: 'auto' }}>
                  <InputGroup size="md">
                    <InputLeftElement>
                      <FaRegFileAlt color={primaryColor} />
                    </InputLeftElement>
                    <Input
                      placeholder="Document name"
                      value={documentName}
                      onChange={(e) => setDocumentName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleCreateDocument();
                      }}
                      mr="2"
                      borderColor={borderColor}
                    />
                  </InputGroup>
                  <Button
                    colorScheme="blue"
                    leftIcon={<AddIcon />}
                    onClick={handleCreateDocument}
                    isLoading={isCreating}
                    loadingText="Creating..."
                  >
                    Create
                  </Button>
                </Flex>
              </Flex>
            </Card>
          </motion.div>
          
          {/* Templates */}
          <motion.div variants={itemVariants}>
            <Box mb="8">
              <Heading as="h2" size="md" mb="4">
                Start with a template
              </Heading>
              <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} spacing="4" width="full">
                {templates.map((template, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ y: -4, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' }}
                    whileTap={{ y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card 
                      bg={cardBg} 
                      shadow="md" 
                      borderRadius="lg" 
                      borderWidth="1px"
                      borderColor={borderColor}
                      overflow="hidden"
                      cursor="pointer"
                      height="full"
                      onClick={() => createFromTemplate(template.title)}
                      _hover={{ borderColor: template.color }}
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
                  </motion.div>
                ))}
              </SimpleGrid>
            </Box>
          </motion.div>
          
          {/* Features section */}
          <motion.div variants={itemVariants}>
            <Box mb="8">
              <Heading as="h2" size="md" mb="6" textAlign="center">
                Key Features
              </Heading>
              <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 5 }} spacing="6">
                {features.map((feature, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ y: -4 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card 
                      p="6" 
                      bg={cardBg} 
                      borderRadius="lg" 
                      shadow="md"
                      borderWidth="1px"
                      borderColor={borderColor}
                      height="full"
                    >
                      <VStack spacing="4" align="center" textAlign="center">
                        <Icon as={feature.icon} boxSize="8" color="blue.500" />
                        <Heading as="h3" size="md">{feature.title}</Heading>
                        <Text fontSize="sm" color={mutedColor}>{feature.description}</Text>
                      </VStack>
                    </Card>
                  </motion.div>
                ))}
              </SimpleGrid>
            </Box>
          </motion.div>
          
          {/* Footer */}
          <motion.div variants={itemVariants}>
            <Divider my="8" />
            <Text fontSize="sm" color={mutedColor} textAlign="center">
              &copy; {new Date().getFullYear()} CollabMD - Collaborative Markdown Editor
            </Text>
          </motion.div>
        </motion.div>
      </Container>
    </Box>
  );
};

export default WelcomeScreen;