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
    Tag,
    TagLabel,
    TagLeftIcon
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
    FaCheckCircle,
    FaHourglassHalf,
    FaTimesCircle,
    FaArrowRight,
    FaFilter,
    FaEye
} from 'react-icons/fa';

import { CheckCircleIcon, CloseIcon, TimeIcon, WarningIcon } from '@chakra-ui/icons';
import { useRouter } from 'next/navigation';
import { api } from "@/utils/Functions/helperApi";
import { useUserStore } from "@/utils/stores/useUserStore";
import Header from '@/components/layout/Header';
import EventMediaCarousel from '@/components/common/Event-Media-Carousel/Event-Media-Carousel';
import StatusBadge from '@/components/common/Tag-Status-Badge/Tag-Status-Badge';
const MotionBox = motion.create(Box);
const MotionCard = motion.create(Card);
const MotionButton = motion.create(Button);

// Types
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
    contactInfo?: string;
    createdAt: string;
    updatedAt: string;
};

type Participation = {
    id: number;
    eventId: number;
    participantId: number;
    status: 'PENDING' | 'CONFIRMED' | 'REJECTED' | 'CANCELLED';
    answers: Record<string, any>;
    joinedAt: string;
    event?: Event;
};

type ParticipantDashboardProps = {};

const ParticipantDashboard: React.FC<ParticipantDashboardProps> = () => {
    const router = useRouter();
    const toast = useToast();
    const { user } = useUserStore();
    const [events, setEvents] = useState<Event[]>([]);
    const [participations, setParticipations] = useState<Participation[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState(0);
    const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'upcoming' | 'past'>('all');

    const cardBg = useColorModeValue("gray.800", "gray.900");
    const borderColor = useColorModeValue("gray.600", "gray.700");
    const tabBg = useColorModeValue("gray.700", "gray.800");

    useEffect(() => {
        if (user?.user?.partticipations) {
            // Transform the participations from the user store
            const userParticipations = user?.user?.partticipations.map((p: Participation) => ({
                ...p,
                status: p.status as 'PENDING' | 'CONFIRMED' | 'REJECTED' | 'CANCELLED'
            }));
            setParticipations(userParticipations);
            fetchEventsDetails(userParticipations);
        }
    }, [user]);

    const fetchEventsDetails = async (participations: Participation[]) => {
        setLoading(true);
        try {
            const eventPromises = participations.map(async (participation) => {
                try {
                    const response = await api().get(`/events/${participation.eventId}`);
                    return response.data;
                } catch (error) {
                    console.error(`Failed to fetch event ${participation.eventId}:`, error);
                    return null;
                }
            });

            const eventsData = await Promise.all(eventPromises);
            setEvents(eventsData.filter(event => event !== null));
        } catch (error) {
            console.error('Failed to fetch events:', error);
            toast({
                title: "Error",
                description: "Failed to load your events",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setLoading(false);
        }
    };

    const getEventWithParticipation = (eventId: number) => {
        return participations.find(p => p.eventId === eventId);
    };

    const filteredEvents = events.filter(event => {
        const participation = getEventWithParticipation(event.id);

        if (!participation) return false;

        switch (filter) {
            case 'pending':
                return participation.status === 'PENDING';
            case 'confirmed':
                return participation.status === 'CONFIRMED';
            case 'upcoming':
                return participation.status === 'CONFIRMED' && new Date(event.startDate) > new Date();
            case 'past':
                return new Date(event.endDate) < new Date();
            default:
                return true;
        }
    });

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

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ACTIVE': return 'green';
            case 'COMPLETED': return 'blue';
            case 'DRAFT': return 'yellow';
            case 'CANCELLED': return 'red';
            default: return 'gray';
        }
    };

    type Status = "PENDING" | "CONFIRMED" | "REJECTED" | "CANCELLED";

    interface StatusBadgeProps {
        status: Status;
        size?: "sm" | "md" | "lg";
    }



    const EventCard = ({ event }: { event: Event }) => {
        const participation = getEventWithParticipation(event.id);
         const coverImage = event.attachments?.find(att => att.type === "IMAGE");

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
                onClick={() => router.push(`/events/${event.id}`)}
            >
                {coverImage ? (
                    <Image
                        src={coverImage.url}
                        alt={event.title}
                        height="200px"
                        width="100%"
                        objectFit="cover"
                    />
                ) : (
                    <Box
                        height="200px"
                        bgGradient="linear(to-r, yellow.600, gray.800, purple.600)"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                    >
                        <FaCalendarAlt size="48px" color="white" opacity="0.4" />
                    </Box>
                )}
                <CardBody p={6}>
                    <VStack spacing={4} align="stretch">
                        {/* Header */}
                        <VStack align="start" spacing={2}>
                            <HStack spacing={2} wrap="wrap">
                                <Badge
                                    colorScheme={getStatusColor(event.status)}
                                    size="sm"
                                >
                                    {event.status}
                                </Badge>
                                <Badge colorScheme="purple" size="sm">
                                    {event.TypeOfEvent}
                                </Badge>
                                {participation && (
                                    <StatusBadge status={participation.status} size="sm" />
                                )}
                            </HStack>

                            <Heading size="md" color="white" noOfLines={2}>
                                {event.title}
                            </Heading>

                            <Text fontSize="sm" color="gray.400" noOfLines={2}>
                                {event.description}
                            </Text>
                        </VStack>

                        <Divider borderColor="gray.600" />

                        {/* Event Details */}
                        <VStack spacing={3} align="stretch">
                            <HStack spacing={4}>
                                <HStack spacing={2} flex="1">
                                    <FaCalendarAlt color="#718096" />
                                    <VStack align="start" spacing={0}>
                                        <Text fontSize="xs" color="gray.500">Date</Text>
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

                            <HStack spacing={2}>
                                {event.type === 'ONLINE' ? <FaGlobe color="#718096" /> : <FaMapMarkerAlt color="#718096" />}
                                <Text fontSize="sm" color="gray.300" noOfLines={1}>
                                    {event.type === 'ONLINE' ? 'Online Event' : (event.venue || 'TBA')}
                                </Text>
                            </HStack>

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
                            </HStack>
                        </VStack>

                        {/* Action Button */}
                        <HStack spacing={2} pt={2}>
                            <Button
                                size="sm"
                                colorScheme="yellow"
                                variant="outline"
                                rightIcon={<FaEye />}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    router.push(`/events/${event.id}`);
                                }}
                                width="100%"
                                _hover={{
                                    transform: "translateY(-1px)",
                                    shadow: "lg"
                                }}
                            >
                                View Event
                            </Button>
                        </HStack>
                    </VStack>
                </CardBody>
            </MotionCard>
        );
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
                        <Skeleton height="40px" width="300px" borderRadius="lg" />
                        <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} gap={6} width="100%">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <Card key={i} bg={cardBg} border="1px" borderColor={borderColor} borderRadius="xl">
                                    <Skeleton height="200px" borderTopRadius="xl" />
                                    <CardBody>
                                        <VStack spacing={3} align="stretch">
                                            <SkeletonText noOfLines={2} spacing="4" skeletonHeight="4" />
                                            <SkeletonText noOfLines={3} spacing="4" skeletonHeight="2" />
                                            <Skeleton height="20px" />
                                        </VStack>
                                    </CardBody>
                                </Card>
                            ))}
                        </Grid>
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

            {/* Dashboard Header */}
            <Card bg={cardBg} border="1px" borderColor={borderColor} borderRadius="xl" shadow="xl" mb={6}>
                <CardBody p={8}>
                    <VStack spacing={6} align="stretch">
                        <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
                            <VStack align="start" spacing={2}>
                                <Heading size="xl" color="white">My Events</Heading>
                                <Text color="gray.400">
                                    Manage your event participations and track your registrations
                                </Text>
                            </VStack>

                            <HStack spacing={4}>
                                <Badge colorScheme="green" fontSize="lg" px={3} py={1}>
                                    {participations.filter(p => p.status === 'CONFIRMED').length} Confirmed
                                </Badge>
                                <Badge colorScheme="orange" fontSize="lg" px={3} py={1}>
                                    {participations.filter(p => p.status === 'PENDING').length} Pending
                                </Badge>
                                <Badge colorScheme="blue" fontSize="lg" px={3} py={1}>
                                    {participations.length} Total
                                </Badge>
                            </HStack>
                        </Flex>

                        <Divider borderColor="gray.600" />

                        {/* Filter Tabs */}
                        <HStack spacing={4} overflowX="auto" py={2}>
                            <Button
                                size="sm"
                                variant={filter === 'all' ? 'solid' : 'outline'}
                                colorScheme={filter === 'all' ? 'yellow' : 'gray'}
                                leftIcon={<FaFilter />}
                                onClick={() => setFilter('all')}
                            >
                                All Events
                            </Button>
                            <Button
                                size="sm"
                                variant={filter === 'pending' ? 'solid' : 'outline'}
                                colorScheme={filter === 'pending' ? 'yellow' : 'gray'}
                                leftIcon={<FaHourglassHalf />}
                                onClick={() => setFilter('pending')}
                            >
                                Pending Approval
                            </Button>
                            <Button
                                size="sm"
                                variant={filter === 'confirmed' ? 'solid' : 'outline'}
                                colorScheme={filter === 'confirmed' ? 'yellow' : 'gray'}
                                leftIcon={<FaCheckCircle />}
                                onClick={() => setFilter('confirmed')}
                            >
                                Confirmed
                            </Button>
                            <Button
                                size="sm"
                                variant={filter === 'upcoming' ? 'solid' : 'outline'}
                                colorScheme={filter === 'upcoming' ? 'yellow' : 'gray'}
                                leftIcon={<FaCalendarAlt />}
                                onClick={() => setFilter('upcoming')}
                            >
                                Upcoming
                            </Button>
                            <Button
                                size="sm"
                                variant={filter === 'past' ? 'solid' : 'outline'}
                                colorScheme={filter === 'past' ? 'yellow' : 'gray'}
                                leftIcon={<FaTimesCircle />}
                                onClick={() => setFilter('past')}
                            >
                                Past Events
                            </Button>
                        </HStack>
                    </VStack>
                </CardBody>
            </Card>

            {/* Events Grid */}
            {filteredEvents.length === 0 ? (
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
                                {filter === 'all'
                                    ? "You haven't registered for any events yet. Browse events to get started!"
                                    : `You don't have any ${filter} events at the moment.`}
                            </Text>
                            <Button
                                colorScheme="yellow"
                                onClick={() => router.push('/events')}
                                rightIcon={<FaArrowRight />}
                            >
                                Browse Events
                            </Button>
                        </VStack>
                    </VStack>
                </Card>
            ) : (
                <Grid
                    templateColumns={{
                        base: "1fr",
                        md: "repeat(2, 1fr)",
                        lg: "repeat(3, 1fr)"
                    }}
                    gap={6}
                >
                    <AnimatePresence>
                        {filteredEvents.map((event, index) => (
                            <MotionBox
                                key={event.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ delay: index * 0.1, duration: 0.3 }}
                            >
                                <EventCard event={event} />
                            </MotionBox>
                        ))}
                    </AnimatePresence>
                </Grid>
            )}
        </MotionBox>
    );
};

export default ParticipantDashboard;