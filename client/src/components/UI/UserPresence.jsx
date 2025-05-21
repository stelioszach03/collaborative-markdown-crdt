import { Box, Flex, Text, VStack, Avatar } from '@chakra-ui/react';
import { useDocuments } from '../../context/DocumentContext';

const UserPresence = ({ users = [] }) => {
  const { user: currentUser } = useDocuments();
  
  // Filter out current user if present in the list
  const filteredUsers = users.filter(user => 
    !currentUser || user.id !== currentUser.id
  );
  
  // Add current user at the top
  const allUsers = currentUser 
    ? [currentUser, ...filteredUsers]
    : filteredUsers;
  
  // If no users, show a message
  if (allUsers.length === 0) {
    return (
      <Box textAlign="center" py={4}>
        <Text color="gray.500">No active users</Text>
      </Box>
    );
  }
  
  return (
    <VStack align="stretch" spacing={2}>
      <Text fontWeight="medium" mb={1}>
        Active Users ({allUsers.length})
      </Text>
      
      {allUsers.map((user, index) => (
        <Flex 
          key={user.id || index}
          alignItems="center"
          p={2}
          borderRadius="md"
          bg={user.id === currentUser?.id ? "primary.50" : "transparent"}
          _dark={{
            bg: user.id === currentUser?.id ? "primary.900" : "transparent"
          }}
        >
          <Avatar 
            size="xs" 
            name={user.name} 
            bg={user.color}
            color="white"
            mr={2}
          />
          
          <Box>
            <Text fontWeight={user.id === currentUser?.id ? "medium" : "normal"} fontSize="sm">
              {user.name}
              {user.id === currentUser?.id && " (You)"}
            </Text>
          </Box>
        </Flex>
      ))}
    </VStack>
  );
};

export default UserPresence;