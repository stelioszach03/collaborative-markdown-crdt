import React, { useEffect, useState } from 'react';
import {
  Box,
  Text,
  Heading,
  Flex,
  useColorModeValue,
  Spinner,
  Select,
  useToken,
  Alert,
  AlertIcon
} from '@chakra-ui/react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { format } from 'date-fns';

const EditHistory = ({ docId }) => {
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('24h');
  const [blue500, blue300] = useToken('colors', ['blue.500', 'blue.300']);
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'gray.100');
  const gridColor = useColorModeValue('gray.200', 'gray.700');

  useEffect(() => {
    if (!docId) return;
    
    const fetchHistoryData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/documents/${docId}/history?period=${timeRange}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch edit history');
        }
        
        const data = await response.json();
        setHistoryData(data);
      } catch (err) {
        console.error('Error fetching edit history:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchHistoryData();
  }, [docId, timeRange]);

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
      className="edit-history-chart"
    >
      <Flex justifyContent="space-between" alignItems="center" p="3">
        <Heading size="sm">Edit History</Heading>
        <Select
          size="sm"
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          width="100px"
        >
          <option value="24h">24 hours</option>
          <option value="7d">7 days</option>
          <option value="30d">30 days</option>
        </Select>
      </Flex>
      
      {loading ? (
        <Flex h="80%" justifyContent="center" alignItems="center">
          <Spinner size="xl" color="blue.500" />
        </Flex>
      ) : historyData.length === 0 ? (
        <Flex h="80%" justifyContent="center" alignItems="center" flexDirection="column">
          <Text color={textColor} mb="2">No edit history found</Text>
          <Text fontSize="sm" color="gray.500">
            Make some edits to start tracking history
          </Text>
        </Flex>
      ) : (
        <Box p="2" h="85%">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={historyData}
              margin={{
                top: 5,
                right: 20,
                left: 10,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis 
                dataKey="formattedTime" 
                tick={{ fill: textColor, fontSize: 12 }}
              />
              <YAxis 
                yAxisId="left"
                tick={{ fill: textColor, fontSize: 12 }}
                width={30}
              />
              <YAxis 
                yAxisId="right" 
                orientation="right" 
                tick={{ fill: textColor, fontSize: 12 }}
                width={40}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: bgColor, 
                  borderColor: borderColor,
                  color: textColor
                }}
                formatter={(value, name) => [value, name === 'edits' ? 'Edits' : 'Characters']}
                labelFormatter={(label) => `Time: ${label}`}
              />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="edits"
                stroke={blue500}
                activeDot={{ r: 8 }}
                name="Edits"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="characters"
                stroke={blue300}
                name="Characters"
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      )}
    </Box>
  );
};

export default EditHistory;