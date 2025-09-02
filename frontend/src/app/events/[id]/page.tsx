"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box,
  Button,
  Card,
  CardBody,
  Flex,
  Grid,
  Heading,
  Text,
  VStack,
  HStack,
  Badge,
  useColorModeValue,
  Image,
  Skeleton,
  SkeletonText,
  Divider,
  Avatar,
  Tooltip,
  IconButton,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  Checkbox,
  RadioGroup,
  Radio,
  Stack,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Spinner,
  Center
} from '@chakra-ui/react';
import {
  FaCalendarAlt,
  FaUsers,
  FaMapMarkerAlt,
  FaClock,
  FaGlobe,
  FaTicketAlt,
  FaLink,
  FaUser,
  FaBuilding,
  FaInfoCircle,
  FaCheckCircle,
  FaTimesCircle,
  FaArrowLeft,
  FaPlay,
  FaPause,
  FaVolumeUp,
  FaVolumeMute,
  FaExternalLinkAlt,
  FaUserPlus,
  FaClipboardCheck,
  FaHourglassHalf
} from 'react-icons/fa';
import { useParams, useRouter } from 'next/navigation';
import { api } from "@/utils/Functions/helperApi";
import { useUserStore } from "@/utils/stores/useUserStore";
import Header from '@/components/layout/Header';
import EventMediaCarousel from '@/components/common/Event-Media-Carousel/Event-Media-Carousel';

const MotionBox = motion.create(Box);
const MotionCard = motion.create(Card);
const MotionButton = motion.create(Button);

// Types - Updated to match your Prisma schema
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
  joinQuestions: string;
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
  contactInfo?: string;
  createdAt: string;
  updatedAt: string;
  parsedJoinQuestions?: string[];

};

type JoinFormData = {
  [key: string]: string | string[] | boolean;
};
type Params = { id: string };

const EventDetailsPage: React.FC = () => {
  const { id } = useParams() as Params;
  const router = useRouter();
  const toast = useToast();
  const { user } = useUserStore();
  const { isOpen: isJoinModalOpen, onOpen: onJoinModalOpen, onClose: onJoinModalClose } = useDisclosure();

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);
  const [joinStatus, setJoinStatus] = useState<'PENDING' | 'CONFIRMED' | null>(null);
  const [joinFormData, setJoinFormData] = useState<JoinFormData>({});
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [videoMuted, setVideoMuted] = useState(true);

  const cardBg = useColorModeValue("gray.800", "gray.900");
  const borderColor = useColorModeValue("gray.600", "gray.700");

  // Mock join questions - In real app, this would come from the API
  const mockJoinQuestions = [
    {
      id: 1,
      question: "What is your current experience level with this topic?",
      type: 'SELECT' as const,
      options: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
      required: true
    },
    {
      id: 2,
      question: "Why are you interested in attending this event?",
      type: 'TEXTAREA' as const,
      required: true
    },
    {
      id: 3,
      question: "Do you have any dietary restrictions?",
      type: 'TEXT' as const,
      required: false
    },
    {
      id: 4,
      question: "Which topics interest you most? (Select all that apply)",
      type: 'CHECKBOX' as const,
      options: ['Technical Implementation', 'Best Practices', 'Case Studies', 'Q&A Session'],
      required: false
    }
  ];


  useEffect(() => {
    if (id) {
      fetchEvent();
    }
  }, [id]);

  useEffect(() => {
    checkJoinStatus();
  }, [user]);


  const fetchEvent = async () => {
    setLoading(true);
    try {
      const response = await api().get(`/events/${id}`);
      const eventData = response.data;

      // Parse joinQuestions if it’s JSON string or array
      let parsedQuestions: string[] = [];
      try {
        parsedQuestions = typeof eventData.joinQuestions === "string"
          ? JSON.parse(eventData.joinQuestions)
          : Array.isArray(eventData.joinQuestions)
            ? eventData.joinQuestions
            : [];
      } catch (e) {
        console.error("Failed to parse joinQuestions:", e);
      }

      // Attach parsed questions to event
      setEvent({ ...eventData, parsedJoinQuestions: parsedQuestions ?? [] });
      // Parse DB join questions
     
    } catch (error) {
      console.error("Failed to fetch event:", error);
      toast({
        title: "Error",
        description: "Failed to load event details",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };


  const checkJoinStatus = async () => {
    if (!user?.user || user.user.role !== 'PARTICIPANT') return;

    try {

      const hasJoinedEvent = user?.user?.partticipations.filter((p: any) => p.eventId == id && (p?.status === "CONFIRMED" || p?.status === "PENDING")).length > 0;
      setHasJoined(hasJoinedEvent);
      if (hasJoinedEvent) {
        const participation = user?.user?.partticipations.find((p: any) => p.eventId == id);
        setJoinStatus(participation?.status === "CONFIRMED" ? "CONFIRMED" : "PENDING");
      }

    } catch (error) {
      console.error('Failed to check join status:', error);
    }
  };

  const handleJoinEvent = async () => {
    if (!user?.user || user.user.role !== 'PARTICIPANT') {
      toast({
        title: "Access Denied",
        description: "Only participants can join events",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    if (!event) return;

    setJoining(true);
    try {
      const payload = {
        answers: joinFormData
      };

      const response = await api().post(`/events/${event.id}/join`, payload);

      // Update based on your API response structure
      if (response.data) {
        setHasJoined(true);
        setJoinStatus(event.requiresApproval ? 'PENDING' : 'CONFIRMED');
        onJoinModalClose();

        toast({
          title: "Success!",
          description: event.requiresApproval
            ? "Your request has been submitted and is pending approval"
            : "You have successfully joined the event",
          status: "success",
          duration: 5000,
          isClosable: true,
        });

        // Refresh event data
        fetchEvent();
      }
    } catch (error: any) {
      console.error('Failed to join event:', error);
      toast({
        title: "Error",
        description: error?.response?.data?.error || "Failed to join event",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setJoining(false);
    }
  };
const handleInputChange = (
  questionId: string | number,
  value: string | string[] | boolean
) => {
  setJoinFormData(prev => ({
    ...prev,
    [questionId]: value
  }));
};

  const renderJoinQuestion = (question: typeof mockJoinQuestions[0]) => {
    switch (question.type) {
      case 'TEXT':
        return (
          <Input
            placeholder="Enter your answer"
            value={(joinFormData[question.id] as string) || ''}
            onChange={(e) => handleInputChange(question.id, e.target.value)}
            bg="gray.700"
            borderColor="gray.600"
            _hover={{ borderColor: "yellow.400" }}
            _focus={{ borderColor: "yellow.400" }}
          />
        );

      case 'TEXTAREA':
        return (
          <Textarea
            placeholder="Enter your answer"
            value={(joinFormData[question.id] as string) || ''}
            onChange={(e) => handleInputChange(question.id, e.target.value)}
            bg="gray.700"
            borderColor="gray.600"
            _hover={{ borderColor: "yellow.400" }}
            _focus={{ borderColor: "yellow.400" }}
            rows={4}
          />
        );

      case 'SELECT':
        return (
          <Select
            placeholder="Select an option"
            value={(joinFormData[question.id] as string) || ''}
            onChange={(e) => handleInputChange(question.id, e.target.value)}
            bg="gray.700"
            borderColor="gray.600"
            _hover={{ borderColor: "yellow.400" }}
            _focus={{ borderColor: "yellow.400" }}
          >
            {question.options?.map((option, index) => (
              <option key={index} value={option} style={{ background: '#2D3748' }}>
                {option}
              </option>
            ))}
          </Select>
        );
      case 'CHECKBOX':
        return (
          <Stack direction="column" spacing={2}>
            {question.options?.map((option, index) => (
              <Checkbox
                key={index}
                colorScheme="yellow"
                isChecked={(joinFormData[question.id] as string[])?.includes(option) || false}
                onChange={(e) => {
                  const currentValues = (joinFormData[question.id] as string[]) || [];
                  const newValues = e.target.checked
                    ? [...currentValues, option]
                    : currentValues.filter(v => v !== option);
                  handleInputChange(question.id, newValues);
                }}
              >
                {option}
              </Checkbox>
            ))}
          </Stack>
        );

      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
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

  const isEventFull = () => {
    return event?.totalSeats && event.confirmedParticipants >= event.totalSeats;
  };

  const isEventStarted = () => {
    return event && new Date(event.startDate) <= new Date();
  };

  const isEventEnded = () => {
    return event && new Date(event.endDate) <= new Date();
  };

  const canJoinEvent = () => {
    return user?.user?.role === 'PARTICIPANT' &&
      event?.status === 'ACTIVE' &&
      !isEventEnded() &&
      !isEventFull() &&
      !hasJoined;
  };

  const getJoinButtonText = () => {
    if (hasJoined) {
      if (joinStatus === 'PENDING') return 'Request Pending';
      if (joinStatus === 'CONFIRMED') return 'Joined';
      return 'Joined';
    }
    if (isEventEnded()) return 'Event Ended';
    if (isEventFull()) return 'Event Full';
    if (event?.requiresApproval) return 'Request to Join';
    return 'Join Event';
  };

  const getJoinButtonIcon = () => {
    if (hasJoined) {
      if (joinStatus === 'PENDING') return <FaHourglassHalf />;
      return <FaCheckCircle />;
    }
    if (event?.requiresApproval) return <FaClipboardCheck />;
    return <FaUserPlus />;
  };

  const getJoinButtonColorScheme = () => {
    if (hasJoined) {
      if (joinStatus === 'PENDING') return 'orange';
      return 'green';
    }
    return 'yellow';
  };

  if (loading) {
    return (
      <MotionBox
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        paddingX={6}
      >
        <Header />
        <Card bg={cardBg} border="1px" borderColor={borderColor} borderRadius="xl" shadow="xl" p={6}>
          <VStack spacing={6}>
            <Skeleton height="300px" width="100%" borderRadius="xl" />
            <VStack spacing={4} align="stretch" width="100%">
              <SkeletonText noOfLines={2} spacing="4" skeletonHeight="6" />
              <SkeletonText noOfLines={4} spacing="4" skeletonHeight="4" />
              <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={4}>
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} height="100px" borderRadius="lg" />
                ))}
              </Grid>
            </VStack>
          </VStack>
        </Card>
      </MotionBox>
    );
  }

  if (!event) {
    return (
      <MotionBox
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        paddingX={6}
      >
        <Header />
        <Card bg={cardBg} border="1px" borderColor={borderColor} borderRadius="xl" p={8}>
          <VStack spacing={6}>
            <Box
              p={6}
              borderRadius="full"
              bgGradient="linear(to-r, red.500, red.600)"
              color="white"
            >
              <FaTimesCircle size="48px" />
            </Box>
            <VStack spacing={3}>
              <Heading size="lg" color="white">Event Not Found</Heading>
              <Text color="gray.400" textAlign="center">
                The event you're looking for doesn't exist or has been removed.
              </Text>
              <Button
                leftIcon={<FaArrowLeft />}
                onClick={() => router.push('/events')}
                colorScheme="yellow"
                variant="outline"
              >
                Back to Events
              </Button>
            </VStack>
          </VStack>
        </Card>
      </MotionBox>
    );
  }


  return (
    <MotionBox
      initial={{ y: 40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8 }}
      paddingX={6}
      paddingBottom={8}
    >
      <Header />

      {/* Back Button */}
      <HStack spacing={4} mb={6}>
        <IconButton
          aria-label="Back to events"
          icon={<FaArrowLeft />}
          onClick={() => router.back()}
          colorScheme="gray"
          variant="outline"
          borderColor={borderColor}
          _hover={{ borderColor: "yellow.400", color: "yellow.400" }}
        />
        <Text color="gray.400">Back to Events</Text>
      </HStack>

      {/* Hero Section */}
      <MotionCard
        bg={cardBg}
        border="1px"
        borderColor={borderColor}
        borderRadius="xl"
        shadow="xl"
        overflow="hidden"
        mb={6}
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        {/* Cover Media */}
        {event.attachments && event.attachments.length > 0 ? (
          <EventMediaCarousel attachments={event.attachments || []} />
        ) : (
          <Box w="100%" h="300px" bg="gray.700" display="flex" alignItems="center" justifyContent="center">
            <Text color="gray.400">No media available</Text>
          </Box>
        )}


        <CardBody p={8}>
          <VStack spacing={6} align="stretch">
            {/* Header */}
            <Flex justify="space-between" align="start" wrap="wrap" gap={4}>
              <VStack align="start" spacing={3} flex="1">
                <HStack spacing={2} wrap="wrap">
                  <Badge
                    colorScheme={getStatusColor(event.status)}
                    size="md"
                    px={3}
                    py={1}
                  >
                    {event.status}
                  </Badge>
                  <Badge colorScheme="purple" size="md" px={3} py={1}>
                    {event.TypeOfEvent}
                  </Badge>
                  <Badge
                    colorScheme={event.type === 'ONLINE' ? 'blue' : 'green'}
                    size="md"
                    px={3}
                    py={1}
                  >
                    {event.type === 'ONLINE' ? 'Online' : 'Onsite'}
                  </Badge>
                  {event.requiresApproval && (
                    <Badge colorScheme="orange" size="md" px={3} py={1}>
                      Approval Required
                    </Badge>
                  )}
                </HStack>

                <Heading size="2xl" color="white" lineHeight="1.2">
                  {event.title}
                </Heading>

                <Text fontSize="lg" color="gray.300" lineHeight="1.6">
                  {event.description}
                </Text>
              </VStack>

              {/* Join Button */}
              <VStack spacing={3}>
                {hasJoined && joinStatus === 'PENDING' && (
                  <Alert status="warning" borderRadius="lg" bg="orange.100" color="orange.800">
                    <AlertIcon />
                    <AlertTitle fontSize="sm">Pending Approval</AlertTitle>
                  </Alert>
                )}

                {hasJoined && joinStatus === 'CONFIRMED' && (
                  <Alert status="success" borderRadius="lg" bg="green.100" color="green.800">
                    <AlertIcon />
                    <AlertTitle fontSize="sm">You're Registered!</AlertTitle>
                  </Alert>
                )}

                <MotionButton
                  size="lg"
                  colorScheme={getJoinButtonColorScheme()}
                  leftIcon={getJoinButtonIcon()}
                  onClick={canJoinEvent() ? onJoinModalOpen : undefined}
                  isDisabled={!canJoinEvent()}
                  px={8}
                  py={6}
                  fontSize="lg"
                  whileHover={canJoinEvent() ? { scale: 1.05 } : {}}
                  whileTap={canJoinEvent() ? { scale: 0.95 } : {}}
                >
                  {getJoinButtonText()}
                </MotionButton>

                {isEventFull() && (
                  <Text fontSize="sm" color="red.400" textAlign="center">
                    This event is at capacity
                  </Text>
                )}
              </VStack>
            </Flex>

            <Divider borderColor="gray.600" />

            {/* Event Details Grid */}
            <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }} gap={6}>
              {/* Start Date & Time */}
              <Card bg="gray.700" borderRadius="lg" p={4}>
                <VStack spacing={3}>
                  <Box color="yellow.400">
                    <FaCalendarAlt size="24px" />
                  </Box>
                  <VStack spacing={1}>
                    <Text color="gray.400" fontSize="sm" fontWeight="medium">
                      Start Date
                    </Text>
                    <Text color="white" fontSize="md" fontWeight="bold" textAlign="center">
                      {formatDate(event.startDate)}
                    </Text>
                    <Text color="yellow.400" fontSize="sm" fontWeight="medium">
                      {formatTime(event.startDate)}
                    </Text>
                  </VStack>
                </VStack>
              </Card>

              {/* Duration */}
              <Card bg="gray.700" borderRadius="lg" p={4}>
                <VStack spacing={3}>
                  <Box color="blue.400">
                    <FaClock size="24px" />
                  </Box>
                  <VStack spacing={1}>
                    <Text color="gray.400" fontSize="sm" fontWeight="medium">
                      Duration
                    </Text>
                    <Text color="white" fontSize="md" fontWeight="bold" textAlign="center">
                      {formatDate(event.endDate)}
                    </Text>
                    <Text color="blue.400" fontSize="sm" fontWeight="medium">
                      {formatTime(event.endDate)}
                    </Text>
                  </VStack>
                </VStack>
              </Card>

              {/* Location */}
              <Card bg="gray.700" borderRadius="lg" p={4}>
                <VStack spacing={3}>
                  <Box color={event.type === 'ONLINE' ? 'purple.400' : 'green.400'}>
                    {event.type === 'ONLINE' ? <FaGlobe size="24px" /> : <FaMapMarkerAlt size="24px" />}
                  </Box>
                  <VStack spacing={1}>
                    <Text color="gray.400" fontSize="sm" fontWeight="medium">
                      {event.type === 'ONLINE' ? 'Platform' : 'Location'}
                    </Text>
                    <Text color="white" fontSize="md" fontWeight="bold" textAlign="center" noOfLines={2}>
                      {event.type === 'ONLINE' ? 'Online Event' : (event.venue || 'TBA')}
                    </Text>
                    {event.type === 'ONLINE' && event.joinLink && hasJoined && joinStatus === 'CONFIRMED' && (
                      <Button
                        as="a"
                        href={event.joinLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        size="xs"
                        colorScheme="purple"
                        variant="outline"
                        leftIcon={<FaExternalLinkAlt />}
                      >
                        Join Now
                      </Button>
                    )}
                  </VStack>
                </VStack>
              </Card>

              {/* Participants */}
              <Card bg="gray.700" borderRadius="lg" p={4}>
                <VStack spacing={3}>
                  <Box color="orange.400">
                    <FaUsers size="24px" />
                  </Box>
                  <VStack spacing={1}>
                    <Text color="gray.400" fontSize="sm" fontWeight="medium">
                      Participants
                    </Text>
                    <Text color="white" fontSize="md" fontWeight="bold">
                      {event.confirmedParticipants}
                      {event.totalSeats && `/${event.totalSeats}`}
                    </Text>
                    <Text color="orange.400" fontSize="sm" fontWeight="medium">
                      {event.totalSeats ?
                        `${event.totalSeats - event.confirmedParticipants} spots left` :
                        'Unlimited'
                      }
                    </Text>
                  </VStack>
                </VStack>
              </Card>
            </Grid>

            {/* Organizer Info */}
            <Card bg="gray.700" borderRadius="lg" p={4}>
              <HStack spacing={4}>
                <Avatar
                  name={event.organizer.name}
                  size="lg"
                  bg="yellow.500"
                  color="white"
                />
                <VStack align="start" spacing={1}>
                  <Text color="gray.400" fontSize="sm">Hosted by</Text>
                  <Text color="white" fontSize="lg" fontWeight="bold">
                    {event?.company?.name} (Company)
                  </Text>
                  <Text color="gray.400" fontSize="sm">
                    {event.organizer.name} (Event Head)
                  </Text>
                </VStack>
              </HStack>
            </Card>
          </VStack>
        </CardBody>
      </MotionCard>

      {/* Join Modal */}
      <Modal isOpen={isJoinModalOpen} onClose={onJoinModalClose} size="xl">
        <ModalOverlay />
        <ModalContent bg={cardBg} border="1px" borderColor={borderColor}>
          <ModalHeader color="white">
            <HStack spacing={3}>
              <Box color="yellow.400">
                <FaUserPlus />
              </Box>
              <Text>
                {event.requiresApproval ? 'Request to Join Event' : 'Join Event'}
              </Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton color="gray.400" />

          <ModalBody>
            <VStack spacing={6} align="stretch">
              {event.requiresApproval && (
                <Alert status="info" borderRadius="lg">
                  <AlertIcon />
                  <AlertDescription>
                    This event requires approval. Your request will be reviewed by the organizer.
                  </AlertDescription>
                </Alert>
              )}



                  {(event?.parsedJoinQuestions!.length > 0 || mockJoinQuestions.length > 0) && (
                    <VStack spacing={4} align="stretch">
                      <Text color="white" fontSize="lg" fontWeight="bold">
                        Please answer the following questions:
                      </Text>

                      {/* Dynamic DB questions (just text inputs) */}
                      {event?.parsedJoinQuestions?.map((q: string, idx: number) => (
                        <FormControl key={`db-q-${idx}`} isRequired={false}>
                          <FormLabel color="gray.300" fontSize="sm">{q}</FormLabel>
                          <Input
                            placeholder="Enter your answer"
                            value={(joinFormData[`db-${idx}`] as string) || ''}
                            onChange={(e) => handleInputChange(`db-${idx}`, e.target.value)}
                            bg="gray.700"
                            borderColor="gray.600"
                            _hover={{ borderColor: "yellow.400" }}
                            _focus={{ borderColor: "yellow.400" }}
                          />
                        </FormControl>
                      ))}

                      {/* Mock questions (structured types) */}
                      {mockJoinQuestions.map((question) => (
                        <FormControl key={question.id} isRequired={question.required}>
                          <FormLabel color="gray.300" fontSize="sm">
                            {question.question}
                            {question.required && <Text as="span" color="red.400"> *</Text>}
                          </FormLabel>
                          {renderJoinQuestion(question)}
                        </FormControl>
                      ))}
                    </VStack>
                  )}

              
              <Alert status="warning" borderRadius="lg">
                <AlertIcon />
                <AlertDescription>
                  By joining this event, you agree to attend and follow all event guidelines.
                </AlertDescription>
              </Alert>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <HStack spacing={3}>
              <Button variant="outline" onClick={onJoinModalClose} colorScheme="gray">
                Cancel
              </Button>
              <Button
                colorScheme="yellow"
                onClick={handleJoinEvent}
                isLoading={joining}
                loadingText={event.requiresApproval ? "Submitting Request..." : "Joining..."}
                leftIcon={event.requiresApproval ? <FaClipboardCheck /> : <FaUserPlus />}
              >
                {event.requiresApproval ? 'Submit Request' : 'Join Event'}
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </MotionBox>
  );
};

export default EventDetailsPage;