import React, { useEffect, useRef, useState, useCallback } from 'react';
import { 
  Box, Flex, useColorModeValue, Text, Button, useToast,
  Tooltip, HStack, Badge, Icon, Menu, MenuButton,
  MenuList, MenuItem, useColorMode
} from '@chakra-ui/react';
import { useCRDT } from '../../hooks/useCRDT';
import { useDocument } from '../../context/DocumentContext';
import { indexToPosition, positionToIndex, getCursorCoordinates } from '../../utils/crdt';
import EditorToolbar from './EditorToolbar';
import UserCursor from './UserCursor';
import { useTheme } from '../../context/ThemeContext';
import { insertMarkdown } from '../../utils/markdown';
import { ChevronDownIcon } from '@chakra-ui/icons';
import { FaRegSave, FaKeyboard, FaEye, FaCode } from 'react-icons/fa';
import { MdPersonOff } from 'react-icons/md';
import { motion } from 'framer-motion';

const Editor = ({ docId }) => {
  const editorRef = useRef(null);
  const textareaRef = useRef(null);
  const lineNumbersRef = useRef(null);
  const { theme } = useTheme();
  const { colorMode } = useColorMode();
  const { text, connectionStatus, activeUsers } = useDocument();
  const toast = useToast();
  
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
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const [showInvisibles, setShowInvisibles] = useState(false);
  const [showOthersCursors, setShowOthersCursors] = useState(true);
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'gray.100');
  const lineNumberColor = useColorModeValue('gray.400', 'gray.500');
  const lineNumberBg = useColorModeValue('gray.50', 'gray.900');
  const lineHighlightColor = useColorModeValue('blue.50', 'blue.900');
  
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
    
    // Highlight current line in line numbers
    if (lineNumbersRef.current) {
      const linePosition = indexToPosition(text, selectionStart);
      const lineElements = lineNumbersRef.current.children;
      
      for (let i = 0; i < lineElements.length; i++) {
        if (i === linePosition.line) {
          lineElements[i].classList.add('current-line');
        } else {
          lineElements[i].classList.remove('current-line');
        }
      }
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
        
        toast({
          title: "Redo",
          description: "Changes restored",
          status: "info",
          duration: 1500,
          isClosable: true,
          position: "bottom-right"
        });
      } else {
        e.preventDefault();
        undo();
        
        toast({
          title: "Undo",
          description: "Change reverted",
          status: "info",
          duration: 1500,
          isClosable: true,
          position: "bottom-right"
        });
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
  }, [undo, redo, formatText, insertText, handleCursorChange, toast]);

  // Focus the editor on mount
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  // Handle connection status changes
  useEffect(() => {
    if (connectionStatus === 'connected' && !connected) {
      toast({
        title: "Connected",
        description: "Real-time collaboration active",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "bottom-right"
      });
    } else if (connectionStatus === 'disconnected' && connected) {
      toast({
        title: "Disconnected",
        description: "Connection lost. Trying to reconnect...",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom-right"
      });
    }
  }, [connectionStatus, connected, toast]);

  // Generate line numbers
  const lineNumbers = text.split('\n').map((_, i) => i + 1);

  // Render remote cursors
  const renderRemoteCursors = () => {
    if (!awarenessStates.size || !showOthersCursors) return null;
    
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
        showLineNumbers={showLineNumbers}
        toggleLineNumbers={() => setShowLineNumbers(!showLineNumbers)}
        showInvisibles={showInvisibles}
        toggleInvisibles={() => setShowInvisibles(!showInvisibles)}
        showOthersCursors={showOthersCursors}
        toggleOthersCursors={() => setShowOthersCursors(!showOthersCursors)}
      />
      
      <Flex 
        position="relative" 
        width="full" 
        height="calc(100% - 40px)" 
        className="editor-container"
      >
        {/* Status indicator */}
        <HStack
          position="absolute"
          top="2"
          right="3"
          zIndex="5"
          spacing="2"
        >
          <Badge
            colorScheme={connected ? 'green' : 'orange'}
            variant="subtle"
            px="2"
            py="1"
            borderRadius="full"
            display="flex"
            alignItems="center"
          >
            <Box
              w="8px"
              h="8px"
              borderRadius="full"
              bg={connected ? 'green.500' : 'orange.500'}
              mr="2"
            />
            <Text fontSize="xs" textTransform="capitalize">
              {connected ? 'Connected' : 'Reconnecting...'}
            </Text>
          </Badge>
          
          {connected && Object.keys(activeUsers).length > 0 && (
            <Tooltip label="Active users">
              <Badge
                bg={useColorModeValue('gray.100', 'gray.700')}
                color={textColor}
                px="2"
                py="1"
                borderRadius="full"
              >
                <HStack spacing="1">
                  <Icon as={FaEye} fontSize="xs" />
                  <Text fontSize="xs">{Object.keys(activeUsers).length}</Text>
                </HStack>
              </Badge>
            </Tooltip>
          )}
        </HStack>
        
        {/* Editor */}
        <Flex h="full" w="full" position="relative">
          {/* Line numbers */}
          {showLineNumbers && (
            <Box 
              ref={lineNumbersRef}
              width="50px" 
              h="full" 
              overflowY="hidden" 
              bg={lineNumberBg}
              color={lineNumberColor}
              fontFamily="mono"
              fontSize="sm"
              userSelect="none"
              borderRight="1px"
              borderColor={borderColor}
              textAlign="right"
              py="4"
              pr="2"
            >
              {lineNumbers.map((num) => (
                <Box 
                  key={num} 
                  px="2" 
                  className="line-number"
                  _classList={{
                    'current-line': {
                      bg: lineHighlightColor,
                      color: textColor,
                      fontWeight: "bold"
                    }
                  }}
                >
                  {num}
                </Box>
              ))}
            </Box>
          )}
          
          {/* Text editor */}
          <Box 
            ref={editorRef}
            position="relative" 
            flex="1"
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
              paddingLeft={showLineNumbers ? "4" : "6"}
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
              spellCheck="false"
              className={showInvisibles ? "show-invisibles" : ""}
              sx={{
                '&::selection': {
                  backgroundColor: theme === 'dark' ? 'rgba(99, 179, 237, 0.3)' : 'rgba(0, 115, 255, 0.2)',
                },
                '&.show-invisibles': {
                  '& .space:before': {
                    content: '"\u00B7"',
                    color: 'gray.400',
                    opacity: 0.6
                  },
                  '& .tab:before': {
                    content: '"\u2192"',
                    color: 'gray.400',
                    opacity: 0.6
                  },
                  '& .cr:before': {
                    content: '"\u21B5"',
                    color: 'gray.400',
                    opacity: 0.6
                  }
                }
              }}
            />
            
            {/* Remote cursors */}
            {renderRemoteCursors()}
          </Box>
        </Flex>
      </Flex>
    </Box>
  );
};

export default Editor;