import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Flex, Spinner, useToast, Button, Text, IconButton } from '@chakra-ui/react';
import { createCodeMirror } from '@uiw/react-codemirror';
import { markdown } from '@codemirror/lang-markdown';
import { EditorView, keymap } from '@codemirror/view';
import { defaultKeymap } from '@codemirror/commands';
import { useDocuments } from '../../context/DocumentContext';
import { useTheme } from '../../context/ThemeContext';
import useCRDT from '../../hooks/useCRDT';
import useMarkdown from '../../hooks/useMarkdown';
import EditorToolbar from './EditorToolbar';
import MarkdownPreview from './MarkdownPreview';
import UserCursor from './UserCursor';
import EditHistory from '../Visualizations/EditHistory';
import { getMarkdownTemplate } from '../../utils/markdown';
import AnalyticsPanel from '../UI/Analytics/AnalyticsPanel';

const Editor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { theme } = useTheme();
  const editorRef = useRef(null);
  const cmViewRef = useRef(null);
  const [editorReady, setEditorReady] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [cursorPositions, setCursorPositions] = useState({});
  
  const { 
    getDocumentById, 
    currentDocument, 
    updateDocument, 
    error: docError 
  } = useDocuments();

  // Set up CRDT with WebSocket
  const { 
    text, 
    setText, 
    isReady: crdtReady, 
    isConnected,
    activeUsers,
    updateCursorPosition
  } = useCRDT(id);

  // Markdown processing
  const { html, stats, formatMarkdown } = useMarkdown(text);

  // Initialize document
  useEffect(() => {
    if (id) {
      getDocumentById(id);
    }
  }, [id, getDocumentById]);

  // Handle errors
  useEffect(() => {
    if (docError) {
      toast({
        title: 'Error',
        description: docError,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      
      navigate('/');
    }
  }, [docError, toast, navigate]);

  // Initialize CodeMirror
  useEffect(() => {
    if (!editorRef.current || editorReady) return;

    const extensions = [
      markdown(),
      keymap.of(defaultKeymap),
      EditorView.theme({
        "&": {
          height: "100%",
          minHeight: "300px"
        },
        ".cm-content": {
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: "14px",
          padding: "10px"
        },
        ".cm-line": {
          padding: "0 2px 0 10px",
          lineHeight: "1.6"
        },
        ".cm-cursor": {
          borderLeftWidth: "2px",
          borderLeftColor: "#2196f3",
          borderLeftStyle: "solid"
        },
        ".cm-activeLine": {
          backgroundColor: theme === 'dark' ? "#1e1e2e" : "#f8fafc"
        },
        "&.cm-focused .cm-activeLine": {
          backgroundColor: theme === 'dark' ? "#2d2d3d" : "#f1f5f9"
        }
      })
    ];

    const view = new EditorView({
      parent: editorRef.current,
      extensions
    });

    cmViewRef.current = view;
    setEditorReady(true);

    return () => {
      view.destroy();
    };
  }, [editorRef, editorReady, theme]);

  // Update editor content when CRDT data changes
  useEffect(() => {
    if (cmViewRef.current && crdtReady) {
      const currentText = cmViewRef.current.state.doc.toString();
      
      if (text !== currentText) {
        // Only update if content is different
        cmViewRef.current.dispatch({
          changes: {
            from: 0,
            to: cmViewRef.current.state.doc.length,
            insert: text || getMarkdownTemplate()
          }
        });
      }
    }
  }, [text, crdtReady]);

  // Set up editor change listener
  useEffect(() => {
    if (cmViewRef.current && editorReady) {
      const updateListener = EditorView.updateListener.of(update => {
        if (update.docChanged) {
          const newText = update.state.doc.toString();
          setText(newText);
        }
        
        // Update cursor position
        const selection = {
          anchor: update.state.selection.main.anchor,
          head: update.state.selection.main.head,
          ranges: update.state.selection.ranges.map(range => ({
            anchor: range.anchor,
            head: range.head
          }))
        };
        
        updateCursorPosition(selection);
      });
      
      cmViewRef.current.dispatch({
        effects: updateListener
      });
    }
  }, [editorReady, setText, updateCursorPosition]);

  // Update document title
  const handleTitleChange = async (newTitle) => {
    if (currentDocument && newTitle.trim() !== '') {
      await updateDocument(id, { name: newTitle });
      toast({
        title: 'Document updated',
        description: 'Document title has been updated',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    }
  };

  // Handle markdown formatting
  const handleFormat = (type) => {
    if (!cmViewRef.current) return;
    
    const view = cmViewRef.current;
    const state = view.state;
    const selection = state.selection.main;
    
    const { text: newText, newPosition } = formatMarkdown(
      state.doc.toString(),
      type,
      { start: selection.from, end: selection.to }
    );
    
    // Update editor content
    view.dispatch({
      changes: {
        from: 0,
        to: state.doc.length,
        insert: newText
      },
      selection: { anchor: newPosition }
    });
    
    // Update CRDT
    setText(newText);
    
    // Focus editor
    view.focus();
  };

  // Toggle preview mode
  const togglePreview = () => setShowPreview(prev => !prev);

  // Toggle analytics panel
  const toggleAnalytics = () => setShowAnalytics(prev => !prev);

  if (!currentDocument) {
    return (
      <Flex 
        justify="center" 
        align="center" 
        height="calc(100vh - 64px)"
        direction="column"
        gap={4}
      >
        <Spinner size="xl" color="primary.500" />
        <Text>Loading document...</Text>
      </Flex>
    );
  }

  return (
    <Box className="editor-container" h="calc(100vh - 64px)" overflow="hidden">
      <EditorToolbar 
        document={currentDocument}
        onTitleChange={handleTitleChange}
        isConnected={isConnected}
        onFormat={handleFormat}
        showPreview={showPreview}
        togglePreview={togglePreview}
        activeUsers={activeUsers}
        showAnalytics={showAnalytics}
        toggleAnalytics={toggleAnalytics}
      />
      
      <Flex h="calc(100% - 48px)" overflow="hidden">
        {/* Editor panel */}
        <Box 
          flex={showPreview ? "1" : "1"} 
          h="100%" 
          position="relative"
          className="editor-panel"
          borderRight={showPreview ? "1px solid" : "none"}
          borderColor="border.light"
          _dark={{ borderColor: "border.dark" }}
        >
          <Box 
            ref={editorRef} 
            className="editor-area" 
            h="100%" 
            overflow="auto"
            bg="editor.light"
            _dark={{ bg: "editor.dark" }}
          />
          
          {/* Display user cursors */}
          {activeUsers.map(user => (
            <UserCursor 
              key={user.clientId} 
              user={user.user} 
              selection={user.selection}
              editorRef={editorRef}
            />
          ))}
        </Box>
        
        {/* Preview panel */}
        {showPreview && (
          <Box flex="1" h="100%" overflow="auto" p={4}>
            <MarkdownPreview html={html} />
          </Box>
        )}
      </Flex>
      
      {/* Analytics overlay */}
      {showAnalytics && (
        <Box 
          position="fixed"
          right="0"
          top="64px"
          bottom="0"
          width="450px"
          bg="white"
          _dark={{ bg: "gray.800" }}
          borderLeft="1px solid"
          borderColor="gray.200"
          _dark={{ borderColor: "gray.700" }}
          boxShadow="-4px 0 15px rgba(0, 0, 0, 0.1)"
          zIndex="10"
          overflow="auto"
          p={4}
        >
          <AnalyticsPanel documentId={id} stats={stats} />
        </Box>
      )}
    </Box>
  );
};

export default Editor;