import { useEffect, useState, useRef, useCallback } from 'react';
import * as Y from 'yjs';
import { encodeStateAsUpdate, applyUpdate } from 'yjs';
import useWebSocket from './useWebSocket';
import { useDocuments } from '../context/DocumentContext';

/**
 * Hook to manage CRDT document with Yjs
 * @param {string} documentId - ID of the document to edit
 * @returns {object} CRDT state and methods
 */
const useCRDT = (documentId) => {
  const { user } = useDocuments();
  const [isReady, setIsReady] = useState(false);
  const [text, setText] = useState('');
  const [activeUsers, setActiveUsers] = useState([]);
  
  const docRef = useRef(new Y.Doc());
  const textRef = useRef(docRef.current.getText('content'));
  const isInitialSyncRef = useRef(true);
  const lastUpdateTimeRef = useRef(Date.now());
  
  // Set up WebSocket connection
  const wsUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws/${documentId}`;
  
  const { 
    isConnected, 
    sendMessage, 
    connect 
  } = useWebSocket(wsUrl, {
    autoConnect: true,
    onOpen: handleOpen,
    onMessage: handleMessage,
    onClose: handleClose,
  });

  // Handle WebSocket open
  function handleOpen() {
    console.log('WebSocket connection established');
    
    // Send initial sync request
    const update = encodeStateAsUpdate(docRef.current);
    const message = JSON.stringify({
      type: 'sync',
      update: Buffer.from(update).toString('base64'),
    });
    
    sendMessage(message);
    
    // Update awareness state
    updateAwareness();
  }

  // Handle incoming WebSocket messages
  function handleMessage(event) {
    try {
      const message = JSON.parse(event.data);
      
      if (message.type === 'sync') {
        // Apply incoming updates
        const update = Buffer.from(message.update, 'base64');
        
        Y.applyUpdate(docRef.current, update, 'remote');
        
        // After initial sync, text is ready to use
        if (isInitialSyncRef.current) {
          isInitialSyncRef.current = false;
          setIsReady(true);
        }
        
        // Update the text state after applying the update
        const newText = textRef.current.toString();
        setText(newText);
      } else if (message.type === 'awareness') {
        // Update active users from awareness states
        if (message.states) {
          try {
            const awarenessData = JSON.parse(message.states);
            const users = Object.values(awarenessData)
              .filter(state => state && state.user)
              .map(state => ({
                clientId: state.clientId,
                user: state.user,
                selection: state.selection
              }));
            
            setActiveUsers(users);
          } catch (err) {
            console.error('Error parsing awareness data:', err);
          }
        }
      }
    } catch (err) {
      console.error('Error handling WebSocket message:', err);
    }
  }

  // Handle WebSocket close
  function handleClose() {
    console.log('WebSocket connection closed');
  }

  // Update local awareness state (user info and cursor)
  const updateAwareness = useCallback((selection = null) => {
    if (!user || !isConnected) return;
    
    const awarenessState = {
      clientId: docRef.current.clientID,
      user: {
        id: user.id,
        name: user.name,
        color: user.color
      },
      selection
    };
    
    const message = JSON.stringify({
      type: 'awareness',
      states: JSON.stringify({
        [docRef.current.clientID]: awarenessState
      })
    });
    
    sendMessage(message);
  }, [user, isConnected, sendMessage]);

  // Handle local text changes
  const handleTextChange = useCallback((newText) => {
    // Only apply if different from current state
    if (newText === textRef.current.toString()) return;
    
    // Apply change to Yjs doc
    docRef.current.transact(() => {
      textRef.current.delete(0, textRef.current.length);
      textRef.current.insert(0, newText);
    }, 'local');
    
    // Update last change time
    lastUpdateTimeRef.current = Date.now();
    
    // Send update to server
    const update = encodeStateAsUpdate(docRef.current);
    const message = JSON.stringify({
      type: 'update',
      update: Buffer.from(update).toString('base64'),
      origin: {
        userId: user?.id || 'unknown',
        username: user?.name || 'Unknown User',
        color: user?.color || '#cccccc',
        changeSize: Math.abs(newText.length - textRef.current.length),
        timestamp: Date.now()
      }
    });
    
    sendMessage(message);
  }, [user, sendMessage]);

  // Update text state when Yjs doc changes
  useEffect(() => {
    const handleYTextChange = () => {
      const newText = textRef.current.toString();
      setText(newText);
    };
    
    // Subscribe to Yjs document changes
    textRef.current.observe(handleYTextChange);
    
    return () => {
      textRef.current.unobserve(handleYTextChange);
    };
  }, []);

  // Keep updating awareness regularly
  useEffect(() => {
    const interval = setInterval(() => {
      updateAwareness();
    }, 3000);
    
    return () => clearInterval(interval);
  }, [updateAwareness]);

  // Reconnect WebSocket if documentId changes
  useEffect(() => {
    if (documentId) {
      isInitialSyncRef.current = true;
      setIsReady(false);
      connect();
    }
  }, [documentId, connect]);

  return {
    text,
    setText: handleTextChange,
    isReady,
    isConnected,
    activeUsers,
    updateCursorPosition: updateAwareness,
    ydoc: docRef.current
  };
};

export default useCRDT;