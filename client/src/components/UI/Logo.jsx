import React, { memo } from 'react';
import { Box, useColorMode } from '@chakra-ui/react';

/**
 * Logo Component - The application logo with light/dark mode support
 * 
 * @param {Object} props - Component properties
 * @param {string|number} [props.height="32px"] - The height of the logo
 * @param {string} [props.className] - Additional CSS classes
 * @returns {JSX.Element} The SVG logo of the application
 */
const Logo = ({ height = "32px", className = "", ...rest }) => {
  const { colorMode } = useColorMode();
  
  // Colors based on theme (light/dark mode)
  const fillColor = colorMode === 'dark' ? '#ffffff' : '#0073ff';
  const bgColor = colorMode === 'dark' ? '#1E293B' : '#EBF8FF';
  const accentColor1 = colorMode === 'dark' ? '#63B3ED' : '#0073FF';
  const accentColor2 = colorMode === 'dark' ? '#9F7AEA' : '#805AD5';
  
  return (
    <Box 
      height={height} 
      width="auto" 
      className={`app-logo ${className}`}
      {...rest}
      transition="all 0.2s"
    >
      <svg 
        height="100%" 
        viewBox="0 0 512 512" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        aria-label="CollabMD Logo"
        role="img"
      >
        {/* Background rounded square */}
        <rect width="512" height="512" rx="96" fill={bgColor} />
        
        {/* Paper base */}
        <path
          d="M396 112H116V400H396V112Z"
          fill="white"
          stroke={fillColor}
          strokeWidth="16"
          strokeLinejoin="round"
        />
        
        {/* Markdown lines */}
        <path
          d="M164 176H348"
          stroke={fillColor}
          strokeWidth="16"
          strokeLinecap="round"
        />
        <path
          d="M164 224H348"
          stroke={fillColor}
          strokeWidth="16"
          strokeLinecap="round"
        />
        <path
          d="M164 272H280"
          stroke={fillColor}
          strokeWidth="16"
          strokeLinecap="round"
        />
        <path
          d="M164 320H240"
          stroke={fillColor}
          strokeWidth="16"
          strokeLinecap="round"
        />
        
        {/* Hash symbol for Markdown */}
        <path
          d="M190 150L174 202M222 150L206 202M164 163H230M152 189H218"
          stroke={accentColor1}
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Collab dots */}
        <circle cx="340" cy="320" r="24" fill={accentColor1} />
        <circle cx="380" cy="320" r="24" fill={accentColor2} />
        
        {/* Cursor */}
        <rect x="314" y="272" width="4" height="20" fill={accentColor1}>
          <animate
            attributeName="opacity"
            values="1;0;1"
            dur="1.5s"
            repeatCount="indefinite"
          />
        </rect>
      </svg>
    </Box>
  );
};

// Use memo for performance optimization - logo rarely changes
export default memo(Logo);