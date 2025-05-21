/**
 * Utility functions for Markdown operations
 */

// Get markdown syntax for different elements
export const markdownSyntax = {
  heading: (level) => '#'.repeat(level) + ' ',
  bold: '**',
  italic: '*',
  link: {
    start: '[',
    middle: '](',
    end: ')',
  },
  image: {
    start: '![',
    middle: '](',
    end: ')',
  },
  code: {
    inline: '`',
    block: '```',
  },
  blockquote: '> ',
  listItem: {
    unordered: '- ',
    ordered: (num) => `${num}. `,
    task: '- [ ] '
  },
  horizontalRule: '---',
  strikethrough: '~~',
  table: {
    header: '| Header | Header |\n| --- | --- |',
    row: '| Cell | Cell |',
  },
};

// Insert markdown syntax at cursor position
export function insertMarkdown(text, syntax, selection, options = {}) {
  const selectionText = text.substring(selection.start, selection.end);
  let result;
  
  switch (syntax) {
    case 'heading':
      const level = options.level || 1;
      result = text.substring(0, selection.start) + 
        markdownSyntax.heading(level) + selectionText + 
        text.substring(selection.end);
      return result;
      
    case 'bold':
      result = text.substring(0, selection.start) + 
        markdownSyntax.bold + selectionText + markdownSyntax.bold + 
        text.substring(selection.end);
      return result;
      
    case 'italic':
      result = text.substring(0, selection.start) + 
        markdownSyntax.italic + selectionText + markdownSyntax.italic + 
        text.substring(selection.end);
      return result;
      
    case 'link':
      const url = options.url || '';
      result = text.substring(0, selection.start) + 
        markdownSyntax.link.start + (selectionText || 'link text') + 
        markdownSyntax.link.middle + url + markdownSyntax.link.end + 
        text.substring(selection.end);
      return result;
      
    case 'image':
      const imgUrl = options.url || '';
      const altText = selectionText || 'image';
      result = text.substring(0, selection.start) + 
        markdownSyntax.image.start + altText + 
        markdownSyntax.image.middle + imgUrl + markdownSyntax.image.end + 
        text.substring(selection.end);
      return result;
      
    case 'code-inline':
      result = text.substring(0, selection.start) + 
        markdownSyntax.code.inline + selectionText + markdownSyntax.code.inline + 
        text.substring(selection.end);
      return result;
      
    case 'code-block':
      const language = options.language || '';
      result = text.substring(0, selection.start) + 
        markdownSyntax.code.block + language + '\n' + 
        selectionText + '\n' + markdownSyntax.code.block + 
        text.substring(selection.end);
      return result;
      
    case 'blockquote':
      // Add blockquote to each line
      const lines = selectionText.split('\n');
      const quotedLines = lines.map(line => markdownSyntax.blockquote + line);
      result = text.substring(0, selection.start) + 
        quotedLines.join('\n') + 
        text.substring(selection.end);
      return result;
      
    case 'unordered-list':
      if (selectionText.trim() === '') {
        result = text.substring(0, selection.start) + 
          markdownSyntax.listItem.unordered + 
          text.substring(selection.end);
      } else {
        const listLines = selectionText.split('\n');
        const unorderedListLines = listLines.map(line => markdownSyntax.listItem.unordered + line);
        result = text.substring(0, selection.start) + 
          unorderedListLines.join('\n') + 
          text.substring(selection.end);
      }
      return result;
      
    case 'ordered-list':
      if (selectionText.trim() === '') {
        result = text.substring(0, selection.start) + 
          markdownSyntax.listItem.ordered(1) + 
          text.substring(selection.end);
      } else {
        const listLines = selectionText.split('\n');
        const orderedListLines = listLines.map((line, i) => 
          markdownSyntax.listItem.ordered(i + 1) + line
        );
        result = text.substring(0, selection.start) + 
          orderedListLines.join('\n') + 
          text.substring(selection.end);
      }
      return result;
      
    case 'task-list':
      if (selectionText.trim() === '') {
        result = text.substring(0, selection.start) + 
          markdownSyntax.listItem.task + 
          text.substring(selection.end);
      } else {
        const listLines = selectionText.split('\n');
        const taskListLines = listLines.map(line => markdownSyntax.listItem.task + line);
        result = text.substring(0, selection.start) + 
          taskListLines.join('\n') + 
          text.substring(selection.end);
      }
      return result;
      
    case 'horizontal-rule':
      result = text.substring(0, selection.start) + 
        '\n' + markdownSyntax.horizontalRule + '\n' + 
        text.substring(selection.end);
      return result;
      
    case 'strikethrough':
      result = text.substring(0, selection.start) + 
        markdownSyntax.strikethrough + selectionText + markdownSyntax.strikethrough + 
        text.substring(selection.end);
      return result;
      
    case 'table':
      result = text.substring(0, selection.start) + 
        markdownSyntax.table.header + '\n' + markdownSyntax.table.row + 
        text.substring(selection.end);
      return result;
      
    default:
      return text;
  }
}

// Check if a line is a heading
export function isHeading(line) {
  return /^(#{1,6})\s/.test(line);
}

// Get heading level (1-6) from a line
export function getHeadingLevel(line) {
  const match = line.match(/^(#{1,6})\s/);
  return match ? match[1].length : 0;
}

// Extract table of contents from markdown
export function extractTableOfContents(markdown) {
  if (!markdown) return [];
  
  const lines = markdown.split('\n');
  const toc = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (isHeading(line)) {
      const level = getHeadingLevel(line);
      const text = line.substring(level + 1).trim();
      const id = text.toLowerCase().replace(/[^\w]+/g, '-');
      
      toc.push({
        level,
        text,
        id,
        line: i,
      });
    }
  }
  
  return toc;
}

// Parse markdown frontmatter if present
export function parseFrontmatter(markdown) {
  const match = markdown.match(/^---\n([\s\S]*?)\n---/);
  
  if (!match) return { frontmatter: null, content: markdown };
  
  const frontmatterStr = match[1];
  const content = markdown.substring(match[0].length).trim();
  
  // Parse frontmatter
  const frontmatter = {};
  frontmatterStr.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split(':');
    if (key && valueParts.length) {
      frontmatter[key.trim()] = valueParts.join(':').trim();
    }
  });
  
  return { frontmatter, content };
}

// Count words in markdown text
export function countWords(text) {
  // Remove code blocks
  const noCodeBlocks = text.replace(/```[\s\S]*?```/g, '');
  
  // Remove inline code
  const noCode = noCodeBlocks.replace(/`[^`]*`/g, '');
  
  // Remove URLs
  const noUrls = noCode.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1').replace(/https?:\/\/[^\s)]+/g, '');
  
  // Count words
  return noUrls.split(/\s+/).filter(word => word.length > 0).length;
}

// Estimate read time in minutes
export function estimateReadTime(text) {
  const words = countWords(text);
  const wordsPerMinute = 200; // Average reading speed
  return Math.max(1, Math.ceil(words / wordsPerMinute));
}

// Check if text has unsaved changes compared to saved version
export function hasUnsavedChanges(currentText, savedText) {
  return currentText !== savedText;
}

// Format code block with specified language
export function formatCodeBlock(code, language) {
  return `\`\`\`${language}\n${code}\n\`\`\``;
}