import { useCallback, useEffect, useState } from 'react';
import * as Y from 'yjs';
import { useDocument } from '../context/DocumentContext';
import { debounce } from '../utils/crdt';

export function useCRDT(docId) {
  const { 
    ydoc, 
    provider, 
    awareness, 
    userId, 
    username, 
    connectToDocument 
  } = useDocument();
  
  const [ytext, setYtext] = useState(null);
  const [connected, setConnected] = useState(false);
  const [awarenessStates, setAwarenessStates] = useState(new Map());
  const [undoManager, setUndoManager] = useState(null);
  const [lastEditTime, setLastEditTime] = useState(Date.now());
  const [editDuration, setEditDuration] = useState(0);

  // Connect to document
  useEffect(() => {
    if (!docId) return;
    
    const { ytext: newYtext, provider: newProvider } = connectToDocument(docId);
    setYtext(newYtext);
    
    // Setup connection status
    const handleStatus = ({ status }) => {
      setConnected(status === 'connected');
    };

    newProvider.on('status', handleStatus);
    setConnected(newProvider.wsconnected);

    // Create undo manager
    const newUndoManager = new Y.UndoManager(newYtext);
    setUndoManager(newUndoManager);

    return () => {
      newProvider.off('status', handleStatus);
      newUndoManager.destroy();
    };
  }, [docId, connectToDocument]);

  // Track awareness updates
  useEffect(() => {
    if (!awareness) return;

    const updateAwareness = () => {
      const states = new Map();
      awareness.getStates().forEach((state, clientId) => {
        if (state.userId && state.userId !== userId) {
          states.set(clientId, state);
        }
      });
      setAwarenessStates(states);
    };

    updateAwareness(); // Initial state
    awareness.on('change', updateAwareness);

    return () => {
      awareness.off('change', updateAwareness);
    };
  }, [awareness, userId]);

  // Track edit duration
  useEffect(() => {
    const interval = setInterval(() => {
      if (connected) {
        setEditDuration(prev => prev + 1);
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [connected]);

  // Update cursor position
  const updateCursor = useCallback((position, selection = null) => {
    if (!awareness) return;
    
    const current = awareness.getLocalState();
    if (current) {
      awareness.setLocalState({
        ...current,
        cursor: position,
        selection,
      });
    }
  }, [awareness]);

  // Debounced cursor update
  const debouncedUpdateCursor = useCallback(
    debounce(updateCursor, 50),
    [updateCursor]
  );

  // Insert text with metadata
  const insertText = useCallback((index, text) => {
    if (!ytext) return;
    
    // Calculate time since last edit
    const now = Date.now();
    const timeSinceLastEdit = now - lastEditTime;
    setLastEditTime(now);
    
    // Create origin object with metadata
    const origin = {
      userId,
      username,
      changeSize: text.length,
      duration: Math.min(timeSinceLastEdit / 1000, 300), // Cap at 5 minutes
      timestamp: now
    };
    
    ytext.insert(index, text, origin);
  }, [ytext, userId, username, lastEditTime]);

  // Delete text with metadata
  const deleteText = useCallback((index, length) => {
    if (!ytext) return;
    
    // Calculate time since last edit
    const now = Date.now();
    const timeSinceLastEdit = now - lastEditTime;
    setLastEditTime(now);
    
    // Create origin object with metadata
    const origin = {
      userId,
      username,
      changeSize: -length,
      duration: Math.min(timeSinceLastEdit / 1000, 300), // Cap at 5 minutes
      timestamp: now
    };
    
    ytext.delete(index, length, origin);
  }, [ytext, userId, username, lastEditTime]);

  // Undo/Redo
  const undo = useCallback(() => {
    if (!undoManager) return;
    
    const origin = {
      userId,
      username,
      isRevision: true,
      timestamp: Date.now()
    };
    
    undoManager.undo(origin);
  }, [undoManager, userId, username]);

  const redo = useCallback(() => {
    if (!undoManager) return;
    
    const origin = {
      userId,
      username,
      isRevision: true,
      timestamp: Date.now()
    };
    
    undoManager.redo(origin);
  }, [undoManager, userId, username]);

  return {
    ytext,
    connected,
    awareness,
    awarenessStates,
    insertText,
    deleteText,
    updateCursor,
    debouncedUpdateCursor,
    undo,
    redo,
    editDuration,
  };
}