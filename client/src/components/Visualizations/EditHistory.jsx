import React, { useEffect, useState } from 'react';
import {
  Box,
  Text,
  Heading,
  Flex,
  useColorModeValue,
  Spinner,
  Select,
  useToken
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
  const [timeRange, setTimeRange] = useState('24h');
  const [blue500, blue300] = useToken('colors', ['blue.500', 'blue.300']);
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'gray.100');
  const gridColor = useColorModeValue('gray.200', 'gray.700');

  useEffect(() => {
    // In a real application, this would fetch actual edit history data
    // Here we'll simulate some data for demonstration purposes
    const fetchHistoryData = async () => {
      setLoading(true);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate mock data
      const now = new Date();
      const data = [];
      
      let timePoints = 24;
      let timeIncrement = 60 * 60 * 1000; // 1 hour in milliseconds
      
      if (timeRange === '7d') {
        timePoints = 7;
        timeIncrement = 24 * 60 * 60 * 1000; // 1 day
      } else if (timeRange === '30d') {
        timePoints = 30;
        timeIncrement = 24 * 60 * 60 * 1000; // 1 day
      }
      
      for (let i = 0; i < timePoints; i++) {
        const timestamp = new Date(now.getTime() - (timePoints - i - 1) * timeIncrement);
        
        data.push({
          timestamp,
          formattedTime: timeRange === '24h' 
            ? format(timestamp, 'HH:mm') 
            : format(timestamp, 'MMM dd'),
          edits: Math.floor(Math.random() * 20) + 1,
          characters: Math.floor(Math.random() * 200) + 10,
        });
      }
      
      setHistoryData(data);
      setLoading(false);
    };
    
    fetchHistoryData();
  }, [docId, timeRange]);

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