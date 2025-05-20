import { useState, useEffect, useCallback } from 'react';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeHighlight from 'rehype-highlight';

export function useMarkdown(markdown) {
  const [html, setHtml] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  // Parse markdown to HTML
  const processMarkdown = useCallback(async (text) => {
    if (!text) {
      setHtml('');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Dynamically import React Markdown to reduce initial load time
      const { default: ReactMarkdown } = await import('react-markdown');
      
      // Use renderToString to convert the React component to HTML
      const { renderToString } = await import('react-dom/server');
      
      const element = ReactMarkdown({
        children: text,
        remarkPlugins: [remarkGfm],
        rehypePlugins: [rehypeRaw, rehypeHighlight],
      });
      
      const rendered = renderToString(element);
      setHtml(rendered);
    } catch (err) {
      console.error('Error processing markdown:', err);
      setError('Failed to process markdown');
    } finally {
      setIsProcessing(false);
    }
  }, []);

  // Process markdown when it changes
  useEffect(() => {
    const timer = setTimeout(() => {
      processMarkdown(markdown);
    }, 300); // Debounce markdown processing
    
    return () => clearTimeout(timer);
  }, [markdown, processMarkdown]);

  // Utility functions for editing
  const insertHeading = useCallback((text, level = 1) => {
    const prefix = '#'.repeat(level) + ' ';
    return prefix + text;
  }, []);

  const insertBold = useCallback((text) => {
    return `**${text}**`;
  }, []);

  const insertItalic = useCallback((text) => {
    return `*${text}*`;
  }, []);

  const insertLink = useCallback((text, url = '') => {
    return `[${text}](${url})`;
  }, []);

  const insertImage = useCallback((altText, url = '') => {
    return `![${altText}](${url})`;
  }, []);

  const insertCodeBlock = useCallback((code, language = '') => {
    return `\`\`\`${language}\n${code}\n\`\`\``;
  }, []);

  const insertInlineCode = useCallback((code) => {
    return `\`${code}\``;
  }, []);

  const insertBlockquote = useCallback((text) => {
    return `> ${text}`;
  }, []);

  const insertListItem = useCallback((text, ordered = false) => {
    return ordered ? `1. ${text}` : `- ${text}`;
  }, []);

  return {
    html,
    isProcessing,
    error,
    insertHeading,
    insertBold,
    insertItalic,
    insertLink,
    insertImage,
    insertCodeBlock,
    insertInlineCode,
    insertBlockquote,
    insertListItem,
  };
}