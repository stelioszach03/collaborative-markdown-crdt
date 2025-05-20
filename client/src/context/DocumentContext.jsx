import React, { createContext, useContext, useState, useEffect } from 'react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { v4 as uuidv4 } from 'uuid';

const DocumentContext = createContext();

export const useDocument = () => useContext(DocumentContext);

export const DocumentProvider = ({ children }) => {
  const [documents, setDocuments] = useState([]);
  const [currentDoc, setCurrentDoc] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [provider, setProvider] = useState(null);
  const [ydoc, setYdoc] = useState(null);
  const [awareness, setAwareness] = useState(null);
  const [text, setText] = useState('');
  const [userId] = useState(() => localStorage.getItem('userId') || uuidv4());
  const [username, setUsername] = useState(() => localStorage.getItem('username') || 'Guest');
  const [userColor] = useState(() => getRandomColor(userId));

  // Initialize user ID
  useEffect(() => {
    localStorage.setItem('userId', userId);
    if (!localStorage.getItem('username')) {
      localStorage.setItem('username', username);
    }
  }, [userId, username]);

  // Fetch documents
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await fetch('/api/documents');
        if (!response.ok) throw new Error('Failed to fetch documents');
        const data = await response.json();
        setDocuments(data);
        setIsLoading(false);
      } catch (err) {
        setError(err.message);
        setIsLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  // Connect to document
  const connectToDocument = (docId, docName = 'Untitled Document') => {
    // Clean up previous connection
    if (provider) {
      provider.disconnect();
    }

    // Create a new Y.Doc
    const newYdoc = new Y.Doc();
    setYdoc(newYdoc);

    // Get the WebSocket URL - απευθείας σύνδεση στο port 5001
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//localhost:5001`;
    console.log(`Connecting directly to WebSocket server: ${wsUrl}, document: ${docId}`);

    // Connect to WebSocket
    const newProvider = new WebsocketProvider(
      wsUrl,
      docId,
      newYdoc,
      { connect: true }
    );

    // Logging connection status
    newProvider.on('status', ({ status }) => {
      console.log(`WebSocket status: ${status}`);
    });

    newProvider.on('connection-error', (error) => {
      console.error('WebSocket connection error:', error);
    });

    // Set up awareness (user presence)
    newProvider.awareness.setLocalState({
      userId,
      username,
      color: userColor,
      cursor: null,
      selection: null,
    });

    setProvider(newProvider);
    setAwareness(newProvider.awareness);
    setCurrentDoc({ id: docId, name: docName });

    // Bind to text updates
    const ytext = newYdoc.getText('content');
    setText(ytext.toString());

    ytext.observe(event => {
      setText(ytext.toString());
    });

    return { ytext, provider: newProvider };
  };

  // Create a new document
  const createDocument = async (name = 'Untitled Document') => {
    try {
      const response = await fetch('/api/documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      });

      if (!response.ok) throw new Error('Failed to create document');
      
      const newDoc = await response.json();
      setDocuments([...documents, newDoc]);
      
      connectToDocument(newDoc.id, newDoc.name);
      return newDoc;
    } catch (err) {
      setError(err.message);
      return null;
    }
  };

  // Update document name
  const updateDocumentName = async (docId, newName) => {
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
      setDocuments(documents.map(doc => doc.id === docId ? updatedDoc : doc));
      
      if (currentDoc && currentDoc.id === docId) {
        setCurrentDoc({ ...currentDoc, name: newName });
      }
      
      return updatedDoc;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Delete document
  const deleteDocument = async (docId) => {
    try {
      const response = await fetch(`/api/documents/${docId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete document');
      
      setDocuments(documents.filter(doc => doc.id !== docId));
      
      if (currentDoc && currentDoc.id === docId) {
        if (provider) {
          provider.disconnect();
        }
        setCurrentDoc(null);
        setYdoc(null);
        setProvider(null);
        setAwareness(null);
        setText('');
      }
      
      return true;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Utility function to generate a consistent color for a user
  function getRandomColor(id) {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#FF9F1C', '#A78BFA', 
      '#10B981', '#F472B6', '#60A5FA', '#FBBF24'
    ];
    
    // Use a simple hash function to get a consistent index
    const hash = id.split('').reduce((acc, char) => {
      return acc + char.charCodeAt(0);
    }, 0);
    
    return colors[hash % colors.length];
  }

  const updateUsername = (newUsername) => {
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
  };

  return (
    <DocumentContext.Provider value={{
      documents,
      currentDoc,
      isLoading,
      error,
      text,
      ydoc,
      provider,
      awareness,
      userId,
      username,
      userColor,
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