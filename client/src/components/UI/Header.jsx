import React, { useState, useRef, useEffect } from 'react';
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
  HStack, 
  Badge, 
  Input, 
  InputGroup,
  InputRightElement,
  Divider,
  useDisclosure,
  Kbd,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  VStack,
  Avatar,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverArrow,
  PopoverCloseButton,
} from '@chakra-ui/react';
import { 
  HamburgerIcon, 
  ViewIcon, 
  ChevronDownIcon, 
  EditIcon, 
  SearchIcon, 
  CloseIcon,
  CheckIcon,
  InfoIcon,
  SettingsIcon,
  ExternalLinkIcon
} from '@chakra-ui/icons';
import { 
  FaUserFriends, 
  FaChartBar, 
  FaHistory, 
  FaRegUser,
  FaKeyboard, 
  FaCheck, 
  FaLink,
  FaGithub,
  FaCog,
  FaRegQuestionCircle,
  FaEye,
  FaEyeSlash,
  FaRegCopy,
  FaPlus,
  FaBell
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useDocument } from '../../context/DocumentContext';
import ThemeToggle from './ThemeToggle';
import UserPresence from './UserPresence';
import Logo from './Logo';
import { motion } from 'framer-motion';

/**
 * Header Component - Main application header with controls and user interface
 */
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
  // Color mode values
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');
  const mutedColor = useColorModeValue('gray.500', 'gray.400');
  const accentColor = useColorModeValue('blue.500', 'blue.400');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');
  const activeBg = useColorModeValue('blue.50', 'blue.900');
  const ghostBtnHover = useColorModeValue('gray.100', 'gray.700');
  
  // Document context
  const { 
    currentDoc, 
    updateDocumentName, 
    createDocument,
    connectionStatus,
    text,
    username,
    updateUsername
  } = useDocument();
  
  // Local state
  const [isEditing, setIsEditing] = useState(false);
  const [newDocName, setNewDocName] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const navigate = useNavigate();
  const inputRef = useRef();
  const [newUsername, setNewUsername] = useState(username);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  
  // Calculate word and character count
  useEffect(() => {
    if (text) {
      setCharCount(text.length);
      setWordCount(text.split(/\s+/).filter(word => word.length > 0).length);
    } else {
      setCharCount(0);
      setWordCount(0);
    }
  }, [text]);
  
  // Shortcuts drawer state
  const { 
    isOpen: isShortcutsOpen, 
    onOpen: onShortcutsOpen, 
    onClose: onShortcutsClose 
  } = useDisclosure();

  // Update document name when current document changes
  useEffect(() => {
    if (currentDoc) {
      setNewDocName(currentDoc.name);
    }
  }, [currentDoc]);

  // Handle document name update
  const handleDocNameChange = () => {
    if (newDocName && newDocName !== currentDoc?.name) {
      updateDocumentName(currentDoc.id, newDocName);
    }
    setIsEditing(false);
  };

  // Create new document
  const handleCreateDocument = () => {
    createDocument('New Document').then(doc => {
      if (doc) {
        navigate(`/documents/${doc.id}`);
      }
    });
  };

  // Copy document link to clipboard
  const copyDocumentLink = () => {
    const url = `${window.location.origin}/documents/${currentDoc?.id}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Update username
  const handleUsernameChange = () => {
    if (newUsername && newUsername !== username) {
      updateUsername(newUsername);
    }
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
      zIndex="30"
      boxShadow="sm"
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
            _hover={{ bg: ghostBtnHover }}
          />
        </Tooltip>
        
        {/* Logo */}
        <Box mr={{ base: "2", md: "4" }} display="flex" alignItems="center">
          <Logo height="28px" />
          <Text 
            display={{ base: "none", md: "block" }} 
            fontSize="lg" 
            fontWeight="bold" 
            color={textColor} 
            ml="2"
            letterSpacing="tight"
          >
            CollabMD
          </Text>
        </Box>
        
        {/* Document title or new document button */}
        {currentDoc ? (
          <Flex align="center">
            {isEditing ? (
              <HStack>
                <InputGroup size="sm" width="200px">
                  <Input
                    value={newDocName}
                    onChange={(e) => setNewDocName(e.target.value)}
                    pr="4.5rem"
                    autoFocus
                    ref={inputRef}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleDocNameChange();
                      if (e.key === 'Escape') setIsEditing(false);
                    }}
                    borderColor={borderColor}
                  />
                  <InputRightElement width="4.5rem">
                    <HStack spacing="1">
                      <IconButton
                        icon={<CheckIcon />}
                        size="xs"
                        onClick={handleDocNameChange}
                        aria-label="Save"
                        colorScheme="green"
                      />
                      <IconButton
                        icon={<CloseIcon />}
                        size="xs"
                        onClick={() => setIsEditing(false)}
                        aria-label="Cancel"
                        variant="ghost"
                      />
                    </HStack>
                  </InputRightElement>
                </InputGroup>
              </HStack>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <HStack spacing="2">
                  <Text 
                    fontSize="md" 
                    fontWeight="medium" 
                    color={textColor}
                    maxW={{ base: "120px", sm: "200px", md: "300px" }}
                    overflow="hidden"
                    textOverflow="ellipsis"
                    whiteSpace="nowrap"
                  >
                    {currentDoc.name}
                  </Text>
                  
                  <HStack spacing="1">
                    <Tooltip label="Rename document">
                      <IconButton
                        icon={<EditIcon />}
                        size="xs"
                        variant="ghost"
                        onClick={() => {
                          setNewDocName(currentDoc.name);
                          setIsEditing(true);
                          setTimeout(() => inputRef.current?.focus(), 0);
                        }}
                        aria-label="Edit"
                        _hover={{ bg: ghostBtnHover }}
                      />
                    </Tooltip>
                    
                    <Tooltip label={copiedLink ? "Copied!" : "Copy link to document"}>
                      <IconButton
                        icon={copiedLink ? <CheckIcon /> : <FaLink />}
                        size="xs"
                        variant="ghost"
                        color={copiedLink ? "green.500" : undefined}
                        onClick={copyDocumentLink}
                        aria-label="Copy link"
                        _hover={{ bg: ghostBtnHover }}
                      />
                    </Tooltip>
                    
                    <Badge
                      colorScheme={connectionStatus === 'connected' ? 'green' : 'orange'}
                      variant="subtle"
                      px="2"
                      py="1"
                      borderRadius="full"
                      display="flex"
                      alignItems="center"
                      fontSize="xs"
                    >
                      <Box
                        w="6px"
                        h="6px"
                        borderRadius="full"
                        bg={connectionStatus === 'connected' ? 'green.500' : 'orange.500'}
                        mr="1.5"
                        animation={connectionStatus === 'connected' ? 'none' : '1s pulse infinite ease-in-out'}
                      />
                      <Text fontSize="xs" textTransform="capitalize">{connectionStatus}</Text>
                    </Badge>
                  </HStack>
                </HStack>
              </motion.div>
            )}
          </Flex>
        ) : (
          <Button
            leftIcon={<FaPlus />}
            size="sm"
            colorScheme="blue"
            onClick={handleCreateDocument}
            boxShadow="sm"
          >
            New Document
          </Button>
        )}
      </Flex>
      
      {/* Right section */}
      <Flex align="center">
        {/* Document stats */}
        {currentDoc && (
          <HStack spacing="3" mr="4" display={{ base: "none", md: "flex" }}>
            <HStack spacing="1">
              <Text fontSize="xs" color={mutedColor}>Words: </Text>
              <Text fontSize="xs" fontWeight="medium">{wordCount}</Text>
            </HStack>
            
            <HStack spacing="1">
              <Text fontSize="xs" color={mutedColor}>Chars: </Text>
              <Text fontSize="xs" fontWeight="medium">{charCount}</Text>
            </HStack>
          </HStack>
        )}
        
        {/* View controls */}
        <Menu closeOnSelect={false}>
          <Tooltip label="View options">
            <MenuButton
              as={Button}
              variant="ghost"
              size="sm"
              rightIcon={<ChevronDownIcon />}
              leftIcon={<ViewIcon />}
              mr="2"
              _hover={{ bg: hoverBg }}
            >
              <Text display={{ base: "none", md: "block" }}>View</Text>
            </MenuButton>
          </Tooltip>
          <MenuList zIndex="1000">
            <MenuItem 
              icon={isPreviewVisible ? <FaEye color={accentColor} /> : <FaEyeSlash />} 
              onClick={togglePreview}
              bg={isPreviewVisible ? activeBg : undefined}
            >
              <Flex justify="space-between" width="full" align="center">
                <Text>Preview Panel</Text>
                <Kbd size="xs">Ctrl+P</Kbd>
              </Flex>
            </MenuItem>
            
            <MenuItem 
              icon={isEditHistoryVisible ? <FaHistory color={accentColor} /> : <FaHistory />}
              onClick={toggleEditHistory}
              bg={isEditHistoryVisible ? activeBg : undefined}
            >
              <Flex justify="space-between" width="full" align="center">
                <Text>Edit History</Text>
                <Kbd size="xs">Ctrl+H</Kbd>
              </Flex>
            </MenuItem>
            
            <MenuItem 
              icon={isCollaborationMapVisible ? <FaUserFriends color={accentColor} /> : <FaUserFriends />}
              onClick={toggleCollaborationMap}
              bg={isCollaborationMapVisible ? activeBg : undefined}
            >
              <Flex justify="space-between" width="full">
                <Text>Collaboration Map</Text>
              </Flex>
            </MenuItem>
            
            <MenuItem 
              icon={isAnalyticsVisible ? <FaChartBar color={accentColor} /> : <FaChartBar />}
              onClick={toggleAnalytics}
              bg={isAnalyticsVisible ? activeBg : undefined}
            >
              <Flex justify="space-between" width="full">
                <Text>Analytics Panel</Text>
              </Flex>
            </MenuItem>
            
            <Divider my="2" />
            
            <MenuItem icon={<FaKeyboard />} onClick={onShortcutsOpen}>
              <Text>Keyboard Shortcuts</Text>
            </MenuItem>
          </MenuList>
        </Menu>
        
        {/* Visualization toggles for larger screens */}
        <HStack spacing="1" mr="2" display={{ base: "none", md: "flex" }}>
          <Tooltip label="Edit History">
            <IconButton
              icon={<FaHistory />}
              aria-label="Edit History"
              size="sm"
              variant={isEditHistoryVisible ? 'solid' : 'ghost'}
              colorScheme={isEditHistoryVisible ? 'blue' : 'gray'}
              onClick={toggleEditHistory}
              _hover={{ bg: ghostBtnHover }}
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
              _hover={{ bg: ghostBtnHover }}
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
              _hover={{ bg: ghostBtnHover }}
            />
          </Tooltip>
        </HStack>
        
        {/* Preview toggle */}
        <Tooltip label={isPreviewVisible ? "Hide Preview" : "Show Preview"}>
          <IconButton
            icon={isPreviewVisible ? <FaEye /> : <FaEyeSlash />}
            aria-label="Toggle Preview"
            size="sm"
            variant={isPreviewVisible ? 'solid' : 'ghost'}
            colorScheme={isPreviewVisible ? 'blue' : 'gray'}
            onClick={togglePreview}
            mr="2"
            _hover={{ bg: ghostBtnHover }}
          />
        </Tooltip>
        
        {/* Search button - placeholder for future search functionality */}
        <Tooltip label="Search in document">
          <IconButton
            icon={<SearchIcon />}
            aria-label="Search"
            size="sm"
            variant="ghost"
            mr="2"
            onClick={() => {
              // To be implemented
              console.log('Search functionality to be implemented');
            }}
            _hover={{ bg: ghostBtnHover }}
          />
        </Tooltip>
        
        {/* Theme toggle */}
        <Box mr="3">
          <ThemeToggle />
        </Box>
        
        {/* User menu */}
        <Menu>
          <Tooltip label="User settings">
            <MenuButton
              as={IconButton}
              aria-label="User settings"
              icon={<Avatar size="sm" name={username || "Guest"} bg="blue.500" />}
              variant="ghost"
              mr={{ base: "0", md: "2" }}
              _hover={{ bg: 'transparent' }}
            />
          </Tooltip>
          <MenuList zIndex={1000}>
            <MenuItem closeOnSelect={false}>
              <InputGroup size="sm">
                <Input 
                  placeholder="Change username"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleUsernameChange();
                  }}
                />
                <InputRightElement>
                  <IconButton
                    icon={<CheckIcon />}
                    size="xs"
                    onClick={handleUsernameChange}
                    aria-label="Save username"
                    colorScheme="blue"
                    variant="ghost"
                  />
                </InputRightElement>
              </InputGroup>
            </MenuItem>
            
            <Divider my="1" />
            
            <MenuItem icon={<FaRegCopy />}>
              Export Document
            </MenuItem>
            
            <MenuItem icon={<FaGithub />}>
              View on GitHub
            </MenuItem>
            
            <MenuItem icon={<FaRegQuestionCircle />} onClick={onShortcutsOpen}>
              Help & Shortcuts
            </MenuItem>
            
            <MenuItem icon={<FaCog />}>
              Settings
            </MenuItem>
          </MenuList>
        </Menu>
        
        {/* User presence component */}
        <Box mr="3" display={{ base: "none", md: "block" }}>
          <UserPresence />
        </Box>
      </Flex>
      
      {/* Keyboard shortcuts drawer */}
      <Drawer
        isOpen={isShortcutsOpen}
        placement="right"
        onClose={onShortcutsClose}
        size="md"
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px">
            Keyboard Shortcuts
          </DrawerHeader>
          <DrawerBody>
            <VStack align="stretch" spacing="6" mt="4">
              <Box>
                <Text fontWeight="bold" mb="3" color={accentColor}>Editor Shortcuts</Text>
                <HStack justify="space-between" mb="2">
                  <Text>Bold Text</Text>
                  <HStack><Kbd>Ctrl</Kbd> + <Kbd>B</Kbd></HStack>
                </HStack>
                <HStack justify="space-between" mb="2">
                  <Text>Italic Text</Text>
                  <HStack><Kbd>Ctrl</Kbd> + <Kbd>I</Kbd></HStack>
                </HStack>
                <HStack justify="space-between" mb="2">
                  <Text>Insert Link</Text>
                  <HStack><Kbd>Ctrl</Kbd> + <Kbd>K</Kbd></HStack>
                </HStack>
                <HStack justify="space-between" mb="2">
                  <Text>Undo</Text>
                  <HStack><Kbd>Ctrl</Kbd> + <Kbd>Z</Kbd></HStack>
                </HStack>
                <HStack justify="space-between" mb="2">
                  <Text>Redo</Text>
                  <HStack><Kbd>Ctrl</Kbd> + <Kbd>Shift</Kbd> + <Kbd>Z</Kbd></HStack>
                </HStack>
              </Box>
              
              <Divider />
              
              <Box>
                <Text fontWeight="bold" mb="3" color={accentColor}>View Shortcuts</Text>
                <HStack justify="space-between" mb="2">
                  <Text>Toggle Preview</Text>
                  <HStack><Kbd>Ctrl</Kbd> + <Kbd>P</Kbd></HStack>
                </HStack>
                <HStack justify="space-between" mb="2">
                  <Text>Toggle Sidebar</Text>
                  <HStack><Kbd>Ctrl</Kbd> + <Kbd>\</Kbd></HStack>
                </HStack>
                <HStack justify="space-between" mb="2">
                  <Text>Toggle History</Text>
                  <HStack><Kbd>Ctrl</Kbd> + <Kbd>H</Kbd></HStack>
                </HStack>
              </Box>
              
              <Divider />
              
              <Box>
                <Text fontWeight="bold" mb="3" color={accentColor}>Document Shortcuts</Text>
                <HStack justify="space-between" mb="2">
                  <Text>New Document</Text>
                  <HStack><Kbd>Ctrl</Kbd> + <Kbd>N</Kbd></HStack>
                </HStack>
                <HStack justify="space-between" mb="2">
                  <Text>Rename Document</Text>
                  <HStack><Kbd>F2</Kbd></HStack>
                </HStack>
                <HStack justify="space-between" mb="2">
                  <Text>Copy Document Link</Text>
                  <HStack><Kbd>Ctrl</Kbd> + <Kbd>Shift</Kbd> + <Kbd>C</Kbd></HStack>
                </HStack>
              </Box>
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Flex>
  );
};

export default Header;