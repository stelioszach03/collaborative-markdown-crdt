import React, { useMemo } from 'react';
import { Box, useColorModeValue } from '@chakra-ui/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';

const MarkdownPreview = ({ content }) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'gray.100');
  
  // Optimize rendering with useMemo
  const renderedMarkdown = useMemo(() => {
    return (
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeHighlight]}
      >
        {content}
      </ReactMarkdown>
    );
  }, [content]);

  return (
    <Box
      width="full"
      height="full"
      padding="5"
      bg={bgColor}
      color={textColor}
      borderLeft="1px"
      borderColor={borderColor}
      overflowY="auto"
      className="markdown-preview"
    >
      {renderedMarkdown}
    </Box>
  );
};

export default MarkdownPreview;