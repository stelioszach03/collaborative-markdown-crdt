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
  useToken,
  Alert,
  AlertIcon
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
  const [error, setError] = useState(null);
  const { text } = useDocument();
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const statBgColor = useColorModeValue('gray.50', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'gray.100');
  const [blue500] = useToken('colors', ['blue.500']);

  useEffect(() => {
    if (!docId) return;
    
    const fetchAnalyticsData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/documents/${docId}/analytics`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch document analytics');
        }
        
        const data = await response.json();
        setAnalyticsData(data);
      } catch (err) {
        console.error('Error fetching document analytics:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAnalyticsData();
    
    // Set up interval to refresh data every 30 seconds
    const intervalId = setInterval(fetchAnalyticsData, 30000);
    
    return () => clearInterval(intervalId);
  }, [docId, text]);

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
      className="analytics-panel"
    >
      <Flex justifyContent="space-between" alignItems="center" p="3">
        <Heading size="sm">Document Analytics</Heading>
        <Badge colorScheme="purple">Live</Badge>
      </Flex>
      
      {loading || !analyticsData ? (
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
                      {analyticsData.editsTrend !== 0 && (
                        <StatArrow type={analyticsData.editsTrend > 0 ? "increase" : "decrease"} />
                      )}
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
                      {analyticsData.timeSpentTrend !== 0 && (
                        <StatArrow type={analyticsData.timeSpentTrend > 0 ? "increase" : "decrease"} />
                      )}
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
                      {analyticsData.revisionsTrend !== 0 && (
                        <StatArrow type={analyticsData.revisionsTrend > 0 ? "increase" : "decrease"} />
                      )}
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
                  Last saved: {new Date(analyticsData.lastSaved).toLocaleTimeString()}
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