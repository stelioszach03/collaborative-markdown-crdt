import React from 'react';
import ReactDOM from 'react-dom/client';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { ThemeProvider } from './context/ThemeContext';
import { DocumentProvider } from './context/DocumentContext';
import './index.css';

// Επέκταση του θέματος Chakra UI για καλύτερο UI
const theme = extendTheme({
  config: {
    initialColorMode: 'light',
    useSystemColorMode: true,
  },
  colors: {
    brand: {
      50: '#E9F2FF',
      100: '#C7DDFF',
      200: '#94BFFF',
      300: '#61A1FF',
      400: '#3D8DFF',
      500: '#0073FF', // Primary color
      600: '#005ED1',
      700: '#004AA3',
      800: '#003675',
      900: '#001D3D',
    },
    editor: {
      background: 'var(--editor-bg)',
      text: 'var(--editor-text)',
      cursor: 'var(--editor-cursor)',
      selection: 'var(--editor-selection)',
      line: 'var(--editor-line)',
    },
    accent: {
      purple: '#9D6EFF',
      green: '#2AC56F',
      yellow: '#FFB627',
      red: '#FF5757',
      blue: '#4285F4',
    },
  },
  fonts: {
    body: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    heading: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    mono: "'Fira Code', 'Roboto Mono', Menlo, Monaco, Consolas, monospace",
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: "500",
        borderRadius: "md",
      },
    },
    Tooltip: {
      baseStyle: {
        borderRadius: "md",
        bg: "gray.800",
        color: "white",
        padding: "2",
        fontSize: "sm",
      },
    },
  },
  styles: {
    global: (props) => ({
      body: {
        bg: props.colorMode === 'dark' ? 'gray.900' : 'white',
        color: props.colorMode === 'dark' ? 'white' : 'gray.800',
      },
    }),
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ChakraProvider theme={theme}>
        <ThemeProvider>
          <DocumentProvider>
            <App />
          </DocumentProvider>
        </ThemeProvider>
      </ChakraProvider>
    </BrowserRouter>
  </React.StrictMode>
);