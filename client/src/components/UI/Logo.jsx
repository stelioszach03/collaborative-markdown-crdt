import React from 'react';
import { Box, useColorMode } from '@chakra-ui/react';

const Logo = ({ height = "32px" }) => {
  const { colorMode } = useColorMode();
  const fillColor = colorMode === 'dark' ? '#ffffff' : '#0073ff';
  
  return (
    <Box height={height} width="auto">
      <svg 
        height="100%" 
        viewBox="0 0 120 120" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="120" height="120" rx="24" fill={colorMode === 'dark' ? '#1E293B' : '#EBF8FF'} />
        <path 
          d="M92 36H28V84H92V36Z" 
          stroke={fillColor} 
          strokeWidth="4" 
          strokeLinejoin="round"
        />
        <path 
          d="M38 50H82" 
          stroke={fillColor} 
          strokeWidth="4" 
          strokeLinecap="round" 
        />
        <path 
          d="M38 64H82" 
          stroke={fillColor} 
          strokeWidth="4" 
          strokeLinecap="round" 
        />
        <path 
          d="M38 78H62" 
          stroke={fillColor} 
          strokeWidth="4" 
          strokeLinecap="round" 
        />
        <circle 
          cx="85" 
          cy="78" 
          r="6" 
          fill={colorMode === 'dark' ? '#63B3ED' : '#0073FF'} 
        />
        <circle 
          cx="70" 
          cy="78" 
          r="6" 
          fill={colorMode === 'dark' ? '#9F7AEA' : '#805AD5'} 
        />
      </svg>
    </Box>
  );
};

export default Logo;