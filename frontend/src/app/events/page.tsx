"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Flex,
  Grid,
  Heading,
  Text,
  VStack,
  HStack,
  Badge,
  useColorModeValue,
  Input,
  InputGroup,
  InputLeftElement,
  Image,
  Skeleton,
  SkeletonText,
  Spinner,
  Center,
  Tooltip,
  SimpleGrid
} from '@chakra-ui/react';
import {
  FaCalendarAlt,
  FaSearch,
  FaUsers,
  FaMapMarkerAlt,
  FaClock,
  FaCalendarCheck,
  FaCalendarTimes,
  FaChevronLeft,
  FaChevronRight,
  FaTicketAlt,
  FaGlobe,
  FaLock,
  FaEye,
  FaLink
} from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { api } from "@/utils/Functions/helperApi";
import Header from '@/components/layout/Header';

const MotionBox = motion.create(Box);
const MotionCard = motion.create(Card);
const MotionButton = motion.create(Button);

// Updated Types based on your Prisma schema
type Event = {
  id: number;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  venue?: string;
  joinLink?: string;
  totalSeats?: number;
  requiresApproval: boolean;
  type: 'ONSITE' | 'ONLINE';
  status: 'CANCELLED' | 'COMPLETED' | 'DRAFT' | 'ACTIVE';
  TypeOfEvent: 'WEBINAR' | 'SEMINAR' | 'WORKSHOP' | 'COMPETITION' | 'CONFERENCE' | 'OTHER';
  organizer: {
    id: number;
    name: string;
  };
  company: {
    id: number;
    name: string;
  };
  attachments?: Array<{
    id: number;
    url: string;
    type: 'IMAGE' | 'VIDEO';
    publicId?: string;
  }>;
  confirmedParticipants: number;
  createdAt: string;
  updatedAt: string;
};

type EventsResponse = {
  page: number;
  pageSize: number;
  total: number;
  items: Event[];
};

type FilterState = {
  status: 'active' | 'completed' | 'cancelled' | 'all';
  search: string;
  page: number;
  pageSize: number;
};
type PublicEventsPageProps = {
  onViewEvent?: (eventId: number) => void;
};

const EventCard = ({
  event,
  onView
}: {
  event: Event;
  onView: (id: number) => void;
}) => {
  const cardBg = useColorModeValue("gray.800", "gray.900");
  const borderColor = useColorModeValue("gray.600", "gray.700");
  const router = useRouter();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };
  const handleViewEvent = (id: number) => {
    router.push(`/events/${id}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'green';
      case 'COMPLETED': return 'blue';
      case 'DRAFT': return 'yellow';
      case 'CANCELLED': return 'red';
      default: return 'gray';
    }
  };

  const getEventTypeIcon = (type: string) => {
    return type === 'ONLINE' ? <FaLink /> : <FaMapMarkerAlt />;
  };

  const getEventTypeText = (type: string) => {
    return type === 'ONLINE' ? 'Online' : 'Onsite';
  };

  const coverImage = event.attachments?.find(att => att.type === 'IMAGE');
  const coverVideo = !coverImage
    ? event.attachments?.find(att => att.type === 'VIDEO')
    : null;
  return (
    <MotionCard
      bg={cardBg}
      border="1px"
      borderColor={borderColor}
      borderRadius="xl"
      shadow="lg"
      overflow="hidden"
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.2 }}
      _hover={{
        borderColor: "yellow.400",
        shadow: "2xl"
      }}
      cursor="pointer"
      onClick={() => handleViewEvent(event.id)}
    >

      {coverImage ? (
        <Image
          src={coverImage.url}
          alt={event.title}
          height="200px"
          width="100%"
          objectFit="cover"
          fallback={
            <Box
              height="200px"
              bg="gray.700"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <FaCalendarAlt size="48px" color="white" opacity="0.3" />
            </Box>
          }
        />
      ) : coverVideo ? (
        <Box height="200px" width="100%" position="relative">
          <video
            src={coverVideo.url}
            controls={false}
            muted
            autoPlay
            loop
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              borderRadius: "8px"
            }}
          />
          {/* Overlay gradient for better text visibility */}
          <Box
            position="absolute"
            top="0"
            left="0"
            right="0"
            bottom="0"
            bgGradient="linear(to-b, rgba(0,0,0,0.3), rgba(0,0,0,0.6))"
          />
        </Box>
      ) : (
        <Box
          height="200px"
          bgGradient="linear(to-r, yellow.600, gray.800)"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <FaCalendarAlt size="48px" color="white" opacity="0.3" />
        </Box>
      )}


      <CardBody p={6}>
        <VStack spacing={4} align="stretch">
          {/* Header */}
          <HStack justify="space-between" align="start">
            <VStack align="start" spacing={1} flex="1">
              <HStack>
                <Badge
                  colorScheme={getStatusColor(event.status)}
                  size="sm"
                >
                  {event.status}
                </Badge>
                <Tooltip label={getEventTypeText(event.type)}>
                  <Box color="gray.400">
                    {getEventTypeIcon(event.type)}
                  </Box>
                </Tooltip>
                <Badge colorScheme="purple" size="sm">
                  {event.TypeOfEvent}
                </Badge>
              </HStack>
              <Heading size="md" color="white" noOfLines={2}>
                {event.title}
              </Heading>
              <Text fontSize="sm" color="gray.400" noOfLines={2}>
                {event.description}
              </Text>
            </VStack>
          </HStack>

          {/* Event Details */}
          <VStack spacing={3} align="stretch">
            <HStack spacing={4}>
              <HStack spacing={2} flex="1">
                <FaCalendarAlt color="#718096" />
                <VStack align="start" spacing={0}>
                  <Text fontSize="xs" color="gray.500">Start Date</Text>
                  <Text fontSize="sm" color="white">
                    {formatDate(event.startDate)}
                  </Text>
                </VStack>
              </HStack>
              <HStack spacing={2} flex="1">
                <FaClock color="#718096" />
                <VStack align="start" spacing={0}>
                  <Text fontSize="xs" color="gray.500">Time</Text>
                  <Text fontSize="sm" color="white">
                    {formatTime(event.startDate)}
                  </Text>
                </VStack>
              </HStack>
            </HStack>

            {event.venue && event.type === 'ONSITE' && (
              <HStack spacing={2}>
                <FaMapMarkerAlt color="#718096" />
                <Text fontSize="sm" color="gray.300" noOfLines={1}>
                  {event.venue}
                </Text>
              </HStack>
            )}

            {event.joinLink && event.type === 'ONLINE' && (
              <HStack spacing={2}>
                <FaGlobe color="#718096" />
                <Text fontSize="sm" color="gray.300" noOfLines={1}>
                  Online Event
                </Text>
              </HStack>
            )}

            {/* Stats */}
            <HStack justify="space-between">
              <HStack spacing={4}>
                <HStack spacing={2}>
                  <FaUsers color="#718096" />
                  <Text fontSize="sm" color="gray.300">
                    {event.confirmedParticipants}
                    {event.totalSeats && `/${event.totalSeats}`}
                  </Text>
                </HStack>
                <HStack spacing={2}>
                  <FaTicketAlt color="#718096" />
                  <Text fontSize="sm" color="gray.300">
                    {event.requiresApproval ? 'Approval Needed' : 'Open Registration'}
                  </Text>
                </HStack>
              </HStack>
              <Text fontSize="xs" color="gray.500">
                by {event.organizer.name}
              </Text>
            </HStack>
          </VStack>

          {/* Action Button */}
          <HStack spacing={2} pt={2}>
            <Button
              size="sm"
              colorScheme="yellow"
              variant="outline"
              leftIcon={<FaEye />}
              onClick={(e) => {
                e.stopPropagation();
                handleViewEvent(event.id);
              }}
              width="100%"
              _hover={{
                transform: "translateY(-1px)",
                shadow: "lg"
              }}
            >
              View Details
            </Button>
          </HStack>
        </VStack>
      </CardBody>
    </MotionCard>
  );
};

const PublicEventsPage: React.FC<PublicEventsPageProps> = ({
  onViewEvent
}) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalEvents, setTotalEvents] = useState(0);
  const [filters, setFilters] = useState<FilterState>({
    status: 'active',
    search: '',
    page: 1,
    pageSize: 12
  });

  const cardBg = useColorModeValue("gray.800", "gray.900");
  const borderColor = useColorModeValue("gray.600", "gray.700");

  // Fetch public events only
  const fetchEvents = async () => {
    setLoading(true);
    try {

      let statusParam = '';

      if (filters.status === 'active') statusParam = 'active';
      else if (filters.status === 'completed') statusParam = 'completed';
      else if (filters.status === 'cancelled') statusParam = 'cancelled';
      else statusParam = 'all';


      const params = new URLSearchParams({
        ...(statusParam ? { status: statusParam } : {}),
        search: filters.search,
        page: filters.page.toString(),
        pageSize: filters.pageSize.toString()
      });

      const response = await api().get(`/events?${params}`);
      const data: EventsResponse = response.data;

      setEvents(data.items);
      setTotalEvents(data.total);
    } catch (error) {
      console.error('Failed to fetch events:', error);
      setEvents([]);
      setTotalEvents(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [filters]);
  useEffect(() => {
    const syncExpired = async () => {
      await api().patch("/events/mark-expired");
    };
    syncExpired();
  }, [events]);

  // Handle search
  const handleSearch = (value: string) => {
    setFilters(prev => ({
      ...prev,
      search: value,
      page: 1
    }));
  };

  // Handle status filter
  const handleStatusFilter = (status: 'active' | 'completed' | 'cancelled' | 'all') => {
    setFilters(prev => ({
      ...prev,
      status,
      page: 1
    }));
  };

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({
      ...prev,
      page: newPage
    }));
  };

  const totalPages = Math.ceil(totalEvents / filters.pageSize);
  const activeEvents = events.filter(e => new Date(e.endDate) > new Date()).length;
  const completedEvents = events.filter(e => new Date(e.endDate) <= new Date()).length;

  return (
    <MotionBox
      initial={{ y: 40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8 }}
      paddingX={6}
    >
      <Header />
      {/* Header */}
      <Card bg={cardBg} border="1px" borderColor={borderColor} borderRadius="xl" shadow="xl" mb={6}>
        <CardHeader pb={4}>
          <Flex justify="center" align="center" direction="column" textAlign="center" gap={4}>
            <HStack spacing={3}>
              <Box
                p={3}
                borderRadius="lg"
                bgGradient="linear(to-r, yellow.500, gray.600)"
                color="white"
              >
                <FaCalendarAlt size="24px" />
              </Box>
              <VStack align="start" spacing={1}>
                <Heading size="xl" color="white">Discover Events</Heading>
                <Text color="gray.400" fontSize="md">
                  Find amazing events happening near you
                </Text>
              </VStack>
            </HStack>
          </Flex>
        </CardHeader>

        <CardBody pt={0}>
          {/* Statistics */}
          <Grid templateColumns={{ base: "repeat(2, 1fr)", md: "repeat(3, 1fr)" }} gap={4} mb={6}>
            <Card bg="gray.700" borderRadius="lg" p={4}>
              <VStack spacing={2}>
                <Box color="blue.400">
                  <FaCalendarAlt size="24px" />
                </Box>
                <Text color="white" fontSize="2xl" fontWeight="bold">{totalEvents}</Text>
                <Text color="gray.400" fontSize="sm">Total Events</Text>
              </VStack>
            </Card>

            <Card bg="gray.700" borderRadius="lg" p={4}>
              <VStack spacing={2}>
                <Box color="yellow.400">
                  <FaCalendarCheck size="24px" />
                </Box>
                <Text color="white" fontSize="2xl" fontWeight="bold">{activeEvents}</Text>
                <Text color="gray.400" fontSize="sm">Upcoming Events</Text>
              </VStack>
            </Card>

            <Card bg="gray.700" borderRadius="lg" p={4}>
              <VStack spacing={2}>
                <Box color="purple.400">
                  <FaUsers size="24px" />
                </Box>
                <Text color="white" fontSize="2xl" fontWeight="bold">
                  {events.reduce((sum, event) => sum + event.confirmedParticipants, 0)}
                </Text>
                <Text color="gray.400" fontSize="sm">Participants</Text>
              </VStack>
            </Card>
          </Grid>

          {/* Search & Filters */}
          <VStack spacing={4} align="stretch">
            <Flex gap={4} wrap="wrap" justify="center">
              <InputGroup maxW="400px" flex="1">
                <InputLeftElement pointerEvents="none">
                  <FaSearch color="#718096" />
                </InputLeftElement>
                <Input
                  placeholder="Search events..."
                  value={filters.search}
                  onChange={(e) => handleSearch(e.target.value)}
                  bg="gray.700"
                  borderColor="gray.600"
                  _hover={{ borderColor: "yellow.400" }}
                  _focus={{ borderColor: "yellow.400", boxShadow: "0 0 0 1px #3182ce" }}
                />
              </InputGroup>

              <HStack spacing={2}>
                <Text color="gray.400" fontSize="sm">Show:</Text>
                 <Button
                  size="sm"
                  variant={filters.status === 'all' ? 'solid' : 'outline'}
                  colorScheme={filters.status === 'all' ? 'yellow' : 'gray'}
                  onClick={() => handleStatusFilter('all')}
                >
                  All
                </Button>
                <Button
                  size="sm"
                  variant={filters.status === 'active' ? 'solid' : 'outline'}
                  colorScheme={filters.status === 'active' ? 'yellow' : 'gray'}
                  onClick={() => handleStatusFilter('active')}
                >
                  Upcoming
                </Button>
                <Button
                  size="sm"
                  variant={filters.status === 'completed' ? 'solid' : 'outline'}
                  colorScheme={filters.status === 'completed' ? 'blue' : 'gray'}
                  onClick={() => handleStatusFilter('completed')}
                >
                  Completed
                </Button>
                <Button
                  size="sm"
                  variant={filters.status === 'cancelled' ? 'solid' : 'outline'}
                  colorScheme={filters.status === 'cancelled' ? 'red' : 'gray'}
                  onClick={() => handleStatusFilter('cancelled')}
                >
                  Cancelled
                </Button>
              </HStack>

            </Flex>
          </VStack>
        </CardBody>
      </Card>

      {/* Events Grid */}
      {loading ? (
        <Grid
          templateColumns={{
            base: "1fr",
            md: "repeat(2, 1fr)",
            lg: "repeat(3, 1fr)",
            xl: "repeat(4, 1fr)"
          }}
          gap={6}
        >
          {Array.from({ length: 8 }).map((_, index) => (
            <Card key={index} bg={cardBg} border="1px" borderColor={borderColor} borderRadius="xl">
              <Skeleton height="200px" borderTopRadius="xl" />
              <CardBody>
                <VStack spacing={3} align="stretch">
                  <SkeletonText mt="4" noOfLines={2} spacing="4" skeletonHeight="2" />
                  <SkeletonText noOfLines={1} spacing="4" skeletonHeight="2" />
                  <Skeleton height="20px" />
                </VStack>
              </CardBody>
            </Card>
          ))}
        </Grid>
      ) : events.length === 0 ? (
        <Card bg={cardBg} border="1px" borderColor={borderColor} borderRadius="xl" p={8}>
          <VStack spacing={6}>
            <Box
              p={6}
              borderRadius="full"
              bgGradient="linear(to-r, yellow.500, yellow.600)"
              color="white"
            >
              <FaCalendarAlt size="48px" />
            </Box>
            <VStack spacing={3}>
              <Heading size="lg" color="white">No Events Found</Heading>
              <Text color="gray.400" textAlign="center" maxW="400px">
                {filters.search
                  ? "Try adjusting your search criteria or filters to find more events."
                  : "There are no events available at the moment. Check back later for exciting events!"}
              </Text>
            </VStack>
          </VStack>
        </Card>
      ) : (
        <>
          <Grid
            templateColumns={{
              base: "1fr",
              md: "repeat(2, 1fr)",
              lg: "repeat(3, 1fr)",
              xl: "repeat(4, 1fr)"
            }}
            gap={6}
            mb={8}
          >
            <AnimatePresence>
              {events.map((event, index) => (
                <MotionBox
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1, duration: 0.3 }}
                >
                  <EventCard
                    event={event}
                    onView={(id) => onViewEvent?.(id)}
                  />
                </MotionBox>
              ))}
            </AnimatePresence>
          </Grid>

          {/* Pagination */}
          {totalPages > 1 && (
            <Card bg={cardBg} border="1px" borderColor={borderColor} borderRadius="xl" p={4}>
              <HStack justify="center" spacing={4}>
                <Button
                  leftIcon={<FaChevronLeft />}
                  onClick={() => handlePageChange(filters.page - 1)}
                  isDisabled={filters.page === 1}
                  variant="outline"
                  colorScheme="gray"
                >
                  Previous
                </Button>

                <HStack spacing={2}>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <Button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        variant={filters.page === pageNum ? 'solid' : 'outline'}
                        colorScheme={filters.page === pageNum ? 'yellow' : 'gray'}
                        size="sm"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </HStack>

                <Button
                  rightIcon={<FaChevronRight />}
                  onClick={() => handlePageChange(filters.page + 1)}
                  isDisabled={filters.page === totalPages}
                  variant="outline"
                  colorScheme="gray"
                >
                  Next
                </Button>
              </HStack>

              <Text textAlign="center" color="gray.400" fontSize="sm" mt={4}>
                Showing {((filters.page - 1) * filters.pageSize) + 1}-{Math.min(filters.page * filters.pageSize, totalEvents)} of {totalEvents} events
              </Text>
            </Card>
          )}
        </>
      )}
    </MotionBox>
  );
};

export default PublicEventsPage;