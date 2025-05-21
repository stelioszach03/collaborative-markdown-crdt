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
  VStack, // Προσθήκη του VStack εδώ
  Tooltip,
  Alert,
  AlertIcon
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
  const [error, setError] = useState(null);
  const { awareness, username } = useDocument();
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'gray.100');

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#AFB4FF'];

  useEffect(() => {
    if (!docId) return;
    
    const fetchCollaborationData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/documents/${docId}/collaboration`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch collaboration data');
        }
        
        const data = await response.json();
        
        // Convert to chart data
        const pieData = data.map(user => ({
          name: user.username,
          value: user.edits,
          color: user.color,
          isCurrentUser: user.username === username
        }));
        
        setCollaborationData(pieData);
      } catch (err) {
        console.error('Error fetching collaboration data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
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

  if (error) {
    return (
      <Box
        h="full"
        bg={bgColor}
        borderRadius="md"
        overflow="hidden"
        p="4"
      >
        <Alert status="error">
          <AlertIcon />
          {error}
        </Alert>
      </Box>
    );
  }

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
      ) : collaborationData.length === 0 ? (
        <Flex h="80%" justifyContent="center" alignItems="center" flexDirection="column">
          <Text color={textColor} mb="2">No collaboration data yet</Text>
          <Text fontSize="sm" color="gray.500">
            Invite others to collaborate on this document
          </Text>
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
              
              {/* Add offline users from collaboration data */}
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