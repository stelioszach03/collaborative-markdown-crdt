import React from 'react';
import { IconButton, useColorMode, Tooltip } from '@chakra-ui/react';
import { SunIcon, MoonIcon } from '@chakra-ui/icons';
import { useTheme } from '../../context/ThemeContext';

const ThemeToggle = (props) => {
  const { colorMode } = useColorMode();
  const { toggleTheme } = useTheme();

  return (
    <Tooltip label={colorMode === 'dark' ? 'Light mode' : 'Dark mode'}>
      <IconButton
        icon={colorMode === 'dark' ? <SunIcon /> : <MoonIcon />}
        onClick={toggleTheme}
        variant="ghost"
        aria-label="Toggle theme"
        size="sm"
        {...props}
      />
    </Tooltip>
  );
};

export default ThemeToggle;