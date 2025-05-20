import React, { useState, useEffect } from 'react';
import {
  Box, 
  Heading, 
  Text, 
  Button, 
  Stack,
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
  useToast
} from '@chakra-ui/react';
import { AddIcon, SearchIcon, ChevronRightIcon } from '@chakra-ui/icons';
import { FaRegFileAlt, FaMarkdown, FaRegEdit, FaUserFriends } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Logo from './Logo';

/**
 * WelcomeScreen Component
 * Αρχική οθόνη που εμφανίζεται όταν ο χρήστης δεν έχει επιλέξει έγγραφο
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
  
  // Χρώματα με βάση το color mode
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'white');
  const mutedColor = useColorModeValue('gray.500', 'gray.400');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const primaryColor = useColorModeValue('blue.500', 'blue.300');

  // Animation effect after mounting
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  /**
   * Χειρισμός δημιουργίας νέου εγγράφου
   */
  const handleCreateDocument = async () => {
    if (isCreating) return;
    
    try {
      setIsCreating(true);
      const name = documentName.trim() || 'Untitled Document';
      const doc = await onCreateDocument(name);
      
      if (doc) {
        toast({
          title: "Επιτυχής δημιουργία εγγράφου",
          description: `Το έγγραφο "${name}" δημιουργήθηκε επιτυχώς.`,
          status: "success",
          duration: 3000,
          isClosable: true,
          position: "bottom-right"
        });
        navigate(`/documents/${doc.id}`);
      }
    } catch (error) {
      toast({
        title: "Σφάλμα",
        description: "Η δημιουργία του εγγράφου απέτυχε. Παρακαλώ δοκιμάστε ξανά.",
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

  /**
   * Χειρισμός δημιουργίας εγγράφου από έτοιμο πρότυπο
   * @param {string} templateName - Όνομα του προτύπου
   */
  const createFromTemplate = (templateName) => {
    if (isCreating) return;
    
    setIsCreating(true);
    onCreateDocument(templateName)
      .then(doc => {
        if (doc) {
          toast({
            title: "Επιτυχής δημιουργία εγγράφου",
            description: `Το έγγραφο "${templateName}" δημιουργήθηκε επιτυχώς από πρότυπο.`,
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
          title: "Σφάλμα",
          description: "Η δημιουργία του εγγράφου απέτυχε. Παρακαλώ δοκιμάστε ξανά.",
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

  // Πρότυπα εγγράφων
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

  // Χαρακτηριστικά της εφαρμογής
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
      icon: FaRegEdit,
      title: "Edit History",
      description: "Track changes and see who contributed what to the document"
    }
  ];

  return (
    <Box 
      height="100%" 
      p={{ base: 4, md: 8 }} 
      bg={bgColor}
      overflowY="auto"
    >
      <Stack 
        spacing="8" 
        align="center" 
        maxW="1200px" 
        mx="auto" 
        w="full"
        opacity={isLoaded ? 1 : 0}
        transform={isLoaded ? "translateY(0)" : "translateY(20px)"}
        transition="opacity 0.5s ease-out, transform 0.5s ease-out"
      >
        {/* Welcome header */}
        <Stack spacing="3" textAlign="center" mb="8">
          <Box mb="4">
            <Logo height="60px" />
          </Box>
          <Heading as="h1" size="xl" color={textColor}>
            Welcome to CollabMD
          </Heading>
          <Text color={mutedColor} fontSize="lg">
            Create, edit, and collaborate on Markdown documents in real-time
          </Text>
        </Stack>
        
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
          opacity={isLoaded ? 1 : 0}
          transform={isLoaded ? "translateY(0)" : "translateY(20px)"}
          transition="opacity 0.5s ease-out 0.1s, transform 0.5s ease-out 0.1s"
          w="full"
          maxW="800px"
        >
          <Stack align="start" spacing="1" mb={{ base: 4, md: 0 }} mr={{ md: 4 }} flex="1">
            <Heading size="md">Start a new document</Heading>
            <Text color={mutedColor}>Create a document and share it with others</Text>
          </Stack>
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
        
        {/* Templates */}
        <Box 
          mb="8" 
          w="full"
          opacity={isLoaded ? 1 : 0}
          transform={isLoaded ? "translateY(0)" : "translateY(20px)"}
          transition="opacity 0.5s ease-out 0.2s, transform 0.5s ease-out 0.2s"
        >
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
                onClick={() => createFromTemplate(template.title)}
              >
                <CardHeader pb="0">
                  <Flex justifyContent="space-between" alignItems="center">
                    <Box as={template.icon} boxSize="6" color={template.color} />
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
        
        {/* Features section */}
        <Box 
          w="full"
          opacity={isLoaded ? 1 : 0}
          transform={isLoaded ? "translateY(0)" : "translateY(20px)"}
          transition="opacity 0.5s ease-out 0.3s, transform 0.5s ease-out 0.3s"
        >
          <Heading as="h2" size="md" mb="6" textAlign="center">
            Key Features
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing="6">
            {features.map((feature, index) => (
              <Box 
                key={index}
                p="6" 
                bg={cardBg} 
                borderRadius="lg" 
                shadow="md"
                borderWidth="1px"
                borderColor={borderColor}
                transition="all 0.2s"
                _hover={{ transform: 'translateY(-4px)', shadow: 'lg' }}
              >
                <Box as={feature.icon} boxSize="8" color="blue.500" mb="4" />
                <Heading as="h3" size="md" mb="2">{feature.title}</Heading>
                <Text>{feature.description}</Text>
              </Box>
            ))}
          </SimpleGrid>
        </Box>
        
        {/* Footer */}
        <Divider my="8" />
        <Text fontSize="sm" color={mutedColor} textAlign="center">
          &copy; 2025 CollabMD - Collaborative Markdown Editor
        </Text>
      </Stack>
    </Box>
  );
};

export default WelcomeScreen;