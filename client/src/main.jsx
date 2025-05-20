import React from 'react';
import ReactDOM from 'react-dom/client';
import { 
  ChakraProvider, 
  ColorModeScript, 
  extendTheme,
  withDefaultColorScheme,
  CSSReset
} from '@chakra-ui/react';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { ThemeProvider } from './context/ThemeContext';
import { DocumentProvider } from './context/DocumentContext';
import './index.css';

// Configuration with debug logs
console.log("Application initialization started");

/**
 * Chakra UI θέμα με προσαρμοσμένες ρυθμίσεις
 * @constant {Object} theme
 */
const theme = extendTheme(
  {
    config: {
      initialColorMode: 'light',
      useSystemColorMode: false,
    },
    colors: {
      primary: {
        50: '#e6f1ff',
        100: '#cce3ff',
        200: '#99c7ff',
        300: '#66abff',
        400: '#338fff',
        500: '#0073ff', // Primary color
        600: '#005ccc',
        700: '#004599',
        800: '#002e66',
        900: '#001733',
      },
      editor: {
        background: 'var(--editor-bg)',
        text: 'var(--editor-text)',
        cursor: 'var(--editor-cursor)',
        selection: 'var(--editor-selection)',
        line: 'var(--editor-line)',
      }
    },
    fonts: {
      body: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      heading: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      mono: "'Fira Code', 'Roboto Mono', monospace",
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
        'html, body': {
          bg: props.colorMode === 'dark' ? 'gray.900' : 'white',
          color: props.colorMode === 'dark' ? 'white' : 'gray.800',
          minHeight: '100vh',
          margin: 0,
          padding: 0,
          transition: 'background-color 0.2s, color 0.2s',
        },
        '*': {
          boxSizing: 'border-box',
        },
        '#root': {
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
        },
      }),
    },
  },
  withDefaultColorScheme({ colorScheme: 'primary' })
);

/**
 * Εύρεση και αρχικοποίηση του root element
 */
const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error("Root element not found!");
} else {
  console.log("Root element found, initializing application");
}

// Αρχικοποίηση του React root
const root = ReactDOM.createRoot(rootElement);

// Render της εφαρμογής με error handling
try {
  console.log("Rendering application");
  root.render(
    <React.StrictMode>
      <BrowserRouter>
        <ChakraProvider theme={theme} resetCSS={true}>
          <CSSReset />
          <ColorModeScript initialColorMode={theme.config.initialColorMode} />
          <ThemeProvider>
            <DocumentProvider>
              <App />
            </DocumentProvider>
          </ThemeProvider>
        </ChakraProvider>
      </BrowserRouter>
    </React.StrictMode>
  );
  console.log("Application rendered successfully");
} catch (error) {
  console.error("Error rendering application:", error);
  
  // Render fallback UI in case of error
  const renderErrorMessage = () => {
    rootElement.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; padding: 20px; text-align: center; font-family: sans-serif;">
        <h1 style="margin-bottom: 16px; color: #e53e3e;">Σφάλμα Εκκίνησης Εφαρμογής</h1>
        <p style="margin-bottom: 24px;">Προέκυψε σφάλμα κατά την φόρτωση της εφαρμογής. Παρακαλώ ανανεώστε τη σελίδα ή επικοινωνήστε με τον διαχειριστή.</p>
        <p style="font-family: monospace; background-color: #f8f9fa; padding: 12px; border-radius: 4px; text-align: left; max-width: 100%; overflow-x: auto;">
          ${error.toString()}
        </p>
        <button 
          style="margin-top: 24px; padding: 8px 16px; background-color: #3182ce; color: white; border: none; border-radius: 4px; cursor: pointer;"
          onclick="window.location.reload()"
        >
          Επανεκκίνηση Εφαρμογής
        </button>
      </div>
    `;
  };
  
  renderErrorMessage();
}