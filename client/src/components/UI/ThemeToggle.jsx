import { useEffect, useState } from 'react';
import { IconButton, Tooltip } from '@chakra-ui/react';
import { FaSun, FaMoon } from 'react-icons/fa';
import { useTheme } from '../../context/ThemeContext';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  // After component is mounted, we can safely show the toggle
  // This prevents hydration errors
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) {
    return null;
  }
  
  return (
    <Tooltip label={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}>
      <IconButton
        aria-label={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        icon={theme === 'dark' ? <FaSun /> : <FaMoon />}
        variant="ghost"
        onClick={toggleTheme}
        color={theme === 'dark' ? 'yellow.300' : 'blue.700'}
      />
    </Tooltip>
  );
};

export default ThemeToggle;