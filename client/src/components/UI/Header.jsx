import { useRef } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Flex,
  Button,
  HStack,
  Text,
  IconButton,
  Tooltip,
  useDisclosure,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverBody,
  FormControl,
  FormLabel,
  Input,
  useToast
} from '@chakra-ui/react';
import { FaUserCircle, FaPlus } from 'react-icons/fa';
import { useDocuments } from '../../context/DocumentContext';
import ThemeToggle from './ThemeToggle';
import Logo from './Logo';

const Header = () => {
  const toast = useToast();
  const { user, updateUsername, createDocument } = useDocuments();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const usernameRef = useRef(null);
  
  // Handle creation of a new document
  const handleCreateDocument = async () => {
    try {
      await createDocument('Untitled Document');
      toast({
        title: 'Document created',
        description: 'New document has been created',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create document',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };
  
  // Update the username
  const handleUsernameUpdate = () => {
    const newUsername = usernameRef.current?.value;
    
    if (newUsername && newUsername.trim() !== '') {
      updateUsername(newUsername);
      onClose();
      
      toast({
        title: 'Username updated',
        description: `Your username is now "${newUsername}"`,
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    }
  };

  return (
    <Box 
      as="header" 
      bg="white" 
      _dark={{ bg: "gray.800" }} 
      borderBottom="1px solid" 
      borderColor="gray.200"
      _dark={{ borderColor: "gray.700" }}
      px={4}
      py={2}
      h="64px"
    >
      <Flex justify="space-between" align="center" h="100%">
        {/* Logo and title */}
        <HStack spacing={2}>
          <RouterLink to="/">
            <Logo height="32px" />
          </RouterLink>
          <Text 
            fontWeight="medium" 
            fontSize="lg" 
            color="gray.700" 
            _dark={{ color: "gray.200" }}
            display={{ base: 'none', md: 'block' }}
          >
            Collaborative Markdown Editor
          </Text>
        </HStack>
        
        {/* Actions */}
        <HStack spacing={4}>
          <Tooltip label="Create new document">
            <Button
              leftIcon={<FaPlus />}
              colorScheme="blue"
              size="sm"
              onClick={handleCreateDocument}
            >
              New Document
            </Button>
          </Tooltip>
          
          <ThemeToggle />
          
          {/* User menu */}
          <Popover
            isOpen={isOpen}
            onOpen={onOpen}
            onClose={onClose}
            placement="bottom-end"
          >
            <PopoverTrigger>
              <IconButton
                aria-label="User Settings"
                icon={<FaUserCircle />}
                variant="ghost"
                fontSize="24px"
                color="gray.600"
                _dark={{ color: "gray.300" }}
              />
            </PopoverTrigger>
            <PopoverContent width="250px">
              <PopoverArrow />
              <PopoverBody p={4}>
                <Text fontWeight="medium" mb={3}>
                  User Settings
                </Text>
                
                <FormControl mb={3}>
                  <FormLabel fontSize="sm">Username</FormLabel>
                  <Input
                    ref={usernameRef}
                    defaultValue={user?.name || ''}
                    placeholder="Enter your username"
                    size="sm"
                  />
                </FormControl>
                
                <Button
                  size="sm"
                  colorScheme="blue"
                  width="full"
                  onClick={handleUsernameUpdate}
                >
                  Save
                </Button>
              </PopoverBody>
            </PopoverContent>
          </Popover>
        </HStack>
      </Flex>
    </Box>
  );
};

export default Header;