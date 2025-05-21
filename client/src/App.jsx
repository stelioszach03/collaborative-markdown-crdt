import React, { useState, useEffect, Suspense } from 'react';
import { 
  Box, 
  Flex, 
  useDisclosure,
  useColorMode,
  useMediaQuery,
  Slide,
  Fade,
  Spinner,
  Center,
  Text,
  useColorModeValue,
  useToast
} from '@chakra-ui/react';
import { Routes, Route, Navigate, useLocation, useParams } from 'react-router-dom';
import Header from './components/UI/Header';
import Sidebar from './components/UI/Sidebar';
import { useDocument } from './context/DocumentContext';
import SplashScreen from './components/UI/SplashScreen';
import WelcomeScreen from './components/UI/WelcomeScreen';
import PageNotFound from './components/UI/PageNotFound';

// Lazy loading for better performance
const Editor = React.lazy(() => import('./components/Editor/Editor'));
const MarkdownPreview = React.lazy(() => import('./components/Editor/MarkdownPreview'));
const EditHistory = React.lazy(() => import('./components/Visualizations/EditHistory'));
const CollaborationMap = React.lazy(() => import('./components/Visualizations/CollaborationMap'));
const AnalyticsPanel = React.lazy(() => import('./components/UI/Analytics/AnalyticsPanel'));

/**
 * Main App Component - Handles routing and layout of the application
 */
const App = () => {
  // Sidebar state
  const { isOpen, onOpen, onClose } = useDisclosure({ defaultIsOpen: true });
  
  // Panel visibility states
  const [showPreview, setShowPreview] = useState(true);
  const [showEditHistory, setShowEditHistory] = useState(false);
  const [showCollaborationMap, setShowCollaborationMap] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  
  // Theme management
  const { colorMode } = useColorMode();
  
  // Document context
  const { text, currentDoc, isLoading, isInitialLoad, connectionStatus, createDocument, refreshConnection } = useDocument();
  
  // Media queries for responsive layout
  const [isLargerThan1280] = useMediaQuery('(min-width: 1280px)');
  const [isLargerThan768] = useMediaQuery('(min-width: 768px)');
  
  // Panel sizing - allow user to resize panels
  const [previewSize, setPreviewSize] = useState(isLargerThan1280 ? 45 : 40);
  
  // SplashScreen management
  const [showSplash, setShowSplash] = useState(true);
  const location = useLocation();
  const toast = useToast();

  // Colors based on theme
  const bgColor = useColorModeValue('white', 'gray.900');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'gray.100');

  // Show toast for connection status changes
  useEffect(() => {
    if (connectionStatus === 'connected') {
      toast({
        title: "Connected",
        description: "Real-time collaboration is active",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "bottom-right"
      });
    } else if (connectionStatus === 'disconnected') {
      toast({
        title: "Disconnected",
        description: "Attempting to reconnect...",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom-right",
        onCloseComplete: () => {
          // Offer to refresh connection
          if (connectionStatus === 'disconnected') {
            toast({
              title: "Still disconnected",
              description: "Would you like to try reconnecting?",
              status: "error",
              duration: null,
              isClosable: true,
              position: "bottom-right",
              action: <Box onClick={refreshConnection} cursor="pointer" fontWeight="bold">Reconnect</Box>
            });
          }
        }
      });
    }
  }, [connectionStatus, toast, refreshConnection]);

  // Hide splash screen after a delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 1500); // Shorter time for better UX
    
    return () => clearTimeout(timer);
  }, []);

  // Close sidebar on small screens when navigating
  useEffect(() => {
    const checkScreenSize = () => {
      const isSmallScreen = window.innerWidth < 768;
      if (isSmallScreen) {
        onClose();
      } else if (window.innerWidth > 1200) {
        onOpen();
      }
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, [location.pathname, onClose, onOpen]);

  // Handle resize of preview panel
  const handleResize = (e) => {
    if (!isLargerThan768) return;
    
    const container = document.getElementById('editor-container');
    if (!container) return;
    
    const containerWidth = container.clientWidth;
    const mouseX = e.clientX;
    const sidebarWidth = isOpen ? 280 : 0;
    const percentage = ((mouseX - sidebarWidth) / containerWidth) * 100;
    
    // Constrain the preview size between 30% and 70%
    if (percentage >= 30 && percentage <= 70) {
      setPreviewSize(100 - percentage);
    }
  };

  // Loading fallback component for lazy-loaded components
  const LoadingFallback = () => (
    <Center h="full" w="full">
      <Spinner size="xl" color="blue.500" thickness="4px" />
    </Center>
  );

  // Show splash screen during initial load
  if (showSplash || isInitialLoad) {
    return <SplashScreen setShowSplash={setShowSplash} />;
  }

  return (
    <Box h="100vh" overflow="hidden" position="relative" bg={bgColor} color={textColor}>
      <Flex direction="column" h="full">
        {/* Header */}
        <Header
          toggleSidebar={isOpen ? onClose : onOpen}
          isSidebarOpen={isOpen}
          togglePreview={() => setShowPreview(!showPreview)}
          isPreviewVisible={showPreview}
          toggleEditHistory={() => setShowEditHistory(!showEditHistory)}
          isEditHistoryVisible={showEditHistory}
          toggleCollaborationMap={() => setShowCollaborationMap(!showCollaborationMap)}
          isCollaborationMapVisible={showCollaborationMap}
          toggleAnalytics={() => setShowAnalytics(!showAnalytics)}
          isAnalyticsVisible={showAnalytics}
        />
        
        {/* Main content */}
        <Flex flex="1" overflow="hidden">
          {/* Sidebar */}
          <Slide 
            direction='left' 
            in={isOpen} 
            style={{ 
              zIndex: 20, 
              position: isLargerThan768 ? 'relative' : 'absolute', 
              height: 'calc(100vh - 56px)', 
              top: isLargerThan768 ? 0 : '56px',
              width: isLargerThan768 ? '280px' : '85vw',
            }}
          >
            <Box
              w={isLargerThan768 ? "280px" : "85vw"}
              h="full"
              bg={useColorModeValue('white', 'gray.800')}
              borderRight="1px"
              borderColor={borderColor}
              boxShadow={{ base: "lg", md: "none" }}
              transition="all 0.3s"
              overflow="hidden"
            >
              <Sidebar onClose={onClose} />
            </Box>
          </Slide>
          
          {/* Content area */}
          <Box 
            flex="1" 
            ml={{ base: 0, md: isOpen ? "0" : 0 }} 
            transition="margin-left 0.3s"
            overflow="hidden"
            id="editor-container"
          >
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                <Route path="/" element={<Navigate to="/documents" replace />} />
                <Route path="/documents" element={
                  isLoading ? (
                    <Center h="full">
                      <Spinner size="xl" color="blue.500" thickness="4px" />
                    </Center>
                  ) : currentDoc ? (
                    <Navigate to={`/documents/${currentDoc.id}`} replace />
                  ) : (
                    <WelcomeScreen onCreateDocument={createDocument} />
                  )
                } />
                <Route path="/documents/:id" element={
                  <Flex direction="column" h="full" overflow="hidden">
                    {/* Visualization panels */}
                    {(showEditHistory || showCollaborationMap || showAnalytics) && (
                      <Fade in={showEditHistory || showCollaborationMap || showAnalytics}>
                        <Box 
                          w="full" 
                          h="280px" 
                          minH="200px"
                          maxH={{ base: "50vh", md: "40vh" }}
                          borderBottom="1px" 
                          borderColor={borderColor}
                          bg={useColorModeValue('gray.50', 'gray.800')}
                        >
                          <Flex h="full" overflow="hidden" direction={{ base: "column", md: "row" }}>
                            {showEditHistory && (
                              <Box flex="1" p="2" minW={{ base: "full", md: "300px" }}>
                                <EditHistory docId={currentDoc?.id} />
                              </Box>
                            )}
                            
                            {showCollaborationMap && (
                              <Box 
                                flex="1" 
                                p="2" 
                                borderLeft={{ base: "none", md: showEditHistory ? "1px" : "0" }}
                                borderTop={{ base: showEditHistory ? "1px" : "0", md: "none" }}
                                borderColor={borderColor}
                                minW={{ base: "full", md: "300px" }}
                              >
                                <CollaborationMap docId={currentDoc?.id} />
                              </Box>
                            )}
                            
                            {showAnalytics && (
                              <Box 
                                flex="1" 
                                p="2" 
                                borderLeft={{ base: "none", md: (showEditHistory || showCollaborationMap) ? "1px" : "0" }}
                                borderTop={{ base: (showEditHistory || showCollaborationMap) ? "1px" : "0", md: "none" }}
                                borderColor={borderColor}
                                minW={{ base: "full", md: "300px" }}
                              >
                                <AnalyticsPanel docId={currentDoc?.id} />
                              </Box>
                            )}
                          </Flex>
                        </Box>
                      </Fade>
                    )}
                    
                    {/* Editor and preview */}
                    <Flex 
                      flex="1" 
                      overflow="hidden" 
                      position="relative"
                    >
                      <Box 
                        w={showPreview ? `${100 - previewSize}%` : "100%"} 
                        h="full" 
                        overflow="hidden"
                        transition="width 0.3s ease"
                      >
                        <Suspense fallback={<LoadingFallback />}>
                          <Editor docId={currentDoc?.id} />
                        </Suspense>
                      </Box>
                      
                      {/* Resize handle */}
                      {showPreview && (
                        <Box 
                          w="5px" 
                          h="full" 
                          bg={borderColor} 
                          cursor="col-resize"
                          onMouseDown={() => {
                            document.addEventListener('mousemove', handleResize);
                            document.addEventListener('mouseup', () => {
                              document.removeEventListener('mousemove', handleResize);
                            }, { once: true });
                          }}
                          _hover={{ bg: 'blue.400' }}
                          display={{ base: "none", md: "block" }}
                        />
                      )}
                      
                      {showPreview && (
                        <Box 
                          w={{ base: "100%", md: `${previewSize}%` }} 
                          h="full" 
                          overflow="hidden"
                          position={{ base: showPreview ? "absolute" : "static", md: "static" }}
                          top="0"
                          right="0"
                          transition="width 0.3s ease"
                          zIndex={{ base: 10, md: 1 }}
                          display={showPreview ? "block" : "none"}
                        >
                          <Suspense fallback={<LoadingFallback />}>
                            <MarkdownPreview content={text} />
                          </Suspense>
                        </Box>
                      )}
                    </Flex>
                  </Flex>
                } />
                <Route path="*" element={<PageNotFound />} />
              </Routes>
            </Suspense>
          </Box>
        </Flex>
      </Flex>
    </Box>
  );
};

export default App;