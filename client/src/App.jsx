import React, { useState, useEffect } from 'react';
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
  Heading,
  Image,
  Button,
  VStack
} from '@chakra-ui/react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Editor from './components/Editor/Editor';
import MarkdownPreview from './components/Editor/MarkdownPreview';
import Header from './components/UI/Header';
import Sidebar from './components/UI/Sidebar';
import { useDocument } from './context/DocumentContext';
import EditHistory from './components/Visualizations/EditHistory';
import CollaborationMap from './components/Visualizations/CollaborationMap';
import AnalyticsPanel from './components/UI/Analytics/AnalyticsPanel';
import { useTheme } from './context/ThemeContext';
import SplashScreen from './components/UI/SplashScreen';
import WelcomeScreen from './components/UI/WelcomeScreen';
import PageNotFound from './components/UI/PageNotFound';
import { AddIcon } from '@chakra-ui/icons';

const App = () => {
  const { isOpen, onOpen, onClose } = useDisclosure({ defaultIsOpen: true });
  const [showPreview, setShowPreview] = useState(true);
  const [showEditHistory, setShowEditHistory] = useState(false);
  const [showCollaborationMap, setShowCollaborationMap] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const { theme } = useTheme();
  const { colorMode } = useColorMode();
  const { text, currentDoc, isLoading, isInitialLoad, createDocument } = useDocument();
  const [isLargerThan1280] = useMediaQuery('(min-width: 1280px)');
  const [showSplash, setShowSplash] = useState(true);
  const location = useLocation();

  // Εμφάνιση splash screen κατά την αρχική φόρτωση
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);

  // Κλείνουμε το sidebar σε μικρές οθόνες κατά την αλλαγή διαδρομής
  useEffect(() => {
    const [isLargerThanMD] = useMediaQuery('(min-width: 768px)');
    if (!isLargerThanMD) {
      onClose();
    }
  }, [location.pathname, onClose]);

  // Αν βρισκόμαστε στην αρχική φόρτωση, εμφανίζουμε splash screen
  if (showSplash || isInitialLoad) {
    return <SplashScreen setShowSplash={setShowSplash} />;
  }

  return (
    <Box h="100vh" overflow="hidden" position="relative">
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
              bg={colorMode === 'dark' ? 'gray.800' : 'white'}
              borderRight="1px"
              borderColor={colorMode === 'dark' ? 'gray.700' : 'gray.200'}
              boxShadow={{ base: "lg", md: "none" }}
              transition="all 0.3s"
            >
              <Sidebar onClose={onClose} />
            </Box>
          </Slide>
          
          {/* Content area with fixed sidebar space */}
          <Box 
            flex="1" 
            ml={{ base: 0, md: isOpen ? "280px" : 0 }} 
            transition="margin-left 0.3s"
            overflow="hidden"
          >
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
                        borderColor={colorMode === 'dark' ? 'gray.700' : 'gray.200'}
                        bg={colorMode === 'dark' ? 'gray.900' : 'gray.50'}
                      >
                        <Flex h="full" overflow="hidden">
                          {showEditHistory && (
                            <Box flex="1" p="2" className="animate-fade-in">
                              <EditHistory docId={currentDoc?.id} />
                            </Box>
                          )}
                          
                          {showCollaborationMap && (
                            <Box flex="1" p="2" borderLeft={showEditHistory ? "1px" : "0"} borderColor={colorMode === 'dark' ? 'gray.700' : 'gray.200'} className="animate-fade-in">
                              <CollaborationMap docId={currentDoc?.id} />
                            </Box>
                          )}
                          
                          {showAnalytics && (
                            <Box flex="1" p="2" borderLeft={(showEditHistory || showCollaborationMap) ? "1px" : "0"} borderColor={colorMode === 'dark' ? 'gray.700' : 'gray.200'} className="animate-fade-in">
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
                      <Editor docId={currentDoc?.id} />
                    </Box>
                    
                    {showPreview && (
                      <Fade in={showPreview}>
                        <Box 
                          w={isLargerThan1280 ? "50%" : "40%"} 
                          h="full" 
                          overflow="hidden"
                        >
                          <MarkdownPreview content={text} />
                        </Box>
                      </Fade>
                    )}
                  </Flex>
                </Flex>
              } />
              <Route path="*" element={<PageNotFound />} />
            </Routes>
          </Box>
        </Flex>
      </Flex>
    </Box>
  );
};

export default App;