import { useState, useEffect } from 'react';
import { 
  Box, 
  Heading, 
  Text, 
  Tabs, 
  TabList, 
  TabPanels, 
  Tab, 
  TabPanel,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  SimpleGrid,
  Spinner,
  Center,
  Flex,
  Badge
} from '@chakra-ui/react';
import EditHistory from '../../Visualizations/EditHistory';
import CollaborationMap from '../../Visualizations/CollaborationMap';

const AnalyticsPanel = ({ documentId, stats }) => {
  const [documentAnalytics, setDocumentAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/documents/${documentId}/analytics`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch analytics');
        }
        
        const data = await response.json();
        setDocumentAnalytics(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching analytics:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    if (documentId) {
      fetchAnalytics();
    }
  }, [documentId]);

  if (loading) {
    return (
      <Center minH="300px">
        <Spinner size="xl" />
      </Center>
    );
  }

  if (error) {
    return (
      <Box p={4} textAlign="center">
        <Text color="red.500">Error loading analytics: {error}</Text>
      </Box>
    );
  }

  return (
    <Box>
      <Heading size="md" mb={4}>Document Analytics</Heading>
      
      <Tabs isFitted variant="enclosed" onChange={setActiveTab}>
        <TabList mb={4}>
          <Tab>Overview</Tab>
          <Tab>History</Tab>
          <Tab>Collaboration</Tab>
        </TabList>
        
        <TabPanels>
          {/* Overview Tab */}
          <TabPanel>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={4}>
              <Stat>
                <StatLabel>Total Edits</StatLabel>
                <StatNumber>{documentAnalytics?.totalEdits || 0}</StatNumber>
                {documentAnalytics?.editsTrend !== 0 && (
                  <StatHelpText>
                    <StatArrow 
                      type={documentAnalytics?.editsTrend > 0 ? 'increase' : 'decrease'} 
                    />
                    {Math.abs(documentAnalytics?.editsTrend || 0)}% from yesterday
                  </StatHelpText>
                )}
              </Stat>
              
              <Stat>
                <StatLabel>Collaborators</StatLabel>
                <StatNumber>{documentAnalytics?.collaborators || 0}</StatNumber>
              </Stat>
              
              <Stat>
                <StatLabel>Time Spent</StatLabel>
                <StatNumber>{documentAnalytics?.timeSpent || 0} min</StatNumber>
              </Stat>
              
              <Stat>
                <StatLabel>Revisions</StatLabel>
                <StatNumber>{documentAnalytics?.revisions || 0}</StatNumber>
              </Stat>
            </SimpleGrid>
            
            <Heading size="sm" mb={2}>Document Statistics</Heading>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <Stat>
                <StatLabel>Characters</StatLabel>
                <StatNumber>{stats?.chars || 0}</StatNumber>
              </Stat>
              
              <Stat>
                <StatLabel>Words</StatLabel>
                <StatNumber>{stats?.words || 0}</StatNumber>
              </Stat>
              
              <Stat>
                <StatLabel>Lines</StatLabel>
                <StatNumber>{stats?.lines || 0}</StatNumber>
              </Stat>
              
              <Stat>
                <Flex alignItems="center">
                  <Box>
                    <StatLabel>Document Elements</StatLabel>
                    <StatNumber>
                      {(stats?.headings || 0) + (stats?.lists || 0) + (stats?.codeBlocks || 0)}
                    </StatNumber>
                  </Box>
                  <Flex ml={4} gap={2} flexWrap="wrap">
                    <Badge colorScheme="purple">{stats?.headings || 0} headings</Badge>
                    <Badge colorScheme="green">{stats?.lists || 0} lists</Badge>
                    <Badge colorScheme="orange">{stats?.codeBlocks || 0} code blocks</Badge>
                  </Flex>
                </Flex>
              </Stat>
            </SimpleGrid>
            
            <Text fontSize="sm" color="gray.500" mt={4} textAlign="right">
              Last updated: {new Date().toLocaleTimeString()}
            </Text>
          </TabPanel>
          
          {/* History Tab */}
          <TabPanel>
            <EditHistory documentId={documentId} />
          </TabPanel>
          
          {/* Collaboration Tab */}
          <TabPanel>
            <CollaborationMap documentId={documentId} />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default AnalyticsPanel;