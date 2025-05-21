import React, { useEffect, useRef, useState, useCallback } from 'react';
import { 
  Box, 
  Flex, 
  useColorModeValue, 
  Text, 
  useToast, 
  Tooltip, 
  IconButton, 
  HStack, 
  Badge, 
  useDisclosure, 
  Spinner, 
  Center,
  Alert,
  AlertIcon,
  CloseButton,
  Collapse,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Button
} from '@chakra-ui/react';
import { ChevronDownIcon, InfoIcon } from '@chakra-ui/icons';
import { useCRDT } from '../../hooks/useCRDT';
import { useDocument } from '../../context/DocumentContext';
import { indexToPosition, positionToIndex, getCursorCoordinates } from '../../utils/crdt';
import EditorToolbar from './EditorToolbar';
import UserCursor from './UserCursor';
import { insertMarkdown } from '../../utils/markdown';
import { FaEye, FaRegSave, FaCheck, FaHistory, FaUndo } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const Editor = ({ docId }) => {
  // References
  const editorRef = useRef(null);
  const textareaRef = useRef(null);
  const lineNumbersRef = useRef(null);
  
  // Document context
  const { text, connectionStatus, activeUsers } = useDocument();
  const toast = useToast();
  
  // CRDT integration
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

  // Editor state
  const [selection, setSelection] = useState({ start: 0, end: 0 });
  const [isEditing, setIsEditing] = useState(false);
  const [cursorCoordinates, setCursorCoordinates] = useState({ top: 0, left: 0 });
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const [showInvisibles, setShowInvisibles] = useState(false);
  const [showOthersCursors, setShowOthersCursors] = useState(true);
  const [activeLine, setActiveLine] = useState(0);
  const [lastEditTime, setLastEditTime] = useState(Date.now());
  const [loading, setLoading] = useState(true);
  const { isOpen: isInfoOpen, onToggle: toggleInfo, onClose: closeInfo } = useDisclosure();
  
  // Colors
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'gray.100');
  const lineNumberColor = useColorModeValue('gray.400', 'gray.500');
  const lineNumberBg = useColorModeValue('gray.50', 'gray.900');
  const lineHighlightColor = useColorModeValue('blue.50', 'blue.900');
  const activeLineBg = useColorModeValue('blue.50', 'blue.800');
  const accentColor = useColorModeValue('blue.500', 'blue.400');
  
  // Show loading indicator
  useEffect(() => {
    if (ytext) {
      const timer = setTimeout(() => {
        setLoading(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [ytext]);
  
  // Show info banner with delay
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isInfoOpen && !localStorage.getItem('infoSeen')) {
        toggleInfo();
      }
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [isInfoOpen, toggleInfo]);

  // Handle cursor movement and selection
  const handleCursorChange = useCallback(() => {
    if (!textareaRef.current) return;
    
    const { selectionStart, selectionEnd } = textareaRef.current;
    setSelection({ start: selectionStart, end: selectionEnd });
    
    // Update cursor coordinates
    const position = indexToPosition(text, selectionStart);
    const coordinates = getCursorCoordinates(textareaRef.current, position);
    setCursorCoordinates(coordinates);
    
    // Set active line
    setActiveLine(position.line);
    
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
    
    // Record edit time
    setLastEditTime(Date.now());
    
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

  // Format text with markdown syntax
  const formatText = useCallback((syntax, options = {}) => {
    if (!ytext || !textareaRef.current) return;
    
    const formattedText = insertMarkdown(text, syntax, selection, options);
    
    // Calculate the diff and apply targeted changes
    if (formattedText !== text) {
      // For simplicity, we'll replace the entire text
      deleteText(0, text.length);
      insertText(0, formattedText);
      
      // Focus back on the editor
      textareaRef.current.focus();
      
      // Show success toast for formatting
      toast({
        title: "Formatting applied",
        status: "success",
        duration: 1000,
        isClosable: true,
        position: "bottom-right"
      });
    }
  }, [ytext, text, selection, deleteText, insertText, toast]);

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
    
    // Link
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      formatText('link', { url: 'https://example.com' });
    }
    
    // Headings
    if ((e.ctrlKey || e.metaKey) && e.key >= '1' && e.key <= '6') {
      e.preventDefault();
      formatText('heading', { level: parseInt(e.key) });
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
    if (textareaRef.current && !loading) {
      textareaRef.current.focus();
    }
  }, [loading]);

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

  // Handle info banner close
  const handleInfoClose = () => {
    closeInfo();
    localStorage.setItem('infoSeen', 'true');
  };

  // Generate line numbers
  const lineNumbers = text.split('\n').map((_, i) => i + 1);

  // Render remote cursors
  const renderRemoteCursors = () => {
    if (!awarenessStates.size || !showOthersCursors) return null;
    
    return Array.from(awarenessStates.entries()).map(([clientId, state]) => {
      if (!state.cursor) return null;
      
      // Determine if user is actively typing
      const isActive = Date.now() - (state.lastUpdate || 0) < 3000;
      
      // Convert cursor position to coordinates
      const cursorCoords = getCursorCoordinates(textareaRef.current, state.cursor);
      
      return (
        <UserCursor
          key={clientId}
          username={state.username || 'Anonymous'}
          color={state.color || '#cccccc'}
          position={cursorCoords}
          selection={state.selection}
          isActive={isActive}
        />
      );
    });
  };

  // Show loading spinner while connecting
  if (loading) {
    return (
      <Box w="full" h="full" position="relative">
        <Center h="full" flexDirection="column">
          <Spinner size="xl" color="blue.500" thickness="4px" mb="4" />
          <Text fontWeight="medium" color={useColorModeValue('gray.600', 'gray.300')}>
            Loading document...
          </Text>
        </Center>
      </Box>
    );
  }

  return (
    <Box w="full" h="full" position="relative">
      {/* Info banner */}
      <Collapse in={isInfoOpen} animateOpacity>
        <Alert
          status="info"
          variant="subtle"
          flexDirection={{ base: "column", sm: "row" }}
          alignItems="center"
          justifyContent="space-between"
          py="3"
          pl="4"
          pr="3"
          mb="0"
          borderRadius="0"
        >
          <Flex alignItems="center">
            <AlertIcon />
            <Box ml="2">
              <Text fontWeight="medium">Real-time collaboration active</Text>
              <Text fontSize="sm">
                Changes are automatically saved and visible to all collaborators
              </Text>
            </Box>
          </Flex>
          <Flex>
            <Menu>
              <MenuButton
                as={Button}
                variant="ghost"
                size="sm"
                rightIcon={<ChevronDownIcon />}
                _hover={{ bg: 'whiteAlpha.200' }}
                mr="2"
              >
                Learn More
              </MenuButton>
              <MenuList>
                <MenuItem icon={<FaEye />}>
                  See others' cursors in real-time
                </MenuItem>
                <MenuItem icon={<FaRegSave />}>
                  Changes auto-save instantly
                </MenuItem>
                <MenuItem icon={<FaHistory />}>
                  View edit history and contributions
                </MenuItem>
                <MenuDivider />
                <MenuItem icon={<FaUndo />}>
                  Press Ctrl+Z to undo changes
                </MenuItem>
              </MenuList>
            </Menu>
            <CloseButton onClick={handleInfoClose} />
          </Flex>
        </Alert>
      </Collapse>
      
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
        height={isInfoOpen ? "calc(100% - 40px - 66px)" : "calc(100% - 40px)"} 
        className="editor-container"
        transition="height 0.2s ease-in-out"
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
              animation={connected ? undefined : "0.8s blink infinite"}
            />
            <Text fontSize="xs" textTransform="capitalize">
              {connected ? 'Connected' : 'Reconnecting...'}
            </Text>
          </Badge>
          
          {connected && activeUsers && activeUsers.size > 0 && (
            <Badge
              bg={useColorModeValue('gray.100', 'gray.700')}
              color={textColor}
              px="2"
              py="1"
              borderRadius="full"
            >
              <HStack spacing="1">
                <FaEye size={10} />
                <Text fontSize="xs">{activeUsers.size}</Text>
              </HStack>
            </Badge>
          )}
        </HStack>
        
        {/* Editor */}
        <Flex h="full" w="full" position="relative">
          {/* Line numbers */}
          <AnimatePresence initial={false}>
            {showLineNumbers && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: "50px", opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                style={{ height: "100%", overflow: "hidden" }}
              >
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
                  position="relative"
                >
                  {/* Active line highlight */}
                  <Box
                    position="absolute"
                    width="100%"
                    height="20px"
                    bg={activeLineBg}
                    opacity="0.5"
                    transform={`translateY(${activeLine * 20 + 16}px)`} 
                    transition="transform 0.1s ease"
                    zIndex="1"
                  />
                  
                  {lineNumbers.map((num) => (
                    <Box 
                      key={num} 
                      px="2" 
                      height="20px"
                      className="line-number"
                      _classList={{
                        'current-line': {
                          color: textColor,
                          fontWeight: "bold"
                        }
                      }}
                      position="relative"
                      zIndex="2"
                    >
                      {num}
                    </Box>
                  ))}
                </Box>
              </motion.div>
            )}
          </AnimatePresence>
          
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
              _placeholder={{ color: "gray.400" }}
              placeholder="Start typing... Use Markdown for formatting."
              sx={{
                '&::selection': {
                  backgroundColor: useColorModeValue('rgba(0, 115, 255, 0.2)', 'rgba(99, 179, 237, 0.3)'),
                },
                '&.show-invisibles .space:before': {
                  content: '"\u00B7"',
                  color: 'gray.400',
                  opacity: 0.6
                },
                '&.show-invisibles .tab:before': {
                  content: '"\u2192"',
                  color: 'gray.400',
                  opacity: 0.6
                },
                '&.show-invisibles .cr:before': {
                  content: '"\u21B5"',
                  color: 'gray.400',
                  opacity: 0.6
                }
              }}
            />
            
            {/* Line highlight */}
            <Box
              position="absolute"
              left="0"
              right="0"
              height="20px"
              backgroundColor={lineHighlightColor}
              opacity="0.5"
              transform={`translateY(${activeLine * 20 + 16}px)`}
              transition="transform 0.1s ease"
              display={showLineNumbers ? 'none' : 'block'}
              pointerEvents="none"
            />
            
            {/* Local cursor */}
            <Box
              position="absolute"
              width="2px"
              height="20px"
              backgroundColor={accentColor}
              top={cursorCoordinates.top}
              left={cursorCoordinates.left}
              zIndex="2"
              opacity="0.8"
              className="animate-cursor-blink"
              display={isEditing ? 'none' : 'block'}
              pointerEvents="none"
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