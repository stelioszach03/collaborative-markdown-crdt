import { useEffect, useState, useRef, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

/**
 * Hook to manage WebSocket connections with auto-reconnect functionality
 * @param {string} url - WebSocket URL
 * @param {object} options - Connection options
 * @returns {object} WebSocket state and methods
 */
const useWebSocket = (url, options = {}) => {
  const {
    reconnectInterval = 2000,
    reconnectAttempts = 10,
    onOpen,
    onMessage,
    onClose,
    onError,
    autoConnect = true,
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);
  const [reconnectCount, setReconnectCount] = useState(0);
  const [error, setError] = useState(null);
  
  const socketRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const messageQueueRef = useRef([]);
  const connIdRef = useRef(uuidv4());

  // Create a new WebSocket connection
  const connect = useCallback(() => {
    try {
      // Close existing connection if any
      if (socketRef.current) {
        socketRef.current.close();
      }

      // Create new connection
      socketRef.current = new WebSocket(url);
      
      // Set up event handlers
      socketRef.current.onopen = (event) => {
        setIsConnected(true);
        setReconnectCount(0);
        setError(null);
        
        console.log(`WebSocket connection established to ${url}`);
        
        // Send any queued messages
        if (messageQueueRef.current.length > 0) {
          messageQueueRef.current.forEach(msg => {
            socketRef.current.send(msg);
          });
          messageQueueRef.current = [];
        }
        
        if (onOpen) onOpen(event);
      };
      
      socketRef.current.onmessage = (event) => {
        setLastMessage(event.data);
        if (onMessage) onMessage(event);
      };
      
      socketRef.current.onclose = (event) => {
        setIsConnected(false);
        console.log(`WebSocket connection closed: ${event.code} ${event.reason}`);
        
        // Try to reconnect unless this was a clean closure or max attempts reached
        if (!event.wasClean && reconnectCount < reconnectAttempts) {
          reconnectTimeoutRef.current = setTimeout(() => {
            setReconnectCount(prev => prev + 1);
            connect();
          }, reconnectInterval);
        } else if (reconnectCount >= reconnectAttempts) {
          setError(new Error('Maximum reconnection attempts reached'));
        }
        
        if (onClose) onClose(event);
      };
      
      socketRef.current.onerror = (event) => {
        console.error('WebSocket error:', event);
        setError(new Error('WebSocket connection error'));
        if (onError) onError(event);
      };
    } catch (err) {
      console.error('Error creating WebSocket connection:', err);
      setError(err);
    }
  }, [url, reconnectInterval, reconnectAttempts, reconnectCount, onOpen, onMessage, onClose, onError]);

  // Send a message through the WebSocket
  const sendMessage = useCallback((data) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(data);
      return true;
    } else {
      // Queue message to send when connection is established
      messageQueueRef.current.push(data);
      
      // Try to reconnect if not already connected
      if (!isConnected && reconnectCount < reconnectAttempts) {
        connect();
      }
      
      return false;
    }
  }, [isConnected, reconnectCount, reconnectAttempts, connect]);

  // Disconnect WebSocket
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    if (socketRef.current) {
      socketRef.current.close(1000, 'Closed by client');
      socketRef.current = null;
    }
    
    setIsConnected(false);
  }, []);

  // Connect on mount if autoConnect is true
  useEffect(() => {
    if (autoConnect) {
      connect();
    }
    
    // Cleanup on unmount
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      
      if (socketRef.current) {
        socketRef.current.close(1000, 'Component unmounted');
      }
    };
  }, [autoConnect, connect]);

  return {
    isConnected,
    lastMessage,
    sendMessage,
    connect,
    disconnect,
    reconnectCount,
    error,
    connectionId: connIdRef.current
  };
};

export default useWebSocket;