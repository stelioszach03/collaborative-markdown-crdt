import React, { useState } from 'react';
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
  Button,
  ButtonGroup,
  HStack,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverArrow,
  PopoverCloseButton,
  Input,
  InputGroup,
  InputLeftAddon,
  Text,
  Badge
} from '@chakra-ui/react';
import {
  ChevronDownIcon,
  AddIcon,
  LinkIcon,
  CheckIcon,
  InfoIcon
} from '@chakra-ui/icons';
import {
  FaBold,
  FaItalic,
  FaImage,
  FaCode,
  FaListUl,
  FaListOl,
  FaQuoteRight,
  FaUndo,
  FaRedo,
  FaHeading,
  FaTable,
  FaEye,
  FaEyeSlash,
  FaUserFriends,
  FaUserSlash,
  FaRegFileCode,
  FaRegFile,
  FaStrikethrough,
  FaAlignLeft,
  FaAlignCenter,
  FaAlignRight,
  FaAlignJustify,
  FaTasks,
  FaCheck
} from 'react-icons/fa';
import { TbSeparatorHorizontal, TbTextWrap } from 'react-icons/tb';
import { IoMdAttach } from 'react-icons/io';
import { BiCodeBlock } from 'react-icons/bi';

const EditorToolbar = ({ 
  formatText, 
  selection, 
  undo, 
  redo, 
  connected,
  showLineNumbers,
  toggleLineNumbers,
  showInvisibles,
  toggleInvisibles,
  showOthersCursors,
  toggleOthersCursors
}) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const iconColor = useColorModeValue('gray.700', 'gray.300');
  const activeBg = useColorModeValue('blue.50', 'blue.900');
  const activeColor = useColorModeValue('blue.600', 'blue.200');
  
  // States for popover inputs
  const [linkUrl, setLinkUrl] = useState('https://');
  const [imageUrl, setImageUrl] = useState('https://');
  const [imageAlt, setImageAlt] = useState('Image description');
  const [codeLanguage, setCodeLanguage] = useState('javascript');

  // Format headings
  const formatHeading = (level) => {
    formatText('heading', { level });
  };

  // Insert link with URL
  const insertLink = () => {
    formatText('link', { url: linkUrl });
    setLinkUrl('https://');
  };

  // Insert image with URL and alt text
  const insertImage = () => {
    formatText('image', { url: imageUrl, alt: imageAlt });
    setImageUrl('https://');
    setImageAlt('Image description');
  };

  // Insert code block with language
  const insertCodeBlock = () => {
    formatText('code-block', { language: codeLanguage });
    setCodeLanguage('javascript');
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
      position="relative"
      zIndex="10"
    >
      <Flex align="center" flex="1">
        {/* Undo/Redo */}
        <ButtonGroup size="sm" variant="ghost" mr="2">
          <Tooltip label="Undo (Ctrl+Z)" openDelay={500}>
            <IconButton
              icon={<FaUndo size="14px" />}
              aria-label="Undo"
              onClick={undo}
              color={iconColor}
            />
          </Tooltip>
          
          <Tooltip label="Redo (Ctrl+Shift+Z)" openDelay={500}>
            <IconButton
              icon={<FaRedo size="14px" />}
              aria-label="Redo"
              onClick={redo}
              color={iconColor}
            />
          </Tooltip>
        </ButtonGroup>
        
        <Divider orientation="vertical" h="20px" mx="2" />
        
        {/* Headings */}
        <Menu closeOnSelect={true}>
          <Tooltip label="Headings" openDelay={500}>
            <MenuButton
              as={Button}
              size="sm"
              variant="ghost"
              color={iconColor}
              mx="1"
              leftIcon={<FaHeading size="14px" />}
              rightIcon={<ChevronDownIcon boxSize={3} />}
            >
              Heading
            </MenuButton>
          </Tooltip>
          <MenuList zIndex={1001}>
            <MenuItem onClick={() => formatHeading(1)} fontWeight="bold" fontSize="xl">Heading 1</MenuItem>
            <MenuItem onClick={() => formatHeading(2)} fontWeight="bold" fontSize="lg">Heading 2</MenuItem>
            <MenuItem onClick={() => formatHeading(3)} fontWeight="bold">Heading 3</MenuItem>
            <MenuItem onClick={() => formatHeading(4)} fontWeight="semibold">Heading 4</MenuItem>
            <MenuItem onClick={() => formatHeading(5)} fontSize="sm" fontWeight="semibold">Heading 5</MenuItem>
            <MenuItem onClick={() => formatHeading(6)} fontSize="xs" fontWeight="semibold">Heading 6</MenuItem>
          </MenuList>
        </Menu>
        
        <Divider orientation="vertical" h="20px" mx="2" />
        
        {/* Text formatting */}
        <ButtonGroup size="sm" variant="ghost" isAttached>
          <Tooltip label="Bold (Ctrl+B)" openDelay={500}>
            <IconButton
              icon={<FaBold size="14px" />}
              aria-label="Bold"
              onClick={() => formatText('bold')}
              color={iconColor}
            />
          </Tooltip>
          
          <Tooltip label="Italic (Ctrl+I)" openDelay={500}>
            <IconButton
              icon={<FaItalic size="14px" />}
              aria-label="Italic"
              onClick={() => formatText('italic')}
              color={iconColor}
            />
          </Tooltip>
          
          <Tooltip label="Strikethrough" openDelay={500}>
            <IconButton
              icon={<FaStrikethrough size="14px" />}
              aria-label="Strikethrough"
              onClick={() => formatText('strikethrough')}
              color={iconColor}
            />
          </Tooltip>
        </ButtonGroup>
        
        <Divider orientation="vertical" h="20px" mx="2" />
        
        {/* Links and media */}
        <ButtonGroup size="sm" variant="ghost" isAttached>
          <Popover placement="bottom" closeOnBlur={false}>
            <PopoverTrigger>
              <Tooltip label="Insert Link (Ctrl+K)" openDelay={500}>
                <IconButton
                  icon={<LinkIcon boxSize="14px" />}
                  aria-label="Insert Link"
                  color={iconColor}
                />
              </Tooltip>
            </PopoverTrigger>
            <PopoverContent width="300px">
              <PopoverArrow />
              <PopoverCloseButton />
              <PopoverHeader fontWeight="semibold">Insert Link</PopoverHeader>
              <PopoverBody>
                <Box>
                  <InputGroup size="sm" mb="3">
                    <InputLeftAddon>URL</InputLeftAddon>
                    <Input 
                      value={linkUrl} 
                      onChange={(e) => setLinkUrl(e.target.value)}
                      placeholder="https://example.com"
                    />
                  </InputGroup>
                  <Button 
                    size="sm" 
                    colorScheme="blue" 
                    onClick={insertLink} 
                    width="full"
                    leftIcon={<CheckIcon />}
                  >
                    Insert Link
                  </Button>
                </Box>
              </PopoverBody>
            </PopoverContent>
          </Popover>
          
          <Popover placement="bottom" closeOnBlur={false}>
            <PopoverTrigger>
              <Tooltip label="Insert Image" openDelay={500}>
                <IconButton
                  icon={<FaImage size="14px" />}
                  aria-label="Insert Image"
                  color={iconColor}
                />
              </Tooltip>
            </PopoverTrigger>
            <PopoverContent width="300px">
              <PopoverArrow />
              <PopoverCloseButton />
              <PopoverHeader fontWeight="semibold">Insert Image</PopoverHeader>
              <PopoverBody>
                <Box>
                  <InputGroup size="sm" mb="2">
                    <InputLeftAddon>URL</InputLeftAddon>
                    <Input 
                      value={imageUrl} 
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="https://example.com/image.jpg"
                    />
                  </InputGroup>
                  <InputGroup size="sm" mb="3">
                    <InputLeftAddon>Alt</InputLeftAddon>
                    <Input 
                      value={imageAlt} 
                      onChange={(e) => setImageAlt(e.target.value)}
                      placeholder="Image description"
                    />
                  </InputGroup>
                  <Button 
                    size="sm" 
                    colorScheme="blue" 
                    onClick={insertImage} 
                    width="full"
                    leftIcon={<CheckIcon />}
                  >
                    Insert Image
                  </Button>
                </Box>
              </PopoverBody>
            </PopoverContent>
          </Popover>
        </ButtonGroup>
        
        <Divider orientation="vertical" h="20px" mx="2" />
        
        {/* Code */}
        <ButtonGroup size="sm" variant="ghost" isAttached>
          <Tooltip label="Inline Code" openDelay={500}>
            <IconButton
              icon={<FaCode size="14px" />}
              aria-label="Inline Code"
              onClick={() => formatText('code-inline')}
              color={iconColor}
            />
          </Tooltip>
          
          <Popover placement="bottom" closeOnBlur={false}>
            <PopoverTrigger>
              <Tooltip label="Code Block" openDelay={500}>
                <IconButton
                  icon={<BiCodeBlock size="16px" />}
                  aria-label="Code Block"
                  color={iconColor}
                />
              </Tooltip>
            </PopoverTrigger>
            <PopoverContent width="300px">
              <PopoverArrow />
              <PopoverCloseButton />
              <PopoverHeader fontWeight="semibold">Insert Code Block</PopoverHeader>
              <PopoverBody>
                <Box>
                  <InputGroup size="sm" mb="3">
                    <InputLeftAddon>Language</InputLeftAddon>
                    <Input 
                      value={codeLanguage} 
                      onChange={(e) => setCodeLanguage(e.target.value)}
                      placeholder="javascript"
                    />
                  </InputGroup>
                  <Button 
                    size="sm" 
                    colorScheme="blue" 
                    onClick={insertCodeBlock} 
                    width="full"
                    leftIcon={<CheckIcon />}
                  >
                    Insert Code Block
                  </Button>
                </Box>
              </PopoverBody>
            </PopoverContent>
          </Popover>
        </ButtonGroup>
        
        <Divider orientation="vertical" h="20px" mx="2" />
        
        {/* Lists */}
        <ButtonGroup size="sm" variant="ghost" isAttached>
          <Tooltip label="Unordered List" openDelay={500}>
            <IconButton
              icon={<FaListUl size="14px" />}
              aria-label="Unordered List"
              onClick={() => formatText('unordered-list')}
              color={iconColor}
            />
          </Tooltip>
          
          <Tooltip label="Ordered List" openDelay={500}>
            <IconButton
              icon={<FaListOl size="14px" />}
              aria-label="Ordered List"
              onClick={() => formatText('ordered-list')}
              color={iconColor}
            />
          </Tooltip>
          
          <Tooltip label="Task List" openDelay={500}>
            <IconButton
              icon={<FaTasks size="14px" />}
              aria-label="Task List"
              onClick={() => formatText('task-list')}
              color={iconColor}
            />
          </Tooltip>
        </ButtonGroup>
        
        <Divider orientation="vertical" h="20px" mx="2" />
        
        {/* Other formatting options */}
        <ButtonGroup size="sm" variant="ghost" isAttached>
          <Tooltip label="Blockquote" openDelay={500}>
            <IconButton
              icon={<FaQuoteRight size="14px" />}
              aria-label="Blockquote"
              onClick={() => formatText('blockquote')}
              color={iconColor}
            />
          </Tooltip>
          
          <Tooltip label="Horizontal Rule" openDelay={500}>
            <IconButton
              icon={<TbSeparatorHorizontal size="16px" />}
              aria-label="Horizontal Rule"
              onClick={() => formatText('horizontal-rule')}
              color={iconColor}
            />
          </Tooltip>
          
          <Tooltip label="Insert Table" openDelay={500}>
            <IconButton
              icon={<FaTable size="14px" />}
              aria-label="Insert Table"
              onClick={() => formatText('table')}
              color={iconColor}
            />
          </Tooltip>
        </ButtonGroup>
      </Flex>
      
      {/* View controls on the right */}
      <Flex align="center" ml="auto">
        <ButtonGroup size="sm" variant="ghost" isAttached>
          <Tooltip label={showLineNumbers ? "Hide line numbers" : "Show line numbers"} openDelay={500}>
            <IconButton
              icon={showLineNumbers ? <FaRegFileCode size="14px" /> : <FaRegFile size="14px" />}
              aria-label={showLineNumbers ? "Hide line numbers" : "Show line numbers"}
              onClick={toggleLineNumbers}
              color={iconColor}
              bg={showLineNumbers ? activeBg : undefined}
              _hover={{ bg: showLineNumbers ? activeBg : undefined }}
            />
          </Tooltip>
          
          <Tooltip label={showInvisibles ? "Hide invisible characters" : "Show invisible characters"} openDelay={500}>
            <IconButton
              icon={<TbTextWrap size="16px" />}
              aria-label={showInvisibles ? "Hide invisible characters" : "Show invisible characters"}
              onClick={toggleInvisibles}
              color={iconColor}
              bg={showInvisibles ? activeBg : undefined}
              _hover={{ bg: showInvisibles ? activeBg : undefined }}
            />
          </Tooltip>
          
          <Tooltip label={showOthersCursors ? "Hide other users' cursors" : "Show other users' cursors"} openDelay={500}>
            <IconButton
              icon={showOthersCursors ? <FaUserFriends size="14px" /> : <FaUserSlash size="14px" />}
              aria-label={showOthersCursors ? "Hide other users' cursors" : "Show other users' cursors"}
              onClick={toggleOthersCursors}
              color={iconColor}
              bg={showOthersCursors ? activeBg : undefined}
              _hover={{ bg: showOthersCursors ? activeBg : undefined }}
            />
          </Tooltip>
        </ButtonGroup>
        
        {/* Connection status */}
        {connected !== undefined && (
          <Badge 
            ml="2" 
            colorScheme={connected ? "green" : "orange"}
            variant="subtle"
            display={{ base: 'none', sm: 'flex' }}
            alignItems="center"
          >
            <Box
              w="6px"
              h="6px"
              borderRadius="full"
              bg={connected ? 'green.500' : 'orange.500'}
              mr="1"
              animation={connected ? undefined : "0.8s blink infinite"}
            />
            <Text fontSize="xs">
              {connected ? 'Connected' : 'Reconnecting...'}
            </Text>
          </Badge>
        )}
      </Flex>
    </Flex>
  );
};

export default EditorToolbar;