import { useEffect } from 'react';
import { Box, Heading, Text, Button, VStack, HStack, SimpleGrid, Icon, useToast } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { FaEdit, FaUsers, FaHistory, FaChartPie, FaMoon, FaBolt } from 'react-icons/fa';
import { useDocuments } from '../../context/DocumentContext';

const FeatureCard = ({ icon, title, description }) => (
  <Box 
    p={6} 
    borderRadius="lg" 
    borderWidth="1px" 
    borderColor="gray.200" 
    _dark={{ borderColor: "gray.700" }}
    bg="white" 
    _dark={{ bg: "gray.800" }}
    boxShadow="sm"
    transition="all 0.2s"
    _hover={{ 
      transform: "translateY(-2px)", 
      boxShadow: "md" 
    }}
  >
    <Icon as={icon} boxSize={10} color="primary.500" mb={4} />
    <Heading size="md" mb={2}>{title}</Heading>
    <Text color="gray.600" _dark={{ color: "gray.300" }}>{description}</Text>
  </Box>
);

const WelcomeScreen = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { createDocument, documents } = useDocuments();

  // Create a new document
  const handleCreateDocument = async () => {
    try {
      const newDoc = await createDocument("Getting Started");
      if (newDoc) {
        navigate(`/documents/${newDoc.id}`);
      }
    } catch (error) {
      toast({
        title: 'Error creating document',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Navigate to first document if exists
  const handleOpenExisting = () => {
    if (documents?.length > 0) {
      navigate(`/documents/${documents[0].id}`);
    } else {
      toast({
        title: 'No documents available',
        description: 'Create a new document to get started',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Box p={8} maxW="1200px" mx="auto">
      <VStack spacing={10} align="center" textAlign="center" mb={16}>
        <Heading 
          as="h1" 
          size="2xl" 
          fontWeight="bold" 
          lineHeight="1.2"
          bgGradient="linear(to-r, primary.400, primary.600)"
          bgClip="text"
        >
          Collaborative Markdown Editor
        </Heading>
        
        <Text fontSize="xl" maxW="800px" color="gray.600" _dark={{ color: "gray.300" }}>
          Create, edit, and collaborate on Markdown documents in real-time.
          See changes as they happen and work together with your team.
        </Text>
        
        <HStack spacing={6}>
          <Button 
            colorScheme="blue" 
            size="lg" 
            height="56px" 
            px="32px"
            leftIcon={<FaEdit />}
            onClick={handleCreateDocument}
          >
            Create New Document
          </Button>
          
          <Button 
            variant="outline" 
            colorScheme="blue" 
            size="lg" 
            height="56px" 
            onClick={handleOpenExisting}
          >
            Open Existing Document
          </Button>
        </HStack>
      </VStack>
      
      <Heading as="h2" size="lg" mb={8} textAlign="center">Key Features</Heading>
      
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8}>
        <FeatureCard 
          icon={FaEdit}
          title="Markdown Editing"
          description="Intuitive Markdown editor with real-time preview. Format your documents with headings, lists, code blocks, and more."
        />
        
        <FeatureCard 
          icon={FaUsers}
          title="Real-time Collaboration"
          description="Work together with your team in real-time. See cursor positions and changes as they happen."
        />
        
        <FeatureCard 
          icon={FaHistory}
          title="Edit History"
          description="Track changes over time with detailed edit history and visualizations of document modifications."
        />
        
        <FeatureCard 
          icon={FaChartPie}
          title="Analytics Dashboard"
          description="Get insights into your documents with analytics on word count, contributors, and edit frequency."
        />
        
        <FeatureCard 
          icon={FaMoon}
          title="Dark Mode Support"
          description="Comfortable editing in any lighting with full dark mode support and automatic detection."
        />
        
        <FeatureCard 
          icon={FaBolt}
          title="CRDT Technology"
          description="Powered by Conflict-free Replicated Data Types (CRDT) for seamless offline editing and conflict resolution."
        />
      </SimpleGrid>
    </Box>
  );
};

export default WelcomeScreen;