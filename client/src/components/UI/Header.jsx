import React, { useState, useRef } from 'react';
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
  VStack
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
  SettingsIcon
} from '@chakra-ui/icons';
import { 
  FaUserFriends, 
  FaChartBar, 
  FaHistory, 
  FaRegUser,
  FaKeyboard, 
  FaCheck, 
  FaLink
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useDocument } from '../../context/DocumentContext';
import ThemeToggle from './ThemeToggle';
import UserPresence from './UserPresence';
import Logo from './Logo';

/**
 * Header Component - Main application header with controls and user interface
 * 
 * @param {Object} props - Component properties
 * @param {Function} props.toggleSidebar - Function to toggle sidebar visibility
 * @param {boolean} props.isSidebarOpen - Current sidebar state
 * @param {Function} props.togglePreview - Function to toggle preview panel
 * @param {boolean} props.isPreviewVisible - Current preview panel state
 * @param {Function} props.toggleEditHistory - Function to toggle edit history panel
 * @param {boolean} props.isEditHistoryVisible - Current edit history panel state
 * @param {Function} props.toggleCollaborationMap - Function to toggle collaboration map
 * @param {boolean} props.isCollaborationMapVisible - Current collaboration map state
 * @param {Function} props.toggleAnalytics - Function to toggle analytics panel
 * @param {boolean} props.isAnalyticsVisible - Current analytics panel state
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
  
  // Document context
  const { 
    currentDoc, 
    updateDocumentName, 
    createDocument,
    connectionStatus
  } = useDocument();
  
  // Local state
  const [isEditing, setIsEditing] = useState(false);
  const [newDocName, setNewDocName] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const navigate = useNavigate();
  const inputRef = useRef();
  
  // Shortcuts drawer state
  const { 
    isOpen: isShortcutsOpen, 
    onOpen: onShortcutsOpen, 
    onClose: onShortcutsClose 
  } = useDisclosure();

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
                    />
                  </Tooltip>
                  
                  <Badge
                    colorScheme={connectionStatus === 'connected' ? 'green' : 'orange'}
                    variant="subtle"
                    px="2"
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
            )}
          </Flex>
        ) : (
          <Button
            leftIcon={<EditIcon />}
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
              icon={isPreviewVisible ? <CheckIcon color={accentColor} /> : undefined} 
              onClick={togglePreview}
              bg={isPreviewVisible ? activeBg : undefined}
            >
              <Flex justify="space-between" width="full" align="center">
                <Text>Preview Panel</Text>
                <Kbd size="xs">Ctrl+P</Kbd>
              </Flex>
            </MenuItem>
            
            <MenuItem 
              icon={isEditHistoryVisible ? <CheckIcon color={accentColor} /> : undefined}
              onClick={toggleEditHistory}
              bg={isEditHistoryVisible ? activeBg : undefined}
            >
              <Flex justify="space-between" width="full" align="center">
                <Text>Edit History</Text>
                <Kbd size="xs">Ctrl+H</Kbd>
              </Flex>
            </MenuItem>
            
            <MenuItem 
              icon={isCollaborationMapVisible ? <CheckIcon color={accentColor} /> : undefined}
              onClick={toggleCollaborationMap}
              bg={isCollaborationMapVisible ? activeBg : undefined}
            >
              <Flex justify="space-between" width="full">
                <Text>Collaboration Map</Text>
              </Flex>
            </MenuItem>
            
            <MenuItem 
              icon={isAnalyticsVisible ? <CheckIcon color={accentColor} /> : undefined}
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
            />
          </Tooltip>
        </HStack>
        
        {/* Preview toggle */}
        <Tooltip label={isPreviewVisible ? "Hide Preview" : "Show Preview"}>
          <IconButton
            icon={<ViewIcon />}
            aria-label="Toggle Preview"
            size="sm"
            variant={isPreviewVisible ? 'solid' : 'ghost'}
            colorScheme={isPreviewVisible ? 'blue' : 'gray'}
            onClick={togglePreview}
            mr="2"
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
          />
        </Tooltip>
        
        {/* Theme toggle */}
        <Box mr="3">
          <ThemeToggle />
        </Box>
        
        {/* User presence component */}
        <Box mr="3">
          <UserPresence />
        </Box>
        
        {/* Settings button */}
        <Tooltip label="Settings">
          <IconButton
            icon={<SettingsIcon />}
            aria-label="Settings"
            size="sm"
            variant="ghost"
            mr={{ base: "0", md: "2" }}
          />
        </Tooltip>
        
        {/* Help button - visible on medium screens and up */}
        <Tooltip label="Help">
          <IconButton
            icon={<InfoIcon />}
            aria-label="Help"
            size="sm"
            variant="ghost"
            display={{ base: "none", md: "flex" }}
            onClick={onShortcutsOpen}
          />
        </Tooltip>
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
                  <HStack><Kbd>Ctrl</Kbd> + <Kbd>\\</Kbd></HStack>
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