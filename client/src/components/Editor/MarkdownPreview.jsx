import React, { useMemo, useState, useEffect } from 'react';
import {
  Box,
  useColorModeValue,
  Text,
  Spinner,
  Center,
  Alert,
  AlertIcon,
  Button,
  Flex,
  IconButton,
  Tooltip,
  Heading,
  Divider,
  Badge
} from '@chakra-ui/react';
import { RepeatIcon, ExternalLinkIcon } from '@chakra-ui/icons';
import { 
  FaSyncAlt,
  FaFileDownload,
  FaBars,
  FaEye,
  FaPrint
} from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';
import { motion } from 'framer-motion';

/**
 * MarkdownPreview Component - Renders markdown content as HTML
 * 
 * @param {Object} props - Component properties
 * @param {string} props.content - Markdown content to render
 */
const MarkdownPreview = ({ content }) => {
  // Colors
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'gray.100');
  const mutedColor = useColorModeValue('gray.500', 'gray.400');
  const toolbarBg = useColorModeValue('gray.50', 'gray.700');
  
  // State
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showToc, setShowToc] = useState(false);
  const [tocItems, setTocItems] = useState([]);
  
  // Ensure content is a string
  const safeContent = useMemo(() => {
    return content || '';
  }, [content]);
  
  // Loading simulation
  useEffect(() => {
    setIsLoading(true);
    
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Extract table of contents
  useEffect(() => {
    if (!safeContent) {
      setTocItems([]);
      return;
    }
    
    // Simple regex to extract headings
    const headingRegex = /^(#{1,6})\s+(.+)$/gm;
    const items = [];
    let match;
    
    while ((match = headingRegex.exec(safeContent)) !== null) {
      const level = match[1].length;
      const text = match[2].trim();
      const id = text.toLowerCase().replace(/[^\w]+/g, '-');
      
      items.push({ level, text, id });
    }
    
    setTocItems(items);
  }, [safeContent]);
  
  // Render markdown content
  const renderedMarkdown = useMemo(() => {
    try {
      if (!safeContent) {
        return null;
      }
      
      return (
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw, rehypeHighlight]}
          components={{
            h1: ({ node, ...props }) => <Heading as="h1" size="xl" mt={6} mb={4} {...props} />,
            h2: ({ node, ...props }) => <Heading as="h2" size="lg" mt={5} mb={3} {...props} />,
            h3: ({ node, ...props }) => <Heading as="h3" size="md" mt={4} mb={2} {...props} />,
            h4: ({ node, ...props }) => <Heading as="h4" size="sm" mt={4} mb={2} {...props} />,
            h5: ({ node, ...props }) => <Heading as="h5" size="xs" mt={3} mb={1} {...props} />,
            h6: ({ node, ...props }) => <Heading as="h6" size="xs" fontWeight="medium" mt={3} mb={1} {...props} />,
            a: ({ node, ...props }) => <Box as="a" color="blue.500" {...props} />,
            pre: ({ node, ...props }) => <Box as="pre" p={3} rounded="md" bg={useColorModeValue('gray.50', 'gray.700')} overflow="auto" {...props} />,
            code: ({ node, inline, ...props }) => 
              inline 
                ? <Box as="code" fontFamily="mono" bg={useColorModeValue('gray.100', 'gray.700')} p={1} rounded="sm" {...props} /> 
                : <Box as="code" fontFamily="mono" {...props} />,
            blockquote: ({ node, ...props }) => <Box as="blockquote" borderLeftWidth="4px" borderLeftColor={useColorModeValue('gray.200', 'gray.600')} pl={4} py={2} my={4} {...props} />,
            table: ({ node, ...props }) => <Box as="table" width="full" my={4} borderWidth="1px" borderColor={borderColor} {...props} />,
            th: ({ node, ...props }) => <Box as="th" bg={useColorModeValue('gray.50', 'gray.700')} p={2} borderBottomWidth="1px" borderColor={borderColor} {...props} />,
            td: ({ node, ...props }) => <Box as="td" p={2} borderBottomWidth="1px" borderColor={borderColor} {...props} />,
          }}
        >
          {safeContent}
        </ReactMarkdown>
      );
    } catch (err) {
      console.error("Error rendering markdown:", err);
      setError(err);
      return null;
    }
  }, [safeContent, borderColor]);
  
  // Retry rendering
  const retryRendering = () => {
    setIsLoading(true);
    setError(null);
    
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  };
  
  // Print preview
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    
    if (!printWindow) {
      console.error('Failed to open print window. Pop-ups might be blocked.');
      return;
    }
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Markdown Preview</title>
        <style>
          body {
            font-family: system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            color: #333;
          }
          pre, code {
            font-family: monospace;
            background-color: #f5f5f5;
            border-radius: 3px;
          }
          pre {
            padding: 10px;
            overflow: auto;
          }
          code {
            padding: 2px 5px;
          }
          blockquote {
            border-left: 4px solid #ddd;
            padding-left: 16px;
            margin-left: 0;
            color: #666;
          }
          img {
            max-width: 100%;
          }
          table {
            border-collapse: collapse;
            width: 100%;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 8px;
          }
          th {
            background-color: #f2f2f2;
          }
          @media print {
            body {
              font-size: 12pt;
            }
            pre, code {
              font-size: 10pt;
            }
          }
        </style>
      </head>
      <body>
        ${renderedMarkdown ? printWindow.document.createElement('div').appendChild(renderedMarkdown.type({ 
          children: safeContent, 
          remarkPlugins: [remarkGfm] 
        })).innerHTML : ''}
      </body>
      </html>
    `);
    
    printWindow.document.close();
    
    // Wait for content to load, then print
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };
  
  // Loading spinner
  if (isLoading) {
    return (
      <Box
        width="full"
        height="full"
        padding="0"
        bg={bgColor}
        color={textColor}
        borderLeft="1px"
        borderColor={borderColor}
        overflowY="auto"
      >
        <Flex 
          h="40px" 
          alignItems="center" 
          px="3" 
          bg={toolbarBg} 
          borderBottom="1px" 
          borderColor={borderColor}
          justifyContent="space-between"
        >
          <Heading size="xs">Preview</Heading>
          
          <HStack spacing="1">
            <Tooltip label="Toggle Table of Contents">
              <IconButton
                icon={<FaBars size="14px" />}
                size="sm"
                variant="ghost"
                aria-label="Table of Contents"
                onClick={() => setShowToc(prev => !prev)}
              />
            </Tooltip>
            
            <Tooltip label="Print">
              <IconButton
                icon={<FaPrint size="14px" />}
                size="sm"
                variant="ghost"
                aria-label="Print"
                onClick={handlePrint}
              />
            </Tooltip>
            
            <Tooltip label="Refresh">
              <IconButton
                icon={<FaSyncAlt size="14px" />}
                size="sm"
                variant="ghost"
                aria-label="Refresh"
                onClick={retryRendering}
              />
            </Tooltip>
          </HStack>
        </Flex>
        
        <Center h="calc(100% - 40px)">
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
  
  // Error state
  if (error) {
    return (
      <Box
        width="full"
        height="full"
        padding="0"
        bg={bgColor}
        color={textColor}
        borderLeft="1px"
        borderColor={borderColor}
        overflowY="auto"
      >
        <Flex 
          h="40px" 
          alignItems="center" 
          px="3" 
          bg={toolbarBg} 
          borderBottom="1px" 
          borderColor={borderColor}
        >
          <Heading size="xs">Preview</Heading>
        </Flex>
        
        <Center h="calc(100% - 40px)" flexDirection="column" p="6">
          <Alert
            status="error"
            variant="subtle"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            textAlign="center"
            p="6"
            borderRadius="md"
            maxW="400px"
          >
            <AlertIcon boxSize="40px" mr={0} />
            <Heading as="h3" size="md" mt="4" mb="2">
              Error rendering Markdown
            </Heading>
            <Text mb="4">
              {error.message || "An unexpected error occurred while rendering the Markdown content."}
            </Text>
            <Button
              rightIcon={<RepeatIcon />}
              colorScheme="blue"
              variant="outline"
              onClick={retryRendering}
            >
              Try Again
            </Button>
          </Alert>
        </Center>
      </Box>
    );
  }
  
  // Empty state
  if (!safeContent) {
    return (
      <Box
        width="full"
        height="full"
        padding="0"
        bg={bgColor}
        color={textColor}
        borderLeft="1px"
        borderColor={borderColor}
        overflowY="auto"
      >
        <Flex 
          h="40px" 
          alignItems="center" 
          px="3" 
          bg={toolbarBg} 
          borderBottom="1px" 
          borderColor={borderColor}
        >
          <Heading size="xs">Preview</Heading>
        </Flex>
        
        <Center h="calc(100% - 40px)" flexDirection="column">
          <FaEye size="32px" color={useColorModeValue('gray.300', 'gray.600')} />
          <Text color={mutedColor} fontStyle="italic" mt="4">
            Start typing in the editor to see a preview
          </Text>
        </Center>
      </Box>
    );
  }
  
  // Normal preview with content
  return (
    <Box
      width="full"
      height="full"
      padding="0"
      bg={bgColor}
      color={textColor}
      borderLeft="1px"
      borderColor={borderColor}
      overflowY="hidden"
      position="relative"
    >
      {/* Preview toolbar */}
      <Flex 
        h="40px" 
        alignItems="center" 
        px="3" 
        bg={toolbarBg} 
        borderBottom="1px" 
        borderColor={borderColor}
        justifyContent="space-between"
      >
        <Heading size="xs">Preview</Heading>
        
        <HStack spacing="1">
          <Tooltip label={showToc ? "Hide Table of Contents" : "Show Table of Contents"}>
            <IconButton
              icon={<FaBars size="14px" />}
              size="sm"
              variant="ghost"
              aria-label="Table of Contents"
              onClick={() => setShowToc(prev => !prev)}
              colorScheme={showToc ? "blue" : "gray"}
            />
          </Tooltip>
          
          <Tooltip label="Print">
            <IconButton
              icon={<FaPrint size="14px" />}
              size="sm"
              variant="ghost"
              aria-label="Print"
              onClick={handlePrint}
            />
          </Tooltip>
          
          <Tooltip label="Refresh">
            <IconButton
              icon={<FaSyncAlt size="14px" />}
              size="sm"
              variant="ghost"
              aria-label="Refresh"
              onClick={retryRendering}
            />
          </Tooltip>
        </HStack>
      </Flex>
      
      {/* Main content area with side-by-side layout when TOC is visible */}
      <Flex h="calc(100% - 40px)">
        {/* Table of Contents sidebar */}
        {showToc && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: '200px', opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ 
              overflowY: 'auto',
              borderRight: '1px solid',
              borderColor: borderColor,
              height: '100%' 
            }}
          >
            <Box p="3">
              <Heading size="xs" mb="3">Table of Contents</Heading>
              <Divider mb="3" />
              
              {tocItems.length > 0 ? (
                <VStack align="stretch" spacing="1">
                  {tocItems.map((item, index) => (
                    <Box
                      key={index}
                      pl={`${(item.level - 1) * 12}px`}
                      py="1"
                      borderRadius="md"
                      _hover={{ bg: useColorModeValue('gray.100', 'gray.700') }}
                      fontSize={item.level === 1 ? 'sm' : 'xs'}
                      fontWeight={item.level <= 2 ? 'semibold' : 'normal'}
                      cursor="pointer"
                      onClick={() => {
                        // Scroll to heading
                        const element = document.getElementById(item.id);
                        if (element) {
                          element.scrollIntoView({ behavior: 'smooth' });
                        }
                      }}
                    >
                      {item.text}
                    </Box>
                  ))}
                </VStack>
              ) : (
                <Text fontSize="sm" color={mutedColor}>
                  No headings found in document
                </Text>
              )}
            </Box>
          </motion.div>
        )}
        
        {/* Markdown content */}
        <Box 
          flex="1" 
          p="5" 
          overflowY="auto" 
          className="markdown-preview"
          sx={{
            '& > div > :first-of-type': {
              marginTop: 0,
            }
          }}
        >
          {renderedMarkdown}
        </Box>
      </Flex>
    </Box>
  );
};

export default MarkdownPreview;