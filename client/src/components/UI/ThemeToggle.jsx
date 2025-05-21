import React from 'react';
import { 
  IconButton, 
  useColorMode, 
  Tooltip,
  Box,
  useColorModeValue
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

/**
 * ThemeToggle Component - Toggles between light and dark mode
 * 
 * @param {Object} props - Component properties passed from parent
 */
const ThemeToggle = (props) => {
  const { colorMode } = useColorMode();
  const { toggleTheme } = useTheme();
  const isDark = colorMode === 'dark';
  
  // Animation variants for sun/moon icon transition
  const variants = {
    light: { rotate: 0 },
    dark: { rotate: 180 }
  };
  
  // Animation for the pulse effect when toggling
  const pulseVariants = {
    initial: { scale: 0, opacity: 0 },
    animate: { 
      scale: [0, 1.5, 0], 
      opacity: [0, 0.4, 0] 
    }
  };
  
  // Custom colors
  const iconBg = useColorModeValue('blue.50', 'blue.900');
  const iconColor = useColorModeValue('blue.500', 'blue.200');
  const hoverBg = useColorModeValue('blue.100', 'blue.800');

  return (
    <Tooltip 
      label={isDark ? 'Switch to light mode' : 'Switch to dark mode'} 
      placement="bottom"
      openDelay={500}
    >
      <Box position="relative" {...props}>
        <IconButton
          onClick={toggleTheme}
          variant="ghost"
          aria-label="Toggle color mode"
          size="sm"
          icon={
            <motion.div
              initial={false}
              animate={isDark ? "dark" : "light"}
              variants={variants}
              transition={{ duration: 0.5, type: "spring" }}
            >
              {isDark ? (
                <motion.svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5"></circle>
                  <line x1="12" y1="1" x2="12" y2="3"></line>
                  <line x1="12" y1="21" x2="12" y2="23"></line>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                  <line x1="1" y1="12" x2="3" y2="12"></line>
                  <line x1="21" y1="12" x2="23" y2="12"></line>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                </motion.svg>
              ) : (
                <motion.svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                </motion.svg>
              )}
            </motion.div>
          }
          color={iconColor}
          bg={iconBg}
          _hover={{ bg: hoverBg }}
        />
        
        {/* Animated pulse effect when toggling */}
        <motion.div
          variants={pulseVariants}
          initial="initial"
          animate="animate"
          key={colorMode} // Trigger animation when mode changes
          transition={{ duration: 0.5 }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: '50%',
            zIndex: -1,
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'
          }}
        />
      </Box>
    </Tooltip>
  );
};

export default ThemeToggle;