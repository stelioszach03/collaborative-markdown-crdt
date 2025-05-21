import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from '@chakra-ui/react';

// Create Context
const DocumentContext = createContext(null);

// Custom hook to access the context
export const useDocument = () => {
  const context = useContext(DocumentContext);
  if (context === null) {
    throw new Error('useDocument must be used within a DocumentProvider');
  }
  return context;
};

export const DocumentProvider = ({ children }) => {
  const [documents, setDocuments] = useState([]);
  const [currentDoc, setCurrentDoc] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [provider, setProvider] = useState(null);
  const providerRef = useRef(null);
  const [ydoc, setYdoc] = useState(null);
  const [awareness, setAwareness] = useState(null);
  const [text, setText] = useState('');
  
  // Store userId in localStorage or create new one
  const [userId] = useState(() => {
    const storedId = localStorage.getItem('userId');
    if (storedId) return storedId;
    const newId = uuidv4();
    localStorage.setItem('userId', newId);
    return newId;
  });
  
  // Store username in localStorage or use default
  const [username, setUsername] = useState(() => {
    const storedName = localStorage.getItem('username');
    return storedName || 'Guest';
  });
  
  // Create consistent color for user
  const [userColor] = useState(() => getRandomColor(userId));
  
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [activeUsers, setActiveUsers] = useState(new Map());
  const toast = useToast();

  // Variables for reconnection
  const reconnectTimerRef = useRef(null);
  const maxReconnectAttempts = 5;
  const [reconnectAttempts, setReconnectAttempts] = useState(0);

  // Initialize user
  useEffect(() => {
    localStorage.setItem('userId', userId);
    if (!localStorage.getItem('username')) {
      localStorage.setItem('username', username);
    }
  }, [userId, username]);

  // Load documents
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/documents');
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'Failed to fetch documents');
        }
        
        const data = await response.json();
        setDocuments(data);
        setIsInitialLoad(false);
      } catch (err) {
        console.error('Error fetching documents:', err);
        setError(err.message);
        toast({
          title: 'Error loading documents',
          description: err.message,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocuments();
  }, [toast]);

  // Cleanup and disconnect
  useEffect(() => {
    return () => {
      if (providerRef.current) {
        console.log('Disconnecting WebSocket provider during cleanup');
        providerRef.current.disconnect();
        providerRef.current = null;
      }
      
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
    };
  }, []);

  // Track awareness changes
  useEffect(() => {
    if (!awareness) return;

    const updateActiveUsers = () => {
      const users = new Map();
      awareness.getStates().forEach((state, clientId) => {
        if (state.userId) {
          users.set(state.userId, {
            username: state.username || 'Anonymous',
            color: state.color || '#cccccc',
            cursor: state.cursor,
            selection: state.selection,
            clientId,
            lastUpdate: state.lastUpdate || Date.now()
          });
        }
      });
      setActiveUsers(users);
    };

    updateActiveUsers(); // Initial state
    awareness.on('change', updateActiveUsers);

    return () => {
      awareness.off('change', updateActiveUsers);
    };
  }, [awareness]);

  // Get WebSocket URL based on current window location
  const getWebSocketUrl = useCallback(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    
    return `${protocol}//${host}/ws`;
  }, []);

  // Connect to document
  const connectToDocument = useCallback((docId, docName = 'Untitled Document') => {
    // Check for existing provider
    if (providerRef.current && currentDoc && currentDoc.id === docId) {
      console.log(`Already connected to document: ${docId}`);
      return { 
        ytext: providerRef.current.doc.getText('content'), 
        provider: providerRef.current 
      };
    }
    
    // Cleanup previous connection
    if (providerRef.current) {
      console.log(`Disconnecting from previous document before connecting to: ${docId}`);
      providerRef.current.disconnect();
      providerRef.current = null;
    }
    
    // Cancel any reconnection timers
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }

    try {
      // Create new Y.Doc
      const newYdoc = new Y.Doc();
      setYdoc(newYdoc);

      // Configure WebSocket URL
      const wsUrl = getWebSocketUrl();
      console.log(`Connecting to WebSocket: ${wsUrl}, document: ${docId}`);

      // Connect to WebSocket
      const newProvider = new WebsocketProvider(wsUrl, docId, newYdoc, { 
        connect: true,
        maxBackoffTime: 10000, 
        disableBc: true,
      });

      // Store provider
      providerRef.current = newProvider;
      setProvider(newProvider);

      // Monitor connection status
      newProvider.on('status', ({ status }) => {
        console.log(`WebSocket status: ${status}`);
        setConnectionStatus(status);
        
        if (status === 'connected') {
          // Reset reconnect attempts after successful connection
          setReconnectAttempts(0);
          
          toast({
            title: 'Connected',
            description: 'Now connected to document',
            status: 'success',
            duration: 2000,
            isClosable: true,
            position: 'bottom-right'
          });
        } else if (status === 'disconnected') {
          toast({
            title: 'Disconnected',
            description: 'Connection lost. Attempting to reconnect...',
            status: 'warning',
            duration: 3000,
            isClosable: true,
            position: 'bottom-right'
          });
        }
      });

      // Handle connection errors
      newProvider.on('connection-error', (error) => {
        console.error('WebSocket connection error:', error);
        setError(`Connection error: ${error.message || 'Unknown error'}`);
        
        // Try to reconnect with increasing delay
        if (reconnectAttempts < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
          console.log(`Scheduling reconnect in ${delay}ms (attempt ${reconnectAttempts + 1}/${maxReconnectAttempts})`);
          
          reconnectTimerRef.current = setTimeout(() => {
            setReconnectAttempts(prev => prev + 1);
            // Try to reconnect with the same docId and docName
            connectToDocument(docId, docName);
          }, delay);
        } else {
          toast({
            title: 'Connection Error',
            description: `Failed to connect to document after ${maxReconnectAttempts} attempts. Please try again later.`,
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
        }
      });

      // Set up awareness
      newProvider.awareness.setLocalState({
        userId,
        username,
        color: userColor,
        cursor: null,
        selection: null,
        lastUpdate: Date.now()
      });

      setAwareness(newProvider.awareness);
      setCurrentDoc({ id: docId, name: docName });

      // Connect to the text
      const ytext = newYdoc.getText('content');
      setText(ytext.toString());

      ytext.observe(event => {
        setText(ytext.toString());
      });

      return { ytext, provider: newProvider };
    } catch (err) {
      console.error('Error connecting to document:', err);
      setError(`Error connecting to document: ${err.message}`);
      toast({
        title: 'Connection Error',
        description: `Failed to connect to document: ${err.message}`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return { ytext: null, provider: null };
    }
  }, [currentDoc, toast, userId, username, userColor, getWebSocketUrl, reconnectAttempts]);

  // Create new document
  const createDocument = useCallback(async (name = 'Untitled Document') => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to create document');
      }
      
      const newDoc = await response.json();
      setDocuments(prev => [...prev, newDoc]);
      
      toast({
        title: 'Document Created',
        description: `"${name}" has been created successfully`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      connectToDocument(newDoc.id, newDoc.name);
      return newDoc;
    } catch (err) {
      console.error('Error creating document:', err);
      setError(err.message);
      toast({
        title: 'Error',
        description: `Failed to create document: ${err.message}`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [connectToDocument, toast]);

  // Update document name
  const updateDocumentName = useCallback(async (docId, newName) => {
    try {
      const response = await fetch(`/api/documents/${docId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newName }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update document');
      }
      
      const updatedDoc = await response.json();
      setDocuments(docs => docs.map(doc => doc.id === docId ? updatedDoc : doc));
      
      if (currentDoc && currentDoc.id === docId) {
        setCurrentDoc({ ...currentDoc, name: newName });
      }
      
      toast({
        title: 'Document Renamed',
        description: `Document renamed to "${newName}"`,
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
      
      return updatedDoc;
    } catch (err) {
      console.error('Error updating document name:', err);
      setError(err.message);
      toast({
        title: 'Error',
        description: `Failed to rename document: ${err.message}`,
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
      throw err;
    }
  }, [currentDoc, toast]);

  // Delete document
  const deleteDocument = useCallback(async (docId) => {
    try {
      const response = await fetch(`/api/documents/${docId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to delete document');
      }
      
      setDocuments(docs => docs.filter(doc => doc.id !== docId));
      
      if (currentDoc && currentDoc.id === docId) {
        if (providerRef.current) {
          providerRef.current.disconnect();
          providerRef.current = null;
        }
        setCurrentDoc(null);
        setYdoc(null);
        setProvider(null);
        setAwareness(null);
        setText('');
      }
      
      toast({
        title: 'Document Deleted',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      return true;
    } catch (err) {
      console.error('Error deleting document:', err);
      setError(err.message);
      toast({
        title: 'Error',
        description: `Failed to delete document: ${err.message}`,
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
      throw err;
    }
  }, [currentDoc, toast]);

  // Create consistent color for user
  function getRandomColor(id) {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#FF9F1C', '#A78BFA', 
      '#10B981', '#F472B6', '#60A5FA', '#FBBF24'
    ];
    
    // Hash function for consistent result
    const hash = id.split('').reduce((acc, char) => {
      return acc + char.charCodeAt(0);
    }, 0);
    
    return colors[hash % colors.length];
  }

  // Update username
  const updateUsername = useCallback((newUsername) => {
    setUsername(newUsername);
    localStorage.setItem('username', newUsername);
    
    if (awareness) {
      const current = awareness.getLocalState();
      if (current) {
        awareness.setLocalState({
          ...current,
          username: newUsername,
        });
      }
    }
    
    toast({
      title: 'Username Updated',
      description: `Your username is now "${newUsername}"`,
      status: 'success',
      duration: 2000,
      isClosable: true,
      position: 'bottom-right'
    });
  }, [awareness, toast]);

  // Refresh connection
  const refreshConnection = useCallback(() => {
    if (currentDoc) {
      setReconnectAttempts(0);
      connectToDocument(currentDoc.id, currentDoc.name);
      
      toast({
        title: 'Connection Refreshed',
        description: 'Attempting to reconnect to the document',
        status: 'info',
        duration: 2000,
        isClosable: true,
        position: 'bottom-right'
      });
    }
  }, [currentDoc, connectToDocument, toast]);

  // Provide functions and data to children
  return (
    <DocumentContext.Provider value={{
      documents,
      currentDoc,
      isLoading,
      isInitialLoad,
      error,
      text,
      ydoc,
      provider,
      awareness,
      userId,
      username,
      userColor,
      connectionStatus,
      activeUsers,
      connectToDocument,
      createDocument,
      updateDocumentName,
      deleteDocument,
      updateUsername,
      refreshConnection,
    }}>
      {children}
    </DocumentContext.Provider>
  );
};