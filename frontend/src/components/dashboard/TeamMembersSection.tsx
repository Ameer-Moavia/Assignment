"use client";
import React, { useState } from 'react';
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
    IconButton,
    useColorModeValue,
    useDisclosure,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    FormControl,
    FormLabel,
    Input,
    Select,
    Avatar,
    useToast,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    MenuDivider,
    Alert,
    AlertIcon,
    AlertTitle,
    AlertDescription,
    Divider,
    Stat,
    StatLabel,
    StatNumber,
    StatHelpText,
    FormErrorMessage,
    InputGroup,
    InputLeftElement,
    Toast
} from '@chakra-ui/react';
import {
    FaUserPlus,
    FaUsers,
    FaEllipsisV,
    FaEdit,
    FaTrash,
    FaEnvelope,
    FaCrown,
    FaUserTie,
    FaCalendarCheck,
    FaUserCog
} from 'react-icons/fa';
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { FormikHelpers } from "formik";
import { FaShield } from 'react-icons/fa6';
import { api } from "@/utils/Functions/helperApi";
import { refreshCompany } from '@/utils/stores/RefreshStore/refreshCompany';

const MotionBox = motion.create(Box);
const MotionCard = motion.create(Card);
const MotionButton = motion.create(Button);


// Types based on your backend structure
type Organizer = {
    id: number;
    userId: number;
    name: string;
    companyId: number;
    email?: string;
    role?: string;
    joinedAt?: string;
    eventsCreated?: number;
    status?: 'ACTIVE' | 'PENDING' | 'INACTIVE';
};

type Company = {
    id: number;
    name: string;
    description: string;
    ownerId: number;
    owner: Organizer;
    organizers: Organizer[];
    users: any;
    [key: string]: any; // for events and other relations
};
type Event = {
    [key: string]: any;
}

type User = {
    user: {
        id: number;
        email: string;
        role: string;
        profileId: number;
        companyId: number;
    };
};

type TeamMembersSectionProps = {
    company: Company;
    user: User;
    onInviteMember?: (memberData: any) => Promise<void>;
    onRemoveMember?: (memberId: number) => Promise<void>;
    onUpdateMemberRole?: (memberId: number, role: string) => Promise<void>;
    [key: string]: any;
};
type InviteMemberFormValues = {
    email: string;
    role: 'ORGANIZER' | 'ADMIN';
};

type InviteMemberModalProps = {
    isOpen: boolean;
    onClose: () => void;
    isOwner: boolean;
    onInvite: (values: InviteMemberFormValues) => Promise<void>;
};

type Member = {
    id: number;
    userId: number;
    name: string;
    email?: string;
    role?: "ADMIN" | "ORGANIZER";
    status?: "ACTIVE" | "PENDING" | "INACTIVE";
    eventsCreated?: number;
    joinedAt?: string;
    isOwner?: boolean; // ✅ mark if this member is the company owner
    [key: string]: any;
};

type MemberCardProps = {
    member: Member;
    currentUserId: number;
    onRemove: any;
    onUpdateRole: (id: number, role: string) => Promise<void>;
    isOwner: boolean; // ✅ whether the current user is the company owner
    ownerId: number; // ✅ the company owner's ID
};
const InviteMemberModal = ({ isOpen, onClose, onInvite, isOwner }: InviteMemberModalProps) => {
    const toast = useToast();
    const cardBg = useColorModeValue("gray.800", "gray.900");
    const inputBg = useColorModeValue("gray.700", "gray.800");
    const borderColor = useColorModeValue("gray.600", "gray.700");

    const validationSchema = Yup.object({
        email: Yup.string()
            .email("Please enter a valid email address")
            .required("Email is required"),
        role: Yup.string()
            .oneOf(['ORGANIZER', 'ADMIN'], "Please select a valid role")
            .required("Role is required")
    });

    // Define type for the form values

    const handleSubmit = async (
        values: InviteMemberFormValues,
        { setSubmitting, resetForm }: { setSubmitting: (isSubmitting: boolean) => void; resetForm: () => void }
    ) => {
        try {
            await onInvite(values);
            toast({
                title: "Invitation sent successfully!",
                description: `We've sent an invitation to ${values.email}`,
                status: "success",
                duration: 3000,
                isClosable: true,
                position: "top"
            });
            resetForm();
            onClose();
        } catch (error) {
            toast({
                title: "Failed to send invitation",
                description: "Please try again later.",
                status: "error",
                duration: 4000,
                isClosable: true,
                position: "top"
            });
        } finally {
            setSubmitting(false);
        }
    };


    return (
        <Modal isOpen={isOpen} onClose={onClose} size="md" isCentered>
            <ModalOverlay bg="blackAlpha.800" />
            <ModalContent bg={cardBg} border="1px" borderColor={borderColor}>
                <ModalHeader>
                    <HStack>
                        <Box p={2} borderRadius="lg" bg="yellow.400" color="black">
                            <FaUserPlus />
                        </Box>
                        <Heading size="lg" color="white">Invite Team Member</Heading>
                    </HStack>
                </ModalHeader>
                <ModalCloseButton color="gray.400" />

                <Formik
                    initialValues={{ email: '', role: 'ORGANIZER' }}
                    validationSchema={validationSchema}
                    onSubmit={handleSubmit}
                >
                    {({ errors, touched, isSubmitting, handleSubmit: formikSubmit }) => (
                        <>
                            <ModalBody>
                                <VStack spacing={6} align="stretch">
                                    <Alert status="info" bg="blue.900" border="1px" borderColor="blue.600" borderRadius="lg">
                                        <AlertIcon color="blue.400" />
                                        <Box>
                                            <AlertTitle color="blue.200">Team Member Role</AlertTitle>
                                            <AlertDescription color="blue.300" fontSize="sm">
                                                <VStack align="start" spacing={1} mt={2}>
                                                    <Text><strong>Organizer:</strong> Can create and manage events only</Text>
                                                </VStack>
                                            </AlertDescription>
                                        </Box>
                                    </Alert>

                                    <FormControl isInvalid={!!(errors.email && touched.email)} isRequired>
                                        <FormLabel color="gray.300">Email Address</FormLabel>
                                        <InputGroup>
                                            <InputLeftElement pointerEvents="none">
                                                <FaEnvelope color="#718096" />
                                            </InputLeftElement>
                                            <Field
                                                as={Input}
                                                name="email"
                                                type="email"
                                                placeholder="Enter team member's email"
                                                bg={inputBg}
                                                borderColor={borderColor}
                                                _hover={{ borderColor: "yellow.400" }}
                                                _focus={{ borderColor: "yellow.400", boxShadow: "0 0 0 1px #fbbf24" }}
                                            />
                                        </InputGroup>
                                        <FormErrorMessage>{errors.email}</FormErrorMessage>
                                    </FormControl>
                                </VStack>
                            </ModalBody>

                            <ModalFooter>
                                <HStack spacing={3}>
                                    <Button variant="ghost" onClick={onClose} color="gray.400">
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={() => formikSubmit()}
                                        colorScheme="yellow"
                                        isLoading={isSubmitting}
                                        loadingText="Sending Invitation..."
                                        leftIcon={<FaUserPlus />}
                                    >
                                        Send Invitation
                                    </Button>
                                </HStack>
                            </ModalFooter>
                        </>
                    )}
                </Formik>
            </ModalContent>
        </Modal>
    );
};

const MemberCard = ({ member, currentUserId, onRemove, ownerId }: MemberCardProps) => {
    const cardBg = useColorModeValue("gray.800", "gray.900");
    const borderColor = useColorModeValue("gray.600", "gray.700");
    const toast = useToast();

    const isCurrentUser = member.id === currentUserId;
    const isCompanyOwner = Number(member.id) === ownerId;
    const isOwner = Number(currentUserId) === ownerId;


    const getRoleColor = (role: string) => {
        switch (role?.toUpperCase()) {
            case "ADMIN": return "red";
            case "ORGANIZER": return "blue";
            default: return "gray";
        }
    };

    const getStatusColor = (status: string) => {
        switch (status?.toUpperCase()) {
            case "ACTIVE": return "green";
            case "PENDING": return "yellow";
            case "INACTIVE": return "gray";
            default: return "green";
        }
    };

    const handleRemoveMember = async () => {
       if(onRemove) {
        await onRemove(member);
       }
    };


    return (
        <MotionCard
            bg={cardBg}
            border="1px"
            borderColor={borderColor}
            borderRadius="xl"
            shadow="lg"
            whileHover={{ y: -2 }}
            transition={{ duration: 0.2 }}
            _hover={{ borderColor: "yellow.400" }}
        >
            <CardBody p={6}>
                <VStack spacing={4} align="stretch">
                    <HStack justify="space-between">
                        <HStack spacing={3}>
                            <Avatar
                                size="md"
                                name={member.name}
                                bg="yellow.400"
                                color="black"
                            />
                            <VStack align="start" spacing={1}>
                                <HStack>
                                    <Text fontWeight="bold" color="white">{member.name}</Text>
                                    {isCompanyOwner && (
                                        <FaCrown color="#F6E05E" size="14px" title="Company Owner" />
                                    )}
                                    {isCurrentUser && (
                                        <Badge colorScheme="green" size="sm">You</Badge>
                                    )}
                                </HStack>
                           

                                <Text fontSize="sm" color="gray.400"> {member.user?.email || member.email || "No email provided"}</Text>
                            </VStack>
                        </HStack>

                        {/* ✅ Only owners can manage others, but they can't edit/remove themselves or the company owner */}
                       
                        {isOwner && !isCompanyOwner && !isCurrentUser && (
                            <Menu>
                                <MenuButton
                                    as={IconButton}
                                    icon={<FaEllipsisV />}
                                    variant="ghost"
                                    color="gray.400"
                                    size="sm"
                                    _hover={{ color: "yellow.400" }}
                                />
                                <MenuList bg="gray.800" borderColor="gray.600">

                                    <MenuItem
                                        icon={<FaTrash />}
                                        color="red.400"
                                        _hover={{ bg: "red.900" }}
                                        onClick={handleRemoveMember}
                                    >
                                        Remove Member
                                    </MenuItem>
                                </MenuList>
                            </Menu>
                        )}
                    </HStack>

                    {/* Role & Status */}
                    <HStack justify="space-between">
                        <VStack align="start" spacing={1}>
                            <Text fontSize="xs" color="gray.500">Role</Text>
                            <Badge
                                colorScheme={getRoleColor(member.role || "ORGANIZER")}
                                size="sm"
                            >
                                {member.role || "ORGANIZER"}
                            </Badge>
                        </VStack>

                        <VStack align="end" spacing={1}>
                            <Text fontSize="xs" color="gray.500">Status</Text>
                            <Badge
                                colorScheme={getStatusColor(member.status || "ACTIVE")}
                                size="sm"
                            >
                                {member.status || "ACTIVE"}
                            </Badge>
                        </VStack>
                    </HStack>
                </VStack>
            </CardBody>
        </MotionCard>
    );
};

const TeamMembersSection: React.FC<TeamMembersSectionProps> = ({
    company,
    user,
    onUpdateMemberRole
}) => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const cardBg = useColorModeValue("gray.800", "gray.900");
    const borderColor = useColorModeValue("gray.600", "gray.700");

    // Check if current user is the company owner
    const isOwner = user?.user?.profileId === company?.ownerId;
    const ownerEmail =
  (company?.organizers as any)?.find((org: any) => org.id === company?.owner?.id)?.user?.email || null;

    // Combine owner and organizers for display
 const allMembers = [
  ...(company?.owner ? [{
    id: company.owner.id,
    userId: company.owner.userId, 
    name: company.owner.name,
    email: ownerEmail,
    role: 'OWNER',
    status: 'ACTIVE',
  }] : []),
  ...(company?.organizers || [])
    .filter(org => org?.id !== company?.owner?.id)
    .map(org => ({
      ...org,
      role: org?.role || 'ORGANIZER',
      status: 'ACTIVE',
    }))
];



    const handleInviteMember = async (memberData: any) => {



        try {
            const payload = {
                companyId: company?.id,
                email: memberData.email,
                role: memberData.role
            };

            const res = await api().post("/company/invite-organizer", payload);

            await refreshCompany();

            if (res.status === 200 || res.status === 201) {
                //setInvitedEmails(prev => [...prev, values.email]);
                Toast({
                    title: "Invitation sent! 📧",
                    description: `We've sent an invitation to ${memberData.email}`,
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                    position: "top"
                });

            }
        }
        catch (error) {
            console.error("Failed to invite member:", error);
        }
        // In a real app, you might refetch the company data here
    };

    const handleRemoveMember = async (member: any) => {
        try {
     
            const res = await api().delete(`/users/${member.userId}`); // 👈 deleting user by ID
            await refreshCompany();
          

            if (res.status === 200) {
                Toast({
                    title: "User deleted 🗑️",
                    description: `${member.name || "The user"} has been removed successfully.`,
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                    position: "top",
                });
            }
        } catch (error) {
            console.error("Failed to delete user:", error);
            Toast({
                title: "Deletion failed ❌",
                description: "Something went wrong while deleting the user.",
                status: "error",
                duration: 4000,
                isClosable: true,
                position: "top",
            });
        }

        // In a real app, you might refetch the company data here
    };

    const handleUpdateMemberRole = async (memberId: number, role: string) => {
        if (onUpdateMemberRole) {
            await onUpdateMemberRole(memberId, role);
        }
        // In a real app, you might refetch the company data here
    };

    return (
        <MotionBox
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
        >
            <Card bg={cardBg} border="1px" borderColor={borderColor} borderRadius="xl" shadow="xl">
                <CardHeader pb={4}>
                    <Flex justify="space-between" align="center">
                        <HStack spacing={3}>
                            <Box
                                p={3}
                                borderRadius="lg"
                                bg="blue.500"
                                color="white"
                            >
                                <FaUsers size="24px" />
                            </Box>
                            <VStack align="start" spacing={1}>
                                <Heading size="lg" color="white">Team Members</Heading>
                                <Text color="gray.400" fontSize="sm">
                                    Manage your company team and permissions
                                </Text>
                            </VStack>
                        </HStack>

                        {isOwner && (
                            <MotionButton
                                leftIcon={<FaUserPlus />}
                                colorScheme="yellow"
                                onClick={onOpen}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                shadow="lg"
                                _hover={{
                                    shadow: "xl",
                                    transform: "translateY(-1px)"
                                }}
                            >
                                Invite Member
                            </MotionButton>
                        )}
                    </Flex>
                </CardHeader>

                <CardBody pt={0}>
                    <VStack spacing={6} align="stretch">
                        {/* Team Statistics */}
                        <Grid templateColumns={{ base: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }} gap={4}>
                            <Card bg="gray.700" borderRadius="lg" p={4}>
                                <Stat>
                                    <StatLabel color="gray.400" fontSize="xs">Total Members</StatLabel>
                                    <StatNumber color="white" fontSize="xl">{allMembers.length}</StatNumber>
                                    <StatHelpText color="blue.400" fontSize="xs">
                                        <FaUsers style={{ display: 'inline', marginRight: '4px' }} />
                                        Active team
                                    </StatHelpText>
                                </Stat>
                            </Card>

                            <Card bg="gray.700" borderRadius="lg" p={4}>
                                <Stat>
                                    <StatLabel color="gray.400" fontSize="xs">Organizers</StatLabel>
                                    <StatNumber color="white" fontSize="xl">
                                        {allMembers.filter(m => m.role === 'ORGANIZER').length}
                                    </StatNumber>
                                    <StatHelpText color="green.400" fontSize="xs">
                                        <FaUserTie style={{ display: 'inline', marginRight: '4px' }} />
                                        Event creators
                                    </StatHelpText>
                                </Stat>
                            </Card>

                            <Card bg="gray.700" borderRadius="lg" p={4}>
                                <Stat>
                                    <StatLabel color="gray.400" fontSize="xs">Admins</StatLabel>
                                    <StatNumber color="white" fontSize="xl">
                                        {allMembers.filter(m => m.role === 'ADMIN' || m.role === 'OWNER').length}
                                    </StatNumber>
                                    <StatHelpText color="red.400" fontSize="xs">
                                        <FaShield style={{ display: 'inline', marginRight: '4px' }} />
                                        Full access
                                    </StatHelpText>
                                </Stat>
                            </Card>

                            <Card bg="gray.700" borderRadius="lg" p={4}>
                                <Stat>
                                    <StatLabel color="gray.400" fontSize="xs">Total Events</StatLabel>
                                    <StatNumber color="white" fontSize="xl">{company?.events?.length || 0}</StatNumber>
                                    <StatHelpText color="yellow.400" fontSize="xs">
                                        <FaCalendarCheck style={{ display: 'inline', marginRight: '4px' }} />
                                        Created by team
                                    </StatHelpText>
                                </Stat>
                            </Card>
                        </Grid>

                        <Divider borderColor="gray.600" />

                        {/* Members Grid */}
                        <VStack align="stretch" spacing={4}>
                            <HStack justify="space-between">
                                <Text color="gray.300" fontWeight="medium">
                                    All Team Members ({allMembers.length})
                                </Text>
                                {!isOwner && (
                                    <Badge colorScheme="blue" size="sm">
                                        View Only Access
                                    </Badge>
                                )}
                            </HStack>

                            <Grid
                                templateColumns={{
                                    base: "1fr",
                                    md: "repeat(2, 1fr)",
                                    lg: "repeat(3, 1fr)"
                                }}
                                gap={6}
                            >
                                <AnimatePresence>
                                    {allMembers.map((member, index) => (
                                
                                        <MotionBox
                                            key={member.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -20 }}
                                            transition={{ delay: index * 0.1, duration: 0.3 }}
                                        >
                                            <MemberCard
                                                member={{
                                                    ...member,
                                                    role: member.role as "ADMIN" | "ORGANIZER" | undefined,
                                                    status: member.status as "ACTIVE" | "PENDING" | "INACTIVE" | undefined,
                                                }}
                                                isOwner={isOwner}
                                                currentUserId={user?.user?.profileId}
                                                 ownerId={company?.ownerId}
                                                onRemove={handleRemoveMember}
                                                onUpdateRole={handleUpdateMemberRole}
                                            />


                                        </MotionBox>
                                    ))}
                                </AnimatePresence>
                            </Grid>

                            {allMembers.length === 1 && (
                                <Card bg="gray.700" borderRadius="lg" p={8}>
                                    <VStack spacing={4}>
                                        <Box
                                            p={4}
                                            borderRadius="full"
                                            bg="gray.600"
                                            color="gray.400"
                                        >
                                            <FaUserPlus size="32px" />
                                        </Box>
                                        <VStack spacing={2}>
                                            <Text color="gray.300" fontWeight="medium">
                                                Your team is just getting started!
                                            </Text>
                                            <Text color="gray.500" textAlign="center" fontSize="sm">
                                                Invite team members to help you create and manage amazing events together.
                                            </Text>
                                        </VStack>
                                        {isOwner && (
                                            <Button
                                                leftIcon={<FaUserPlus />}
                                                colorScheme="yellow"
                                                onClick={onOpen}
                                            >
                                                Invite Your First Team Member
                                            </Button>
                                        )}
                                    </VStack>
                                </Card>
                            )}
                        </VStack>
                    </VStack>
                </CardBody>
            </Card>

            {/* Invite Member Modal */}
            <InviteMemberModal
                isOpen={isOpen}
                onClose={onClose}
                onInvite={handleInviteMember}
                isOwner={isOwner}
            />
        </MotionBox>
    );
};

export default TeamMembersSection;