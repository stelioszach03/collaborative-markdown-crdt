import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useColorMode } from '@chakra-ui/react';

/**
 * Context για το θέμα της εφαρμογής
 * @type {React.Context}
 */
const ThemeContext = createContext({
  theme: 'light',
  toggleTheme: () => {},
  isDarkMode: false
});

/**
 * Custom hook για χρήση του ThemeContext
 * @returns {Object} Το context με το θέμα και τις σχετικές λειτουργίες
 */
export const useTheme = () => {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
};

/**
 * ThemeProvider Component
 * Διαχειρίζεται το θέμα της εφαρμογής (light/dark mode)
 * 
 * @param {Object} props - Component properties
 * @param {React.ReactNode} props.children - Child components
 */
export const ThemeProvider = ({ children }) => {
  // Χρήση του Chakra UI colorMode
  const { colorMode, toggleColorMode } = useColorMode();
  
  // State για το τρέχον θέμα
  const [theme, setTheme] = useState(colorMode || 'light');
  
  // Boolean για εύκολο έλεγχο του dark mode
  const isDarkMode = theme === 'dark';
  
  // Debug για τρέχουσα κατάσταση
  useEffect(() => {
    console.log(`ThemeProvider initialized with colorMode: ${colorMode}`);
  }, []);
  
  // Συγχρονισμός του theme με το colorMode όταν αλλάζει
  useEffect(() => {
    console.log(`ColorMode changed to: ${colorMode}`);
    setTheme(colorMode);
    
    // Συγχρονισμός με το document class για το Tailwind dark mode
    if (colorMode === 'dark') {
      document.documentElement.classList.add('dark');
      document.body.classList.add('chakra-ui-dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('chakra-ui-dark');
    }
  }, [colorMode]);
  
  // Εναλλαγή του θέματος με memoization για βελτιωμένη απόδοση
  const toggleTheme = useCallback(() => {
    console.log(`Toggling theme from ${theme}`);
    toggleColorMode();
  }, [theme, toggleColorMode]);
  
  // Τιμή του context
  const contextValue = {
    theme,
    toggleTheme,
    isDarkMode
  };
  
  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider; 