import React from 'react';
import { Box, Text, Flex, useColorModeValue } from '@chakra-ui/react';
import { motion } from 'framer-motion';

/**
 * UserCursor Component - Displays remote user cursors in the editor
 * 
 * @param {Object} props - Component properties
 * @param {string} props.username - Username of remote user
 * @param {string} props.color - Cursor color for the user
 * @param {Object} props.position - Position coordinates {top, left}
 * @param {Object} props.selection - Selection range if applicable
 * @param {boolean} props.isActive - Whether the user is actively typing
 */
const UserCursor = ({ username, color, position, selection, isActive = false }) => {
  // Animation variants for blinking cursor
  const cursorVariants = {
    blink: {
      opacity: [1, 0.5, 1],
      transition: { 
        duration: 1.5,
        repeat: Infinity,
        ease: "linear"
      }
    },
    visible: { 
      opacity: 1
    }
  };
  
  // Animation variants for typing indicator
  const typingVariants = {
    typing: {
      y: [0, -3, 0],
      transition: {
        repeat: Infinity,
        duration: 0.6,
        ease: "easeInOut",
        times: [0, 0.5, 1],
        repeatType: "loop"
      }
    }
  };
  
  // If no position is provided, don't render
  if (!position) return null;

  return (
    <>
      {/* Cursor */}
      <motion.div
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        style={{
          position: 'absolute',
          zIndex: 50,
          pointerEvents: 'none',
          top: position.top,
          left: position.left
        }}
      >
        <motion.div
          variants={cursorVariants}
          animate={isActive ? "blink" : "visible"}
        >
          <Box
            w="2px"
            h="20px"
            bg={color}
            position="relative"
          >
            {/* Username label */}
            <Flex
              position="absolute"
              top="-22px"
              left="-1px"
              bg={color}
              color="white"
              fontSize="xs"
              fontWeight="medium"
              py="1"
              px="2"
              borderRadius="md"
              whiteSpace="nowrap"
              boxShadow="sm"
              alignItems="center"
              zIndex={60}
            >
              <Text>{username}</Text>
              
              {/* Typing indicator */}
              {isActive && (
                <Flex ml="2">
                  <motion.div
                    variants={typingVariants}
                    animate="typing"
                    custom={0}
                    style={{ display: 'flex' }}
                  >
                    <Box w="2px" h="2px" bg="white" mx="0.5px" borderRadius="full" />
                  </motion.div>
                  <motion.div
                    variants={typingVariants}
                    animate="typing"
                    custom={1}
                    style={{ display: 'flex' }}
                  >
                    <Box w="2px" h="2px" bg="white" mx="0.5px" borderRadius="full" />
                  </motion.div>
                  <motion.div
                    variants={typingVariants}
                    animate="typing"
                    custom={2}
                    style={{ display: 'flex' }}
                  >
                    <Box w="2px" h="2px" bg="white" mx="0.5px" borderRadius="full" />
                  </motion.div>
                </Flex>
              )}
            </Flex>
          </Box>
        </motion.div>
      </motion.div>
      
      {/* Text selection */}
      {selection && selection.anchor && selection.head && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          style={{
            position: 'absolute',
            top: Math.min(selection.anchor.top, selection.head.top),
            left: Math.min(selection.anchor.left, selection.head.left),
            width: Math.abs(selection.head.left - selection.anchor.left),
            height: Math.abs(selection.head.top - selection.anchor.top) || 20,
            backgroundColor: color,
            zIndex: 30,
            pointerEvents: 'none'
          }}
        />
      )}
    </>
  );
};

export default UserCursor;