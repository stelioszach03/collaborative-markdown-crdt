import { useState, useEffect, useCallback } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import hljs from 'highlight.js';

// Configure marked options
marked.setOptions({
  breaks: true,
  gfm: true,
  headerIds: true,
  mangle: false,
  smartLists: true,
  smartypants: true,
  highlight: function(code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(code, { language: lang }).value;
      } catch (err) {
        console.error('Highlight.js error:', err);
      }
    }
    return hljs.highlightAuto(code).value;
  }
});

/**
 * Hook to handle Markdown rendering and statistics
 * @param {string} markdown - Markdown content to render
 * @returns {object} Rendered HTML and document statistics
 */
const useMarkdown = (markdown = '') => {
  const [html, setHtml] = useState('');
  const [stats, setStats] = useState({
    chars: 0,
    words: 0,
    lines: 0,
    headings: 0,
    lists: 0,
    codeBlocks: 0
  });
  const [isRendering, setIsRendering] = useState(false);

  // Render markdown to HTML
  const renderMarkdown = useCallback((md) => {
    setIsRendering(true);
    
    try {
      // Sanitize HTML output
      const rendered = DOMPurify.sanitize(marked.parse(md));
      setHtml(rendered);
    } catch (err) {
      console.error('Error rendering markdown:', err);
      setHtml(`<p>Error rendering markdown: ${err.message}</p>`);
    }
    
    setIsRendering(false);
  }, []);

  // Calculate document statistics
  const calculateStats = useCallback((md) => {
    if (!md) {
      setStats({
        chars: 0,
        words: 0,
        lines: 0,
        headings: 0,
        lists: 0,
        codeBlocks: 0
      });
      return;
    }

    const lines = md.split('\n');
    const words = md.split(/\s+/).filter(Boolean).length;
    const headings = (md.match(/^#+\s+/gm) || []).length;
    const lists = (md.match(/^[\s]*[-*+]\s+/gm) || []).length + 
                 (md.match(/^[\s]*\d+\.\s+/gm) || []).length;
    const codeBlocks = (md.match(/```[\s\S]*?```/g) || []).length;

    setStats({
      chars: md.length,
      words,
      lines: lines.length,
      headings,
      lists,
      codeBlocks
    });
  }, []);

  // Insert markdown syntax at a specific position
  const insertMarkdown = useCallback((text, position, syntax, options = {}) => {
    const { selectionStart, selectionEnd, prefix = '', suffix = '' } = options;
    
    // Check if text is a valid string
    if (typeof text !== 'string') {
      console.error('Text must be a string');
      return { text, newPosition: position };
    }

    // Handle selections
    if (selectionStart !== undefined && selectionEnd !== undefined && selectionStart !== selectionEnd) {
      // Insert around selection
      const before = text.substring(0, selectionStart);
      const selection = text.substring(selectionStart, selectionEnd);
      const after = text.substring(selectionEnd);
      
      const newText = `${before}${prefix}${syntax}${selection}${suffix}${after}`;
      return { 
        text: newText, 
        newPosition: selectionEnd + prefix.length + syntax.length + suffix.length 
      };
    } else {
      // Insert at cursor position
      const before = text.substring(0, position);
      const after = text.substring(position);
      
      const newText = `${before}${prefix}${syntax}${suffix}${after}`;
      return { 
        text: newText, 
        newPosition: position + prefix.length + syntax.length 
      };
    }
  }, []);

  // Format markdown shortcuts
  const formatMarkdown = useCallback((text, type, selection = { start: 0, end: 0 }) => {
    const { start, end } = selection;
    const selectedText = text.substring(start, end);
    let newText = text;
    let newCursorPos = end;

    switch (type) {
      case 'bold':
        return insertMarkdown(text, end, selectedText || 'bold text', { 
          selectionStart: start, 
          selectionEnd: end,
          prefix: '**',
          suffix: '**'
        });
      
      case 'italic':
        return insertMarkdown(text, end, selectedText || 'italic text', { 
          selectionStart: start, 
          selectionEnd: end,
          prefix: '_',
          suffix: '_'
        });
      
      case 'heading1':
        return insertMarkdown(text, end, selectedText || 'Heading 1', { 
          selectionStart: start, 
          selectionEnd: end,
          prefix: '# '
        });
      
      case 'heading2':
        return insertMarkdown(text, end, selectedText || 'Heading 2', { 
          selectionStart: start, 
          selectionEnd: end,
          prefix: '## '
        });
      
      case 'heading3':
        return insertMarkdown(text, end, selectedText || 'Heading 3', { 
          selectionStart: start, 
          selectionEnd: end,
          prefix: '### '
        });
      
      case 'quote':
        return insertMarkdown(text, end, selectedText || 'Blockquote', { 
          selectionStart: start, 
          selectionEnd: end,
          prefix: '> '
        });
      
      case 'code':
        return insertMarkdown(text, end, selectedText || 'code', { 
          selectionStart: start, 
          selectionEnd: end,
          prefix: '`',
          suffix: '`'
        });
      
      case 'codeblock':
        return insertMarkdown(text, end, selectedText || 'console.log("Hello world!");', { 
          selectionStart: start, 
          selectionEnd: end,
          prefix: '```javascript\n',
          suffix: '\n```'
        });
      
      case 'link':
        if (selectedText) {
          return insertMarkdown(text, end, selectedText, { 
            selectionStart: start, 
            selectionEnd: end,
            prefix: '[',
            suffix: '](url)'
          });
        } else {
          return insertMarkdown(text, end, 'link text', { 
            selectionStart: start, 
            selectionEnd: end,
            prefix: '[',
            suffix: '](url)'
          });
        }
      
      case 'image':
        return insertMarkdown(text, end, '', { 
          selectionStart: start, 
          selectionEnd: end,
          prefix: '![alt text](',
          suffix: ')'
        });
      
      case 'list':
        return insertMarkdown(text, end, selectedText || 'List item', { 
          selectionStart: start, 
          selectionEnd: end,
          prefix: '- '
        });
      
      case 'numbered-list':
        return insertMarkdown(text, end, selectedText || 'List item', { 
          selectionStart: start, 
          selectionEnd: end,
          prefix: '1. '
        });
      
      case 'horizontal-rule':
        return insertMarkdown(text, end, '\n---\n');
      
      default:
        return { text, newPosition: end };
    }
  }, [insertMarkdown]);

  // Update HTML and stats when markdown changes
  useEffect(() => {
    renderMarkdown(markdown);
    calculateStats(markdown);
  }, [markdown, renderMarkdown, calculateStats]);

  return {
    html,
    stats,
    isRendering,
    formatMarkdown
  };
};

export default useMarkdown;