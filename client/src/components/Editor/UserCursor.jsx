import { useEffect, useState, useRef } from 'react';
import { Box, Text } from '@chakra-ui/react';
import { useDocuments } from '../../context/DocumentContext';

const UserCursor = ({ user, selection, editorRef }) => {
  const { user: currentUser } = useDocuments();
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [visible, setVisible] = useState(false);
  const cursorRef = useRef(null);

  // Don't show the current user's cursor
  if (!user || !selection || (currentUser && user.id === currentUser.id)) {
    return null;
  }

  // Update cursor position when selection changes
  useEffect(() => {
    if (!editorRef.current || !selection) return;

    // Get editor element
    const editorElement = editorRef.current;
    
    // Try to get cursor coordinates from CodeMirror
    const cmEditor = editorElement.querySelector('.cm-editor');
    if (!cmEditor) return;
    
    // Find cursor position
    try {
      // Find the position of the cursor in the editor
      const cmContent = cmEditor.querySelector('.cm-content');
      if (!cmContent) return;
      
      // Get editor container coordinates
      const editorRect = editorElement.getBoundingClientRect();
      
      // Try to find cursor position by looking at the line and character position
      const lines = cmContent.querySelectorAll('.cm-line');
      
      // Count characters to find the right position
      let charCount = 0;
      let foundLine = null;
      let lineTop = 0;
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const lineLength = line.textContent.length + 1; // +1 for the newline
        
        if (charCount + lineLength > selection.head) {
          foundLine = line;
          lineTop = line.offsetTop;
          break;
        }
        
        charCount += lineLength;
      }
      
      if (foundLine) {
        // Approximate horizontal position (not perfect, but gives a reasonable estimate)
        // For a more accurate position, we would need to account for character width
        const charsInLine = selection.head - charCount;
        const avgCharWidth = 8; // Average character width in pixels
        
        const x = charsInLine * avgCharWidth;
        const y = lineTop;
        
        setPosition({
          x,
          y
        });
        
        setVisible(true);
      }
    } catch (error) {
      console.error('Error calculating cursor position:', error);
      setVisible(false);
    }
  }, [selection, editorRef]);

  // Don't render if cursor isn't visible
  if (!visible) return null;

  return (
    <Box
      ref={cursorRef}
      className="user-cursor"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
      zIndex="5"
    >
      <Box 
        className="name-flag"
        bg={user.color}
        mb={1}
      >
        {user.name}
      </Box>
      <Box 
        className="cursor" 
        bg={user.color}
      />
    </Box>
  );
};

export default UserCursor;