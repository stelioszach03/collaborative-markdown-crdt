import { memo, useEffect, useRef } from 'react';
import { Box } from '@chakra-ui/react';
import { useTheme } from '../../context/ThemeContext';

// Memoized component to prevent unnecessary re-renders
const MarkdownPreview = memo(({ html }) => {
  const previewRef = useRef(null);
  const { theme } = useTheme();

  // Fix code highlighting when theme changes
  useEffect(() => {
    if (previewRef.current) {
      // Force repaint for code blocks when theme changes
      const codeBlocks = previewRef.current.querySelectorAll('pre code');
      codeBlocks.forEach(block => {
        block.classList.toggle('dark', theme === 'dark');
      });
    }
  }, [theme, html]);

  // Handle link clicks to open in new tab
  useEffect(() => {
    if (previewRef.current) {
      const links = previewRef.current.querySelectorAll('a');
      
      links.forEach(link => {
        // Only set for links without click handlers and internal links
        if (!link.getAttribute('target')) {
          link.setAttribute('target', '_blank');
          link.setAttribute('rel', 'noopener noreferrer');
        }
      });
    }
  }, [html]);

  return (
    <Box 
      ref={previewRef}
      className="markdown-preview"
      dangerouslySetInnerHTML={{ __html: html }}
      bg="editor.light"
      _dark={{ bg: "editor.dark" }}
      p={6}
      borderRadius="md"
      overflowX="auto"
      height="100%"
    />
  );
});

// Display name for debugging
MarkdownPreview.displayName = 'MarkdownPreview';

export default MarkdownPreview;