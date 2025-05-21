import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  VStack,
  Text,
  IconButton,
  Tooltip,
  Button,
  Divider,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure,
  Spinner,
  useToast
} from '@chakra-ui/react';
import { 
  FaFile, 
  FaTrash, 
  FaPencilAlt, 
  FaEllipsisH, 
  FaChevronLeft, 
  FaChevronRight 
} from 'react-icons/fa';
import { format } from 'date-fns';
import { useDocuments } from '../../context/DocumentContext';

const Sidebar = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [collapsed, setCollapsed] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { 
    documents, 
    loading,
    deleteDocument,
    createDocument,
    fetchDocuments
  } = useDocuments();

  // Refresh documents list when mounted
  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  // Handle document selection
  const handleDocumentClick = (documentId) => {
    navigate(`/documents/${documentId}`);
  };

  // Handle creating a new document
  const handleCreateDocument = async () => {
    await createDocument();
  };

  // Show delete confirmation dialog
  const handleDeleteClick = (doc, e) => {
    e.stopPropagation(); // Prevent triggering the document click
    setDocumentToDelete(doc);
    onOpen();
  };

  // Delete a document
  const confirmDelete = async () => {
    if (!documentToDelete) return;
    
    const success = await deleteDocument(documentToDelete.id);
    
    if (success) {
      toast({
        title: 'Document deleted',
        description: `"${documentToDelete.name}" has been deleted`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } else {
      toast({
        title: 'Error',
        description: 'Failed to delete document',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
    
    onClose();
    setDocumentToDelete(null);
  };

  // Toggle sidebar collapse
  const toggleCollapse = () => {
    setCollapsed(prev => !prev);
  };

  return (
    <>
      <Box
        as="aside"
        w={collapsed ? "60px" : "250px"}
        h="100%"
        bg="sidebar.light"
        _dark={{ bg: "sidebar.dark" }}
        borderRight="1px solid"
        borderColor="border.light"
        _dark={{ borderColor: "border.dark" }}
        transition="width 0.2s ease"
        overflow="hidden"
      >
        <Box p={3} position="relative">
          {/* Sidebar header */}
          <Flex 
            justifyContent="space-between" 
            alignItems="center" 
            mb={3}
            display={collapsed ? "none" : "flex"}
          >
            <Text fontWeight="medium" fontSize="sm">Your Documents</Text>
            <Button
              size="sm"
              colorScheme="blue"
              leftIcon={<FaFile />}
              iconSpacing={1}
              onClick={handleCreateDocument}
            >
              New
            </Button>
          </Flex>
          
          {/* Collapse toggle button */}
          <IconButton
            aria-label={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            icon={collapsed ? <FaChevronRight /> : <FaChevronLeft />}
            size="sm"
            variant="ghost"
            position="absolute"
            right={1}
            top={2}
            onClick={toggleCollapse}
          />
          
          {/* Documents list with loading state */}
          {loading ? (
            <VStack py={8} justify="center">
              <Spinner />
              <Text fontSize="sm" display={collapsed ? "none" : "block"}>
                Loading documents...
              </Text>
            </VStack>
          ) : (
            <VStack align="stretch" spacing={1} mt={collapsed ? 10 : 0}>
              {documents.length === 0 ? (
                <Box textAlign="center" py={6} display={collapsed ? "none" : "block"}>
                  <Text fontSize="sm" color="gray.500">
                    No documents yet
                  </Text>
                  <Button
                    mt={2}
                    size="sm"
                    variant="outline"
                    colorScheme="blue"
                    onClick={handleCreateDocument}
                  >
                    Create your first document
                  </Button>
                </Box>
              ) : (
                documents.map(doc => (
                  <Box
                    key={doc.id}
                    py={2}
                    px={3}
                    borderRadius="md"
                    cursor="pointer"
                    bg={id === doc.id ? 'primary.50' : 'transparent'}
                    _dark={{
                      bg: id === doc.id ? 'primary.900' : 'transparent'
                    }}
                    _hover={{
                      bg: id === doc.id 
                        ? 'primary.100'
                        : 'gray.100',
                      _dark: {
                        bg: id === doc.id 
                          ? 'primary.800'
                          : 'gray.700'
                      }
                    }}
                    transition="background 0.2s"
                    onClick={() => handleDocumentClick(doc.id)}
                    position="relative"
                  >
                    <Flex alignItems="center" gap={2}>
                      <FaFile 
                        size={16} 
                        color={id === doc.id ? '#2196f3' : '#718096'} 
                      />
                      {!collapsed && (
                        <>
                          <VStack align="flex-start" spacing={0} flex={1} overflow="hidden">
                            <Text 
                              fontWeight={id === doc.id ? "medium" : "normal"} 
                              color={id === doc.id ? 'primary.700' : 'gray.700'}
                              _dark={{
                                color: id === doc.id ? 'primary.300' : 'gray.300'
                              }}
                              fontSize="sm"
                              noOfLines={1}
                            >
                              {doc.name}
                            </Text>
                            <Text fontSize="xs" color="gray.500">
                              {format(new Date(doc.updatedAt), 'MMM d, yyyy')}
                            </Text>
                          </VStack>
                          
                          {/* Document actions */}
                          <Menu isLazy>
                            <MenuButton
                              as={IconButton}
                              icon={<FaEllipsisH />}
                              variant="ghost"
                              size="xs"
                              onClick={e => e.stopPropagation()}
                              aria-label="Document actions"
                            />
                            <MenuList minW="140px">
                              <MenuItem 
                                icon={<FaPencilAlt />}
                                onClick={e => {
                                  e.stopPropagation();
                                  handleDocumentClick(doc.id);
                                }}
                              >
                                Edit
                              </MenuItem>
                              <MenuItem 
                                icon={<FaTrash />}
                                color="red.500"
                                onClick={e => handleDeleteClick(doc, e)}
                              >
                                Delete
                              </MenuItem>
                            </MenuList>
                          </Menu>
                        </>
                      )}
                    </Flex>
                  </Box>
                ))
              )}
            </VStack>
          )}
        </Box>
      </Box>
      
      {/* Delete confirmation dialog */}
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Document
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete "{documentToDelete?.name}"?
              This action cannot be undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={confirmDelete} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
};

// Required for the AlertDialog
const Flex = ({ children, ...props }) => <Box display="flex" {...props}>{children}</Box>;
const cancelRef = React.createRef();

export default Sidebar;