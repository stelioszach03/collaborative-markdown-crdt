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

  // Insert text
  const insertText = useCallback((index, text) => {
    if (!ytext) return;
    ytext.insert(index, text);
  }, [ytext]);

  // Delete text
  const deleteText = useCallback((index, length) => {
    if (!ytext) return;
    ytext.delete(index, length);
  }, [ytext]);

  // Undo/Redo
  const undo = useCallback(() => {
    if (!undoManager) return;
    undoManager.undo();
  }, [undoManager]);

  const redo = useCallback(() => {
    if (!undoManager) return;
    undoManager.redo();
  }, [undoManager]);

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
  };
}