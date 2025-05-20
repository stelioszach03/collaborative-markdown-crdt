# Collaborative Markdown Editor - Project Code

This file contains all the code from the project, organized by file.

Generated on: Tue May 20 18:50:35 EEST 2025


# File: client/index.html

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/src/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Collaborative Markdown Editor</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>```




# File: client/package.json

```json
{
    "name": "collaborative-markdown-editor-client",
    "private": true,
    "version": "0.1.0",
    "type": "module",
    "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext js,jsx --report-unused-disable-directives --max-warnings 0"
  },
    "dependencies": {
      "@chakra-ui/react": "^2.8.2",
      "@chakra-ui/icons": "^2.1.1",
      "@emotion/react": "^11.11.3",
      "@emotion/styled": "^11.11.0",
      "framer-motion": "^10.17.9",
      "y-websocket": "^1.5.1",
      "y-prosemirror": "^1.2.0",
      "yjs": "^13.6.10",
      "react": "^18.2.0",
      "react-dom": "^18.2.0",
      "react-icons": "^4.12.0",
      "react-markdown": "^9.0.1",
      "remark-gfm": "^4.0.0",
      "uuid": "^9.0.1",
      "rehype-highlight": "^7.0.0",
      "rehype-raw": "^7.0.0",
      "react-router-dom": "^6.21.1",
      "recharts": "^2.10.3",
      "date-fns": "^3.0.6"
    },
    "devDependencies": {
      "@types/react": "^18.2.46",
      "@types/react-dom": "^18.2.18",
      "@vitejs/plugin-react": "^4.2.1",
      "autoprefixer": "^10.4.16",
      "eslint": "^8.56.0",
      "eslint-plugin-react": "^7.33.2",
      "eslint-plugin-react-hooks": "^4.6.0",
      "eslint-plugin-react-refresh": "^0.4.5",
      "postcss": "^8.4.32",
      "tailwindcss": "^3.4.0",
      "vite": "^5.0.10"
    }
  }```




# File: client/src/App.jsx

```jsx
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

export default App;```




# File: client/src/components/Editor/Editor.jsx

```jsx
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { 
  Box, 
  Flex, 
  useColorModeValue,
  Text
} from '@chakra-ui/react';
import { useCRDT } from '../../hooks/useCRDT';
import { useDocument } from '../../context/DocumentContext';
import { indexToPosition, positionToIndex, getCursorCoordinates } from '../../utils/crdt';
import EditorToolbar from './EditorToolbar';
import UserCursor from './UserCursor';
import { useTheme } from '../../context/ThemeContext';
import { insertMarkdown } from '../../utils/markdown';

const Editor = ({ docId }) => {
  const editorRef = useRef(null);
  const textareaRef = useRef(null);
  const { theme } = useTheme();
  const { text } = useDocument();
  const { 
    ytext,
    connected,
    awarenessStates,
    insertText,
    deleteText,
    debouncedUpdateCursor,
    undo,
    redo
  } = useCRDT(docId);

  const [selection, setSelection] = useState({ start: 0, end: 0 });
  const [isEditing, setIsEditing] = useState(false);
  const [cursorCoordinates, setCursorCoordinates] = useState({ top: 0, left: 0 });

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'gray.100');
  
  // Handle cursor movement and selection
  const handleCursorChange = useCallback(() => {
    if (!textareaRef.current) return;
    
    const { selectionStart, selectionEnd } = textareaRef.current;
    setSelection({ start: selectionStart, end: selectionEnd });
    
    // Update cursor coordinates
    const position = indexToPosition(text, selectionStart);
    const coordinates = getCursorCoordinates(textareaRef.current, position);
    setCursorCoordinates(coordinates);
    
    // Update awareness state
    if (selectionStart === selectionEnd) {
      debouncedUpdateCursor(position);
    } else {
      debouncedUpdateCursor(
        indexToPosition(text, selectionStart),
        {
          anchor: indexToPosition(text, selectionStart),
          head: indexToPosition(text, selectionEnd)
        }
      );
    }
  }, [text, debouncedUpdateCursor]);

  // Handle text changes
  const handleChange = useCallback((e) => {
    if (!ytext) return;
    
    const newText = e.target.value;
    const oldText = text;
    
    if (newText === oldText) return;
    
    // Find the diff and apply it
    if (oldText.length === 0) {
      // Insert all text
      insertText(0, newText);
    } else if (newText.length > oldText.length) {
      // Text was added
      let commonPrefixLength = 0;
      for (let i = 0; i < Math.min(oldText.length, newText.length); i++) {
        if (oldText[i] !== newText[i]) break;
        commonPrefixLength++;
      }
      
      const addedText = newText.slice(commonPrefixLength);
      if (commonPrefixLength < oldText.length) {
        // Some text was replaced
        const deletedLength = oldText.length - commonPrefixLength;
        deleteText(commonPrefixLength, deletedLength);
      }
      insertText(commonPrefixLength, addedText);
    } else {
      // Text was deleted
      let commonPrefixLength = 0;
      for (let i = 0; i < Math.min(oldText.length, newText.length); i++) {
        if (oldText[i] !== newText[i]) break;
        commonPrefixLength++;
      }
      
      const deletedLength = oldText.length - newText.length;
      deleteText(commonPrefixLength, deletedLength);
    }
    
    handleCursorChange();
  }, [ytext, text, insertText, deleteText, handleCursorChange]);

  // Format text
  const formatText = useCallback((syntax, options = {}) => {
    if (!ytext || !textareaRef.current) return;
    
    const formattedText = insertMarkdown(text, syntax, selection, options);
    
    // Calculate the diff and apply targeted changes
    if (formattedText !== text) {
      // For simplicity, we're replacing the entire text
      // In a production app, you would calculate a more precise diff
      deleteText(0, text.length);
      insertText(0, formattedText);
      
      // Focus back on the editor
      textareaRef.current.focus();
    }
  }, [ytext, text, selection, deleteText, insertText]);

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback((e) => {
    // Undo/Redo
    if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
      if (e.shiftKey) {
        e.preventDefault();
        redo();
      } else {
        e.preventDefault();
        undo();
      }
    }
    
    // Bold
    if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
      e.preventDefault();
      formatText('bold');
    }
    
    // Italic
    if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
      e.preventDefault();
      formatText('italic');
    }
    
    // Tab key for indentation
    if (e.key === 'Tab') {
      e.preventDefault();
      const { selectionStart } = textareaRef.current;
      insertText(selectionStart, '  '); // Insert 2 spaces
      
      // Move cursor
      setTimeout(() => {
        textareaRef.current.selectionStart = selectionStart + 2;
        textareaRef.current.selectionEnd = selectionStart + 2;
        handleCursorChange();
      }, 0);
    }
  }, [undo, redo, formatText, insertText, handleCursorChange]);

  // Focus the editor on mount
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  // Render remote cursors
  const renderRemoteCursors = () => {
    if (!awarenessStates.size) return null;
    
    return Array.from(awarenessStates.entries()).map(([clientId, state]) => {
      if (!state.cursor) return null;
      
      // Convert cursor position to coordinates
      const cursorCoords = getCursorCoordinates(editorRef.current, state.cursor);
      
      return (
        <UserCursor
          key={clientId}
          username={state.username || 'Anonymous'}
          color={state.color || '#cccccc'}
          position={cursorCoords}
          selection={state.selection}
        />
      );
    });
  };

  return (
    <Box w="full" h="full" position="relative">
      <EditorToolbar 
        formatText={formatText}
        selection={selection}
        undo={undo}
        redo={redo}
        connected={connected}
      />
      
      <Flex 
        position="relative" 
        width="full" 
        height="calc(100% - 40px)" 
        className="editor-container"
      >
        {/* Status indicator */}
        <Box
          position="absolute"
          top="2"
          right="2"
          display="flex"
          alignItems="center"
          zIndex="5"
        >
          <Box
            w="8px"
            h="8px"
            borderRadius="full"
            bg={connected ? 'green.500' : 'red.500'}
            mr="2"
          />
          <Text fontSize="xs" color={textColor}>
            {connected ? 'Connected' : 'Disconnected'}
          </Text>
        </Box>
        
        {/* Editor */}
        <Box 
          ref={editorRef}
          position="relative" 
          width="full" 
          height="full" 
          overflow="auto"
          className="markdown-editor"
          onMouseDown={() => setIsEditing(true)}
          onMouseUp={() => setIsEditing(false)}
        >
          <Box 
            as="textarea"
            ref={textareaRef}
            value={text}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onClick={handleCursorChange}
            onKeyUp={handleCursorChange}
            onSelect={handleCursorChange}
            padding="4"
            width="full"
            height="full"
            outline="none"
            bg={bgColor}
            border="none"
            color={textColor}
            fontFamily="mono"
            fontSize="sm"
            lineHeight="1.6"
            resize="none"
            position="absolute"
            top="0"
            left="0"
            right="0"
            bottom="0"
            zIndex="1"
            sx={{
              '&::selection': {
                backgroundColor: theme === 'dark' ? 'rgba(99, 179, 237, 0.3)' : 'rgba(0, 115, 255, 0.2)',
              }
            }}
          />
          
          {/* Remote cursors */}
          {renderRemoteCursors()}
        </Box>
      </Flex>
    </Box>
  );
};

export default Editor;```




# File: client/src/components/Editor/EditorToolbar.jsx

```jsx
import React from 'react';
import {
  Box,
  Flex,
  IconButton,
  Tooltip,
  Divider,
  useColorModeValue,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button
} from '@chakra-ui/react';
import {
  FaBold,
  FaItalic,
  FaLink,
  FaImage,
  FaCode,
  FaListUl,
  FaListOl,
  FaQuoteRight,
  FaUndo,
  FaRedo,
  FaHeading,
  FaTable
} from 'react-icons/fa';
import { TbSeparatorHorizontal } from 'react-icons/tb';
import { IoMdAttach } from 'react-icons/io';
import { ChevronDownIcon } from '@chakra-ui/icons';

const EditorToolbar = ({ formatText, selection, undo, redo, connected }) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const iconColor = useColorModeValue('gray.700', 'gray.300');

  // Format headings
  const formatHeading = (level) => {
    formatText('heading', { level });
  };

  return (
    <Flex
      width="full"
      h="40px"
      bg={bgColor}
      borderBottom="1px"
      borderColor={borderColor}
      p="1"
      alignItems="center"
      overflowX="auto"
      className="editor-toolbar"
    >
      <Box display="flex" alignItems="center">
        {/* Undo/Redo */}
        <Tooltip label="Undo (Ctrl+Z)" aria-label="Undo">
          <IconButton
            icon={<FaUndo />}
            size="sm"
            variant="ghost"
            aria-label="Undo"
            onClick={undo}
            color={iconColor}
            mx="1"
          />
        </Tooltip>
        
        <Tooltip label="Redo (Ctrl+Shift+Z)" aria-label="Redo">
          <IconButton
            icon={<FaRedo />}
            size="sm"
            variant="ghost"
            aria-label="Redo"
            onClick={redo}
            color={iconColor}
            mx="1"
          />
        </Tooltip>
        
        <Divider orientation="vertical" h="20px" mx="2" />
        
        {/* Headings */}
        <Menu>
          <Tooltip label="Headings" aria-label="Headings">
            <MenuButton
              as={Button}
              size="sm"
              variant="ghost"
              color={iconColor}
              mx="1"
              leftIcon={<FaHeading />}
              rightIcon={<ChevronDownIcon />}
            >
              Heading
            </MenuButton>
          </Tooltip>
          <MenuList>
            <MenuItem onClick={() => formatHeading(1)}>Heading 1</MenuItem>
            <MenuItem onClick={() => formatHeading(2)}>Heading 2</MenuItem>
            <MenuItem onClick={() => formatHeading(3)}>Heading 3</MenuItem>
            <MenuItem onClick={() => formatHeading(4)}>Heading 4</MenuItem>
            <MenuItem onClick={() => formatHeading(5)}>Heading 5</MenuItem>
            <MenuItem onClick={() => formatHeading(6)}>Heading 6</MenuItem>
          </MenuList>
        </Menu>
        
        <Divider orientation="vertical" h="20px" mx="2" />
        
        {/* Text formatting */}
        <Tooltip label="Bold (Ctrl+B)" aria-label="Bold">
          <IconButton
            icon={<FaBold />}
            size="sm"
            variant="ghost"
            aria-label="Bold"
            onClick={() => formatText('bold')}
            color={iconColor}
            mx="1"
          />
        </Tooltip>
        
        <Tooltip label="Italic (Ctrl+I)" aria-label="Italic">
          <IconButton
            icon={<FaItalic />}
            size="sm"
            variant="ghost"
            aria-label="Italic"
            onClick={() => formatText('italic')}
            color={iconColor}
            mx="1"
          />
        </Tooltip>
        
        <Divider orientation="vertical" h="20px" mx="2" />
        
        {/* Links and media */}
        <Tooltip label="Insert Link" aria-label="Insert Link">
          <IconButton
            icon={<FaLink />}
            size="sm"
            variant="ghost"
            aria-label="Insert Link"
            onClick={() => formatText('link', { url: 'https://example.com' })}
            color={iconColor}
            mx="1"
          />
        </Tooltip>
        
        <Tooltip label="Insert Image" aria-label="Insert Image">
          <IconButton
            icon={<FaImage />}
            size="sm"
            variant="ghost"
            aria-label="Insert Image"
            onClick={() => formatText('image', { url: 'https://via.placeholder.com/150' })}
            color={iconColor}
            mx="1"
          />
        </Tooltip>
        
        <Divider orientation="vertical" h="20px" mx="2" />
        
        {/* Code */}
        <Menu>
          <Tooltip label="Insert Code" aria-label="Insert Code">
            <MenuButton
              as={IconButton}
              icon={<FaCode />}
              size="sm"
              variant="ghost"
              color={iconColor}
              mx="1"
            />
          </Tooltip>
          <MenuList>
            <MenuItem onClick={() => formatText('code-inline')}>Inline Code</MenuItem>
            <MenuItem onClick={() => formatText('code-block', { language: 'javascript' })}>Code Block</MenuItem>
          </MenuList>
        </Menu>
        
        <Divider orientation="vertical" h="20px" mx="2" />
        
        {/* Lists */}
        <Tooltip label="Unordered List" aria-label="Unordered List">
          <IconButton
            icon={<FaListUl />}
            size="sm"
            variant="ghost"
            aria-label="Unordered List"
            onClick={() => formatText('unordered-list')}
            color={iconColor}
            mx="1"
          />
        </Tooltip>
        
        <Tooltip label="Ordered List" aria-label="Ordered List">
          <IconButton
            icon={<FaListOl />}
            size="sm"
            variant="ghost"
            aria-label="Ordered List"
            onClick={() => formatText('ordered-list')}
            color={iconColor}
            mx="1"
          />
        </Tooltip>
        
        <Divider orientation="vertical" h="20px" mx="2" />
        
        {/* Blockquote */}
        <Tooltip label="Blockquote" aria-label="Blockquote">
          <IconButton
            icon={<FaQuoteRight />}
            size="sm"
            variant="ghost"
            aria-label="Blockquote"
            onClick={() => formatText('blockquote')}
            color={iconColor}
            mx="1"
          />
        </Tooltip>
        
        {/* Horizontal Rule */}
        <Tooltip label="Horizontal Rule" aria-label="Horizontal Rule">
          <IconButton
            icon={<TbSeparatorHorizontal />}
            size="sm"
            variant="ghost"
            aria-label="Horizontal Rule"
            onClick={() => formatText('horizontal-rule')}
            color={iconColor}
            mx="1"
          />
        </Tooltip>
        
        {/* Table */}
        <Tooltip label="Insert Table" aria-label="Insert Table">
          <IconButton
            icon={<FaTable />}
            size="sm"
            variant="ghost"
            aria-label="Insert Table"
            onClick={() => formatText('table')}
            color={iconColor}
            mx="1"
          />
        </Tooltip>
        
        <Divider orientation="vertical" h="20px" mx="2" />
        
        {/* File Attachment (placeholder) */}
        <Tooltip label="Attach File (Placeholder)" aria-label="Attach File">
          <IconButton
            icon={<IoMdAttach />}
            size="sm"
            variant="ghost"
            aria-label="Attach File"
            onClick={() => alert('File attachment is a placeholder feature')}
            color={iconColor}
            mx="1"
          />
        </Tooltip>
      </Box>
    </Flex>
  );
};

export default EditorToolbar;```




# File: client/src/components/Editor/MarkdownPreview.jsx

```jsx
import React, { useMemo } from 'react';
import { Box, useColorModeValue } from '@chakra-ui/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';

const MarkdownPreview = ({ content }) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'gray.100');
  
  // Optimize rendering with useMemo
  const renderedMarkdown = useMemo(() => {
    return (
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeHighlight]}
      >
        {content}
      </ReactMarkdown>
    );
  }, [content]);

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
      {renderedMarkdown}
    </Box>
  );
};

export default MarkdownPreview;```




# File: client/src/components/Editor/UserCursor.jsx

```jsx
import React from 'react';
import { Box, Text } from '@chakra-ui/react';

const UserCursor = ({ username, color, position, selection }) => {
  return (
    <>
      {/* Cursor */}
      <Box
        className="user-cursor"
        style={{
          top: `${position.top}px`,
          left: `${position.left}px`,
          backgroundColor: color
        }}
      >
        {/* User label */}
        <Text
          className="user-label"
          style={{
            backgroundColor: color,
            color: '#ffffff'
          }}
        >
          {username}
        </Text>
      </Box>
      
      {/* Selection if applicable */}
      {selection && selection.anchor && selection.head && (
        <Box
          position="absolute"
          style={{
            top: `${Math.min(selection.anchor.top, selection.head.top)}px`,
            left: `${Math.min(selection.anchor.left, selection.head.left)}px`,
            width: `${Math.abs(selection.head.left - selection.anchor.left)}px`,
            height: `${Math.abs(selection.head.top - selection.anchor.top) || 20}px`,
            backgroundColor: `${color}33`, // 20% opacity
            pointerEvents: 'none'
          }}
        />
      )}
    </>
  );
};

export default UserCursor;```




# File: client/src/components/UI/Analytics/AnalyticsPanel.jsx

```jsx
import React, { useEffect, useState } from 'react';
import {
  Box,
  Text,
  Heading,
  Grid,
  GridItem,
  useColorModeValue,
  Spinner,
  Flex,
  VStack,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Badge,
  HStack,
  Progress,
  useToken,
  Alert,
  AlertIcon
} from '@chakra-ui/react';
import { 
  FaEdit, 
  FaUsers, 
  FaClock, 
  FaFileAlt, 
  FaRegSave
} from 'react-icons/fa';
import { useDocument } from '../../../context/DocumentContext';

const AnalyticsPanel = ({ docId }) => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { text } = useDocument();
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const statBgColor = useColorModeValue('gray.50', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'gray.100');
  const [blue500] = useToken('colors', ['blue.500']);

  useEffect(() => {
    if (!docId) return;
    
    const fetchAnalyticsData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/documents/${docId}/analytics`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch document analytics');
        }
        
        const data = await response.json();
        setAnalyticsData(data);
      } catch (err) {
        console.error('Error fetching document analytics:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAnalyticsData();
    
    // Set up interval to refresh data every 30 seconds
    const intervalId = setInterval(fetchAnalyticsData, 30000);
    
    return () => clearInterval(intervalId);
  }, [docId, text]);

  if (error) {
    return (
      <Box
        h="full"
        bg={bgColor}
        borderRadius="md"
        overflow="hidden"
        p="4"
      >
        <Alert status="error">
          <AlertIcon />
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box
      h="full"
      bg={bgColor}
      borderRadius="md"
      overflow="hidden"
      className="analytics-panel"
    >
      <Flex justifyContent="space-between" alignItems="center" p="3">
        <Heading size="sm">Document Analytics</Heading>
        <Badge colorScheme="purple">Live</Badge>
      </Flex>
      
      {loading || !analyticsData ? (
        <Flex h="80%" justifyContent="center" alignItems="center">
          <Spinner size="xl" color="purple.500" />
        </Flex>
      ) : (
        <Box p="2" overflowY="auto" h="85%">
          <Grid templateColumns={{ base: "repeat(1, 1fr)", md: "repeat(2, 1fr)" }} gap="4">
            {/* Total Edits */}
            <GridItem>
              <Stat
                p="3"
                borderRadius="md"
                bg={statBgColor}
                borderLeft="4px"
                borderColor="blue.500"
              >
                <Flex align="center">
                  <Box color="blue.500" mr="3">
                    <FaEdit size="20px" />
                  </Box>
                  <Box>
                    <StatLabel>Total Edits</StatLabel>
                    <StatNumber>{analyticsData.totalEdits}</StatNumber>
                    <StatHelpText>
                      {analyticsData.editsTrend !== 0 && (
                        <StatArrow type={analyticsData.editsTrend > 0 ? "increase" : "decrease"} />
                      )}
                      {Math.abs(analyticsData.editsTrend)}% from last session
                    </StatHelpText>
                  </Box>
                </Flex>
              </Stat>
            </GridItem>
            
            {/* Collaborators */}
            <GridItem>
              <Stat
                p="3"
                borderRadius="md"
                bg={statBgColor}
                borderLeft="4px"
                borderColor="green.500"
              >
                <Flex align="center">
                  <Box color="green.500" mr="3">
                    <FaUsers size="20px" />
                  </Box>
                  <Box>
                    <StatLabel>Collaborators</StatLabel>
                    <StatNumber>{analyticsData.collaborators}</StatNumber>
                    <StatHelpText>
                      {analyticsData.collaboratorsTrend > 0 ? (
                        <>
                          <StatArrow type="increase" />
                          {analyticsData.collaboratorsTrend} new this week
                        </>
                      ) : (
                        "No change this week"
                      )}
                    </StatHelpText>
                  </Box>
                </Flex>
              </Stat>
            </GridItem>
            
            {/* Time Spent */}
            <GridItem>
              <Stat
                p="3"
                borderRadius="md"
                bg={statBgColor}
                borderLeft="4px"
                borderColor="orange.500"
              >
                <Flex align="center">
                  <Box color="orange.500" mr="3">
                    <FaClock size="20px" />
                  </Box>
                  <Box>
                    <StatLabel>Time Spent</StatLabel>
                    <StatNumber>{analyticsData.timeSpent} min</StatNumber>
                    <StatHelpText>
                      {analyticsData.timeSpentTrend !== 0 && (
                        <StatArrow type={analyticsData.timeSpentTrend > 0 ? "increase" : "decrease"} />
                      )}
                      {Math.abs(analyticsData.timeSpentTrend)} min from last session
                    </StatHelpText>
                  </Box>
                </Flex>
              </Stat>
            </GridItem>
            
            {/* Revisions */}
            <GridItem>
              <Stat
                p="3"
                borderRadius="md"
                bg={statBgColor}
                borderLeft="4px"
                borderColor="purple.500"
              >
                <Flex align="center">
                  <Box color="purple.500" mr="3">
                    <FaFileAlt size="20px" />
                  </Box>
                  <Box>
                    <StatLabel>Revisions</StatLabel>
                    <StatNumber>{analyticsData.revisions}</StatNumber>
                    <StatHelpText>
                      {analyticsData.revisionsTrend !== 0 && (
                        <StatArrow type={analyticsData.revisionsTrend > 0 ? "increase" : "decrease"} />
                      )}
                      {Math.abs(analyticsData.revisionsTrend)} from yesterday
                    </StatHelpText>
                  </Box>
                </Flex>
              </Stat>
            </GridItem>
          </Grid>
          
          {/* Document Stats */}
          <Box mt="4" p="3" borderRadius="md" bg={statBgColor}>
            <Flex justify="space-between" align="center" mb="3">
              <Heading size="xs">Document Stats</Heading>
              <HStack>
                <FaRegSave size="14px" />
                <Text fontSize="xs">
                  Last saved: {new Date(analyticsData.lastSaved).toLocaleTimeString()}
                </Text>
              </HStack>
            </Flex>
            
            <VStack spacing="3" align="stretch">
              {/* Word Count */}
              <Box>
                <Flex justify="space-between">
                  <Text fontSize="sm">Words</Text>
                  <Text fontSize="sm" fontWeight="bold">{analyticsData.wordCount}</Text>
                </Flex>
                <Progress value={Math.min(analyticsData.wordCount / 10, 100)} size="sm" colorScheme="blue" mt="1" />
              </Box>
              
              {/* Character Count */}
              <Box>
                <Flex justify="space-between">
                  <Text fontSize="sm">Characters</Text>
                  <Text fontSize="sm" fontWeight="bold">{analyticsData.characterCount}</Text>
                </Flex>
                <Progress value={Math.min(analyticsData.characterCount / 50, 100)} size="sm" colorScheme="green" mt="1" />
              </Box>
              
              {/* Headings */}
              <Box>
                <Flex justify="space-between">
                  <Text fontSize="sm">Headings</Text>
                  <Text fontSize="sm" fontWeight="bold">{analyticsData.headingCount}</Text>
                </Flex>
                <Progress value={Math.min(analyticsData.headingCount * 10, 100)} size="sm" colorScheme="orange" mt="1" />
              </Box>
              
              {/* List Items */}
              <Box>
                <Flex justify="space-between">
                  <Text fontSize="sm">List Items</Text>
                  <Text fontSize="sm" fontWeight="bold">{analyticsData.listItemCount}</Text>
                </Flex>
                <Progress value={Math.min(analyticsData.listItemCount * 5, 100)} size="sm" colorScheme="purple" mt="1" />
              </Box>
            </VStack>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default AnalyticsPanel; ```




# File: client/src/components/UI/Header.jsx

```jsx
import React from 'react';
import {
  Box,
  Flex,
  IconButton,
  Button,
  useColorModeValue,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Text,
  Tooltip,
  useToast,
  Input,
  Avatar,
  AvatarBadge,
  HStack,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverFooter,
  FormControl,
  FormLabel
} from '@chakra-ui/react';
import { 
  HamburgerIcon, 
  ViewIcon, 
  SettingsIcon, 
  ChevronDownIcon,
  EditIcon,
  CheckIcon,
  CloseIcon,
  TimeIcon,
  InfoIcon,
  AddIcon
} from '@chakra-ui/icons';
import { FaUserFriends, FaChartBar } from 'react-icons/fa';
import { VscGraphLine } from 'react-icons/vsc';
import ThemeToggle from './ThemeToggle';
import { useDocument } from '../../context/DocumentContext';
import { useState } from 'react';

const Header = ({ 
  toggleSidebar, 
  isSidebarOpen,
  togglePreview,
  isPreviewVisible,
  toggleEditHistory,
  isEditHistoryVisible,
  toggleCollaborationMap,
  isCollaborationMapVisible,
  toggleAnalytics,
  isAnalyticsVisible
}) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');
  const toast = useToast();
  
  const { 
    currentDoc, 
    updateDocumentName, 
    username, 
    updateUsername,
    createDocument,
    awareness
  } = useDocument();
  
  const [isEditing, setIsEditing] = useState(false);
  const [newDocName, setNewDocName] = useState('');
  const [newUsername, setNewUsername] = useState(username);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Get active users from awareness
  const activeUsers = new Map();
  if (awareness) {
    awareness.getStates().forEach((state, clientId) => {
      if (state.userId) {
        activeUsers.set(state.userId, {
          username: state.username || 'Anonymous',
          color: state.color || '#cccccc'
        });
      }
    });
  }

  const handleDocNameChange = () => {
    if (newDocName && newDocName !== currentDoc.name) {
      updateDocumentName(currentDoc.id, newDocName);
      toast({
        title: 'Document renamed',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    }
    setIsEditing(false);
  };

  const handleCreateDocument = () => {
    createDocument('New Document');
    toast({
      title: 'Document created',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  const handleUsernameChange = () => {
    if (newUsername && newUsername !== username) {
      updateUsername(newUsername);
      toast({
        title: 'Username updated',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    }
    setIsUserMenuOpen(false);
  };

  return (
    <Flex
      as="header"
      align="center"
      justify="space-between"
      w="full"
      h="14"
      px="4"
      bg={bgColor}
      borderBottom="1px"
      borderColor={borderColor}
      position="relative"
      zIndex="20"
    >
      {/* Left section */}
      <Flex align="center">
        <Tooltip label={isSidebarOpen ? "Hide sidebar" : "Show sidebar"}>
          <IconButton
            icon={<HamburgerIcon />}
            variant="ghost"
            onClick={toggleSidebar}
            aria-label="Toggle Sidebar"
            mr="3"
          />
        </Tooltip>
        
        {/* Logo or app title */}
        <Box mr="8">
          <Text fontSize="lg" fontWeight="bold" color={textColor}>
            Collaborative MD
          </Text>
        </Box>
        
        {/* Document title */}
        {currentDoc ? (
          <Flex align="center">
            {isEditing ? (
              <HStack>
                <Input
                  value={newDocName}
                  onChange={(e) => setNewDocName(e.target.value)}
                  size="sm"
                  width="200px"
                  autoFocus
                  onBlur={handleDocNameChange}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleDocNameChange();
                    } else if (e.key === 'Escape') {
                      setIsEditing(false);
                    }
                  }}
                />
                <IconButton
                  icon={<CheckIcon />}
                  size="sm"
                  onClick={handleDocNameChange}
                  aria-label="Save"
                />
                <IconButton
                  icon={<CloseIcon />}
                  size="sm"
                  onClick={() => setIsEditing(false)}
                  aria-label="Cancel"
                />
              </HStack>
            ) : (
              <HStack>
                <Text fontSize="md" fontWeight="medium" color={textColor}>
                  {currentDoc.name}
                </Text>
                <IconButton
                  icon={<EditIcon />}
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setNewDocName(currentDoc.name);
                    setIsEditing(true);
                  }}
                  aria-label="Edit"
                />
              </HStack>
            )}
          </Flex>
        ) : (
          <Button
            leftIcon={<AddIcon />}
            size="sm"
            colorScheme="blue"
            onClick={handleCreateDocument}
          >
            New Document
          </Button>
        )}
      </Flex>
      
      {/* Right section */}
      <Flex align="center">
        {/* View controls */}
        <Menu>
          <Tooltip label="View options">
            <MenuButton
              as={Button}
              variant="ghost"
              size="sm"
              rightIcon={<ChevronDownIcon />}
              leftIcon={<ViewIcon />}
              mr="2"
            >
              View
            </MenuButton>
          </Tooltip>
          <MenuList>
            <MenuItem onClick={togglePreview}>
              {isPreviewVisible ? 'Hide Preview' : 'Show Preview'}
            </MenuItem>
            <MenuItem onClick={toggleEditHistory}>
              {isEditHistoryVisible ? 'Hide Edit History' : 'Show Edit History'}
            </MenuItem>
            <MenuItem onClick={toggleCollaborationMap}>
              {isCollaborationMapVisible ? 'Hide Collaboration Map' : 'Show Collaboration Map'}
            </MenuItem>
            <MenuItem onClick={toggleAnalytics}>
              {isAnalyticsVisible ? 'Hide Analytics' : 'Show Analytics'}
            </MenuItem>
          </MenuList>
        </Menu>
        
        {/* Visualization toggles */}
        <Tooltip label="Edit History">
          <IconButton
            icon={<TimeIcon />}
            aria-label="Edit History"
            size="sm"
            variant={isEditHistoryVisible ? 'solid' : 'ghost'}
            colorScheme={isEditHistoryVisible ? 'blue' : 'gray'}
            onClick={toggleEditHistory}
            mr="1"
          />
        </Tooltip>
        
        <Tooltip label="Collaboration Map">
          <IconButton
            icon={<FaUserFriends />}
            aria-label="Collaboration Map"
            size="sm"
            variant={isCollaborationMapVisible ? 'solid' : 'ghost'}
            colorScheme={isCollaborationMapVisible ? 'blue' : 'gray'}
            onClick={toggleCollaborationMap}
            mr="1"
          />
        </Tooltip>
        
        <Tooltip label="Analytics">
          <IconButton
            icon={<FaChartBar />}
            aria-label="Analytics"
            size="sm"
            variant={isAnalyticsVisible ? 'solid' : 'ghost'}
            colorScheme={isAnalyticsVisible ? 'blue' : 'gray'}
            onClick={toggleAnalytics}
            mr="1"
          />
        </Tooltip>
        
        {/* Preview toggle */}
        <Tooltip label={isPreviewVisible ? "Hide Preview" : "Show Preview"}>
          <IconButton
            icon={<ViewIcon />}
            aria-label="Toggle Preview"
            size="sm"
            variant={isPreviewVisible ? 'solid' : 'ghost'}
            colorScheme={isPreviewVisible ? 'blue' : 'gray'}
            onClick={togglePreview}
            mr="3"
          />
        </Tooltip>
        
        {/* Theme toggle */}
        <ThemeToggle mr="3" />
        
        {/* Active users */}
        <Box mr="3">
          <Popover placement="bottom-end">
            <PopoverTrigger>
              <Button
                size="sm"
                variant="ghost"
                leftIcon={<FaUserFriends />}
              >
                {activeUsers.size || 1}
              </Button>
            </PopoverTrigger>
            <PopoverContent width="250px">
              <PopoverHeader fontWeight="bold">
                Active Users
              </PopoverHeader>
              <PopoverBody>
                <Flex direction="column">
                  {/* Current user */}
                  <Flex align="center" mb="2">
                    <Avatar size="xs" name={username}>
                      <AvatarBadge boxSize="1em" bg="green.500" />
                    </Avatar>
                    <Text ml="2" fontWeight="medium">
                      {username} (you)
                    </Text>
                  </Flex>
                  
                  {/* Other users */}
                  {Array.from(activeUsers.entries()).map(([userId, user]) => (
                    userId !== username && (
                      <Flex key={userId} align="center" mb="2">
                        <Avatar size="xs" name={user.username}>
                          <AvatarBadge boxSize="1em" bg="green.500" />
                        </Avatar>
                        <Text ml="2">
                          {user.username}
                        </Text>
                      </Flex>
                    )
                  ))}
                </Flex>
              </PopoverBody>
            </PopoverContent>
          </Popover>
        </Box>
        
        {/* User menu */}
        <Popover
          isOpen={isUserMenuOpen}
          onClose={() => setIsUserMenuOpen(false)}
          placement="bottom-end"
        >
          <PopoverTrigger>
            <Button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              size="sm"
              rightIcon={<ChevronDownIcon />}
              colorScheme="blue"
            >
              {username}
            </Button>
          </PopoverTrigger>
          <PopoverContent width="250px">
            <PopoverHeader fontWeight="bold">
              User Settings
            </PopoverHeader>
            <PopoverBody>
              <FormControl>
                <FormLabel fontSize="sm">Username</FormLabel>
                <Input
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  size="sm"
                />
              </FormControl>
            </PopoverBody>
            <PopoverFooter display="flex" justifyContent="flex-end">
              <Button
                size="sm"
                variant="ghost"
                mr="2"
                onClick={() => setIsUserMenuOpen(false)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                colorScheme="blue"
                onClick={handleUsernameChange}
              >
                Save
              </Button>
            </PopoverFooter>
          </PopoverContent>
        </Popover>
      </Flex>
    </Flex>
  );
};

export default Header;```




# File: client/src/components/UI/Sidebar.jsx

```jsx
import React, { useState } from 'react';
import {
  Box,
  VStack,
  Text,
  IconButton,
  Button,
  useColorModeValue,
  Divider,
  HStack,
  Input,
  useToast,
  Flex,
  Menu,
  MenuButton,
  MenuList,
  MenuItem
} from '@chakra-ui/react';
import { 
  AddIcon, 
  CloseIcon, 
  SearchIcon, 
  ChevronRightIcon,
  DeleteIcon,
  EditIcon,
  SettingsIcon
} from '@chakra-ui/icons';
import { FaFileAlt } from 'react-icons/fa';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useDocument } from '../../context/DocumentContext';

const Sidebar = ({ onClose }) => {
  const { documents, createDocument, updateDocumentName, deleteDocument } = useDocument();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const hoverBgColor = useColorModeValue('gray.50', 'gray.700');
  const activeBgColor = useColorModeValue('blue.50', 'blue.900');
  const activeTextColor = useColorModeValue('blue.600', 'blue.200');
  const navigate = useNavigate();
  const { id } = useParams();
  const toast = useToast();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [editingDocId, setEditingDocId] = useState(null);
  const [newDocName, setNewDocName] = useState('');

  // Filter documents based on search term
  const filteredDocuments = documents.filter(doc => 
    doc.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateDocument = () => {
    createDocument('New Document').then(doc => {
      if (doc) {
        navigate(`/documents/${doc.id}`);
      }
    });
  };

  const handleRenameDocument = (docId) => {
    if (newDocName) {
      updateDocumentName(docId, newDocName);
      setEditingDocId(null);
      toast({
        title: 'Document renamed',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    }
  };

  const handleDeleteDocument = (docId) => {
    deleteDocument(docId);
    if (id === docId) {
      navigate('/documents');
    }
    toast({
      title: 'Document deleted',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  return (
    <Box
      height="full"
      overflowY="auto"
      p="3"
      className="sidebar"
    >
      {/* Mobile close button */}
      <Flex display={{ base: 'flex', md: 'none' }} justifyContent="flex-end" mb="2">
        <IconButton
          icon={<CloseIcon />}
          size="sm"
          variant="ghost"
          onClick={onClose}
          aria-label="Close Sidebar"
        />
      </Flex>
      
      {/* New document button */}
      <Button
        leftIcon={<AddIcon />}
        colorScheme="blue"
        size="sm"
        width="full"
        mb="4"
        onClick={handleCreateDocument}
      >
        New Document
      </Button>
      
      {/* Search */}
      <Box position="relative" mb="4">
        <Input
          placeholder="Search documents..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          size="sm"
          pr="8"
        />
        <IconButton
          icon={<SearchIcon />}
          size="sm"
          position="absolute"
          right="0"
          top="0"
          variant="ghost"
          aria-label="Search"
        />
      </Box>
      
      <Divider mb="4" />
      
      {/* Document list */}
      <Text fontSize="xs" fontWeight="bold" textTransform="uppercase" mb="2" color="gray.500">
        Your Documents
      </Text>
      
      <VStack align="stretch" spacing="1">
        {filteredDocuments.length > 0 ? (
          filteredDocuments.map(doc => (
            <Box key={doc.id}>
              {editingDocId === doc.id ? (
                <HStack p="2">
                  <Input
                    value={newDocName}
                    onChange={(e) => setNewDocName(e.target.value)}
                    size="sm"
                    autoFocus
                    onBlur={() => handleRenameDocument(doc.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleRenameDocument(doc.id);
                      } else if (e.key === 'Escape') {
                        setEditingDocId(null);
                      }
                    }}
                  />
                  <IconButton
                    icon={<CheckIcon />}
                    size="sm"
                    onClick={() => handleRenameDocument(doc.id)}
                    aria-label="Save"
                  />
                </HStack>
              ) : (
                <Flex
                  as={Link}
                  to={`/documents/${doc.id}`}
                  p="2"
                  borderRadius="md"
                  bg={id === doc.id ? activeBgColor : 'transparent'}
                  color={id === doc.id ? activeTextColor : 'inherit'}
                  _hover={{
                    bg: id === doc.id ? activeBgColor : hoverBgColor,
                    textDecoration: 'none'
                  }}
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <HStack spacing="2">
                    <FaFileAlt />
                    <Text noOfLines={1}>{doc.name}</Text>
                  </HStack>
                  
                  <Menu>
                    <MenuButton
                      as={IconButton}
                      icon={<SettingsIcon />}
                      size="xs"
                      variant="ghost"
                      onClick={(e) => e.preventDefault()}
                      aria-label="Document Settings"
                      opacity="0.5"
                      _hover={{ opacity: 1 }}
                    />
                    <MenuList>
                      <MenuItem
                        icon={<EditIcon />}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setNewDocName(doc.name);
                          setEditingDocId(doc.id);
                        }}
                      >
                        Rename
                      </MenuItem>
                      <MenuItem
                        icon={<DeleteIcon />}
                        color="red.500"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDeleteDocument(doc.id);
                        }}
                      >
                        Delete
                      </MenuItem>
                    </MenuList>
                  </Menu>
                </Flex>
              )}
            </Box>
          ))
        ) : (
          <Box p="4" textAlign="center">
            <Text color="gray.500">No documents found</Text>
          </Box>
        )}
      </VStack>
    </Box>
  );
};

export default Sidebar;```




# File: client/src/components/UI/ThemeToggle.jsx

```jsx
import React from 'react';
import { IconButton, useColorMode, Tooltip } from '@chakra-ui/react';
import { SunIcon, MoonIcon } from '@chakra-ui/icons';
import { useTheme } from '../../context/ThemeContext';

const ThemeToggle = (props) => {
  const { colorMode } = useColorMode();
  const { toggleTheme } = useTheme();

  return (
    <Tooltip label={colorMode === 'dark' ? 'Light mode' : 'Dark mode'}>
      <IconButton
        icon={colorMode === 'dark' ? <SunIcon /> : <MoonIcon />}
        onClick={toggleTheme}
        variant="ghost"
        aria-label="Toggle theme"
        size="sm"
        {...props}
      />
    </Tooltip>
  );
};

export default ThemeToggle;```




# File: client/src/components/UI/UserPresence.jsx

```jsx
```




# File: client/src/components/Visualizations/CollaborationMap.jsx

```jsx
import React, { useEffect, useState } from 'react';
import {
  Box,
  Text,
  Heading,
  Flex,
  useColorModeValue,
  Spinner,
  Badge,
  HStack,
  Avatar,
  VStack,
  Tooltip,
  Alert,
  AlertIcon
} from '@chakra-ui/react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { useDocument } from '../../context/DocumentContext';

const CollaborationMap = ({ docId }) => {
  const [collaborationData, setCollaborationData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { awareness, username } = useDocument();
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'gray.100');

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#AFB4FF'];

  useEffect(() => {
    if (!docId) return;
    
    const fetchCollaborationData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/documents/${docId}/collaboration`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch collaboration data');
        }
        
        const data = await response.json();
        
        // Convert to chart data
        const pieData = data.map(user => ({
          name: user.username,
          value: user.edits,
          color: user.color,
          isCurrentUser: user.username === username
        }));
        
        setCollaborationData(pieData);
      } catch (err) {
        console.error('Error fetching collaboration data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCollaborationData();
  }, [docId, username]);

  // Get active users from awareness
  const activeUsers = new Map();
  if (awareness) {
    awareness.getStates().forEach((state, clientId) => {
      if (state.userId) {
        activeUsers.set(state.userId, {
          username: state.username || 'Anonymous',
          color: state.color || '#cccccc'
        });
      }
    });
  }

  const renderCustomLabel = ({ cx, cy, midAngle, outerRadius, percent, index, name }) => {
    const RADIAN = Math.PI / 180;
    const radius = outerRadius * 1.1;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill={textColor}
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize="12"
      >
        {`${name} (${(percent * 100).toFixed(0)}%)`}
      </text>
    );
  };

  if (error) {
    return (
      <Box
        h="full"
        bg={bgColor}
        borderRadius="md"
        overflow="hidden"
        p="4"
      >
        <Alert status="error">
          <AlertIcon />
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box
      h="full"
      bg={bgColor}
      borderRadius="md"
      overflow="hidden"
      className="collaboration-map"
    >
      <Flex justifyContent="space-between" alignItems="center" p="3">
        <Heading size="sm">Collaboration</Heading>
        <Badge colorScheme="green">
          {activeUsers.size || 1} Active
        </Badge>
      </Flex>
      
      {loading ? (
        <Flex h="80%" justifyContent="center" alignItems="center">
          <Spinner size="xl" color="green.500" />
        </Flex>
      ) : collaborationData.length === 0 ? (
        <Flex h="80%" justifyContent="center" alignItems="center" flexDirection="column">
          <Text color={textColor} mb="2">No collaboration data yet</Text>
          <Text fontSize="sm" color="gray.500">
            Invite others to collaborate on this document
          </Text>
        </Flex>
      ) : (
        <Flex h="85%" direction={{ base: "column", md: "row" }}>
          {/* Pie chart */}
          <Box flex="1" minH={{ base: "150px", md: "auto" }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={collaborationData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomLabel}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {collaborationData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color || COLORS[index % COLORS.length]}
                      stroke={entry.isCurrentUser ? "#000" : "none"}
                      strokeWidth={entry.isCurrentUser ? 2 : 0}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </Box>
          
          {/* Active users list */}
          <Box flex="1" p="4">
            <Text fontSize="sm" fontWeight="bold" mb="2">
              Active Contributors
            </Text>
            
            <VStack align="stretch" spacing="2">
              {Array.from(activeUsers.entries()).map(([userId, user]) => (
                <HStack key={userId} p="2" bg={useColorModeValue('gray.50', 'gray.700')} borderRadius="md">
                  <Avatar 
                    size="xs" 
                    name={user.username}
                    bg={user.color}
                  />
                  <Text fontSize="sm" fontWeight={user.username === username ? "bold" : "normal"}>
                    {user.username} {user.username === username && "(you)"}
                  </Text>
                  <Badge colorScheme="green" ml="auto">
                    Active
                  </Badge>
                </HStack>
              ))}
              
              {/* Add offline users from collaboration data */}
              {collaborationData
                .filter(user => !Array.from(activeUsers.values()).some(au => au.username === user.name))
                .map((user, index) => (
                  <HStack key={index} p="2" bg={useColorModeValue('gray.50', 'gray.700')} borderRadius="md" opacity="0.6">
                    <Avatar 
                      size="xs" 
                      name={user.name}
                      bg={user.color}
                    />
                    <Text fontSize="sm">
                      {user.name}
                    </Text>
                    <Badge colorScheme="gray" ml="auto">
                      Offline
                    </Badge>
                  </HStack>
                ))}
            </VStack>
          </Box>
        </Flex>
      )}
    </Box>
  );
};

export default CollaborationMap;```




# File: client/src/components/Visualizations/EditHistory.jsx

```jsx
import React, { useEffect, useState } from 'react';
import {
  Box,
  Text,
  Heading,
  Flex,
  useColorModeValue,
  Spinner,
  Select,
  useToken,
  Alert,
  AlertIcon
} from '@chakra-ui/react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { format } from 'date-fns';

const EditHistory = ({ docId }) => {
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('24h');
  const [blue500, blue300] = useToken('colors', ['blue.500', 'blue.300']);
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'gray.100');
  const gridColor = useColorModeValue('gray.200', 'gray.700');

  useEffect(() => {
    if (!docId) return;
    
    const fetchHistoryData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/documents/${docId}/history?period=${timeRange}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch edit history');
        }
        
        const data = await response.json();
        setHistoryData(data);
      } catch (err) {
        console.error('Error fetching edit history:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchHistoryData();
  }, [docId, timeRange]);

  if (error) {
    return (
      <Box
        h="full"
        bg={bgColor}
        borderRadius="md"
        overflow="hidden"
        p="4"
      >
        <Alert status="error">
          <AlertIcon />
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box
      h="full"
      bg={bgColor}
      borderRadius="md"
      overflow="hidden"
      className="edit-history-chart"
    >
      <Flex justifyContent="space-between" alignItems="center" p="3">
        <Heading size="sm">Edit History</Heading>
        <Select
          size="sm"
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          width="100px"
        >
          <option value="24h">24 hours</option>
          <option value="7d">7 days</option>
          <option value="30d">30 days</option>
        </Select>
      </Flex>
      
      {loading ? (
        <Flex h="80%" justifyContent="center" alignItems="center">
          <Spinner size="xl" color="blue.500" />
        </Flex>
      ) : historyData.length === 0 ? (
        <Flex h="80%" justifyContent="center" alignItems="center" flexDirection="column">
          <Text color={textColor} mb="2">No edit history found</Text>
          <Text fontSize="sm" color="gray.500">
            Make some edits to start tracking history
          </Text>
        </Flex>
      ) : (
        <Box p="2" h="85%">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={historyData}
              margin={{
                top: 5,
                right: 20,
                left: 10,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis 
                dataKey="formattedTime" 
                tick={{ fill: textColor, fontSize: 12 }}
              />
              <YAxis 
                yAxisId="left"
                tick={{ fill: textColor, fontSize: 12 }}
                width={30}
              />
              <YAxis 
                yAxisId="right" 
                orientation="right" 
                tick={{ fill: textColor, fontSize: 12 }}
                width={40}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: bgColor, 
                  borderColor: borderColor,
                  color: textColor
                }}
                formatter={(value, name) => [value, name === 'edits' ? 'Edits' : 'Characters']}
                labelFormatter={(label) => `Time: ${label}`}
              />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="edits"
                stroke={blue500}
                activeDot={{ r: 8 }}
                name="Edits"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="characters"
                stroke={blue300}
                name="Characters"
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      )}
    </Box>
  );
};

export default EditHistory;```




# File: client/src/context/DocumentContext.jsx

```jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { v4 as uuidv4 } from 'uuid';

const DocumentContext = createContext();

export const useDocument = () => useContext(DocumentContext);

export const DocumentProvider = ({ children }) => {
  const [documents, setDocuments] = useState([]);
  const [currentDoc, setCurrentDoc] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [provider, setProvider] = useState(null);
  const [ydoc, setYdoc] = useState(null);
  const [awareness, setAwareness] = useState(null);
  const [text, setText] = useState('');
  const [userId] = useState(() => localStorage.getItem('userId') || uuidv4());
  const [username, setUsername] = useState(() => localStorage.getItem('username') || 'Guest');
  const [userColor] = useState(() => getRandomColor(userId));

  // Initialize user ID
  useEffect(() => {
    localStorage.setItem('userId', userId);
    if (!localStorage.getItem('username')) {
      localStorage.setItem('username', username);
    }
  }, [userId, username]);

  // Fetch documents
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await fetch('/api/documents');
        if (!response.ok) throw new Error('Failed to fetch documents');
        const data = await response.json();
        setDocuments(data);
        setIsLoading(false);
      } catch (err) {
        setError(err.message);
        setIsLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  // Connect to document
  const connectToDocument = (docId, docName = 'Untitled Document') => {
    // Clean up previous connection
    if (provider) {
      provider.disconnect();
    }

    // Create a new Y.Doc
    const newYdoc = new Y.Doc();
    setYdoc(newYdoc);

    // Get the WebSocket URL
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const wsUrl = `${protocol}//${host}`;

    // Connect to WebSocket
    const newProvider = new WebsocketProvider(
      wsUrl,
      docId,
      newYdoc,
      { connect: true }
    );

    // Set up awareness (user presence)
    newProvider.awareness.setLocalState({
      userId,
      username,
      color: userColor,
      cursor: null,
      selection: null,
    });

    setProvider(newProvider);
    setAwareness(newProvider.awareness);
    setCurrentDoc({ id: docId, name: docName });

    // Bind to text updates
    const ytext = newYdoc.getText('content');
    setText(ytext.toString());

    ytext.observe(event => {
      setText(ytext.toString());
    });

    return { ytext, provider: newProvider };
  };

  // Create a new document
  const createDocument = async (name = 'Untitled Document') => {
    try {
      const response = await fetch('/api/documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      });

      if (!response.ok) throw new Error('Failed to create document');
      
      const newDoc = await response.json();
      setDocuments([...documents, newDoc]);
      
      connectToDocument(newDoc.id, newDoc.name);
      return newDoc;
    } catch (err) {
      setError(err.message);
      return null;
    }
  };

  // Update document name
  const updateDocumentName = async (docId, newName) => {
    try {
      const response = await fetch(`/api/documents/${docId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newName }),
      });

      if (!response.ok) throw new Error('Failed to update document');
      
      const updatedDoc = await response.json();
      setDocuments(documents.map(doc => doc.id === docId ? updatedDoc : doc));
      
      if (currentDoc && currentDoc.id === docId) {
        setCurrentDoc({ ...currentDoc, name: newName });
      }
      
      return updatedDoc;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Delete document
  const deleteDocument = async (docId) => {
    try {
      const response = await fetch(`/api/documents/${docId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete document');
      
      setDocuments(documents.filter(doc => doc.id !== docId));
      
      if (currentDoc && currentDoc.id === docId) {
        if (provider) {
          provider.disconnect();
        }
        setCurrentDoc(null);
        setYdoc(null);
        setProvider(null);
        setAwareness(null);
        setText('');
      }
      
      return true;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Utility function to generate a consistent color for a user
  function getRandomColor(id) {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#FF9F1C', '#A78BFA', 
      '#10B981', '#F472B6', '#60A5FA', '#FBBF24'
    ];
    
    // Use a simple hash function to get a consistent index
    const hash = id.split('').reduce((acc, char) => {
      return acc + char.charCodeAt(0);
    }, 0);
    
    return colors[hash % colors.length];
  }

  const updateUsername = (newUsername) => {
    setUsername(newUsername);
    localStorage.setItem('username', newUsername);
    
    if (awareness) {
      const current = awareness.getLocalState();
      if (current) {
        awareness.setLocalState({
          ...current,
          username: newUsername,
        });
      }
    }
  };

  return (
    <DocumentContext.Provider value={{
      documents,
      currentDoc,
      isLoading,
      error,
      text,
      ydoc,
      provider,
      awareness,
      userId,
      username,
      userColor,
      connectToDocument,
      createDocument,
      updateDocumentName,
      deleteDocument,
      updateUsername,
    }}>
      {children}
    </DocumentContext.Provider>
  );
};```




# File: client/src/context/ThemeContext.jsx

```jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorMode } from '@chakra-ui/react';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const { colorMode, toggleColorMode } = useColorMode();
  const [theme, setTheme] = useState(colorMode);

  useEffect(() => {
    // Sync theme with body class for Tailwind dark mode
    if (colorMode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    setTheme(colorMode);
  }, [colorMode]);

  const toggleTheme = () => {
    toggleColorMode();
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};```




# File: client/src/hooks/useCRDT.js

```js
import { useCallback, useEffect, useState } from 'react';
import * as Y from 'yjs';
import { useDocument } from '../context/DocumentContext';
import { debounce } from '../utils/crdt';

export function useCRDT(docId) {
  const { 
    ydoc, 
    provider, 
    awareness, 
    userId, 
    username, 
    connectToDocument 
  } = useDocument();
  
  const [ytext, setYtext] = useState(null);
  const [connected, setConnected] = useState(false);
  const [awarenessStates, setAwarenessStates] = useState(new Map());
  const [undoManager, setUndoManager] = useState(null);
  const [lastEditTime, setLastEditTime] = useState(Date.now());
  const [editDuration, setEditDuration] = useState(0);

  // Connect to document
  useEffect(() => {
    if (!docId) return;
    
    const { ytext: newYtext, provider: newProvider } = connectToDocument(docId);
    setYtext(newYtext);
    
    // Setup connection status
    const handleStatus = ({ status }) => {
      setConnected(status === 'connected');
    };

    newProvider.on('status', handleStatus);
    setConnected(newProvider.wsconnected);

    // Create undo manager
    const newUndoManager = new Y.UndoManager(newYtext);
    setUndoManager(newUndoManager);

    return () => {
      newProvider.off('status', handleStatus);
      newUndoManager.destroy();
    };
  }, [docId, connectToDocument]);

  // Track awareness updates
  useEffect(() => {
    if (!awareness) return;

    const updateAwareness = () => {
      const states = new Map();
      awareness.getStates().forEach((state, clientId) => {
        if (state.userId && state.userId !== userId) {
          states.set(clientId, state);
        }
      });
      setAwarenessStates(states);
    };

    updateAwareness(); // Initial state
    awareness.on('change', updateAwareness);

    return () => {
      awareness.off('change', updateAwareness);
    };
  }, [awareness, userId]);

  // Track edit duration
  useEffect(() => {
    const interval = setInterval(() => {
      if (connected) {
        setEditDuration(prev => prev + 1);
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [connected]);

  // Update cursor position
  const updateCursor = useCallback((position, selection = null) => {
    if (!awareness) return;
    
    const current = awareness.getLocalState();
    if (current) {
      awareness.setLocalState({
        ...current,
        cursor: position,
        selection,
      });
    }
  }, [awareness]);

  // Debounced cursor update
  const debouncedUpdateCursor = useCallback(
    debounce(updateCursor, 50),
    [updateCursor]
  );

  // Insert text with metadata
  const insertText = useCallback((index, text) => {
    if (!ytext) return;
    
    // Calculate time since last edit
    const now = Date.now();
    const timeSinceLastEdit = now - lastEditTime;
    setLastEditTime(now);
    
    // Create origin object with metadata
    const origin = {
      userId,
      username,
      changeSize: text.length,
      duration: Math.min(timeSinceLastEdit / 1000, 300), // Cap at 5 minutes
      timestamp: now
    };
    
    ytext.insert(index, text, origin);
  }, [ytext, userId, username, lastEditTime]);

  // Delete text with metadata
  const deleteText = useCallback((index, length) => {
    if (!ytext) return;
    
    // Calculate time since last edit
    const now = Date.now();
    const timeSinceLastEdit = now - lastEditTime;
    setLastEditTime(now);
    
    // Create origin object with metadata
    const origin = {
      userId,
      username,
      changeSize: -length,
      duration: Math.min(timeSinceLastEdit / 1000, 300), // Cap at 5 minutes
      timestamp: now
    };
    
    ytext.delete(index, length, origin);
  }, [ytext, userId, username, lastEditTime]);

  // Undo/Redo
  const undo = useCallback(() => {
    if (!undoManager) return;
    
    const origin = {
      userId,
      username,
      isRevision: true,
      timestamp: Date.now()
    };
    
    undoManager.undo(origin);
  }, [undoManager, userId, username]);

  const redo = useCallback(() => {
    if (!undoManager) return;
    
    const origin = {
      userId,
      username,
      isRevision: true,
      timestamp: Date.now()
    };
    
    undoManager.redo(origin);
  }, [undoManager, userId, username]);

  return {
    ytext,
    connected,
    awareness,
    awarenessStates,
    insertText,
    deleteText,
    updateCursor,
    debouncedUpdateCursor,
    undo,
    redo,
    editDuration,
  };
}```




# File: client/src/hooks/useMarkdown.js

```js
import { useState, useEffect, useCallback } from 'react';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeHighlight from 'rehype-highlight';

export function useMarkdown(markdown) {
  const [html, setHtml] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  // Parse markdown to HTML
  const processMarkdown = useCallback(async (text) => {
    if (!text) {
      setHtml('');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Dynamically import React Markdown to reduce initial load time
      const { default: ReactMarkdown } = await import('react-markdown');
      
      // Use renderToString to convert the React component to HTML
      const { renderToString } = await import('react-dom/server');
      
      const element = ReactMarkdown({
        children: text,
        remarkPlugins: [remarkGfm],
        rehypePlugins: [rehypeRaw, rehypeHighlight],
      });
      
      const rendered = renderToString(element);
      setHtml(rendered);
    } catch (err) {
      console.error('Error processing markdown:', err);
      setError('Failed to process markdown');
    } finally {
      setIsProcessing(false);
    }
  }, []);

  // Process markdown when it changes
  useEffect(() => {
    const timer = setTimeout(() => {
      processMarkdown(markdown);
    }, 300); // Debounce markdown processing
    
    return () => clearTimeout(timer);
  }, [markdown, processMarkdown]);

  // Utility functions for editing
  const insertHeading = useCallback((text, level = 1) => {
    const prefix = '#'.repeat(level) + ' ';
    return prefix + text;
  }, []);

  const insertBold = useCallback((text) => {
    return `**${text}**`;
  }, []);

  const insertItalic = useCallback((text) => {
    return `*${text}*`;
  }, []);

  const insertLink = useCallback((text, url = '') => {
    return `[${text}](${url})`;
  }, []);

  const insertImage = useCallback((altText, url = '') => {
    return `![${altText}](${url})`;
  }, []);

  const insertCodeBlock = useCallback((code, language = '') => {
    return `\`\`\`${language}\n${code}\n\`\`\``;
  }, []);

  const insertInlineCode = useCallback((code) => {
    return `\`${code}\``;
  }, []);

  const insertBlockquote = useCallback((text) => {
    return `> ${text}`;
  }, []);

  const insertListItem = useCallback((text, ordered = false) => {
    return ordered ? `1. ${text}` : `- ${text}`;
  }, []);

  return {
    html,
    isProcessing,
    error,
    insertHeading,
    insertBold,
    insertItalic,
    insertLink,
    insertImage,
    insertCodeBlock,
    insertInlineCode,
    insertBlockquote,
    insertListItem,
  };
}```




# File: client/src/hooks/useWebSocket.js

```js
import { useEffect, useCallback, useState } from 'react';

export function useWebSocket(url) {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const [messages, setMessages] = useState([]);
  
  // Connect to WebSocket
  useEffect(() => {
    if (!url) return;

    const ws = new WebSocket(url);
    
    ws.onopen = () => {
      setIsConnected(true);
      setError(null);
    };
    
    ws.onclose = () => {
      setIsConnected(false);
    };
    
    ws.onerror = (event) => {
      setError('WebSocket error');
      console.error('WebSocket error:', event);
    };
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setMessages(prev => [...prev, data]);
      } catch (e) {
        console.error('Error parsing WebSocket message:', e);
      }
    };
    
    setSocket(ws);
    
    // Cleanup
    return () => {
      ws.close();
    };
  }, [url]);
  
  // Send message
  const sendMessage = useCallback((message) => {
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      setError('WebSocket is not connected');
      return false;
    }
    
    try {
      socket.send(typeof message === 'string' ? message : JSON.stringify(message));
      return true;
    } catch (e) {
      setError('Failed to send message');
      console.error('Error sending message:', e);
      return false;
    }
  }, [socket]);
  
  // Clear messages
  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);
  
  return {
    socket,
    isConnected,
    error,
    messages,
    sendMessage,
    clearMessages,
  };
}```




# File: client/src/index.css

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  /* Light theme */
  --editor-bg: #ffffff;
  --editor-text: #2d3748;
  --editor-cursor: #0073ff;
  --editor-selection: rgba(0, 115, 255, 0.2);
  --editor-line: #e2e8f0;
}

.dark {
  /* Dark theme */
  --editor-bg: #1a202c;
  --editor-text: #e2e8f0;
  --editor-cursor: #63b3ed;
  --editor-selection: rgba(99, 179, 237, 0.3);
  --editor-line: #2d3748;
}

body {
  min-height: 100vh;
  margin: 0;
  padding: 0;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}

.markdown-editor {
  font-family: 'Fira Code', monospace;
  line-height: 1.6;
}

.user-cursor {
  position: absolute;
  width: 2px;
  height: 18px;
  pointer-events: none;
  transition: transform 0.1s ease;
}

.user-label {
  position: absolute;
  top: -18px;
  left: 0;
  font-size: 12px;
  padding: 2px 4px;
  border-radius: 3px;
  white-space: nowrap;
  pointer-events: none;
}

.presence-indicator {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 6px;
}

/* Transitions */
.fade-enter {
  opacity: 0;
}
.fade-enter-active {
  opacity: 1;
  transition: opacity 300ms;
}
.fade-exit {
  opacity: 1;
}
.fade-exit-active {
  opacity: 0;
  transition: opacity 300ms;
}

/* Markdown preview styles */
.markdown-preview h1 {
  @apply text-2xl font-bold mb-4 mt-6;
}

.markdown-preview h2 {
  @apply text-xl font-bold mb-3 mt-5;
}

.markdown-preview h3 {
  @apply text-lg font-bold mb-2 mt-4;
}

.markdown-preview p {
  @apply mb-4;
}

.markdown-preview ul, .markdown-preview ol {
  @apply mb-4 ml-5;
}

.markdown-preview ul {
  @apply list-disc;
}

.markdown-preview ol {
  @apply list-decimal;
}

.markdown-preview code {
  @apply font-mono text-sm px-1 py-0.5 rounded;
}

.markdown-preview pre {
  @apply font-mono text-sm p-3 rounded mb-4 overflow-x-auto;
}

.markdown-preview blockquote {
  @apply border-l-4 pl-4 italic my-4;
}

.markdown-preview a {
  @apply text-blue-600 hover:underline;
}

.markdown-preview table {
  @apply w-full border-collapse mb-4;
}

.markdown-preview th, .markdown-preview td {
  @apply border p-2;
}

.markdown-preview img {
  @apply max-w-full h-auto;
}```




# File: client/src/main.jsx

```jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { ThemeProvider } from './context/ThemeContext';
import { DocumentProvider } from './context/DocumentContext';
import './index.css';

const theme = extendTheme({
  config: {
    initialColorMode: 'light',
    useSystemColorMode: true,
  },
  colors: {
    brand: {
      50: '#e6f1ff',
      100: '#cce3ff',
      500: '#0073ff',
      600: '#005ccc',
      700: '#004599',
      900: '#001733',
    },
  },
  styles: {
    global: (props) => ({
      body: {
        bg: props.colorMode === 'dark' ? 'gray.900' : 'white',
        color: props.colorMode === 'dark' ? 'white' : 'gray.800',
      },
    }),
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ChakraProvider theme={theme}>
        <ThemeProvider>
          <DocumentProvider>
            <App />
          </DocumentProvider>
        </ThemeProvider>
      </ChakraProvider>
    </BrowserRouter>
  </React.StrictMode>,
);```




# File: client/src/utils/crdt.js

```js
/**
 * Utility functions for CRDT operations
 */

// Debounce function for rate-limiting operations
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
  
  // Calculate position in the document from an index
  export function indexToPosition(text, index) {
    if (!text || index === 0) {
      return { line: 0, ch: 0 };
    }
  
    const lines = text.slice(0, index).split('\n');
    return {
      line: lines.length - 1,
      ch: lines[lines.length - 1].length,
    };
  }
  
  // Calculate index from line and column position
  export function positionToIndex(text, position) {
    if (!text || (position.line === 0 && position.ch === 0)) {
      return 0;
    }
  
    const lines = text.split('\n');
    let index = 0;
    
    for (let i = 0; i < position.line; i++) {
      index += lines[i].length + 1; // +1 for the newline character
    }
    
    return index + Math.min(position.ch, lines[position.line]?.length || 0);
  }
  
  // Get a relative position for displaying a cursor
  export function getCursorCoordinates(element, position) {
    if (!element) return { top: 0, left: 0 };
    
    const text = element.textContent || '';
    const lines = text.split('\n');
    
    // Calculate line height (approximate)
    const lineHeight = 20; // Default line height in pixels
    
    // Calculate left position based on character width (approximate)
    const charWidth = 8; // Average character width in pixels
    
    // Calculate top position
    const top = position.line * lineHeight;
    
    // Calculate left position
    const left = position.ch * charWidth;
    
    return { top, left };
  }
  
  // Convert awareness states to a format suitable for visualization
  export function awarenessStatesToArray(awarenessStates) {
    const result = [];
    
    awarenessStates.forEach((state, clientId) => {
      if (state.userId) {
        result.push({
          clientId,
          userId: state.userId,
          username: state.username || 'Anonymous',
          color: state.color || '#cccccc',
          cursor: state.cursor,
          selection: state.selection,
        });
      }
    });
    
    return result;
  }
  
  // Extract statistics from the document update history
  export function extractHistoryStats(updates) {
    if (!updates || updates.length === 0) {
      return { 
        totalEdits: 0,
        editsByUser: {},
        editsOverTime: [],
        avgEditSize: 0
      };
    }
    
    const result = {
      totalEdits: updates.length,
      editsByUser: {},
      editsOverTime: [],
      avgEditSize: 0,
    };
    
    // Group by hour
    const hourBuckets = {};
    let totalChangeSize = 0;
    
    updates.forEach(update => {
      // Count edits by user
      if (!result.editsByUser[update.userId]) {
        result.editsByUser[update.userId] = 0;
      }
      result.editsByUser[update.userId]++;
      
      // Track changes over time
      const date = new Date(update.timestamp);
      const hourKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}-${date.getHours()}`;
      
      if (!hourBuckets[hourKey]) {
        hourBuckets[hourKey] = { 
          time: date.getTime(), 
          count: 0 
        };
      }
      
      hourBuckets[hourKey].count++;
      
      // Calculate change size
      totalChangeSize += update.changeSize || 0;
    });
    
    // Convert hour buckets to array
    result.editsOverTime = Object.values(hourBuckets).sort((a, b) => a.time - b.time);
    
    // Calculate average edit size
    result.avgEditSize = totalChangeSize / updates.length;
    
    return result;
  }```




# File: client/src/utils/markdown.js

```js
/**
 * Utility functions for Markdown operations
 */

// Get markdown syntax for different elements
export const markdownSyntax = {
    heading: (level) => '#'.repeat(level) + ' ',
    bold: '**',
    italic: '*',
    link: {
      start: '[',
      middle: '](',
      end: ')',
    },
    image: {
      start: '![',
      middle: '](',
      end: ')',
    },
    code: {
      inline: '`',
      block: '```',
    },
    blockquote: '> ',
    listItem: {
      unordered: '- ',
      ordered: (num) => `${num}. `,
    },
    horizontalRule: '---',
    strikethrough: '~~',
    table: {
      header: '| Header | Header |\n| --- | --- |',
      row: '| Cell | Cell |',
    },
  };
  
  // Insert markdown syntax at cursor position
  export function insertMarkdown(text, syntax, selection, options = {}) {
    const selectionText = text.substring(selection.start, selection.end);
    let result;
    
    switch (syntax) {
      case 'heading':
        const level = options.level || 1;
        result = text.substring(0, selection.start) + 
          markdownSyntax.heading(level) + selectionText + 
          text.substring(selection.end);
        return result;
        
      case 'bold':
        result = text.substring(0, selection.start) + 
          markdownSyntax.bold + selectionText + markdownSyntax.bold + 
          text.substring(selection.end);
        return result;
        
      case 'italic':
        result = text.substring(0, selection.start) + 
          markdownSyntax.italic + selectionText + markdownSyntax.italic + 
          text.substring(selection.end);
        return result;
        
      case 'link':
        const url = options.url || '';
        result = text.substring(0, selection.start) + 
          markdownSyntax.link.start + (selectionText || 'link text') + 
          markdownSyntax.link.middle + url + markdownSyntax.link.end + 
          text.substring(selection.end);
        return result;
        
      case 'image':
        const imgUrl = options.url || '';
        const altText = selectionText || 'image';
        result = text.substring(0, selection.start) + 
          markdownSyntax.image.start + altText + 
          markdownSyntax.image.middle + imgUrl + markdownSyntax.image.end + 
          text.substring(selection.end);
        return result;
        
      case 'code-inline':
        result = text.substring(0, selection.start) + 
          markdownSyntax.code.inline + selectionText + markdownSyntax.code.inline + 
          text.substring(selection.end);
        return result;
        
      case 'code-block':
        const language = options.language || '';
        result = text.substring(0, selection.start) + 
          markdownSyntax.code.block + language + '\n' + 
          selectionText + '\n' + markdownSyntax.code.block + 
          text.substring(selection.end);
        return result;
        
      case 'blockquote':
        // Add blockquote to each line
        const lines = selectionText.split('\n');
        const quotedLines = lines.map(line => markdownSyntax.blockquote + line);
        result = text.substring(0, selection.start) + 
          quotedLines.join('\n') + 
          text.substring(selection.end);
        return result;
        
      case 'unordered-list':
        if (selectionText.trim() === '') {
          result = text.substring(0, selection.start) + 
            markdownSyntax.listItem.unordered + 
            text.substring(selection.end);
        } else {
          const listLines = selectionText.split('\n');
          const unorderedListLines = listLines.map(line => markdownSyntax.listItem.unordered + line);
          result = text.substring(0, selection.start) + 
            unorderedListLines.join('\n') + 
            text.substring(selection.end);
        }
        return result;
        
      case 'ordered-list':
        if (selectionText.trim() === '') {
          result = text.substring(0, selection.start) + 
            markdownSyntax.listItem.ordered(1) + 
            text.substring(selection.end);
        } else {
          const listLines = selectionText.split('\n');
          const orderedListLines = listLines.map((line, i) => 
            markdownSyntax.listItem.ordered(i + 1) + line
          );
          result = text.substring(0, selection.start) + 
            orderedListLines.join('\n') + 
            text.substring(selection.end);
        }
        return result;
        
      case 'horizontal-rule':
        result = text.substring(0, selection.start) + 
          '\n' + markdownSyntax.horizontalRule + '\n' + 
          text.substring(selection.end);
        return result;
        
      case 'strikethrough':
        result = text.substring(0, selection.start) + 
          markdownSyntax.strikethrough + selectionText + markdownSyntax.strikethrough + 
          text.substring(selection.end);
        return result;
        
      case 'table':
        result = text.substring(0, selection.start) + 
          markdownSyntax.table.header + '\n' + markdownSyntax.table.row + 
          text.substring(selection.end);
        return result;
        
      default:
        return text;
    }
  }
  
  // Check if a line is a heading
  export function isHeading(line) {
    return /^#{1,6}\s/.test(line);
  }
  
  // Get heading level (1-6) from a line
  export function getHeadingLevel(line) {
    const match = line.match(/^(#{1,6})\s/);
    return match ? match[1].length : 0;
  }
  
  // Extract table of contents from markdown
  export function extractTableOfContents(markdown) {
    if (!markdown) return [];
    
    const lines = markdown.split('\n');
    const toc = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (isHeading(line)) {
        const level = getHeadingLevel(line);
        const text = line.substring(level + 1).trim();
        const id = text.toLowerCase().replace(/[^\w]+/g, '-');
        
        toc.push({
          level,
          text,
          id,
          line: i,
        });
      }
    }
    
    return toc;
  }
  
  // Parse markdown frontmatter if present
  export function parseFrontmatter(markdown) {
    const match = markdown.match(/^---\n([\s\S]*?)\n---/);
    
    if (!match) return { frontmatter: null, content: markdown };
    
    const frontmatterStr = match[1];
    const content = markdown.substring(match[0].length).trim();
    
    // Parse frontmatter
    const frontmatter = {};
    frontmatterStr.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split(':');
      if (key && valueParts.length) {
        frontmatter[key.trim()] = valueParts.join(':').trim();
      }
    });
    
    return { frontmatter, content };
  }```




# File: client/tailwind.config.js

```js
/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
      extend: {
        colors: {
          primary: {
            50: '#e6f1ff',
            100: '#cce3ff',
            200: '#99c7ff',
            300: '#66abff',
            400: '#338fff',
            500: '#0073ff',
            600: '#005ccc',
            700: '#004599',
            800: '#002e66',
            900: '#001733',
          },
          editor: {
            background: 'var(--editor-bg)',
            text: 'var(--editor-text)',
            cursor: 'var(--editor-cursor)',
            selection: 'var(--editor-selection)',
            line: 'var(--editor-line)',
          },
        },
        animation: {
          'cursor-blink': 'blink 1s step-end infinite',
          'fade-in': 'fadeIn 0.3s ease-in-out',
          'slide-up': 'slideUp 0.3s ease-out',
        },
        keyframes: {
          blink: {
            '0%, 100%': { opacity: 1 },
            '50%': { opacity: 0 },
          },
          fadeIn: {
            '0%': { opacity: 0 },
            '100%': { opacity: 1 },
          },
          slideUp: {
            '0%': { transform: 'translateY(10px)', opacity: 0 },
            '100%': { transform: 'translateY(0)', opacity: 1 },
          },
        },
      },
    },
    plugins: [],
  }```




# File: client/vite.config.js

```js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: false,
    chunkSizeWarningLimit: 1600, // Αύξηση του ορίου προειδοποίησης
    rollupOptions: {
      external: [], // Αν χρειάζεται να ορίσεις εξωτερικές εξαρτήσεις
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
      },
      '/ws': {
        target: 'ws://localhost:5001',
        ws: true,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});```




# File: docker/client.Dockerfile

```Dockerfile
FROM node:18-alpine as build

WORKDIR /app

# Αντιγραφή μόνο των package.json και package-lock.json
COPY client/package.json ./

# Εγκατάσταση των εξαρτήσεων
RUN npm install

# Προσθήκη των missing dependencies
RUN npm install --save @chakra-ui/icons

# Add WebSocket dependencies
RUN npm install --save y-websocket

# Αντιγραφή του πηγαίου κώδικα
COPY client/ ./

# Διόρθωση του commonPrefixLength
RUN sed -i 's/const commonPrefixLength = 0;/let commonPrefixLength = 0;/g' src/components/Editor/Editor.jsx

# Εμφάνιση των αρχείων για διαγνωστικούς λόγους
RUN find . -type f -name "*.jsx" | xargs grep -l "commonPrefixLength"

# Build της εφαρμογής με παράκαμψη των σφαλμάτων αν είναι δυνατόν
RUN npm run build || (cat /root/.npm/_logs/*-debug.log && exit 1)

# Production stage
FROM nginx:alpine

# Αντιγραφή των αρχείων build
COPY --from=build /app/dist /usr/share/nginx/html

# Αντιγραφή της ρύθμισης του nginx
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]```




# File: docker/nginx.conf

```conf
server {
    listen 80;
    server_name localhost;
    
    # Enhanced logging for debugging
    error_log /var/log/nginx/error.log debug;
    
    # Serve static files
    location / {
        root /usr/share/nginx/html;
        index index.html;
        try_files $uri $uri/ /index.html;
    }
    
    # Proxy API requests to the backend
    location /api/ {
        proxy_pass http://server:5000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    
    # WebSocket proxy for real-time collaboration
    location /ws/ {
        proxy_pass http://server:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}```




# File: docker/server.Dockerfile

```Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy only package.json first
COPY server/package.json ./

# Install dependencies
RUN npm install

# Install the y-websocket-server with correct version
RUN npm install @y/websocket-server@0.1.1 ws

# Copy source code
COPY server/ ./

# Create documents directory
RUN mkdir -p documents/updates

EXPOSE 5000

CMD ["npm", "start"]```




# File: docker-compose.yml

```yml
services:
  # Backend service
  server:
    build:
      context: .
      dockerfile: docker/server.Dockerfile
    ports:
      - "5001:5000"
    environment:
      - NODE_ENV=production
      - PORT=5000
    volumes:
      - document-data:/app/documents
    restart: unless-stopped
    networks:
      - app_network
    
  # Frontend service
  client:
    build:
      context: .
      dockerfile: docker/client.Dockerfile
    ports:
      - "80:80"
    depends_on:
      - server
    restart: unless-stopped
    networks:
      - app_network

networks:
  app_network:
    driver: bridge

volumes:
  document-data:
    driver: local```




# File: README.md

```md
# Collaborative Markdown Editor

A real-time collaborative Markdown editor built with React, Node.js, and CRDT technology.

![Collaborative Markdown Editor](https://via.placeholder.com/1200x600)

## Features

- **Real-time collaboration**: Multiple users can edit the same document simultaneously
- **CRDT-based conflict resolution**: Uses Yjs for conflict-free replicated data types
- **Markdown editing and preview**: Edit Markdown with rich formatting tools and see live preview
- **User presence**: See who's editing and their cursor positions
- **Edit history visualization**: Track document changes over time
- **Collaboration analytics**: View detailed statistics about user contributions
- **Dark/light theme**: Choose your preferred color scheme
- **Responsive design**: Works on desktop and mobile devices
- **Docker support**: Easy deployment with Docker and Docker Compose

## Architecture

```mermaid
graph TD
    Client[Client App] --> |WebSocket| Server[Server]
    Client --> |HTTP API| Server
    Server --> |Persist| DocumentStorage[Document Storage]
    
    subgraph "Client Components"
        Editor[Editor]
        Preview[Preview]
        UserPresence[User Presence]
        Analytics[Analytics]
        History[Edit History]
    end
    
    subgraph "Server Components"
        WebSocketServer[WebSocket Server]
        CRDTMerge[CRDT Merge]
        DocumentController[Document Controller]
    end
    
    style Client fill:#d4f1f9,stroke:#333
    style Server fill:#ffe6cc,stroke:#333
    style DocumentStorage fill:#e1d5e7,stroke:#333
Technology Stack

Frontend:

React (with Vite)
Chakra UI
Tailwind CSS
Yjs (CRDT library)
React Router
Recharts (for visualizations)


Backend:

Node.js
Express
WebSockets (for real-time communication)
Yjs (for CRDT operations)


DevOps:

Docker
Docker Compose
Nginx (for production deployment)



Installation and Setup
Prerequisites

Node.js (v18 or higher)
npm or yarn
Docker and Docker Compose (for containerized deployment)

Local Development

Clone the repository:
bashgit clone https://github.com/yourusername/collaborative-markdown-editor.git
cd collaborative-markdown-editor

Install dependencies for both client and server:
bash# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install

Start the development servers:
bash# Start the server (from the server directory)
npm run dev

# In a separate terminal, start the client (from the client directory)
npm run dev

Open your browser and navigate to http://localhost:3000

Docker Deployment

Build and start the containers:
bashdocker-compose up -d

Access the application at http://localhost
To stop the containers:
bashdocker-compose down


Data Flow
mermaidsequenceDiagram
    participant User1 as User 1
    participant User2 as User 2
    participant Client1 as Client App 1
    participant Client2 as Client App 2
    participant Server as Server
    
    User1->>Client1: Edit document
    Client1->>Server: Send changes (CRDT ops)
    Server->>Client2: Broadcast changes
    Client2->>User2: Update UI
    
    User2->>Client2: Edit document
    Client2->>Server: Send changes (CRDT ops)
    Server->>Client1: Broadcast changes
    Client1->>User1: Update UI
Key Components
Client

Editor: The core text editing component with real-time collaboration
MarkdownPreview: Renders the Markdown as HTML in real-time
UserPresence: Shows cursors and selections of other users
Sidebar: Document navigation and management
Visualizations: Charts and graphs showing collaboration metrics

Server

WebSocket Handler: Manages real-time connections and message routing
CRDT Operations: Handles merging of concurrent edits
Document Controller: API endpoints for document management

API Endpoints
EndpointMethodDescription/api/documentsGETGet all documents/api/documentsPOSTCreate a new document/api/documents/:idGETGet a specific document/api/documents/:idPATCHUpdate a document/api/documents/:idDELETEDelete a document
WebSocket Protocol
The application uses WebSockets for real-time collaboration. The WebSocket server is accessible at ws://localhost:5000/:docId where :docId is the document identifier.
Messages exchanged over the WebSocket connection follow the Yjs protocol.
Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

Fork the repository
Create your feature branch (git checkout -b feature/amazing-feature)
Commit your changes (git commit -m 'Add some amazing feature')
Push to the branch (git push origin feature/amazing-feature)
Open a Pull Request

License
This project is licensed under the MIT License - see the LICENSE file for details.

This completes the detailed implementation of a real-time collaborative Markdown editor using React (Vite) and Node.js (Express) with CRDT integration. The application features a comprehensive folder structure, client and server implementation, Docker configuration for deployment, and extensive documentation.

The implementation includes:
- Client-side components for editing, previewing, and visualizing Markdown documents
- Server-side APIs for document management
- WebSocket integration for real-time collaboration
- CRDT implementation using the Yjs library
- UI styling with Chakra UI and Tailwind CSS
- Visualizations for edit history and collaboration metrics
- Dark/light theme toggle
- Docker configuration for easy deployment

Would you like me to explain any particular aspect of the implementation in more detail?```




# File: server/controllers/analyticsController.js

```js
// server/controllers/analyticsController.js
import * as Y from 'yjs';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPDATES_DIR = path.join(__dirname, '..', 'documents', 'updates');

// Get edit history for a document
export const getEditHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const { period = '24h' } = req.query;
    
    // Implementation based on reading update files
    const updatesDir = path.join(UPDATES_DIR, id);
    const now = new Date();
    let cutoff;
    
    // Determine time period cutoff
    switch (period) {
      case '7d':
        cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default: // 24h
        cutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }
    
    // Read update files
    try {
      const files = await fs.readdir(updatesDir);
      const updates = [];
      
      for (const file of files) {
        // Process your update files here
      }
      
      res.json(updates);
    } catch (err) {
      if (err.code === 'ENOENT') {
        // Directory doesn't exist, return empty array
        res.json([]);
      } else {
        throw err;
      }
    }
  } catch (err) {
    console.error(`Error fetching edit history: ${err.message}`);
    res.status(500).json({ message: 'Error fetching edit history' });
  }
};

// Get collaboration stats for a document
export const getCollaborationStats = async (req, res) => {
  // Similar implementation based on reading document files
  res.json([]);
};

// Get document analytics
export const getDocumentAnalytics = async (req, res) => {
  // Implementation based on document analysis
  res.json({
    totalEdits: 0,
    editsTrend: 0,
    collaborators: 0,
    timeSpent: 0,
    revisions: 0,
    wordCount: 0,
    characterCount: 0,
    headingCount: 0,
    listItemCount: 0,
    lastSaved: new Date()
  });
};

// Get active users for a document
export const getActiveUsers = async (req, res) => {
  // This will be harder to implement without direct awareness access
  // You might need to implement a custom solution or use a different approach
  res.json([]);
};```




# File: server/controllers/documentController.js

```js
import {
  createDocument as createDocumentInStore,
  getAllDocuments as getAllDocumentsFromStore,
  getDocumentById as getDocumentByIdFromStore,
  updateDocument as updateDocumentInStore,
  deleteDocument as deleteDocumentFromStore
} from '../utils/documentStore.js';

// Get all documents
export const getAllDocuments = async (req, res) => {
  try {
    const documents = await getAllDocumentsFromStore();
    res.json(documents);
  } catch (err) {
    console.error(`Error fetching documents: ${err.message}`);
    res.status(500).json({ message: 'Error fetching documents' });
  }
};

// Create a new document
export const createDocument = async (req, res) => {
  try {
    const { name } = req.body;
    const newDoc = await createDocumentInStore(name);
    res.status(201).json(newDoc);
  } catch (err) {
    console.error(`Error creating document: ${err.message}`);
    res.status(500).json({ message: 'Error creating document' });
  }
};

// Get document by ID
export const getDocumentById = async (req, res) => {
  try {
    const { id } = req.params;
    const document = await getDocumentByIdFromStore(id);
    res.json(document);
  } catch (err) {
    console.error(`Error fetching document: ${err.message}`);
    res.status(404).json({ message: 'Document not found' });
  }
};

// Update document
export const updateDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }
    
    const updatedDoc = await updateDocumentInStore(id, { name });
    res.json(updatedDoc);
  } catch (err) {
    console.error(`Error updating document: ${err.message}`);
    
    if (err.message === 'Document not found') {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    res.status(500).json({ message: 'Error updating document' });
  }
};

// Delete document
export const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;
    await deleteDocumentFromStore(id);
    res.status(204).send();
  } catch (err) {
    console.error(`Error deleting document: ${err.message}`);
    
    if (err.message === 'Document not found') {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    res.status(500).json({ message: 'Error deleting document' });
  }
};```




# File: server/index.js

```js
import express from 'express';
import http from 'http';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import setupWSConnection from '@y/websocket-server';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import morgan from 'morgan';
import * as dotenv from 'dotenv';
import apiRoutes from './routes/documentRoutes.js';

// Initialize environment variables
dotenv.config();

// Constants
const PORT = process.env.PORT || 5000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DOCUMENTS_DIR = path.join(__dirname, 'documents');

// Ensure documents directory exists
try {
  await fs.mkdir(DOCUMENTS_DIR, { recursive: true });
  console.log(`Documents directory created: ${DOCUMENTS_DIR}`);
} catch (err) {
  console.error(`Error creating documents directory: ${err.message}`);
}

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// API Routes
app.use('/api', apiRoutes);

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  // Serve static files from the React app build directory
  const staticPath = path.resolve(__dirname, '../client/dist');
  app.use(express.static(staticPath));
  
  // For any request that doesn't match an API route, send the React app
  app.get('*', (req, res) => {
    res.sendFile(path.join(staticPath, 'index.html'));
  });
}

// Set up WebSocket server for Yjs
const wss = new WebSocketServer({ server });

wss.on('connection', (ws, req) => {
  setupWSConnection(ws, req, {
    // Set up any necessary options for the Y.js WebSocket server
    docName: req.url.slice(1), // Remove leading slash from URL to get document name
    gc: true // Enable garbage collection
  });
  console.log(`Client connected to document: ${req.url.slice(1)}`);
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`WebSocket server is ready`);
});

// Handle server shutdown gracefully
process.on('SIGINT', () => {
  console.log('Server shutting down...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});```




# File: server/models/Document.js

```js
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DOCUMENTS_DIR = path.join(__dirname, '..', 'documents');

// Document model (in-memory implementation for simplicity)
export class Document {
  constructor(data = {}) {
    this.id = data.id || uuidv4();
    this.name = data.name || 'Untitled Document';
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }
  
  // Load all documents
  static async findAll() {
    try {
      const indexPath = path.join(DOCUMENTS_DIR, 'index.json');
      const data = await fs.readFile(indexPath, 'utf8');
      const documents = JSON.parse(data);
      
      return documents.map(doc => new Document(doc));
    } catch (err) {
      if (err.code === 'ENOENT') {
        // If index file doesn't exist yet, return empty array
        return [];
      }
      
      throw err;
    }
  }
  
  // Find document by ID
  static async findById(id) {
    const documents = await Document.findAll();
    const document = documents.find(doc => doc.id === id);
    
    return document || null;
  }
  
  // Save document to storage
  async save() {
    try {
      // Load existing documents
      let documents = [];
      
      try {
        const indexPath = path.join(DOCUMENTS_DIR, 'index.json');
        const data = await fs.readFile(indexPath, 'utf8');
        documents = JSON.parse(data);
      } catch (err) {
        if (err.code !== 'ENOENT') {
          throw err;
        }
        // If file doesn't exist, start with empty array
      }
      
      // Update or insert document
      const index = documents.findIndex(doc => doc.id === this.id);
      
      if (index !== -1) {
        // Update
        documents[index] = this;
      } else {
        // Insert
        documents.push(this);
      }
      
      // Save updated index
      const indexPath = path.join(DOCUMENTS_DIR, 'index.json');
      await fs.writeFile(indexPath, JSON.stringify(documents, null, 2), 'utf8');
      
      return this;
    } catch (err) {
      throw err;
    }
  }
  
  // Delete document
  async remove() {
    try {
      // Load existing documents
      const indexPath = path.join(DOCUMENTS_DIR, 'index.json');
      const data = await fs.readFile(indexPath, 'utf8');
      let documents = JSON.parse(data);
      
      // Filter out this document
      documents = documents.filter(doc => doc.id !== this.id);
      
      // Save updated index
      await fs.writeFile(indexPath, JSON.stringify(documents, null, 2), 'utf8');
      
      return true;
    } catch (err) {
      throw err;
    }
  }
}```




# File: server/package.json

```json
{
  "name": "collaborative-markdown-editor-server",
  "version": "1.0.0",
  "description": "Server for collaborative Markdown editor",
  "main": "index.js",
  "type": "module",
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js"
  },
  "dependencies": {
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "express": "^4.18.2",
    "morgan": "^1.10.0",
    "uuid": "^9.0.1",
    "ws": "^8.16.0",
    "yjs": "^13.6.10",
    "@y/websocket-server": "^0.1.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.2"
  },
  "engines": {
    "node": ">=18"
  }
}```




# File: server/routes/documentRoutes.js

```js
import express from 'express';
import * as documentController from '../controllers/documentController.js';
import * as analyticsController from '../controllers/analyticsController.js';

const router = express.Router();

// Document CRUD routes
router.get('/documents', documentController.getAllDocuments);
router.post('/documents', documentController.createDocument);
router.get('/documents/:id', documentController.getDocumentById);
router.patch('/documents/:id', documentController.updateDocument);
router.delete('/documents/:id', documentController.deleteDocument);

// Analytics routes
router.get('/documents/:id/history', analyticsController.getEditHistory);
router.get('/documents/:id/collaboration', analyticsController.getCollaborationStats);
router.get('/documents/:id/analytics', analyticsController.getDocumentAnalytics);
router.get('/documents/:id/active-users', analyticsController.getActiveUsers);

export default router;```




# File: server/socket/socketHandler.js

```js
import * as Y from 'yjs';
import pkg from 'y-websocket';
const { WebsocketProvider } = pkg;
import * as awarenessProtocol from 'y-protocols/awareness.js';
import { writeUpdate, storeUpdate } from '../utils/documentStore.js';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPDATES_DIR = path.join(__dirname, '..', 'documents', 'updates');

// Create updates directory if it doesn't exist
try {
  await fs.mkdir(UPDATES_DIR, { recursive: true });
  console.log(`Updates directory created: ${UPDATES_DIR}`);
} catch (err) {
  console.error(`Error creating updates directory: ${err.message}`);
}

// Map to store document instances and their awareness states
const docs = new Map();
const awarenessList = new Map();

// Get or create a Y.Doc instance for a document ID
export const getYDoc = (docId) => {
  if (!docs.has(docId)) {
    const doc = new Y.Doc();
    docs.set(docId, doc);
    
    // Initialize text for new document
    doc.getText('content');
    
    // Set up awareness
    const awareness = new awarenessProtocol.Awareness(doc);
    awarenessList.set(docId, awareness);
    
    // Save document updates
    doc.on('update', (update, origin) => {
      // Store update for document history
      storeUpdate(docId, update, origin);
    });
    
    // Try to load existing document state
    loadDocumentUpdates(docId, doc);
  }
  
  return { 
    doc: docs.get(docId), 
    awareness: awarenessList.get(docId)
  };
};

// Load document updates from storage
async function loadDocumentUpdates(docId, doc) {
  try {
    const updatesDir = path.join(UPDATES_DIR, docId);
    
    try {
      await fs.mkdir(updatesDir, { recursive: true });
    } catch (err) {
      // Directory already exists, ignore
    }
    
    const updateFiles = await fs.readdir(updatesDir);
    updateFiles.sort(); // Sort by timestamp
    
    // Apply updates in order
    for (const file of updateFiles) {
      if (file.endsWith('.update')) {
        const update = await fs.readFile(path.join(updatesDir, file));
        Y.applyUpdate(doc, update);
      }
    }
    
    console.log(`Loaded ${updateFiles.length} updates for document ${docId}`);
  } catch (err) {
    console.error(`Error loading document updates: ${err.message}`);
  }
}

// Handle WebSocket connection with a client
export const handleConnection = (conn, req) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const docId = url.pathname.slice(1); // Remove leading slash
  
  if (!docId) {
    conn.close();
    return;
  }
  
  const { doc, awareness } = getYDoc(docId);
  
  // Custom WebSocket handling implementation
  conn.on('message', (message) => {
    try {
      const parsedMessage = JSON.parse(message);
      
      if (parsedMessage.type === 'sync') {
        // Handle sync messages
        const encoder = new Y.DSEncoder();
        const stateVector = parsedMessage.stateVector ? Y.decodeStateVector(parsedMessage.stateVector) : Y.encodeStateVector(doc);
        const update = Y.encodeStateAsUpdate(doc, stateVector);
        
        conn.send(JSON.stringify({
          type: 'sync',
          update: update.toString('base64')
        }));
      } else if (parsedMessage.type === 'update') {
        // Apply update to document
        const update = Buffer.from(parsedMessage.update, 'base64');
        Y.applyUpdate(doc, update);
        
        // Broadcast update to all clients except sender
        broadcastUpdate(docId, update, conn);
      } else if (parsedMessage.type === 'awareness') {
        // Update awareness state
        if (parsedMessage.states) {
          awarenessProtocol.applyAwarenessUpdate(
            awareness, 
            parsedMessage.states
          );
        }
      }
    } catch (err) {
      console.error(`Error handling message: ${err.message}`);
    }
  });
  
  // Initial sync
  const encoder = new Y.DSEncoder();
  const update = Y.encodeStateAsUpdate(doc);
  
  conn.send(JSON.stringify({
    type: 'sync',
    update: update.toString('base64')
  }));
  
  // Send current awareness states
  const awarenessStates = awareness.getStates();
  if (awarenessStates.size > 0) {
    conn.send(JSON.stringify({
      type: 'awareness',
      states: awarenessProtocol.encodeAwarenessUpdate(awareness, Array.from(awarenessStates.keys()))
    }));
  }
  
  conn.on('close', () => {
    console.log(`Client disconnected from document: ${docId}`);
  });
  
  console.log(`Client connected to document: ${docId}`);
};

// Broadcast update to all clients for a document
function broadcastUpdate(docId, update, excludeConn) {
  // Implementation details would depend on how connections are stored
  // This is a placeholder
}

// Get active users for a document
export const getActiveUsers = (docId) => {
  const awareness = awarenessList.get(docId);
  
  if (!awareness) {
    return [];
  }
  
  const users = [];
  awareness.getStates().forEach((state, clientId) => {
    if (state.user) {
      users.push({
        clientId,
        userId: state.user.id,
        username: state.user.name,
        color: state.user.color
      });
    }
  });
  
  return users;
};

// Get edit history for a document
export const getEditHistory = async (docId, period = '24h') => {
  try {
    const updatesDir = path.join(UPDATES_DIR, docId);
    const now = new Date();
    let cutoff;
    
    // Determine time period cutoff
    switch (period) {
      case '7d':
        cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default: // 24h
        cutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }
    
    // Read update files
    const files = await fs.readdir(updatesDir);
    const updates = [];
    
    for (const file of files) {
      if (file.endsWith('.update')) {
        // Extract timestamp from filename (e.g., 1621234567890.update)
        const timestamp = parseInt(file.split('.')[0]);
        const updateTime = new Date(timestamp);
        
        if (updateTime >= cutoff) {
          const metadata = await getUpdateMetadata(docId, file);
          updates.push({
            timestamp: updateTime,
            formattedTime: formatTime(updateTime, period),
            ...metadata
          });
        }
      }
    }
    
    // Process updates data
    return processUpdateHistory(updates, period);
  } catch (err) {
    console.error(`Error getting edit history: ${err.message}`);
    return [];
  }
};

// Helper function to read update metadata
async function getUpdateMetadata(docId, filename) {
  try {
    const metaFile = filename.replace('.update', '.meta.json');
    const metaPath = path.join(UPDATES_DIR, docId, metaFile);
    
    const data = await fs.readFile(metaPath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return { userId: 'unknown', changeSize: 0 };
  }
}

// Format timestamp based on period
function formatTime(date, period) {
  if (period === '24h') {
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  } else {
    return `${date.getMonth() + 1}/${date.getDate()}`;
  }
}

// Process update history to return chart-friendly data
function processUpdateHistory(updates, period) {
  // Group updates by time period
  const groupedUpdates = new Map();
  
  for (const update of updates) {
    const key = update.formattedTime;
    
    if (!groupedUpdates.has(key)) {
      groupedUpdates.set(key, {
        timestamp: update.timestamp,
        formattedTime: key,
        edits: 0,
        characters: 0
      });
    }
    
    const group = groupedUpdates.get(key);
    group.edits += 1;
    group.characters += update.changeSize || 0;
  }
  
  // Convert to array and sort by timestamp
  const result = Array.from(groupedUpdates.values());
  result.sort((a, b) => a.timestamp - b.timestamp);
  
  return result;
}

// Get collaboration stats for a document
export const getCollaborationStats = async (docId) => {
  try {
    const updatesDir = path.join(UPDATES_DIR, docId);
    const files = await fs.readdir(updatesDir);
    
    // Process metadata to get collaboration stats
    const userStats = new Map();
    
    for (const file of files) {
      if (file.endsWith('.meta.json')) {
        const metaPath = path.join(updatesDir, file);
        const data = await fs.readFile(metaPath, 'utf8');
        const metadata = JSON.parse(data);
        
        if (!userStats.has(metadata.userId)) {
          userStats.set(metadata.userId, {
            userId: metadata.userId,
            username: metadata.username || 'Unknown User',
            color: metadata.color || '#cccccc',
            edits: 0
          });
        }
        
        const stats = userStats.get(metadata.userId);
        stats.edits += 1;
      }
    }
    
    return Array.from(userStats.values());
  } catch (err) {
    console.error(`Error getting collaboration stats: ${err.message}`);
    return [];
  }
};

// Get document analytics
export const getDocumentAnalytics = async (docId) => {
  try {
    const { doc } = getYDoc(docId);
    const text = doc.getText('content').toString();
    
    // Get update history for trends
    const updatesDir = path.join(UPDATES_DIR, docId);
    const files = await fs.readdir(updatesDir);
    const metaFiles = files.filter(f => f.endsWith('.meta.json'));
    
    // Basic stats
    const totalEdits = metaFiles.length;
    const collaborators = new Set();
    let timeSpent = 0;
    let revisions = 0;
    
    // Calculate stats from metadata
    for (const file of metaFiles) {
      const metaPath = path.join(updatesDir, file);
      const data = await fs.readFile(metaPath, 'utf8');
      const metadata = JSON.parse(data);
      
      collaborators.add(metadata.userId);
      timeSpent += metadata.duration || 0;
      
      if (metadata.isRevision) {
        revisions += 1;
      }
    }
    
    // Calculate trends (compare with previous period)
    const now = new Date();
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    const recentEdits = metaFiles.filter(file => {
      const timestamp = parseInt(file.split('.')[0]);
      return timestamp > dayAgo.getTime();
    }).length;
    
    const olderEdits = metaFiles.filter(file => {
      const timestamp = parseInt(file.split('.')[0]);
      return timestamp <= dayAgo.getTime() && timestamp > dayAgo.getTime() - 24 * 60 * 60 * 1000;
    }).length;
    
    const editsTrend = olderEdits === 0 ? 100 : ((recentEdits - olderEdits) / olderEdits) * 100;
    
    // Document content stats
    const wordCount = text.split(/\s+/).filter(Boolean).length;
    const characterCount = text.length;
    const headingCount = (text.match(/^#+\s+/gm) || []).length;
    const listItemCount = (text.match(/^[\s]*[-*+]\s+/gm) || []).length + (text.match(/^[\s]*\d+\.\s+/gm) || []).length;
    
    return {
      totalEdits,
      editsTrend: Math.round(editsTrend),
      collaborators: collaborators.size,
      collaboratorsTrend: 0, // Calculate if needed
      timeSpent: Math.round(timeSpent / 60), // Convert to minutes
      timeSpentTrend: 0, // Calculate if needed
      revisions,
      revisionsTrend: 0, // Calculate if needed
      lastSaved: new Date(),
      wordCount,
      characterCount,
      headingCount,
      listItemCount
    };
  } catch (err) {
    console.error(`Error getting document analytics: ${err.message}`);
    return {
      totalEdits: 0,
      editsTrend: 0,
      collaborators: 0,
      collaboratorsTrend: 0,
      timeSpent: 0,
      timeSpentTrend: 0,
      revisions: 0,
      revisionsTrend: 0,
      lastSaved: new Date(),
      wordCount: 0,
      characterCount: 0,
      headingCount: 0,
      listItemCount: 0
    };
  }
};```




# File: server/utils/crdtMerge.js

```js
import * as Y from 'yjs';

// Create a new Y.Doc
export const createYDoc = () => {
  return new Y.Doc();
};

// Get the text from a Y.Doc
export const getYText = (ydoc, name = 'content') => {
  return ydoc.getText(name);
};

// Apply an update to a Y.Doc
export const applyUpdate = (ydoc, update) => {
  Y.applyUpdate(ydoc, update);
};

// Encode state as an update message that can be sent to other peers
export const encodeStateAsUpdate = (ydoc) => {
  return Y.encodeStateAsUpdate(ydoc);
};

// Create a Y.UndoManager for a type
export const createUndoManager = (ytext, options = {}) => {
  return new Y.UndoManager(ytext, options);
};

// Helper function to merge document updates from multiple sources
export const mergeUpdates = (updates) => {
  return Y.mergeUpdates(updates);
};

// Convert Yjs delta to plain text
export const deltaToPlainText = (delta) => {
  let text = '';
  
  delta.forEach(op => {
    if (op.insert) {
      text += op.insert;
    }
  });
  
  return text;
};

// Extract document statistics
export const extractDocStats = (text) => {
  if (!text) {
    return {
      chars: 0,
      words: 0,
      lines: 0,
      headings: 0,
      lists: 0,
      codeBlocks: 0
    };
  }
  
  const lines = text.split('\n');
  const words = text.split(/\s+/).filter(Boolean).length;
  const headings = (text.match(/^#+\s+/gm) || []).length;
  const lists = (text.match(/^[\s]*[-*+]\s+/gm) || []).length + 
                (text.match(/^[\s]*\d+\.\s+/gm) || []).length;
  const codeBlocks = (text.match(/```[\s\S]*?```/g) || []).length;
  
  return {
    chars: text.length,
    words,
    lines: lines.length,
    headings,
    lists,
    codeBlocks
  };
};```




# File: server/utils/documentStore.js

```js
import * as Y from 'yjs';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DOCUMENTS_DIR = path.join(__dirname, '..', 'documents');
const UPDATES_DIR = path.join(DOCUMENTS_DIR, 'updates');

// Ensure directories exist
try {
  await fs.mkdir(DOCUMENTS_DIR, { recursive: true });
  await fs.mkdir(UPDATES_DIR, { recursive: true });
} catch (err) {
  console.error(`Error creating document directories: ${err.message}`);
}

// Write a document update to the filesystem
export async function writeUpdate(docId, update, metadata = {}) {
  try {
    const docDir = path.join(UPDATES_DIR, docId);
    
    // Create document directory if it doesn't exist
    try {
      await fs.mkdir(docDir, { recursive: true });
    } catch (err) {
      // Directory already exists, ignore
    }
    
    const timestamp = Date.now();
    const updateFile = path.join(docDir, `${timestamp}.update`);
    const metaFile = path.join(docDir, `${timestamp}.meta.json`);
    
    // Write update
    await fs.writeFile(updateFile, update);
    
    // Write metadata
    await fs.writeFile(metaFile, JSON.stringify({
      timestamp,
      ...metadata
    }, null, 2));
    
    return timestamp;
  } catch (err) {
    console.error(`Error writing update: ${err.message}`);
    throw err;
  }
}

// Store an update with additional metadata extracted from the update
export async function storeUpdate(docId, update, origin = null) {
  try {
    // Extract information from the update if possible
    let changeSize = 0;
    let userId = 'unknown';
    let username = 'Unknown User';
    let color = '#cccccc';
    let isRevision = false;
    
    // If origin contains user information, extract it
    if (origin && typeof origin === 'object') {
      if (origin.userId) userId = origin.userId;
      if (origin.username) username = origin.username;
      if (origin.color) color = origin.color;
      if (origin.isRevision) isRevision = true;
      
      // Try to estimate change size if not provided
      if (origin.changeSize) {
        changeSize = origin.changeSize;
      } else {
        // Rough estimate based on update size
        changeSize = update.byteLength;
      }
    }
    
    // Store the update with metadata
    return await writeUpdate(docId, update, {
      userId,
      username,
      color,
      changeSize,
      isRevision,
      duration: origin?.duration || 0 // Time spent on this edit if tracked
    });
  } catch (err) {
    console.error(`Error storing update: ${err.message}`);
    // Still write the update even if metadata extraction fails
    return await writeUpdate(docId, update);
  }
}

// Load all updates for a document
export async function loadDocumentUpdates(docId) {
  try {
    const docDir = path.join(UPDATES_DIR, docId);
    
    try {
      await fs.mkdir(docDir, { recursive: true });
    } catch (err) {
      // Directory already exists, ignore
    }
    
    const files = await fs.readdir(docDir);
    const updateFiles = files.filter(file => file.endsWith('.update'));
    updateFiles.sort(); // Sort by timestamp
    
    const updates = [];
    
    for (const file of updateFiles) {
      const updatePath = path.join(docDir, file);
      const update = await fs.readFile(updatePath);
      updates.push(update);
    }
    
    return updates;
  } catch (err) {
    console.error(`Error loading document updates: ${err.message}`);
    return [];
  }
}

// Merge updates into a single state
export function mergeUpdates(updates) {
  if (updates.length === 0) return null;
  return Y.mergeUpdates(updates);
}

// Apply updates to a Y.Doc
export function applyUpdatesToDoc(doc, updates) {
  for (const update of updates) {
    Y.applyUpdate(doc, update);
  }
  return doc;
}

// Create a new document in storage
export async function createDocument(name = 'Untitled Document') {
  try {
    const id = generateDocId();
    const doc = {
      id,
      name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Create document metadata
    const indexPath = path.join(DOCUMENTS_DIR, 'index.json');
    let documents = [];
    
    try {
      const indexData = await fs.readFile(indexPath, 'utf8');
      documents = JSON.parse(indexData);
    } catch (err) {
      // If file doesn't exist or is invalid, start with empty array
      documents = [];
    }
    
    documents.push(doc);
    await fs.writeFile(indexPath, JSON.stringify(documents, null, 2));
    
    // Create document directory
    const docDir = path.join(UPDATES_DIR, id);
    await fs.mkdir(docDir, { recursive: true });
    
    return doc;
  } catch (err) {
    console.error(`Error creating document: ${err.message}`);
    throw err;
  }
}

// Update document metadata
export async function updateDocument(id, data) {
  try {
    const indexPath = path.join(DOCUMENTS_DIR, 'index.json');
    let documents = [];
    
    try {
      const indexData = await fs.readFile(indexPath, 'utf8');
      documents = JSON.parse(indexData);
    } catch (err) {
      // If file doesn't exist or is invalid, start with empty array
      documents = [];
      throw new Error('Document not found');
    }
    
    const index = documents.findIndex(doc => doc.id === id);
    if (index === -1) {
      throw new Error('Document not found');
    }
    
    const updatedDoc = {
      ...documents[index],
      ...data,
      updatedAt: new Date().toISOString()
    };
    
    documents[index] = updatedDoc;
    await fs.writeFile(indexPath, JSON.stringify(documents, null, 2));
    
    return updatedDoc;
  } catch (err) {
    console.error(`Error updating document: ${err.message}`);
    throw err;
  }
}

// Delete a document
export async function deleteDocument(id) {
  try {
    const indexPath = path.join(DOCUMENTS_DIR, 'index.json');
    let documents = [];
    
    try {
      const indexData = await fs.readFile(indexPath, 'utf8');
      documents = JSON.parse(indexData);
    } catch (err) {
      // If file doesn't exist or is invalid, start with empty array
      documents = [];
      throw new Error('Document not found');
    }
    
    const index = documents.findIndex(doc => doc.id === id);
    if (index === -1) {
      throw new Error('Document not found');
    }
    
    // Remove from index
    documents.splice(index, 1);
    await fs.writeFile(indexPath, JSON.stringify(documents, null, 2));
    
    // Remove document files
    const docDir = path.join(UPDATES_DIR, id);
    await fs.rm(docDir, { recursive: true, force: true });
    
    return true;
  } catch (err) {
    console.error(`Error deleting document: ${err.message}`);
    throw err;
  }
}

// Get all documents
export async function getAllDocuments() {
  try {
    const indexPath = path.join(DOCUMENTS_DIR, 'index.json');
    
    try {
      const indexData = await fs.readFile(indexPath, 'utf8');
      return JSON.parse(indexData);
    } catch (err) {
      // If file doesn't exist or is invalid, return empty array
      return [];
    }
  } catch (err) {
    console.error(`Error getting all documents: ${err.message}`);
    return [];
  }
}

// Get a document by ID
export async function getDocumentById(id) {
  try {
    const indexPath = path.join(DOCUMENTS_DIR, 'index.json');
    
    try {
      const indexData = await fs.readFile(indexPath, 'utf8');
      const documents = JSON.parse(indexData);
      const document = documents.find(doc => doc.id === id);
      
      if (!document) {
        throw new Error('Document not found');
      }
      
      return document;
    } catch (err) {
      // If file doesn't exist or is invalid, or document not found
      throw new Error('Document not found');
    }
  } catch (err) {
    console.error(`Error getting document: ${err.message}`);
    throw err;
  }
}

// Generate a unique document ID
function generateDocId() {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}```


