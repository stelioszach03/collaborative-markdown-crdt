import { Box } from '@chakra-ui/react';
import { useTheme } from '../../context/ThemeContext';

const Logo = ({ height = '40px' }) => {
  const { theme } = useTheme();
  
  // Set color based on theme
  const color = theme === 'dark' ? '#90CAF9' : '#1976D2';
  
  return (
    <Box as="svg" 
      height={height} 
      viewBox="0 0 48 48" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Simplified logo SVG representing a markdown document with collaboration */}
      <rect x="6" y="6" width="36" height="36" rx="3" fill={color} fillOpacity="0.2" />
      <path 
        d="M12 12H36V16H12V12ZM12 20H28V24H12V20ZM12 28H32V32H12V28ZM12 36H24V40H12V36Z" 
        fill={color} 
      />
      <circle cx="36" cy="34" r="6" fill={color} fillOpacity="0.8" />
      <circle cx="30" cy="38" r="4" fill={color} fillOpacity="0.6" />
    </Box>
  );
};

export default Logo;