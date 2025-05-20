import React, { useEffect, useState } from 'react';
import {
  Box,
  Text,
  Heading,
  Flex,
  useColorModeValue,
  Spinner,
  Badge,
  HStack,
  Avatar,
  VStack,
  Tooltip,
  useToken
} from '@chakra-ui/react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { useDocument } from '../../context/DocumentContext';

const CollaborationMap = ({ docId }) => {
  const [collaborationData, setCollaborationData] = useState([]);
  const [loading, setLoading] = useState(true);
  const { awareness, username } = useDocument();
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'gray.100');

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#AFB4FF'];

  useEffect(() => {
    // In a real application, this would fetch actual collaboration data
    // Here we'll simulate some data for demonstration purposes
    const fetchCollaborationData = async () => {
      setLoading(true);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      // Create some mock users, including the current user
      const users = [
        { id: 'user1', username: username, color: '#0088FE', edits: Math.floor(Math.random() * 100) + 50 },
        { id: 'user2', username: 'Alice', color: '#00C49F', edits: Math.floor(Math.random() * 80) + 20 },
        { id: 'user3', username: 'Bob', color: '#FFBB28', edits: Math.floor(Math.random() * 60) + 10 },
        { id: 'user4', username: 'Carol', color: '#FF8042', edits: Math.floor(Math.random() * 40) + 5 },
      ];
      
      // Convert to chart data
      const pieData = users.map(user => ({
        name: user.username,
        value: user.edits,
        color: user.color,
        isCurrentUser: user.username === username
      }));
      
      setCollaborationData(pieData);
      setLoading(false);
    };
    
    fetchCollaborationData();
  }, [docId, username]);

  // Get active users from awareness
  const activeUsers = new Map();
  if (awareness) {
    awareness.getStates().forEach((state, clientId) => {
      if (state.userId) {
        activeUsers.set(state.userId, {
          username: state.username || 'Anonymous',
          color: state.color || '#cccccc'
        });
      }
    });
  }

  const renderCustomLabel = ({ cx, cy, midAngle, outerRadius, percent, index, name }) => {
    const RADIAN = Math.PI / 180;
    const radius = outerRadius * 1.1;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill={textColor}
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize="12"
      >
        {`${name} (${(percent * 100).toFixed(0)}%)`}
      </text>
    );
  };

  return (
    <Box
      h="full"
      bg={bgColor}
      borderRadius="md"
      overflow="hidden"
      className="collaboration-map"
    >
      <Flex justifyContent="space-between" alignItems="center" p="3">
        <Heading size="sm">Collaboration</Heading>
        <Badge colorScheme="green">
          {activeUsers.size || 1} Active
        </Badge>
      </Flex>
      
      {loading ? (
        <Flex h="80%" justifyContent="center" alignItems="center">
          <Spinner size="xl" color="green.500" />
        </Flex>
      ) : (
        <Flex h="85%" direction={{ base: "column", md: "row" }}>
          {/* Pie chart */}
          <Box flex="1" minH={{ base: "150px", md: "auto" }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={collaborationData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomLabel}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {collaborationData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color || COLORS[index % COLORS.length]}
                      stroke={entry.isCurrentUser ? "#000" : "none"}
                      strokeWidth={entry.isCurrentUser ? 2 : 0}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </Box>
          
          {/* Active users list */}
          <Box flex="1" p="4">
            <Text fontSize="sm" fontWeight="bold" mb="2">
              Active Contributors
            </Text>
            
            <VStack align="stretch" spacing="2">
              {Array.from(activeUsers.entries()).map(([userId, user]) => (
                <HStack key={userId} p="2" bg={useColorModeValue('gray.50', 'gray.700')} borderRadius="md">
                  <Avatar 
                    size="xs" 
                    name={user.username}
                    bg={user.color}
                  />
                  <Text fontSize="sm" fontWeight={user.username === username ? "bold" : "normal"}>
                    {user.username} {user.username === username && "(you)"}
                  </Text>
                  <Badge colorScheme="green" ml="auto">
                    Active
                  </Badge>
                </HStack>
              ))}
              
              {/* Add some inactive users for demonstration */}
              {collaborationData
                .filter(user => !Array.from(activeUsers.values()).some(au => au.username === user.name))
                .map((user, index) => (
                  <HStack key={index} p="2" bg={useColorModeValue('gray.50', 'gray.700')} borderRadius="md" opacity="0.6">
                    <Avatar 
                      size="xs" 
                      name={user.name}
                      bg={user.color}
                    />
                    <Text fontSize="sm">
                      {user.name}
                    </Text>
                    <Badge colorScheme="gray" ml="auto">
                      Offline
                    </Badge>
                  </HStack>
                ))}
            </VStack>
          </Box>
        </Flex>
      )}
    </Box>
  );
};

export default CollaborationMap;