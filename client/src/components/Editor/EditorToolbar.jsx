import { useState, useRef } from 'react';
import { 
  Flex, 
  Button, 
  IconButton, 
  Tooltip, 
  Input, 
  HStack, 
  Box,
  Badge, 
  Divider,
  useDisclosure,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  PopoverArrow 
} from '@chakra-ui/react';
import {
  FaBold,
  FaItalic,
  FaHeading,
  FaListUl,
  FaListOl,
  FaQuoteLeft,
  FaCode,
  FaLink,
  FaImage,
  FaSync,
  FaEye,
  FaEyeSlash,
  FaChartLine,
  FaUserFriends
} from 'react-icons/fa';
import { MdHorizontalRule } from 'react-icons/md';
import UserPresence from '../UI/UserPresence';

const EditorToolbar = ({ 
  document, 
  onTitleChange, 
  isConnected,
  onFormat,
  showPreview,
  togglePreview,
  activeUsers = [],
  showAnalytics,
  toggleAnalytics
}) => {
  const [title, setTitle] = useState(document?.name || 'Untitled Document');
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Handle title click to start editing
  const handleTitleClick = () => {
    setIsEditing(true);
    setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    }, 50);
  };

  // Handle title input blur to save changes
  const handleTitleBlur = () => {
    setIsEditing(false);
    onTitleChange(title);
  };

  // Handle title input key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      setIsEditing(false);
      onTitleChange(title);
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setTitle(document?.name || 'Untitled Document');
    }
  };

  return (
    <Box
      className="editor-toolbar"
      p={2}
      borderBottom="1px solid"
      borderColor="border.light"
      _dark={{ borderColor: "border.dark" }}
      bg="sidebar.light"
      _dark={{ bg: "sidebar.dark" }}
    >
      <Flex justifyContent="space-between" alignItems="center">
        {/* Document title */}
        <Box>
          {isEditing ? (
            <Input
              ref={inputRef}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleTitleBlur}
              onKeyDown={handleKeyPress}
              size="sm"
              width="250px"
              fontWeight="medium"
            />
          ) : (
            <Tooltip label="Click to edit">
              <Button 
                variant="ghost" 
                onClick={handleTitleClick}
                fontWeight="medium"
                px={2}
                h="32px"
              >
                {title}
              </Button>
            </Tooltip>
          )}
          
          {/* Connection status */}
          <Badge 
            ml={2}
            colorScheme={isConnected ? 'green' : 'red'}
            variant="subtle"
          >
            {isConnected ? 'Connected' : 'Disconnected'}
          </Badge>
        </Box>
        
        {/* Formatting tools */}
        <HStack spacing={1} justifyContent="center" flex="1">
          <Tooltip label="Bold (Ctrl+B)">
            <IconButton
              aria-label="Bold"
              icon={<FaBold />}
              onClick={() => onFormat('bold')}
              size="sm"
              variant="ghost"
              className="toolbar-button"
            />
          </Tooltip>
          
          <Tooltip label="Italic (Ctrl+I)">
            <IconButton
              aria-label="Italic"
              icon={<FaItalic />}
              onClick={() => onFormat('italic')}
              size="sm"
              variant="ghost"
              className="toolbar-button"
            />
          </Tooltip>
          
          <Tooltip label="Heading 1">
            <IconButton
              aria-label="Heading 1"
              icon={<FaHeading />}
              onClick={() => onFormat('heading1')}
              size="sm"
              variant="ghost"
              className="toolbar-button"
            />
          </Tooltip>
          
          <Tooltip label="Heading 2">
            <IconButton
              aria-label="Heading 2"
              icon={<Box as="span" fontSize="xs">H2</Box>}
              onClick={() => onFormat('heading2')}
              size="sm"
              variant="ghost"
              className="toolbar-button"
            />
          </Tooltip>
          
          <Tooltip label="Heading 3">
            <IconButton
              aria-label="Heading 3"
              icon={<Box as="span" fontSize="xs">H3</Box>}
              onClick={() => onFormat('heading3')}
              size="sm"
              variant="ghost"
              className="toolbar-button"
            />
          </Tooltip>
          
          <Divider orientation="vertical" h="24px" />
          
          <Tooltip label="Bulleted List">
            <IconButton
              aria-label="Bulleted List"
              icon={<FaListUl />}
              onClick={() => onFormat('list')}
              size="sm"
              variant="ghost"
              className="toolbar-button"
            />
          </Tooltip>
          
          <Tooltip label="Numbered List">
            <IconButton
              aria-label="Numbered List"
              icon={<FaListOl />}
              onClick={() => onFormat('numbered-list')}
              size="sm"
              variant="ghost"
              className="toolbar-button"
            />
          </Tooltip>
          
          <Tooltip label="Quote">
            <IconButton
              aria-label="Quote"
              icon={<FaQuoteLeft />}
              onClick={() => onFormat('quote')}
              size="sm"
              variant="ghost"
              className="toolbar-button"
            />
          </Tooltip>
          
          <Tooltip label="Inline Code">
            <IconButton
              aria-label="Inline Code"
              icon={<FaCode />}
              onClick={() => onFormat('code')}
              size="sm"
              variant="ghost"
              className="toolbar-button"
            />
          </Tooltip>
          
          <Tooltip label="Code Block">
            <IconButton
              aria-label="Code Block"
              icon={<Box as="span" fontSize="xs">{'</>'}</Box>}
              onClick={() => onFormat('codeblock')}
              size="sm"
              variant="ghost"
              className="toolbar-button"
            />
          </Tooltip>
          
          <Divider orientation="vertical" h="24px" />
          
          <Tooltip label="Link">
            <IconButton
              aria-label="Link"
              icon={<FaLink />}
              onClick={() => onFormat('link')}
              size="sm"
              variant="ghost"
              className="toolbar-button"
            />
          </Tooltip>
          
          <Tooltip label="Image">
            <IconButton
              aria-label="Image"
              icon={<FaImage />}
              onClick={() => onFormat('image')}
              size="sm"
              variant="ghost"
              className="toolbar-button"
            />
          </Tooltip>
          
          <Tooltip label="Horizontal Rule">
            <IconButton
              aria-label="Horizontal Rule"
              icon={<MdHorizontalRule />}
              onClick={() => onFormat('horizontal-rule')}
              size="sm"
              variant="ghost"
              className="toolbar-button"
            />
          </Tooltip>
        </HStack>
        
        {/* Right side controls */}
        <HStack spacing={2}>
          {/* Active users */}
          <Popover isOpen={isOpen} onOpen={onOpen} onClose={onClose}>
            <PopoverTrigger>
              <Button 
                leftIcon={<FaUserFriends />} 
                size="sm" 
                variant="ghost"
                className="toolbar-button"
              >
                {activeUsers.length}
              </Button>
            </PopoverTrigger>
            <PopoverContent width="250px">
              <PopoverArrow />
              <PopoverBody p={3}>
                <UserPresence users={activeUsers.map(u => u.user)} />
              </PopoverBody>
            </PopoverContent>
          </Popover>
        
          {/* Toggle preview */}
          <Tooltip label={showPreview ? 'Hide Preview' : 'Show Preview'}>
            <IconButton
              aria-label={showPreview ? 'Hide Preview' : 'Show Preview'}
              icon={showPreview ? <FaEyeSlash /> : <FaEye />}
              onClick={togglePreview}
              size="sm"
              variant="ghost"
              className="toolbar-button"
            />
          </Tooltip>
          
          {/* Toggle analytics */}
          <Tooltip label={showAnalytics ? 'Hide Analytics' : 'Show Analytics'}>
            <IconButton
              aria-label={showAnalytics ? 'Hide Analytics' : 'Show Analytics'}
              icon={<FaChartLine />}
              onClick={toggleAnalytics}
              size="sm"
              variant="ghost"
              className={`toolbar-button ${showAnalytics ? 'active' : ''}`}
            />
          </Tooltip>
        </HStack>
      </Flex>
    </Box>
  );
};

export default EditorToolbar;