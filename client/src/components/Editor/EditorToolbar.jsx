import React from 'react';
import {
  Box,
  Flex,
  IconButton,
  Tooltip,
  Divider,
  useColorModeValue,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button
} from '@chakra-ui/react';
import {
  FaBold,
  FaItalic,
  FaLink,
  FaImage,
  FaCode,
  FaListUl,
  FaListOl,
  FaQuoteRight,
  FaUndo,
  FaRedo,
  FaHeading,
  FaTable
} from 'react-icons/fa';
import { TbSeparatorHorizontal } from 'react-icons/tb';
import { IoMdAttach } from 'react-icons/io';
import { ChevronDownIcon } from '@chakra-ui/icons';

const EditorToolbar = ({ formatText, selection, undo, redo, connected }) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const iconColor = useColorModeValue('gray.700', 'gray.300');

  // Format headings
  const formatHeading = (level) => {
    formatText('heading', { level });
  };

  return (
    <Flex
      width="full"
      h="40px"
      bg={bgColor}
      borderBottom="1px"
      borderColor={borderColor}
      p="1"
      alignItems="center"
      overflowX="auto"
      className="editor-toolbar"
    >
      <Box display="flex" alignItems="center">
        {/* Undo/Redo */}
        <Tooltip label="Undo (Ctrl+Z)" aria-label="Undo">
          <IconButton
            icon={<FaUndo />}
            size="sm"
            variant="ghost"
            aria-label="Undo"
            onClick={undo}
            color={iconColor}
            mx="1"
          />
        </Tooltip>
        
        <Tooltip label="Redo (Ctrl+Shift+Z)" aria-label="Redo">
          <IconButton
            icon={<FaRedo />}
            size="sm"
            variant="ghost"
            aria-label="Redo"
            onClick={redo}
            color={iconColor}
            mx="1"
          />
        </Tooltip>
        
        <Divider orientation="vertical" h="20px" mx="2" />
        
        {/* Headings */}
        <Menu>
          <Tooltip label="Headings" aria-label="Headings">
            <MenuButton
              as={Button}
              size="sm"
              variant="ghost"
              color={iconColor}
              mx="1"
              leftIcon={<FaHeading />}
              rightIcon={<ChevronDownIcon />}
            >
              Heading
            </MenuButton>
          </Tooltip>
          <MenuList>
            <MenuItem onClick={() => formatHeading(1)}>Heading 1</MenuItem>
            <MenuItem onClick={() => formatHeading(2)}>Heading 2</MenuItem>
            <MenuItem onClick={() => formatHeading(3)}>Heading 3</MenuItem>
            <MenuItem onClick={() => formatHeading(4)}>Heading 4</MenuItem>
            <MenuItem onClick={() => formatHeading(5)}>Heading 5</MenuItem>
            <MenuItem onClick={() => formatHeading(6)}>Heading 6</MenuItem>
          </MenuList>
        </Menu>
        
        <Divider orientation="vertical" h="20px" mx="2" />
        
        {/* Text formatting */}
        <Tooltip label="Bold (Ctrl+B)" aria-label="Bold">
          <IconButton
            icon={<FaBold />}
            size="sm"
            variant="ghost"
            aria-label="Bold"
            onClick={() => formatText('bold')}
            color={iconColor}
            mx="1"
          />
        </Tooltip>
        
        <Tooltip label="Italic (Ctrl+I)" aria-label="Italic">
          <IconButton
            icon={<FaItalic />}
            size="sm"
            variant="ghost"
            aria-label="Italic"
            onClick={() => formatText('italic')}
            color={iconColor}
            mx="1"
          />
        </Tooltip>
        
        <Divider orientation="vertical" h="20px" mx="2" />
        
        {/* Links and media */}
        <Tooltip label="Insert Link" aria-label="Insert Link">
          <IconButton
            icon={<FaLink />}
            size="sm"
            variant="ghost"
            aria-label="Insert Link"
            onClick={() => formatText('link', { url: 'https://example.com' })}
            color={iconColor}
            mx="1"
          />
        </Tooltip>
        
        <Tooltip label="Insert Image" aria-label="Insert Image">
          <IconButton
            icon={<FaImage />}
            size="sm"
            variant="ghost"
            aria-label="Insert Image"
            onClick={() => formatText('image', { url: 'https://via.placeholder.com/150' })}
            color={iconColor}
            mx="1"
          />
        </Tooltip>
        
        <Divider orientation="vertical" h="20px" mx="2" />
        
        {/* Code */}
        <Menu>
          <Tooltip label="Insert Code" aria-label="Insert Code">
            <MenuButton
              as={IconButton}
              icon={<FaCode />}
              size="sm"
              variant="ghost"
              color={iconColor}
              mx="1"
            />
          </Tooltip>
          <MenuList>
            <MenuItem onClick={() => formatText('code-inline')}>Inline Code</MenuItem>
            <MenuItem onClick={() => formatText('code-block', { language: 'javascript' })}>Code Block</MenuItem>
          </MenuList>
        </Menu>
        
        <Divider orientation="vertical" h="20px" mx="2" />
        
        {/* Lists */}
        <Tooltip label="Unordered List" aria-label="Unordered List">
          <IconButton
            icon={<FaListUl />}
            size="sm"
            variant="ghost"
            aria-label="Unordered List"
            onClick={() => formatText('unordered-list')}
            color={iconColor}
            mx="1"
          />
        </Tooltip>
        
        <Tooltip label="Ordered List" aria-label="Ordered List">
          <IconButton
            icon={<FaListOl />}
            size="sm"
            variant="ghost"
            aria-label="Ordered List"
            onClick={() => formatText('ordered-list')}
            color={iconColor}
            mx="1"
          />
        </Tooltip>
        
        <Divider orientation="vertical" h="20px" mx="2" />
        
        {/* Blockquote */}
        <Tooltip label="Blockquote" aria-label="Blockquote">
          <IconButton
            icon={<FaQuoteRight />}
            size="sm"
            variant="ghost"
            aria-label="Blockquote"
            onClick={() => formatText('blockquote')}
            color={iconColor}
            mx="1"
          />
        </Tooltip>
        
        {/* Horizontal Rule */}
        <Tooltip label="Horizontal Rule" aria-label="Horizontal Rule">
          <IconButton
            icon={<TbSeparatorHorizontal />}
            size="sm"
            variant="ghost"
            aria-label="Horizontal Rule"
            onClick={() => formatText('horizontal-rule')}
            color={iconColor}
            mx="1"
          />
        </Tooltip>
        
        {/* Table */}
        <Tooltip label="Insert Table" aria-label="Insert Table">
          <IconButton
            icon={<FaTable />}
            size="sm"
            variant="ghost"
            aria-label="Insert Table"
            onClick={() => formatText('table')}
            color={iconColor}
            mx="1"
          />
        </Tooltip>
        
        <Divider orientation="vertical" h="20px" mx="2" />
        
        {/* File Attachment (placeholder) */}
        <Tooltip label="Attach File (Placeholder)" aria-label="Attach File">
          <IconButton
            icon={<IoMdAttach />}
            size="sm"
            variant="ghost"
            aria-label="Attach File"
            onClick={() => alert('File attachment is a placeholder feature')}
            color={iconColor}
            mx="1"
          />
        </Tooltip>
      </Box>
    </Flex>
  );
};

export default EditorToolbar;