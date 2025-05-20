import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from '@chakra-ui/react';

const DocumentContext = createContext();

export const useDocument = () => useContext(DocumentContext);

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
  const [userId] = useState(() => localStorage.getItem('userId') || uuidv4());
  const [username, setUsername] = useState(() => localStorage.getItem('username') || 'Guest');
  const [userColor] = useState(() => getRandomColor(userId));
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [activeUsers, setActiveUsers] = useState(new Map());
  const toast = useToast();

  // Εκκίνηση και αρχικοποίηση του χρήστη
  useEffect(() => {
    localStorage.setItem('userId', userId);
    if (!localStorage.getItem('username')) {
      localStorage.setItem('username', username);
    }
  }, [userId, username]);

  // Φόρτωση εγγράφων
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/documents');
        if (!response.ok) throw new Error('Failed to fetch documents');
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

  // Καθαρισμός και αποσύνδεση
  useEffect(() => {
    return () => {
      if (providerRef.current) {
        console.log('Disconnecting WebSocket provider during cleanup');
        providerRef.current.disconnect();
        providerRef.current = null;
      }
    };
  }, []);

  // Παρακολούθηση αλλαγών awareness
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
            clientId
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

  // Σύνδεση σε έγγραφο
  const connectToDocument = useCallback((docId, docName = 'Untitled Document') => {
    // Αν έχουμε ήδη έναν provider για αυτό το έγγραφο, επιστρέφουμε τα υπάρχοντα αντικείμενα
    if (providerRef.current && currentDoc && currentDoc.id === docId) {
      console.log(`Already connected to document: ${docId}`);
      return { 
        ytext: providerRef.current.doc.getText('content'), 
        provider: providerRef.current 
      };
    }
    
    // Καθαρισμός προηγούμενης σύνδεσης
    if (providerRef.current) {
      console.log(`Disconnecting from previous document before connecting to: ${docId}`);
      providerRef.current.disconnect();
      providerRef.current = null;
    }

    try {
      // Δημιουργία νέου Y.Doc
      const newYdoc = new Y.Doc();
      setYdoc(newYdoc);

      // Διαμόρφωση URL WebSocket μέσω του Nginx proxy
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.host;
      const wsUrl = `${protocol}//${host}/ws`;
      console.log(`Connecting to WebSocket server via proxy: ${wsUrl}, document: ${docId}`);

      // Σύνδεση WebSocket με βελτιωμένες ρυθμίσεις
      const newProvider = new WebsocketProvider(
        wsUrl,
        docId,
        newYdoc,
        { 
          connect: true,
          maxBackoffTime: 10000,
          disableBc: true,
        }
      );

      // Αποθήκευση του provider
      providerRef.current = newProvider;
      setProvider(newProvider);

      // Παρακολούθηση κατάστασης σύνδεσης
      newProvider.on('status', ({ status }) => {
        console.log(`WebSocket status: ${status}`);
        setConnectionStatus(status);
        
        if (status === 'connected') {
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

      newProvider.on('connection-error', (error) => {
        console.error('WebSocket connection error:', error);
        setError(`Connection error: ${error.message || 'Unknown error'}`);
        toast({
          title: 'Connection Error',
          description: `Error connecting to document: ${error.message || 'Unknown error'}`,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      });

      // Ρύθμιση του awareness
      newProvider.awareness.setLocalState({
        userId,
        username,
        color: userColor,
        cursor: null,
        selection: null,
      });

      setAwareness(newProvider.awareness);
      setCurrentDoc({ id: docId, name: docName });

      // Σύνδεση με το κείμενο
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
  }, [currentDoc, toast, userId, username, userColor]);

  // Δημιουργία νέου εγγράφου
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

      if (!response.ok) throw new Error('Failed to create document');
      
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
  }, [documents, connectToDocument, toast]);

  // Ενημέρωση ονόματος εγγράφου
  const updateDocumentName = useCallback(async (docId, newName) => {
    try {
      const response = await fetch(`/api/documents/${docId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newName }),
      });

      if (!response.ok) throw new Error('Failed to update document');
      
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

  // Διαγραφή εγγράφου
  const deleteDocument = useCallback(async (docId) => {
    try {
      const response = await fetch(`/api/documents/${docId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete document');
      
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

  // Δημιουργία συνεπούς χρώματος για χρήστη
  function getRandomColor(id) {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#FF9F1C', '#A78BFA', 
      '#10B981', '#F472B6', '#60A5FA', '#FBBF24'
    ];
    
    // Απλή συνάρτηση hash για συνεπές αποτέλεσμα
    const hash = id.split('').reduce((acc, char) => {
      return acc + char.charCodeAt(0);
    }, 0);
    
    return colors[hash % colors.length];
  }

  // Ενημέρωση ονόματος χρήστη
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
    }}>
      {children}
    </DocumentContext.Provider>
  );
};