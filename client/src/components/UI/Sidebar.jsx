import React, { useState } from 'react';
import {
  Box,
  VStack,
  Text,
  IconButton,
  Button,
  useColorModeValue,
  Divider,
  HStack,
  Input,
  useToast,
  Flex,
  Menu,
  MenuButton,
  MenuList,
  MenuItem
} from '@chakra-ui/react';
import { 
  AddIcon, 
  CloseIcon, 
  SearchIcon, 
  ChevronRightIcon,
  DeleteIcon,
  EditIcon,
  SettingsIcon
} from '@chakra-ui/icons';
import { FaFileAlt } from 'react-icons/fa';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useDocument } from '../../context/DocumentContext';

const Sidebar = ({ onClose }) => {
  const { documents, createDocument, updateDocumentName, deleteDocument } = useDocument();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const hoverBgColor = useColorModeValue('gray.50', 'gray.700');
  const activeBgColor = useColorModeValue('blue.50', 'blue.900');
  const activeTextColor = useColorModeValue('blue.600', 'blue.200');
  const navigate = useNavigate();
  const { id } = useParams();
  const toast = useToast();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [editingDocId, setEditingDocId] = useState(null);
  const [newDocName, setNewDocName] = useState('');

  // Filter documents based on search term
  const filteredDocuments = documents.filter(doc => 
    doc.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateDocument = () => {
    createDocument('New Document').then(doc => {
      if (doc) {
        navigate(`/documents/${doc.id}`);
      }
    });
  };

  const handleRenameDocument = (docId) => {
    if (newDocName) {
      updateDocumentName(docId, newDocName);
      setEditingDocId(null);
      toast({
        title: 'Document renamed',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    }
  };

  const handleDeleteDocument = (docId) => {
    deleteDocument(docId);
    if (id === docId) {
      navigate('/documents');
    }
    toast({
      title: 'Document deleted',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  return (
    <Box
      height="full"
      overflowY="auto"
      p="3"
      className="sidebar"
    >
      {/* Mobile close button */}
      <Flex display={{ base: 'flex', md: 'none' }} justifyContent="flex-end" mb="2">
        <IconButton
          icon={<CloseIcon />}
          size="sm"
          variant="ghost"
          onClick={onClose}
          aria-label="Close Sidebar"
        />
      </Flex>
      
      {/* New document button */}
      <Button
        leftIcon={<AddIcon />}
        colorScheme="blue"
        size="sm"
        width="full"
        mb="4"
        onClick={handleCreateDocument}
      >
        New Document
      </Button>
      
      {/* Search */}
      <Box position="relative" mb="4">
        <Input
          placeholder="Search documents..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          size="sm"
          pr="8"
        />
        <IconButton
          icon={<SearchIcon />}
          size="sm"
          position="absolute"
          right="0"
          top="0"
          variant="ghost"
          aria-label="Search"
        />
      </Box>
      
      <Divider mb="4" />
      
      {/* Document list */}
      <Text fontSize="xs" fontWeight="bold" textTransform="uppercase" mb="2" color="gray.500">
        Your Documents
      </Text>
      
      <VStack align="stretch" spacing="1">
        {filteredDocuments.length > 0 ? (
          filteredDocuments.map(doc => (
            <Box key={doc.id}>
              {editingDocId === doc.id ? (
                <HStack p="2">
                  <Input
                    value={newDocName}
                    onChange={(e) => setNewDocName(e.target.value)}
                    size="sm"
                    autoFocus
                    onBlur={() => handleRenameDocument(doc.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleRenameDocument(doc.id);
                      } else if (e.key === 'Escape') {
                        setEditingDocId(null);
                      }
                    }}
                  />
                  <IconButton
                    icon={<CheckIcon />}
                    size="sm"
                    onClick={() => handleRenameDocument(doc.id)}
                    aria-label="Save"
                  />
                </HStack>
              ) : (
                <Flex
                  as={Link}
                  to={`/documents/${doc.id}`}
                  p="2"
                  borderRadius="md"
                  bg={id === doc.id ? activeBgColor : 'transparent'}
                  color={id === doc.id ? activeTextColor : 'inherit'}
                  _hover={{
                    bg: id === doc.id ? activeBgColor : hoverBgColor,
                    textDecoration: 'none'
                  }}
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <HStack spacing="2">
                    <FaFileAlt />
                    <Text noOfLines={1}>{doc.name}</Text>
                  </HStack>
                  
                  <Menu>
                    <MenuButton
                      as={IconButton}
                      icon={<SettingsIcon />}
                      size="xs"
                      variant="ghost"
                      onClick={(e) => e.preventDefault()}
                      aria-label="Document Settings"
                      opacity="0.5"
                      _hover={{ opacity: 1 }}
                    />
                    <MenuList>
                      <MenuItem
                        icon={<EditIcon />}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setNewDocName(doc.name);
                          setEditingDocId(doc.id);
                        }}
                      >
                        Rename
                      </MenuItem>
                      <MenuItem
                        icon={<DeleteIcon />}
                        color="red.500"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDeleteDocument(doc.id);
                        }}
                      >
                        Delete
                      </MenuItem>
                    </MenuList>
                  </Menu>
                </Flex>
              )}
            </Box>
          ))
        ) : (
          <Box p="4" textAlign="center">
            <Text color="gray.500">No documents found</Text>
          </Box>
        )}
      </VStack>
    </Box>
  );
};

export default Sidebar;