import React, { useState } from 'react';
import { 
  Box, 
  Flex, 
  useDisclosure,
  useColorMode,
  useMediaQuery
} from '@chakra-ui/react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Editor from './components/Editor/Editor';
import MarkdownPreview from './components/Editor/MarkdownPreview';
import Header from './components/UI/Header';
import Sidebar from './components/UI/Sidebar';
import { useDocument } from './context/DocumentContext';
import EditHistory from './components/Visualizations/EditHistory';
import CollaborationMap from './components/Visualizations/CollaborationMap';
import AnalyticsPanel from './components/UI/Analytics/AnalyticsPanel';
import { useTheme } from './context/ThemeContext';

const App = () => {
  const { isOpen, onOpen, onClose } = useDisclosure({ defaultIsOpen: true });
  const [showPreview, setShowPreview] = useState(true);
  const [showEditHistory, setShowEditHistory] = useState(false);
  const [showCollaborationMap, setShowCollaborationMap] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const { theme } = useTheme();
  const { colorMode } = useColorMode();
  const { text, currentDoc } = useDocument();
  const [isLargerThan1280] = useMediaQuery('(min-width: 1280px)');

  return (
    <Box h="100vh" overflow="hidden">
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
          {isOpen && (
            <Box
              w={{ base: "full", md: "250px" }}
              position={{ base: "absolute", md: "relative" }}
              h="full"
              zIndex="10"
              bg={colorMode === 'dark' ? 'gray.800' : 'white'}
              borderRight="1px"
              borderColor={colorMode === 'dark' ? 'gray.700' : 'gray.200'}
              boxShadow={{ base: "lg", md: "none" }}
              transition="all 0.3s"
              className="animate-slide-up"
            >
              <Sidebar onClose={onClose} />
            </Box>
          )}
          
          {/* Content area */}
          <Box flex="1" overflow="hidden">
            <Routes>
              <Route path="/" element={<Navigate to="/documents" replace />} />
              <Route path="/documents" element={
                currentDoc ? <Navigate to={`/documents/${currentDoc.id}`} replace /> : <Box p="8">Select or create a document</Box>
              } />
              <Route path="/documents/:id" element={
                <Flex direction="column" h="full" overflow="hidden">
                  {/* Visualization panels */}
                  {(showEditHistory || showCollaborationMap || showAnalytics) && (
                    <Box 
                      w="full" 
                      h="30%" 
                      minH="200px" 
                      borderBottom="1px" 
                      borderColor={colorMode === 'dark' ? 'gray.700' : 'gray.200'}
                      className="animate-fade-in"
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
                      <Box 
                        w={isLargerThan1280 ? "50%" : "40%"} 
                        h="full" 
                        overflow="hidden"
                        className="animate-fade-in"
                      >
                        <MarkdownPreview content={text} />
                      </Box>
                    )}
                  </Flex>
                </Flex>
              } />
            </Routes>
          </Box>
        </Flex>
      </Flex>
    </Box>
  );
};

export default App;