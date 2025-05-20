import React, { memo } from 'react';
import { Box, useColorMode } from '@chakra-ui/react';

/**
 * Logo Component - Το λογότυπο της εφαρμογής
 * 
 * @param {Object} props - Component properties
 * @param {string|number} [props.height="32px"] - Το ύψος του λογότυπου
 * @param {string} [props.className] - Επιπλέον CSS classes
 * @returns {JSX.Element} Το SVG λογότυπο της εφαρμογής
 */
const Logo = ({ height = "32px", className = "", ...rest }) => {
  const { colorMode } = useColorMode();
  
  // Χρώματα με βάση το θέμα (light/dark mode)
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
    >
      <svg 
        height="100%" 
        viewBox="0 0 120 120" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        aria-label="CollabMD Logo"
        role="img"
      >
        {/* Rounded rectangle background */}
        <rect width="120" height="120" rx="24" fill={bgColor} />
        
        {/* Document outline */}
        <path 
          d="M92 36H28V84H92V36Z" 
          stroke={fillColor} 
          strokeWidth="4" 
          strokeLinejoin="round"
        />
        
        {/* Document content lines */}
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
        
        {/* Collaboration dots */}
        <circle 
          cx="85" 
          cy="78" 
          r="6" 
          fill={accentColor1}
        />
        <circle 
          cx="70" 
          cy="78" 
          r="6" 
          fill={accentColor2}
        />
      </svg>
    </Box>
  );
};

// Χρήση του memo για βελτιωμένη απόδοση, καθώς το logo σπάνια αλλάζει
export default memo(Logo);