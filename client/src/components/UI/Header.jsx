import React, { useState, useRef } from 'react';
import {
  Box, Flex, IconButton, Button, useColorModeValue, Menu, MenuButton,
  MenuList, MenuItem, Text, Tooltip, Avatar, AvatarBadge, HStack,
  Popover, PopoverTrigger, PopoverContent, PopoverHeader, PopoverBody,
  PopoverFooter, FormControl, FormLabel, Input, Badge, Heading,
  Drawer, DrawerBody, DrawerHeader, DrawerOverlay, DrawerContent,
  DrawerCloseButton, useDisclosure, Divider, Kbd, Icon, Spacer, ButtonGroup
} from '@chakra-ui/react';
import { HamburgerIcon, ViewIcon, SettingsIcon, ChevronDownIcon, EditIcon, 
         SearchIcon, InfoIcon, AddIcon, CloseIcon, ChevronRightIcon } from '@chakra-ui/icons';
import { FaUserFriends, FaChartBar, FaHistory, FaRegClock, FaRegUser,
         FaSignOutAlt, FaRegQuestionCircle, FaKeyboard, FaCheck } from 'react-icons/fa';
import { VscGraphLine } from 'react-icons/vsc';
import { BiBookContent, BiSolidFileExport, BiCodeAlt } from 'react-icons/bi';
import { MdOutlineContentCopy } from 'react-icons/md';
import ThemeToggle from './ThemeToggle';
import { useDocument } from '../../context/DocumentContext';
import { Link, useNavigate } from 'react-router-dom';
import Logo from './Logo';

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
  const buttonHoverBg = useColorModeValue('gray.100', 'gray.700');
  
  const { 
    currentDoc, 
    updateDocumentName, 
    username, 
    updateUsername,
    createDocument,
    activeUsers,
    connectionStatus,
    userId
  } = useDocument();
  
  const [isEditing, setIsEditing] = useState(false);
  const [newDocName, setNewDocName] = useState('');
  const [newUsername, setNewUsername] = useState(username);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { isOpen: isHelpOpen, onOpen: onHelpOpen, onClose: onHelpClose } = useDisclosure();
  const [copiedLink, setCopiedLink] = useState(false);
  const inputRef = useRef();
  const navigate = useNavigate();

  const handleDocNameChange = () => {
    if (newDocName && newDocName !== currentDoc.name) {
      updateDocumentName(currentDoc.id, newDocName);
    }
    setIsEditing(false);
  };

  const handleCreateDocument = () => {
    createDocument('New Document').then(doc => {
      if (doc) {
        navigate(`/documents/${doc.id}`);
      }
    });
  };

  const handleUsernameChange = () => {
    if (newUsername && newUsername !== username) {
      updateUsername(newUsername);
    }
    setIsUserMenuOpen(false);
  };

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
        <Box mr={{ base: "2", md: "8" }} display="flex" alignItems="center">
          <Logo height="32px" />
          <Text display={{ base: "none", md: "block" }} fontSize="lg" fontWeight="bold" color={textColor} ml="2">
            CollabMD
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
                  ref={inputRef}
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
                  icon={<FaCheck />}
                  size="sm"
                  onClick={handleDocNameChange}
                  aria-label="Save"
                  colorScheme="green"
                />
                <IconButton
                  icon={<CloseIcon />}
                  size="sm"
                  onClick={() => setIsEditing(false)}
                  aria-label="Cancel"
                  variant="ghost"
                />
              </HStack>
            ) : (
              <HStack>
                <Text fontSize="md" fontWeight="medium" color={textColor}>
                  {currentDoc.name}
                </Text>
                <Tooltip label="Rename document">
                  <IconButton
                    icon={<EditIcon />}
                    size="sm"
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
                    icon={copiedLink ? <FaCheck /> : <MdOutlineContentCopy />}
                    size="sm"
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
                  py="1"
                  borderRadius="full"
                  display="flex"
                  alignItems="center"
                >
                  <Box
                    w="8px"
                    h="8px"
                    borderRadius="full"
                    bg={connectionStatus === 'connected' ? 'green.500' : 'orange.500'}
                    mr="2"
                  />
                  <Text fontSize="xs" textTransform="capitalize">{connectionStatus}</Text>
                </Badge>
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
              _hover={{ bg: buttonHoverBg }}
            >
              <Text display={{ base: "none", md: "block" }}>View</Text>
            </MenuButton>
          </Tooltip>
          <MenuList zIndex="1000">
            <MenuItem onClick={togglePreview} icon={isPreviewVisible ? <FaCheck /> : undefined}>
              {isPreviewVisible ? 'Hide Preview' : 'Show Preview'}
            </MenuItem>
            <MenuItem onClick={toggleEditHistory} icon={isEditHistoryVisible ? <FaCheck /> : undefined}>
              {isEditHistoryVisible ? 'Hide Edit History' : 'Show Edit History'}
            </MenuItem>
            <MenuItem onClick={toggleCollaborationMap} icon={isCollaborationMapVisible ? <FaCheck /> : undefined}>
              {isCollaborationMapVisible ? 'Hide Collaboration Map' : 'Show Collaboration Map'}
            </MenuItem>
            <MenuItem onClick={toggleAnalytics} icon={isAnalyticsVisible ? <FaCheck /> : undefined}>
              {isAnalyticsVisible ? 'Hide Analytics' : 'Show Analytics'}
            </MenuItem>
            <Divider />
            <MenuItem icon={<FaKeyboard />} onClick={onHelpOpen}>
              Keyboard Shortcuts
            </MenuItem>
          </MenuList>
        </Menu>
        
        {/* Visualization toggles */}
        <ButtonGroup size="sm" isAttached variant="ghost" mr="3" display={{ base: "none", md: "flex" }}>
          <Tooltip label="Edit History">
            <IconButton
              icon={<FaHistory />}
              aria-label="Edit History"
              variant={isEditHistoryVisible ? 'solid' : 'ghost'}
              colorScheme={isEditHistoryVisible ? 'blue' : 'gray'}
              onClick={toggleEditHistory}
            />
          </Tooltip>
          
          <Tooltip label="Collaboration Map">
            <IconButton
              icon={<FaUserFriends />}
              aria-label="Collaboration Map"
              variant={isCollaborationMapVisible ? 'solid' : 'ghost'}
              colorScheme={isCollaborationMapVisible ? 'blue' : 'gray'}
              onClick={toggleCollaborationMap}
            />
          </Tooltip>
          
          <Tooltip label="Analytics">
            <IconButton
              icon={<FaChartBar />}
              aria-label="Analytics"
              variant={isAnalyticsVisible ? 'solid' : 'ghost'}
              colorScheme={isAnalyticsVisible ? 'blue' : 'gray'}
              onClick={toggleAnalytics}
            />
          </Tooltip>
        </ButtonGroup>
        
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
                _hover={{ bg: buttonHoverBg }}
              >
                {activeUsers.size || 1}
              </Button>
            </PopoverTrigger>
            <PopoverContent width="280px">
              <PopoverHeader fontWeight="bold" px="4" py="3">
                Active Users
              </PopoverHeader>
              <PopoverBody>
                <VStack align="stretch" spacing="3">
                  {/* Current user */}
                  <Flex align="center" p="2" bg={useColorModeValue('gray.50', 'gray.700')} borderRadius="md">
                    <Avatar size="sm" name={username} bg={activeUsers.get(userId)?.color || 'blue.500'}>
                      <AvatarBadge boxSize="1em" bg="green.500" />
                    </Avatar>
                    <Text ml="3" fontWeight="medium">
                      {username} <Badge ml="1" colorScheme="green">you</Badge>
                    </Text>
                  </Flex>
                  
                  {/* Other users */}
                  {Array.from(activeUsers.entries()).map(([id, user]) => (
                    id !== userId && (
                      <Flex key={id} align="center" p="2" bg={useColorModeValue('gray.50', 'gray.700')} borderRadius="md">
                        <Avatar size="sm" name={user.username} bg={user.color}>
                          <AvatarBadge boxSize="1em" bg="green.500" />
                        </Avatar>
                        <Text ml="3">
                          {user.username}
                        </Text>
                      </Flex>
                    )
                  ))}
                  
                  {activeUsers.size <= 1 && (
                    <Box textAlign="center" p="2" color="gray.500">
                      <Text>You're the only user here.</Text>
                      <Text fontSize="sm" mt="1">Share the document link to collaborate.</Text>
                    </Box>
                  )}
                </VStack>
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
              leftIcon={<Avatar size="xs" name={username} bg={activeUsers.get(userId)?.color || 'blue.500'} />}
              rightIcon={<ChevronDownIcon />}
              variant="ghost"
              _hover={{ bg: buttonHoverBg }}
            >
              <Text display={{ base: "none", md: "block" }}>{username}</Text>
            </Button>
          </PopoverTrigger>
          <PopoverContent width="280px">
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
                  placeholder="Enter your username"
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
        
        {/* Help button */}
        <Tooltip label="Help">
          <IconButton
            icon={<FaRegQuestionCircle />}
            aria-label="Help"
            size="sm"
            variant="ghost"
            onClick={onHelpOpen}
            ml="1"
          />
        </Tooltip>
      </Flex>
      
      {/* Keyboard shortcuts drawer */}
      <Drawer
        isOpen={isHelpOpen}
        placement="right"
        onClose={onHelpClose}
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
                <Heading size="sm" mb="3">Editor Shortcuts</Heading>
                <HStack justify="space-between" mb="2">
                  <Text>Bold Text</Text>
                  <HStack><Kbd>Ctrl</Kbd> + <Kbd>B</Kbd></HStack>
                </HStack>
                <HStack justify="space-between" mb="2">
                  <Text>Italic Text</Text>
                  <HStack><Kbd>Ctrl</Kbd> + <Kbd>I</Kbd></HStack>
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
                <Heading size="sm" mb="3">View Shortcuts</Heading>
                <HStack justify="space-between" mb="2">
                  <Text>Toggle Preview</Text>
                  <HStack><Kbd>Ctrl</Kbd> + <Kbd>P</Kbd></HStack>
                </HStack>
                <HStack justify="space-between" mb="2">
                  <Text>Toggle Sidebar</Text>
                  <HStack><Kbd>Ctrl</Kbd> + <Kbd>B</Kbd></HStack>
                </HStack>
              </Box>
              
              <Divider />
              
              <Box>
                <Heading size="sm" mb="3">Document Shortcuts</Heading>
                <HStack justify="space-between" mb="2">
                  <Text>Save Changes</Text>
                  <HStack><Kbd>Ctrl</Kbd> + <Kbd>S</Kbd></HStack>
                </HStack>
                <HStack justify="space-between" mb="2">
                  <Text>New Document</Text>
                  <HStack><Kbd>Ctrl</Kbd> + <Kbd>N</Kbd></HStack>
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