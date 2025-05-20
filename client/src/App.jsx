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
  useColorModeValue
} from '@chakra-ui/react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Header from './components/UI/Header';
import Sidebar from './components/UI/Sidebar';
import { useDocument } from './context/DocumentContext';
import SplashScreen from './components/UI/SplashScreen';
import WelcomeScreen from './components/UI/WelcomeScreen';
import PageNotFound from './components/UI/PageNotFound';

// Lazy loading για τα πιο βαριά components για βελτιωμένη απόδοση
const Editor = React.lazy(() => import('./components/Editor/Editor'));
const MarkdownPreview = React.lazy(() => import('./components/Editor/MarkdownPreview'));
const EditHistory = React.lazy(() => import('./components/Visualizations/EditHistory'));
const CollaborationMap = React.lazy(() => import('./components/Visualizations/CollaborationMap'));
const AnalyticsPanel = React.lazy(() => import('./components/UI/Analytics/AnalyticsPanel'));

/**
 * Κύριο Component της εφαρμογής
 * Διαχειρίζεται το routing και την κατάσταση της διεπαφής χρήστη
 */
const App = () => {
  // Sidebar state
  const { isOpen, onOpen, onClose } = useDisclosure({ defaultIsOpen: true });
  
  // Visibility states for panels
  const [showPreview, setShowPreview] = useState(true);
  const [showEditHistory, setShowEditHistory] = useState(false);
  const [showCollaborationMap, setShowCollaborationMap] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  
  // Theme management
  const { colorMode } = useColorMode();
  
  // Document context
  const { text, currentDoc, isLoading, isInitialLoad, createDocument } = useDocument();
  
  // Media queries for responsive layout
  const [isLargerThan1280] = useMediaQuery('(min-width: 1280px)');
  
  // SplashScreen management
  const [showSplash, setShowSplash] = useState(true);
  const location = useLocation();

  // Colors based on theme
  const bgColor = useColorModeValue('white', 'gray.900');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'gray.100');

  // Countdown timer για το splash screen
  useEffect(() => {
    console.log("App mounted, showing splash screen");
    // Αρχικοποίηση timer για προκαθορισμένο χρόνο εμφάνισης του splash screen
    const timer = setTimeout(() => {
      console.log("Splash screen timer complete, hiding splash");
      setShowSplash(false);
    }, 3000); // Λίγο μεγαλύτερο από το εσωτερικό timer του SplashScreen για ασφάλεια
    
    return () => {
      console.log("App unmounting, clearing timer");
      clearTimeout(timer);
    };
  }, []);

  // Κλείσιμο του sidebar σε μικρές οθόνες κατά την αλλαγή διαδρομής
  useEffect(() => {
    const checkScreenSize = () => {
      const isSmallScreen = window.innerWidth < 768;
      if (isSmallScreen) {
        onClose();
      }
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, [location.pathname, onClose]);

  // Fallback component για lazy-loaded components
  const LoadingFallback = () => (
    <Center h="full" w="full">
      <Spinner size="xl" color="blue.500" thickness="4px" />
    </Center>
  );

  // Εμφάνιση splash screen αν είμαστε στην αρχική φόρτωση
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
          <Slide direction='left' in={isOpen} style={{ zIndex: 10, position: 'absolute', height: 'calc(100vh - 56px)', top: '56px' }}>
            <Box
              w={{ base: "85vw", md: "280px" }}
              h="full"
              bg={useColorModeValue('white', 'gray.800')}
              borderRight="1px"
              borderColor={borderColor}
              boxShadow={{ base: "lg", md: "none" }}
              transition="all 0.3s"
            >
              <Sidebar onClose={onClose} />
            </Box>
          </Slide>
          
          {/* Content area */}
          <Box 
            flex="1" 
            ml={{ base: 0, md: isOpen ? "280px" : 0 }} 
            transition="margin-left 0.3s"
            overflow="hidden"
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
                          maxH="40vh"
                          borderBottom="1px" 
                          borderColor={borderColor}
                          bg={useColorModeValue('gray.50', 'gray.800')}
                        >
                          <Flex h="full" overflow="hidden">
                            {showEditHistory && (
                              <Box flex="1" p="2">
                                <EditHistory docId={currentDoc?.id} />
                              </Box>
                            )}
                            
                            {showCollaborationMap && (
                              <Box flex="1" p="2" borderLeft={showEditHistory ? "1px" : "0"} borderColor={borderColor}>
                                <CollaborationMap docId={currentDoc?.id} />
                              </Box>
                            )}
                            
                            {showAnalytics && (
                              <Box flex="1" p="2" borderLeft={(showEditHistory || showCollaborationMap) ? "1px" : "0"} borderColor={borderColor}>
                                <AnalyticsPanel docId={currentDoc?.id} />
                              </Box>
                            )}
                          </Flex>
                        </Box>
                      </Fade>
                    )}
                    
                    {/* Editor and preview */}
                    <Flex flex="1" overflow="hidden">
                      <Box 
                        flex="1" 
                        h="full" 
                        overflow="hidden"
                        transition="flex 0.3s ease"
                      >
                        <Suspense fallback={<LoadingFallback />}>
                          <Editor docId={currentDoc?.id} />
                        </Suspense>
                      </Box>
                      
                      {showPreview && (
                        <Fade in={showPreview}>
                          <Box 
                            w={isLargerThan1280 ? "50%" : "40%"} 
                            h="full" 
                            overflow="hidden"
                          >
                            <Suspense fallback={<LoadingFallback />}>
                              <MarkdownPreview content={text} />
                            </Suspense>
                          </Box>
                        </Fade>
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