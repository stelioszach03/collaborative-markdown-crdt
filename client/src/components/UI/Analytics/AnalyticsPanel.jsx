import React, { useEffect, useState } from 'react';
import {
  Box,
  Text,
  Heading,
  Grid,
  GridItem,
  useColorModeValue,
  Spinner,
  Flex,
  VStack,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Badge,
  HStack,
  Progress,
  useToken
} from '@chakra-ui/react';
import { 
  FaEdit, 
  FaUsers, 
  FaClock, 
  FaFileAlt, 
  FaRegSave
} from 'react-icons/fa';
import { useDocument } from '../../../context/DocumentContext';

const AnalyticsPanel = ({ docId }) => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { text } = useDocument();
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const statBgColor = useColorModeValue('gray.50', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'gray.100');
  const [blue500] = useToken('colors', ['blue.500']);

  useEffect(() => {
    // In a real application, this would fetch actual analytics data
    // Here we'll simulate some data for demonstration purposes
    const fetchAnalyticsData = async () => {
      setLoading(true);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Generate mock data
      const data = {
        totalEdits: Math.floor(Math.random() * 500) + 100,
        editsTrend: Math.random() > 0.5 ? Math.floor(Math.random() * 20) + 5 : -Math.floor(Math.random() * 20) - 5,
        collaborators: Math.floor(Math.random() * 5) + 2,
        collaboratorsTrend: Math.random() > 0.5 ? Math.floor(Math.random() * 3) + 1 : 0,
        timeSpent: Math.floor(Math.random() * 120) + 30, // minutes
        timeSpentTrend: Math.random() > 0.5 ? Math.floor(Math.random() * 30) + 5 : -Math.floor(Math.random() * 30) - 5,
        revisions: Math.floor(Math.random() * 50) + 10,
        revisionsTrend: Math.random() > 0.5 ? Math.floor(Math.random() * 10) + 1 : -Math.floor(Math.random() * 10) - 1,
        lastSaved: new Date(Date.now() - Math.floor(Math.random() * 3600000)),
        wordCount: text.split(/\s+/).filter(Boolean).length,
        characterCount: text.length,
        headingCount: (text.match(/^#+\s+/gm) || []).length,
        listItemCount: (text.match(/^[\s]*[-*+]\s+/gm) || []).length + (text.match(/^[\s]*\d+\.\s+/gm) || []).length,
      };
      
      setAnalyticsData(data);
      setLoading(false);
    };
    
    fetchAnalyticsData();
    
    // Set up interval to refresh data (simulating real-time updates)
    const intervalId = setInterval(fetchAnalyticsData, 30000);
    
    return () => clearInterval(intervalId);
  }, [docId, text]);

  return (
    <Box
      h="full"
      bg={bgColor}
      borderRadius="md"
      overflow="hidden"
      className="analytics-panel"
    >
      <Flex justifyContent="space-between" alignItems="center" p="3">
        <Heading size="sm">Document Analytics</Heading>
        <Badge colorScheme="purple">Live</Badge>
      </Flex>
      
      {loading ? (
        <Flex h="80%" justifyContent="center" alignItems="center">
          <Spinner size="xl" color="purple.500" />
        </Flex>
      ) : (
        <Box p="2" overflowY="auto" h="85%">
          <Grid templateColumns={{ base: "repeat(1, 1fr)", md: "repeat(2, 1fr)" }} gap="4">
            {/* Total Edits */}
            <GridItem>
              <Stat
                p="3"
                borderRadius="md"
                bg={statBgColor}
                borderLeft="4px"
                borderColor="blue.500"
              >
                <Flex align="center">
                  <Box color="blue.500" mr="3">
                    <FaEdit size="20px" />
                  </Box>
                  <Box>
                    <StatLabel>Total Edits</StatLabel>
                    <StatNumber>{analyticsData.totalEdits}</StatNumber>
                    <StatHelpText>
                      <StatArrow type={analyticsData.editsTrend > 0 ? "increase" : "decrease"} />
                      {Math.abs(analyticsData.editsTrend)}% from last session
                    </StatHelpText>
                  </Box>
                </Flex>
              </Stat>
            </GridItem>
            
            {/* Collaborators */}
            <GridItem>
              <Stat
                p="3"
                borderRadius="md"
                bg={statBgColor}
                borderLeft="4px"
                borderColor="green.500"
              >
                <Flex align="center">
                  <Box color="green.500" mr="3">
                    <FaUsers size="20px" />
                  </Box>
                  <Box>
                    <StatLabel>Collaborators</StatLabel>
                    <StatNumber>{analyticsData.collaborators}</StatNumber>
                    <StatHelpText>
                      {analyticsData.collaboratorsTrend > 0 ? (
                        <>
                          <StatArrow type="increase" />
                          {analyticsData.collaboratorsTrend} new this week
                        </>
                      ) : (
                        "No change this week"
                      )}
                    </StatHelpText>
                  </Box>
                </Flex>
              </Stat>
            </GridItem>
            
            {/* Time Spent */}
            <GridItem>
              <Stat
                p="3"
                borderRadius="md"
                bg={statBgColor}
                borderLeft="4px"
                borderColor="orange.500"
              >
                <Flex align="center">
                  <Box color="orange.500" mr="3">
                    <FaClock size="20px" />
                  </Box>
                  <Box>
                    <StatLabel>Time Spent</StatLabel>
                    <StatNumber>{analyticsData.timeSpent} min</StatNumber>
                    <StatHelpText>
                      <StatArrow type={analyticsData.timeSpentTrend > 0 ? "increase" : "decrease"} />
                      {Math.abs(analyticsData.timeSpentTrend)} min from last session
                    </StatHelpText>
                  </Box>
                </Flex>
              </Stat>
            </GridItem>
            
            {/* Revisions */}
            <GridItem>
              <Stat
                p="3"
                borderRadius="md"
                bg={statBgColor}
                borderLeft="4px"
                borderColor="purple.500"
              >
                <Flex align="center">
                  <Box color="purple.500" mr="3">
                    <FaFileAlt size="20px" />
                  </Box>
                  <Box>
                    <StatLabel>Revisions</StatLabel>
                    <StatNumber>{analyticsData.revisions}</StatNumber>
                    <StatHelpText>
                      <StatArrow type={analyticsData.revisionsTrend > 0 ? "increase" : "decrease"} />
                      {Math.abs(analyticsData.revisionsTrend)} from yesterday
                    </StatHelpText>
                  </Box>
                </Flex>
              </Stat>
            </GridItem>
          </Grid>
          
          {/* Document Stats */}
          <Box mt="4" p="3" borderRadius="md" bg={statBgColor}>
            <Flex justify="space-between" align="center" mb="3">
              <Heading size="xs">Document Stats</Heading>
              <HStack>
                <FaRegSave size="14px" />
                <Text fontSize="xs">
                  Last saved: {analyticsData.lastSaved.toLocaleTimeString()}
                </Text>
              </HStack>
            </Flex>
            
            <VStack spacing="3" align="stretch">
              {/* Word Count */}
              <Box>
                <Flex justify="space-between">
                  <Text fontSize="sm">Words</Text>
                  <Text fontSize="sm" fontWeight="bold">{analyticsData.wordCount}</Text>
                </Flex>
                <Progress value={Math.min(analyticsData.wordCount / 10, 100)} size="sm" colorScheme="blue" mt="1" />
              </Box>
              
              {/* Character Count */}
              <Box>
                <Flex justify="space-between">
                  <Text fontSize="sm">Characters</Text>
                  <Text fontSize="sm" fontWeight="bold">{analyticsData.characterCount}</Text>
                </Flex>
                <Progress value={Math.min(analyticsData.characterCount / 50, 100)} size="sm" colorScheme="green" mt="1" />
              </Box>
              
              {/* Headings */}
              <Box>
                <Flex justify="space-between">
                  <Text fontSize="sm">Headings</Text>
                  <Text fontSize="sm" fontWeight="bold">{analyticsData.headingCount}</Text>
                </Flex>
                <Progress value={Math.min(analyticsData.headingCount * 10, 100)} size="sm" colorScheme="orange" mt="1" />
              </Box>
              
              {/* List Items */}
              <Box>
                <Flex justify="space-between">
                  <Text fontSize="sm">List Items</Text>
                  <Text fontSize="sm" fontWeight="bold">{analyticsData.listItemCount}</Text>
                </Flex>
                <Progress value={Math.min(analyticsData.listItemCount * 5, 100)} size="sm" colorScheme="purple" mt="1" />
              </Box>
            </VStack>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default AnalyticsPanel;