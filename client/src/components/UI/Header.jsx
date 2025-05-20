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

export default Header;