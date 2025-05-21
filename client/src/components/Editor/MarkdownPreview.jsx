import React, { useMemo, useState, useEffect, useCallback } from 'react';
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
  Badge,
  HStack,
  VStack,
  Collapse,
  useDisclosure,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuGroup,
  MenuDivider,
  useClipboard
} from '@chakra-ui/react';
import { 
  RepeatIcon, 
  ExternalLinkIcon, 
  ChevronDownIcon, 
  ChevronUpIcon,
  DownloadIcon,
  CheckIcon
} from '@chakra-ui/icons';
import { 
  FaSyncAlt,
  FaFileDownload,
  FaBars,
  FaEye,
  FaPrint,
  FaCode,
  FaExternalLinkAlt,
  FaUndo,
  FaCog,
  FaFont,
  FaFileCode,
  FaLayerGroup,
  FaTimes,
  FaShareAlt,
  FaExpand,
  FaCompress,
  FaTags
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import 'highlight.js/styles/github-dark.css';
import { extractTableOfContents } from '../../utils/markdown';

// Dynamic imports
const ReactMarkdown = React.lazy(() => import('react-markdown'));
const remarkGfm = React.lazy(() => import('remark-gfm'));
const rehypeRaw = React.lazy(() => import('rehype-raw'));
const rehypeHighlight = React.lazy(() => import('rehype-highlight'));

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
  const cardBg = useColorModeValue('gray.50', 'gray.700');
  const hoverBg = useColorModeValue('gray.100', 'gray.600');
  
  // State
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tocItems, setTocItems] = useState([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  const [lineHeight, setLineHeight] = useState(1.6);
  const { isOpen: isTocOpen, onToggle: onTocToggle, onClose: onTocClose } = useDisclosure();
  const { hasCopied, onCopy } = useClipboard(content || '');
  
  // Ensure content is a string
  const safeContent = useMemo(() => {
    return content || '';
  }, [content]);
  
  // Extract table of contents on content change
  useEffect(() => {
    if (!safeContent) {
      setTocItems([]);
      return;
    }
    
    setTocItems(extractTableOfContents(safeContent));
  }, [safeContent]);
  
  // Simulate initial loading
  useEffect(() => {
    setIsLoading(true);
    
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Fullscreen handling
  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => !prev);
  }, []);
  
  // Handle escape key to exit fullscreen
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isFullscreen]);
  
  // Handle font size change
  const changeFontSize = (delta) => {
    setFontSize(prev => {
      const newSize = prev + delta;
      return newSize >= 12 && newSize <= 24 ? newSize : prev;
    });
  };
  
  // Handle line height change
  const changeLineHeight = (delta) => {
    setLineHeight(prev => {
      const newHeight = parseFloat((prev + delta).toFixed(1));
      return newHeight >= 1.0 && newHeight <= 2.2 ? newHeight : prev;
    });
  };
  
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
    
    // Create print-friendly CSS
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Markdown Preview</title>
        <style>
          body {
            font-family: system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
            line-height: ${lineHeight};
            max-width: 800px;
            font-size: ${fontSize}px;
            margin: 0 auto;
            padding: 20px;
            color: #333;
          }
          h1, h2, h3, h4, h5, h6 {
            margin-top: 1.5em;
            margin-bottom: 0.5em;
            line-height: 1.2;
          }
          h1 { font-size: 2em; }
          h2 { font-size: 1.6em; }
          h3 { font-size: 1.3em; }
          h4 { font-size: 1.1em; }
          h5 { font-size: 1em; }
          h6 { font-size: 0.9em; }
          p {
            margin-bottom: 1em;
          }
          pre, code {
            font-family: monospace;
            background-color: #f5f5f5;
            border-radius: 3px;
          }
          pre {
            padding: 1em;
            overflow: auto;
            white-space: pre-wrap;
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
            margin-bottom: 1em;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 8px;
          }
          th {
            background-color: #f2f2f2;
            text-align: left;
          }
          ul, ol {
            margin-bottom: 1em;
            padding-left: 2em;
          }
          hr {
            border: 0;
            border-top: 1px solid #ddd;
            margin: 2em 0;
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
        ${safeContent ? `<div id="content"></div>` : 'No content to print'}
      </body>
      </html>
    `);
    
    // Render markdown in the new window
    if (safeContent) {
      const remarkGfmModule = require('remark-gfm');
      const ReactMarkdownModule = require('react-markdown');
      const ReactDOMServer = require('react-dom/server');
      
      try {
        const markdownHtml = ReactDOMServer.renderToString(
          <ReactMarkdownModule remarkPlugins={[remarkGfmModule]}>
            {safeContent}
          </ReactMarkdownModule>
        );
        
        printWindow.document.getElementById('content').innerHTML = markdownHtml;
      } catch (err) {
        printWindow.document.getElementById('content').innerHTML = `
          <pre style="white-space: pre-wrap;">${safeContent}</pre>
        `;
      }
    }
    
    printWindow.document.close();
    
    // Wait for content to load, then print
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };
  
  // Export as markdown
  const handleExportMarkdown = () => {
    const blob = new Blob([safeContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'document.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  // Export as HTML
  const handleExportHtml = () => {
    try {
      const remarkGfmModule = require('remark-gfm');
      const ReactMarkdownModule = require('react-markdown');
      const ReactDOMServer = require('react-dom/server');
      
      const markdownHtml = ReactDOMServer.renderToString(
        <ReactMarkdownModule remarkPlugins={[remarkGfmModule]}>
          {safeContent}
        </ReactMarkdownModule>
      );
      
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Exported Document</title>
          <style>
            body {
              font-family: system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
              line-height: 1.6;
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
              color: #333;
            }
            h1, h2, h3, h4, h5, h6 {
              margin-top: 1.5em;
              margin-bottom: 0.5em;
              line-height: 1.2;
            }
            pre, code {
              font-family: monospace;
              background-color: #f5f5f5;
              border-radius: 3px;
            }
            pre {
              padding: 1em;
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
          </style>
        </head>
        <body>
          ${markdownHtml}
        </body>
        </html>
      `;
      
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'document.html';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error exporting HTML:', err);
      // Fallback to plain markdown
      handleExportMarkdown();
    }
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
                onClick={onTocToggle}
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
            
            <Menu>
              <Tooltip label="More options">
                <MenuButton
                  as={IconButton}
                  aria-label="More options"
                  icon={<ChevronDownIcon />}
                  variant="ghost"
                  size="sm"
                />
              </Tooltip>
              <MenuList zIndex="1001">
                <MenuGroup title="Export">
                  <MenuItem icon={<FaFileDownload />} onClick={handleExportMarkdown}>
                    Export as Markdown
                  </MenuItem>
                  <MenuItem icon={<FaFileCode />} onClick={handleExportHtml}>
                    Export as HTML
                  </MenuItem>
                </MenuGroup>
                <MenuDivider />
                <MenuGroup title="View">
                  <MenuItem icon={<FaExpand />} onClick={toggleFullscreen}>
                    Toggle Fullscreen
                  </MenuItem>
                  <MenuItem icon={<FaFont />} onClick={() => changeFontSize(1)}>
                    Increase Font Size
                  </MenuItem>
                  <MenuItem icon={<FaFont />} onClick={() => changeFontSize(-1)}>
                    Decrease Font Size
                  </MenuItem>
                </MenuGroup>
              </MenuList>
            </Menu>
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
          
          <HStack spacing="1" ml="auto">
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
  
  // Fullscreen preview
  if (isFullscreen) {
    return (
      <Box
        position="fixed"
        top="0"
        left="0"
        right="0"
        bottom="0"
        bg={bgColor}
        zIndex="1001"
        overflow="hidden"
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
          <Heading size="xs">Preview (Fullscreen)</Heading>
          
          <HStack spacing="2">
            <Badge colorScheme="green" fontSize="xs">Live Preview</Badge>
            
            <Tooltip label="Exit Fullscreen">
              <IconButton
                icon={<FaCompress size="14px" />}
                size="sm"
                variant="ghost"
                aria-label="Exit Fullscreen"
                onClick={toggleFullscreen}
              />
            </Tooltip>
          </HStack>
        </Flex>
        
        <Flex h="calc(100% - 40px)">
          {/* Table of Contents sidebar */}
          <AnimatePresence>
            {isTocOpen && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: '250px', opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                style={{ 
                  height: '100%',
                  overflow: 'hidden',
                  borderRight: '1px solid',
                  borderColor: borderColor
                }}
              >
                <Box h="full" w="250px" p="4" overflowY="auto">
                  <Flex justify="space-between" align="center" mb="4">
                    <Heading size="sm">Table of Contents</Heading>
                    <IconButton
                      icon={<FaTimes size="12px" />}
                      size="xs"
                      variant="ghost"
                      onClick={onTocClose}
                      aria-label="Close TOC"
                    />
                  </Flex>
                  
                  {tocItems.length > 0 ? (
                    <VStack align="stretch" spacing="1">
                      {tocItems.map((item, index) => (
                        <Box
                          key={index}
                          pl={`${(item.level - 1) * 12}px`}
                          py="1"
                          borderRadius="md"
                          _hover={{ bg: hoverBg }}
                          fontSize={item.level === 1 ? 'sm' : 'xs'}
                          fontWeight={item.level <= 2 ? 'semibold' : 'normal'}
                          cursor="pointer"
                          onClick={() => {
                            const elementId = `heading-${item.id}`;
                            const element = document.getElementById(elementId);
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
                      No headings found in the document
                    </Text>
                  )}
                </Box>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Preview content */}
          <Box 
            flex="1" 
            p="5" 
            overflowY="auto" 
            fontSize={`${fontSize}px`}
            lineHeight={lineHeight}
            className="markdown-preview"
          >
            <React.Suspense fallback={<Spinner />}>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw, rehypeHighlight]}
                components={{
                  h1: ({ node, ...props }) => <Heading as="h1" size="xl" mt={6} mb={4} id={`heading-${props.id}`} {...props} />,
                  h2: ({ node, ...props }) => <Heading as="h2" size="lg" mt={5} mb={3} id={`heading-${props.id}`} {...props} />,
                  h3: ({ node, ...props }) => <Heading as="h3" size="md" mt={4} mb={2} id={`heading-${props.id}`} {...props} />,
                  h4: ({ node, ...props }) => <Heading as="h4" size="sm" mt={4} mb={2} id={`heading-${props.id}`} {...props} />,
                  h5: ({ node, ...props }) => <Heading as="h5" size="xs" mt={3} mb={1} id={`heading-${props.id}`} {...props} />,
                  h6: ({ node, ...props }) => <Heading as="h6" size="xs" fontWeight="medium" mt={3} mb={1} id={`heading-${props.id}`} {...props} />,
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
            </React.Suspense>
          </Box>
        </Flex>
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
        <Heading size="xs">
          Preview
          <Badge ml="2" colorScheme="green" fontSize="xs">Live</Badge>
        </Heading>
        
        <HStack spacing="1">
          <Tooltip label={isTocOpen ? "Hide Table of Contents" : "Show Table of Contents"}>
            <IconButton
              icon={<FaBars size="14px" />}
              size="sm"
              variant="ghost"
              aria-label="Table of Contents"
              onClick={onTocToggle}
              colorScheme={isTocOpen ? "blue" : "gray"}
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
          
          <Tooltip label={hasCopied ? "Copied!" : "Copy content"}>
            <IconButton
              icon={hasCopied ? <CheckIcon /> : <FaRegCopy size="14px" />}
              size="sm"
              variant="ghost"
              aria-label="Copy content"
              onClick={onCopy}
              color={hasCopied ? "green.500" : undefined}
            />
          </Tooltip>
          
          <Tooltip label="Fullscreen">
            <IconButton
              icon={<FaExpand size="14px" />}
              size="sm"
              variant="ghost"
              aria-label="Fullscreen"
              onClick={toggleFullscreen}
            />
          </Tooltip>
          
          <Menu>
            <Tooltip label="More options">
              <MenuButton
                as={IconButton}
                aria-label="More options"
                icon={<ChevronDownIcon />}
                variant="ghost"
                size="sm"
              />
            </Tooltip>
            <MenuList zIndex="1001">
              <MenuGroup title="Export">
                <MenuItem icon={<FaFileDownload />} onClick={handleExportMarkdown}>
                  Export as Markdown
                </MenuItem>
                <MenuItem icon={<FaFileCode />} onClick={handleExportHtml}>
                  Export as HTML
                </MenuItem>
              </MenuGroup>
              <MenuDivider />
              <MenuGroup title="Display">
                <MenuItem icon={<FaFont />} onClick={() => changeFontSize(1)}>
                  Increase Font Size
                </MenuItem>
                <MenuItem icon={<FaFont />} onClick={() => changeFontSize(-1)}>
                  Decrease Font Size
                </MenuItem>
                <MenuItem icon={<FaLayerGroup />} onClick={() => changeLineHeight(0.1)}>
                  Increase Line Height
                </MenuItem>
                <MenuItem icon={<FaLayerGroup />} onClick={() => changeLineHeight(-0.1)}>
                  Decrease Line Height
                </MenuItem>
              </MenuGroup>
            </MenuList>
          </Menu>
        </HStack>
      </Flex>
      
      {/* Main content area with side-by-side layout when TOC is visible */}
      <Flex h="calc(100% - 40px)">
        {/* Table of Contents sidebar */}
        <AnimatePresence>
          {isTocOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: '230px', opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              style={{ 
                height: '100%',
                overflow: 'hidden',
                borderRight: '1px solid',
                borderColor: borderColor
              }}
            >
              <Box h="full" w="230px" p="3" overflowY="auto">
                <Flex justify="space-between" align="center" mb="3">
                  <Heading size="xs">Table of Contents</Heading>
                  <IconButton
                    icon={<FaTimes size="12px" />}
                    size="xs"
                    variant="ghost"
                    onClick={onTocClose}
                    aria-label="Close TOC"
                  />
                </Flex>
                
                {tocItems.length > 0 ? (
                  <VStack align="stretch" spacing="1">
                    {tocItems.map((item, index) => (
                      <Box
                        key={index}
                        pl={`${(item.level - 1) * 10}px`}
                        py="1"
                        borderRadius="md"
                        _hover={{ bg: hoverBg }}
                        fontSize={item.level === 1 ? 'sm' : 'xs'}
                        fontWeight={item.level <= 2 ? 'semibold' : 'normal'}
                        cursor="pointer"
                        onClick={() => {
                          const elementId = `heading-${item.id}`;
                          const element = document.getElementById(elementId);
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
                    No headings found in the document
                  </Text>
                )}
              </Box>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Markdown content */}
        <Box 
          flex="1" 
          p="5" 
          overflowY="auto" 
          className="markdown-preview"
          fontSize={`${fontSize}px`}
          lineHeight={lineHeight}
          sx={{
            '& > div > :first-of-type': {
              marginTop: 0,
            }
          }}
        >
          <React.Suspense fallback={<Spinner />}>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw, rehypeHighlight]}
              components={{
                h1: ({ node, ...props }) => <Heading as="h1" size="xl" mt={6} mb={4} id={`heading-${props.id}`} {...props} />,
                h2: ({ node, ...props }) => <Heading as="h2" size="lg" mt={5} mb={3} id={`heading-${props.id}`} {...props} />,
                h3: ({ node, ...props }) => <Heading as="h3" size="md" mt={4} mb={2} id={`heading-${props.id}`} {...props} />,
                h4: ({ node, ...props }) => <Heading as="h4" size="sm" mt={4} mb={2} id={`heading-${props.id}`} {...props} />,
                h5: ({ node, ...props }) => <Heading as="h5" size="xs" mt={3} mb={1} id={`heading-${props.id}`} {...props} />,
                h6: ({ node, ...props }) => <Heading as="h6" size="xs" fontWeight="medium" mt={3} mb={1} id={`heading-${props.id}`} {...props} />,
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
          </React.Suspense>
        </Box>
      </Flex>
    </Box>
  );
};

export default MarkdownPreview;