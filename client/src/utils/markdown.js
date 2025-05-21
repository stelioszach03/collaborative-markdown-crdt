import { marked } from 'marked';
import DOMPurify from 'dompurify';
import hljs from 'highlight.js';

// Configure marked
marked.setOptions({
  breaks: true,
  gfm: true,
  headerIds: true,
  mangle: false,
  smartLists: true,
  smartypants: true,
  highlight: (code, lang) => {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(code, { language: lang }).value;
      } catch (e) {
        console.error(e);
      }
    }
    return hljs.highlightAuto(code).value;
  }
});

/**
 * Render markdown to sanitized HTML
 * @param {string} markdown - The markdown to render
 * @returns {string} The sanitized HTML
 */
export const renderMarkdown = (markdown) => {
  try {
    const html = marked.parse(markdown);
    return DOMPurify.sanitize(html);
  } catch (error) {
    console.error('Error rendering markdown:', error);
    return `<p>Error rendering markdown: ${error.message}</p>`;
  }
};

/**
 * Extract document statistics from a text
 * @param {string} text - The text to analyze
 * @returns {Object} The statistics
 */
export const getDocumentStats = (text) => {
  if (!text) {
    return {
      chars: 0,
      words: 0,
      lines: 0,
      headings: 0,
      lists: 0,
      codeBlocks: 0
    };
  }
  
  const lines = text.split('\n');
  const words = text.split(/\s+/).filter(Boolean).length;
  const headings = (text.match(/^#+\s+/gm) || []).length;
  const lists = (text.match(/^[\s]*[-*+]\s+/gm) || []).length + 
               (text.match(/^[\s]*\d+\.\s+/gm) || []).length;
  const codeBlocks = (text.match(/```[\s\S]*?```/g) || []).length;
  
  return {
    chars: text.length,
    words,
    lines: lines.length,
    headings,
    lists,
    codeBlocks
  };
};

/**
 * Get a markdown template for a new document
 * @returns {string} A markdown template
 */
export const getMarkdownTemplate = () => {
  return `# Untitled Document

## Introduction
Start writing your document here.

## Features
- **Real-time collaboration**: Multiple users can edit the same document simultaneously
- **Markdown support**: Write in Markdown and see the preview in real-time
- **History tracking**: Document changes are tracked and can be visualized

## Getting Started
1. Edit this document in the editor on the left
2. See the preview on the right
3. Share the document URL with others to collaborate

\`\`\`javascript
// Add some code here
console.log("Hello, Collaborative Markdown Editor!");
\`\`\`

> You can also add blockquotes, lists, and more using Markdown syntax.

Happy editing!
`;
};

/**
 * Insert markdown syntax at cursor position
 * @param {string} text - The current text
 * @param {number} position - The cursor position
 * @param {string} syntax - The markdown syntax to insert
 * @param {Object} options - Additional options
 * @returns {Object} The new text and cursor position
 */
export const insertMarkdown = (text, position, syntax, options = {}) => {
  const { selectionStart, selectionEnd, prefix = '', suffix = '' } = options;
  
  // Check if text is a string
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
};