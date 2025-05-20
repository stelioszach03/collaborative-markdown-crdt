import { useEffect, useCallback, useState } from 'react';

export function useWebSocket(url) {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const [messages, setMessages] = useState([]);
  
  // Connect to WebSocket
  useEffect(() => {
    if (!url) return;

    const ws = new WebSocket(url);
    
    ws.onopen = () => {
      setIsConnected(true);
      setError(null);
    };
    
    ws.onclose = () => {
      setIsConnected(false);
    };
    
    ws.onerror = (event) => {
      setError('WebSocket error');
      console.error('WebSocket error:', event);
    };
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setMessages(prev => [...prev, data]);
      } catch (e) {
        console.error('Error parsing WebSocket message:', e);
      }
    };
    
    setSocket(ws);
    
    // Cleanup
    return () => {
      ws.close();
    };
  }, [url]);
  
  // Send message
  const sendMessage = useCallback((message) => {
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      setError('WebSocket is not connected');
      return false;
    }
    
    try {
      socket.send(typeof message === 'string' ? message : JSON.stringify(message));
      return true;
    } catch (e) {
      setError('Failed to send message');
      console.error('Error sending message:', e);
      return false;
    }
  }, [socket]);
  
  // Clear messages
  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);
  
  return {
    socket,
    isConnected,
    error,
    messages,
    sendMessage,
    clearMessages,
  };
}