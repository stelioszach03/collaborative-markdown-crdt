import React, { useState, useRef } from 'react';
import {
  Box, VStack, Text, IconButton, Button, useColorModeValue, Divider,
  HStack, Input, Flex, Menu, MenuButton, MenuList, MenuItem, 
  Tooltip, Avatar, Badge, useDisclosure, Modal, ModalOverlay,
  ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
  InputGroup, InputLeftElement, Spinner, Alert, AlertIcon, Tag,
  FormControl, FormLabel, Select
} from '@chakra-ui/react';
import { 
  AddIcon, CloseIcon, SearchIcon, DeleteIcon, EditIcon, SettingsIcon,
  ViewIcon, DownloadIcon, ExternalLinkIcon
} from '@chakra-ui/icons';
import { FaFileAlt, FaTrash, FaRegClock, FaShareAlt, FaFolder, FaSort,
         FaRegStar, FaStar, FaRegFolderOpen } from 'react-icons/fa';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useDocument } from '../../context/DocumentContext';
import { format } from 'date-fns';

const Sidebar = ({ onClose }) => {
  const { documents, createDocument, updateDocumentName, deleteDocument, isLoading } = useDocument();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const hoverBgColor = useColorModeValue('gray.50', 'gray.700');
  const activeBgColor = useColorModeValue('blue.50', 'blue.900');
  const activeTextColor = useColorModeValue('blue.600', 'blue.200');
  const mutedTextColor = useColorModeValue('gray.500', 'gray.400');
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [editingDocId, setEditingDocId] = useState(null);
  const [newDocName, setNewDocName] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [favorites, setFavorites] = useState([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [docToDelete, setDocToDelete] = useState(null);
  const [showFavorites, setShowFavorites] = useState(false);
  const cancelRef = useRef();

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
    }
  };

  const confirmDeleteDocument = (doc) => {
    setDocToDelete(doc);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteDocument = () => {
    if (!docToDelete) return;
    
    deleteDocument(docToDelete.id);
    if (id === docToDelete.id) {
      navigate('/documents');
    }
    
    // Remove from favorites if needed
    if (favorites.includes(docToDelete.id)) {
      setFavorites(favorites.filter(fid => fid !== docToDelete.id));
      localStorage.setItem('favoriteDocuments', JSON.stringify(
        favorites.filter(fid => fid !== docToDelete.id)
      ));
    }
    
    setIsDeleteModalOpen(false);
    setDocToDelete(null);
  };

  const toggleFavorite = (docId) => {
    const newFavorites = favorites.includes(docId)
      ? favorites.filter(id => id !== docId)
      : [...favorites, docId];
    
    setFavorites(newFavorites);
    localStorage.setItem('favoriteDocuments', JSON.stringify(newFavorites));
  };

  // Sort and filter documents
  let filteredDocuments = documents.filter(doc => 
    doc.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (showFavorites) {
    filteredDocuments = filteredDocuments.filter(doc => favorites.includes(doc.id));
  }

  if (sortBy === 'recent') {
    filteredDocuments.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  } else if (sortBy === 'name') {
    filteredDocuments.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortBy === 'created') {
    filteredDocuments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  return (
    <Box
      height="full"
      overflowY="auto"
      p="4"
      className="sidebar"
      bgGradient={useColorModeValue(
        'linear(to-b, white, gray.50)',
        'linear(to-b, gray.800, gray.900)'
      )}
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
      
      {/* Header & controls */}
      <Flex direction="column" mb="6">
        <Flex align="center" justify="space-between" mb="4">
          <Text fontSize="xl" fontWeight="bold">Documents</Text>
          <Tooltip label="Create new document">
            <IconButton
              icon={<AddIcon />}
              colorScheme="blue"
              size="sm"
              onClick={handleCreateDocument}
              aria-label="New Document"
              isRound
            />
          </Tooltip>
        </Flex>
        
        <HStack mb="4" spacing="2">
          {/* Search bar */}
          <InputGroup size="sm">
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="gray.400" />
            </InputLeftElement>
            <Input
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              borderRadius="full"
              bg={useColorModeValue('white', 'gray.700')}
            />
          </InputGroup>
          
          {/* Sort dropdown */}
          <Menu closeOnSelect={true}>
            <Tooltip label="Sort documents">
              <MenuButton
                as={IconButton}
                icon={<FaSort />}
                variant="ghost"
                size="sm"
                aria-label="Sort documents"
              />
            </Tooltip>
            <MenuList minW="180px">
              <MenuItem onClick={() => setSortBy('recent')} icon={sortBy === 'recent' ? <FaRegClock color="blue" /> : <FaRegClock />}>
                Recently Updated
              </MenuItem>
              <MenuItem onClick={() => setSortBy('name')} icon={sortBy === 'name' ? <FaFileAlt color="blue" /> : <FaFileAlt />}>
                Name
              </MenuItem>
              <MenuItem onClick={() => setSortBy('created')} icon={sortBy === 'created' ? <FaRegClock color="blue" /> : <FaRegClock />}>
                Recently Created
              </MenuItem>
            </MenuList>
          </Menu>
          
          {/* Favorites toggle */}
          <Tooltip label={showFavorites ? "Show all documents" : "Show favorites"}>
            <IconButton
              icon={showFavorites ? <FaRegFolderOpen /> : <FaStar />}
              variant={showFavorites ? "solid" : "ghost"}
              colorScheme={showFavorites ? "blue" : "gray"}
              size="sm"
              onClick={() => setShowFavorites(!showFavorites)}
              aria-label={showFavorites ? "Show all documents" : "Show favorites"}
            />
          </Tooltip>
        </HStack>
      </Flex>
      
      {/* Document list */}
      <VStack align="stretch" spacing="1" mb="4">
        {isLoading ? (
          <Flex justify="center" align="center" height="100px">
            <Spinner size="md" color="blue.500" />
          </Flex>
        ) : filteredDocuments.length > 0 ? (
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
                  p="3"
                  borderRadius="md"
                  bg={id === doc.id ? activeBgColor : 'transparent'}
                  color={id === doc.id ? activeTextColor : 'inherit'}
                  _hover={{
                    bg: id === doc.id ? activeBgColor : hoverBgColor,
                    textDecoration: 'none'
                  }}
                  alignItems="center"
                  justifyContent="space-between"
                  transition="all 0.2s"
                >
                  <HStack spacing="3" flex="1" overflow="hidden">
                    <Box color={id === doc.id ? activeTextColor : mutedTextColor}>
                      <FaFileAlt />
                    </Box>
                    <Box overflow="hidden">
                      <Text noOfLines={1} fontWeight={id === doc.id ? "600" : "normal"}>
                        {doc.name}
                      </Text>
                      <Text fontSize="xs" color={mutedTextColor} noOfLines={1}>
                        {format(new Date(doc.updatedAt), 'MMM d, yyyy • h:mm a')}
                      </Text>
                    </Box>
                  </HStack>
                  
                  <HStack spacing="1">
                    <Tooltip label={favorites.includes(doc.id) ? "Remove from favorites" : "Add to favorites"}>
                      <IconButton
                        icon={favorites.includes(doc.id) ? <FaStar /> : <FaRegStar />}
                        size="xs"
                        variant="ghost"
                        color={favorites.includes(doc.id) ? "yellow.500" : undefined}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleFavorite(doc.id);
                        }}
                        aria-label={favorites.includes(doc.id) ? "Remove from favorites" : "Add to favorites"}
                      />
                    </Tooltip>
                    
                    <Menu>
                      <MenuButton
                        as={IconButton}
                        icon={<SettingsIcon />}
                        size="xs"
                        variant="ghost"
                        onClick={(e) => e.preventDefault()}
                        aria-label="Document Settings"
                        opacity="0.7"
                        _hover={{ opacity: 1 }}
                      />
                      <MenuList zIndex="1000">
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
                          icon={<FaShareAlt />}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            navigator.clipboard.writeText(
                              `${window.location.origin}/documents/${doc.id}`
                            );
                          }}
                        >
                          Copy Link
                        </MenuItem>
                        <MenuItem
                          icon={<DownloadIcon />}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            // Placeholder for export functionality
                            alert('Export functionality is coming soon!');
                          }}
                        >
                          Export
                        </MenuItem>
                        <Divider />
                        <MenuItem
                          icon={<DeleteIcon />}
                          color="red.500"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            confirmDeleteDocument(doc);
                          }}
                        >
                          Delete
                        </MenuItem>
                      </MenuList>
                    </Menu>
                  </HStack>
                </Flex>
              )}
            </Box>
          ))
        ) : searchTerm ? (
          <Box 
            p="6" 
            textAlign="center" 
            bg={useColorModeValue('gray.50', 'gray.700')}
            borderRadius="md"
          >
            <Text color="gray.500" mb="2">No documents match your search</Text>
            <Button
              leftIcon={<AddIcon />}
              colorScheme="blue"
              size="sm"
              variant="outline"
              onClick={handleCreateDocument}
            >
              Create New Document
            </Button>
          </Box>
        ) : showFavorites ? (
          <Box 
            p="6" 
            textAlign="center" 
            bg={useColorModeValue('gray.50', 'gray.700')}
            borderRadius="md"
          >
            <Text color="gray.500" mb="3">No favorite documents yet</Text>
            <Text fontSize="sm" color="gray.500" mb="3">
              Mark documents as favorites to see them here
            </Text>
            <Button
              leftIcon={<FaRegFolderOpen />}
              colorScheme="blue"
              size="sm"
              variant="outline"
              onClick={() => setShowFavorites(false)}
            >
              Show All Documents
            </Button>
          </Box>
        ) : (
          <Box 
            p="6" 
            textAlign="center" 
            bg={useColorModeValue('gray.50', 'gray.700')}
            borderRadius="md"
          >
            <Text color="gray.500" mb="2">No documents yet</Text>
            <Button
              leftIcon={<AddIcon />}
              colorScheme="blue"
              size="sm"
              variant="outline"
              onClick={handleCreateDocument}
            >
              Create Your First Document
            </Button>
          </Box>
        )}
      </VStack>
      
      {/* Divider and info section */}
      <Divider mb="4" />
      
      <Box>
        <HStack mb="2">
          <FaFolder />
          <Text fontWeight="medium">Storage</Text>
        </HStack>
        <Text fontSize="sm" color={mutedTextColor} mb="1">
          {documents.length} document{documents.length !== 1 ? 's' : ''}
        </Text>
        <Text fontSize="sm" color={mutedTextColor}>
          {favorites.length} favorite{favorites.length !== 1 ? 's' : ''}
        </Text>
      </Box>
      
      {/* Delete confirmation modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        isCentered
        motionPreset="slideInBottom"
        size="sm"
      >
        <ModalOverlay bg="blackAlpha.400" backdropFilter="blur(5px)" />
        <ModalContent>
          <ModalHeader>Delete Document</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Alert status="error" mb="4" borderRadius="md">
              <AlertIcon />
              This action cannot be undone.
            </Alert>
            <Text>
              Are you sure you want to delete <strong>{docToDelete?.name}</strong>?
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button ref={cancelRef} onClick={() => setIsDeleteModalOpen(false)} mr={3}>
              Cancel
            </Button>
            <Button colorScheme="red" onClick={handleDeleteDocument} leftIcon={<FaTrash />}>
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Sidebar;