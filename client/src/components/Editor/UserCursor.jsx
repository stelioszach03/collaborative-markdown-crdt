import React from 'react';
import { Box, Text } from '@chakra-ui/react';

const UserCursor = ({ username, color, position, selection }) => {
  return (
    <>
      {/* Cursor */}
      <Box
        className="user-cursor"
        style={{
          top: `${position.top}px`,
          left: `${position.left}px`,
          backgroundColor: color
        }}
      >
        {/* User label */}
        <Text
          className="user-label"
          style={{
            backgroundColor: color,
            color: '#ffffff'
          }}
        >
          {username}
        </Text>
      </Box>
      
      {/* Selection if applicable */}
      {selection && selection.anchor && selection.head && (
        <Box
          position="absolute"
          style={{
            top: `${Math.min(selection.anchor.top, selection.head.top)}px`,
            left: `${Math.min(selection.anchor.left, selection.head.left)}px`,
            width: `${Math.abs(selection.head.left - selection.anchor.left)}px`,
            height: `${Math.abs(selection.head.top - selection.anchor.top) || 20}px`,
            backgroundColor: `${color}33`, // 20% opacity
            pointerEvents: 'none'
          }}
        />
      )}
    </>
  );
};

export default UserCursor;