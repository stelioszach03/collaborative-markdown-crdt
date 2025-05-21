import React, { useEffect, useState } from 'react';
import {
  Box,
  Flex,
  HStack,
  Avatar,
  Tooltip,
  Text,
  Badge,
  useColorModeValue,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverArrow,
  PopoverCloseButton,
  Divider,
  VStack,
  Icon,
  Button,
  useToast
} from '@chakra-ui/react';
import { 
  FaUserFriends, 
  FaLink, 
  FaRegClock,
  FaCheck,
  FaUserPlus,
  FaInbox
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useDocument } from '../../context/DocumentContext';
import { format, formatDistanceToNow } from 'date-fns';

/**
 * UserPresence Component - Shows users who are currently active in the document
 * Displays avatars and a dropdown with user details
 */
const UserPresence = () => {
  const { awareness, userId, username, activeUsers, currentDoc } = useDocument();
  const [userList, setUserList] = useState([]);
  const [copySuccess, setCopySuccess] = useState(false);
  const toast = useToast();
  
  // Colors
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');
  const cardBg = useColorModeValue('gray.50', 'gray.700');
  
  // Update user list when active users change
  useEffect(() => {
    if (!activeUsers) return;
    
    const users = Array.from(activeUsers.entries()).map(([id, user]) => ({
      id,
      username: user.username,
      color: user.color || '#cccccc',
      isCurrentUser: id === userId,
      lastActive: user.lastUpdate || Date.now(),
      cursor: user.cursor,
      selection: user.selection
    }));
    
    // Sort users - current user first, then by username
    users.sort((a, b) => {
      if (a.isCurrentUser) return -1;
      if (b.isCurrentUser) return 1;
      return a.username.localeCompare(b.username);
    });
    
    setUserList(users);
  }, [activeUsers, userId]);

  // Copy invitation link
  const copyInviteLink = () => {
    if (!currentDoc) return;
    
    const url = `${window.location.origin}/documents/${currentDoc.id}`;
    navigator.clipboard.writeText(url);
    setCopySuccess(true);
    
    toast({
      title: "Link Copied!",
      description: "Share this link to invite collaborators",
      status: "success",
      duration: 3000,
      isClosable: true,
      position: "bottom-right"
    });
    
    setTimeout(() => {
      setCopySuccess(false);
    }, 2000);
  };

  // Get time since last activity
  const getLastActive = (timestamp) => {
    const now = Date.now();
    const secondsAgo = Math.floor((now - timestamp) / 1000);
    
    if (secondsAgo < 60) return 'Just now';
    if (secondsAgo < 3600) return `${Math.floor(secondsAgo / 60)}m ago`;
    
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <Popover placement="bottom-end" closeOnBlur={true} gutter={8}>
      <PopoverTrigger>
        <Button
          size="sm"
          leftIcon={<FaUserFriends />}
          colorScheme="blue"
          variant="ghost"
          px={2}
          _hover={{ bg: hoverBg }}
        >
          <HStack spacing={1}>
            <Text>{userList.length || 1}</Text>
            
            {/* Avatar stack - show first 3 users */}
            {userList.length > 0 && (
              <HStack ml={2} spacing="-2" display={{ base: 'none', sm: 'flex' }}>
                {userList.slice(0, 3).map((user, index) => (
                  <Avatar
                    key={user.id}
                    name={user.username}
                    size="2xs"
                    bg={user.color}
                    color="white"
                    border="2px solid"
                    borderColor={bgColor}
                    zIndex={10 - index}
                  />
                ))}
                
                {userList.length > 3 && (
                  <Avatar
                    size="2xs"
                    bg="gray.400"
                    color="white"
                    border="2px solid"
                    borderColor={bgColor}
                    zIndex={7}
                  >
                    <Text fontSize="xs">+{userList.length - 3}</Text>
                  </Avatar>
                )}
              </HStack>
            )}
          </HStack>
        </Button>
      </PopoverTrigger>
      
      <PopoverContent width="320px" shadow="lg">
        <PopoverArrow />
        <PopoverCloseButton />
        
        <PopoverHeader as={Flex} justifyContent="space-between" alignItems="center" fontWeight="semibold">
          <HStack>
            <FaUserFriends />
            <Text>Active Users</Text>
          </HStack>
          <Badge colorScheme="blue">{userList.length || 1}</Badge>
        </PopoverHeader>
        
        <PopoverBody p={0}>
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            <VStack align="stretch" spacing={0} maxH="300px" overflowY="auto">
              {userList.map(user => (
                <motion.div key={user.id} variants={itemVariants}>
                  <Flex
                    p={3}
                    borderBottomWidth="1px"
                    borderColor={borderColor}
                    align="center"
                    bg={user.isCurrentUser ? cardBg : undefined}
                    _hover={{ bg: hoverBg }}
                  >
                    <Avatar 
                      size="sm" 
                      name={user.username} 
                      bg={user.color}
                      color="white"
                      mr={3}
                    >
                      {user.isCurrentUser && (
                        <Badge
                          position="absolute"
                          bottom="-1px"
                          right="-1px"
                          boxSize="10px"
                          borderRadius="full"
                          bg="green.500"
                          border="2px solid"
                          borderColor={bgColor}
                        />
                      )}
                    </Avatar>
                    
                    <Box flex={1}>
                      <Text fontWeight={user.isCurrentUser ? "semibold" : "normal"}>
                        {user.username}
                        {user.isCurrentUser && (
                          <Badge ml={2} colorScheme="green" variant="subtle">
                            you
                          </Badge>
                        )}
                      </Text>
                      
                      <Flex alignItems="center">
                        <Icon as={FaRegClock} boxSize={3} color="gray.500" mr={1} />
                        <Text fontSize="xs" color="gray.500">
                          {getLastActive(user.lastActive)}
                        </Text>
                      </Flex>
                    </Box>
                    
                    <Badge 
                      colorScheme="green" 
                      variant="subtle"
                      px={2}
                      py={1}
                      borderRadius="full"
                    >
                      Active
                    </Badge>
                  </Flex>
                </motion.div>
              ))}
              
              {/* Empty state */}
              {userList.length === 0 && (
                <Box textAlign="center" p={4} color="gray.500">
                  <Text>You're the only one here.</Text>
                  <Text fontSize="sm" mt={2}>
                    Invite others to collaborate.
                  </Text>
                </Box>
              )}
            </VStack>
            
            {/* Invite section */}
            <Box p={3} borderTopWidth="1px" borderColor={borderColor}>
              <Button
                size="sm"
                width="full"
                leftIcon={copySuccess ? <FaCheck /> : <FaLink />}
                colorScheme={copySuccess ? "green" : "blue"}
                onClick={copyInviteLink}
                mb={2}
              >
                {copySuccess ? "Link Copied!" : "Copy Invite Link"}
              </Button>
              
              <Text fontSize="xs" color="gray.500" textAlign="center">
                Anyone with the link can access this document
              </Text>
            </Box>
          </motion.div>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
};

export default UserPresence;