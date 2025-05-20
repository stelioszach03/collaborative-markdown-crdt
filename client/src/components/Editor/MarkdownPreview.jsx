import React, { useMemo, useState, useEffect } from 'react';
import {
  Box,
  useColorModeValue,
  Text,
  Spinner,
  Center,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Button
} from '@chakra-ui/react';
import { RepeatIcon } from '@chakra-ui/icons';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeHighlight from 'rehype-highlight';
// Import των στυλ για syntax highlighting
import 'highlight.js/styles/github-dark.css';

/**
 * MarkdownPreview Component - Προεπισκόπηση του Markdown περιεχομένου σε πραγματικό χρόνο
 * 
 * @param {Object} props - Component properties
 * @param {string} props.content - Το περιεχόμενο Markdown προς προεπισκόπηση
 * @returns {JSX.Element} Το rendered component
 */
const MarkdownPreview = ({ content }) => {
  // Colors για light/dark mode
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'gray.100');
  const mutedColor = useColorModeValue('gray.500', 'gray.400');
  
  // State για χειρισμό φόρτωσης και σφαλμάτων
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Εξασφάλιση ότι το content είναι πάντα string
  const safeContent = useMemo(() => {
    return content || '';
  }, [content]);
  
  // Έλεγχος ότι έχουμε όλα τα απαραίτητα components για το rendering
  useEffect(() => {
    setIsLoading(true);
    
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Render του Markdown με error handling
  const renderedMarkdown = useMemo(() => {
    try {
      if (!safeContent) {
        return null;
      }
      
      return (
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw, rehypeHighlight]}
        >
          {safeContent}
        </ReactMarkdown>
      );
    } catch (err) {
      console.error("Error rendering markdown:", err);
      setError(err);
      return null;
    }
  }, [safeContent]);
  
  // Επανάληψη του rendering σε περίπτωση σφάλματος
  const retryRendering = () => {
    setIsLoading(true);
    setError(null);
    
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  };
  
  // Εμφάνιση spinner κατά τη φόρτωση
  if (isLoading) {
    return (
      <Box
        width="full"
        height="full"
        padding="5"
        bg={bgColor}
        color={textColor}
        borderLeft="1px"
        borderColor={borderColor}
        overflowY="auto"
      >
        <Center h="full">
          <Spinner
            thickness="4px"
            speed="0.65s"
            emptyColor="gray.200"
            color="blue.500"
            size="xl"
          />
        </Center>
      </Box>
    );
  }
  
  // Εμφάνιση μηνύματος σφάλματος
  if (error) {
    return (
      <Box
        width="full"
        height="full"
        padding="5"
        bg={bgColor}
        color={textColor}
        borderLeft="1px"
        borderColor={borderColor}
        overflowY="auto"
      >
        <Alert
          status="error"
          variant="subtle"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          textAlign="center"
          height="200px"
          borderRadius="md"
        >
          <AlertIcon boxSize="40px" mr={0} />
          <AlertTitle mt={4} mb={1} fontSize="lg">
            Error rendering Markdown
          </AlertTitle>
          <AlertDescription maxWidth="sm" mb={4}>
            {error.message || "An unexpected error occurred while rendering the Markdown content."}
          </AlertDescription>
          <Button
            rightIcon={<RepeatIcon />}
            colorScheme="blue"
            variant="outline"
            onClick={retryRendering}
          >
            Try Again
          </Button>
        </Alert>
      </Box>
    );
  }
  
  // Κανονική εμφάνιση του περιεχομένου
  return (
    <Box
      width="full"
      height="full"
      padding="5"
      bg={bgColor}
      color={textColor}
      borderLeft="1px"
      borderColor={borderColor}
      overflowY="auto"
      className="markdown-preview"
    >
      {safeContent ? (
        renderedMarkdown
      ) : (
        <Text color={mutedColor} fontStyle="italic">
          Δεν υπάρχει περιεχόμενο για προεπισκόπηση
        </Text>
      )}
    </Box>
  );
};

// Πρόσθετος έλεγχος για τα props
MarkdownPreview.defaultProps = {
  content: ''
};

export default React.memo(MarkdownPreview);