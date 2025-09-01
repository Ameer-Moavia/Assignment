"use client";
import { useUserStore } from "@/utils/stores/useUserStore";
import { api } from "@/utils/Functions/helperApi";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { motion } from "framer-motion";
import { useToast, useColorModeValue } from "@chakra-ui/react";
import {
    Box,
    Button,
    FormControl,
    FormLabel,
    Input,
    Textarea,
    VStack,
    Heading,
    Text,
    Container,
    FormErrorMessage,
    HStack,
    Icon,
    Progress,
    Badge,
    useDisclosure,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Alert,
    AlertIcon,
    Divider,
    Flex,
    Spacer
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
    FaBuilding,
    FaRocket,
    FaUsers,
    FaCheck,
    FaPlus,
    FaUserPlus,
    FaEnvelope,
    FaForward,
    FaStar,
    FaArrowRight,
    
} from "react-icons/fa";
import Header from "@/components/layout/Header";
import { useCompanyStore } from "@/utils/stores/useCompanyStore";
import axios from "axios";

const MotionBox = motion.create(Box);
const MotionHeading = motion.create(Heading);
const MotionText = motion.create(Text);
const MotionButton = motion.create(Button);

// Validation schemas
const CompanySchema = Yup.object().shape({
    name: Yup.string()
        .min(2, "Company name must be at least 2 characters")
        .max(100, "Company name must be less than 100 characters")
        .required("Company name is required"),
    description: Yup.string()
        .min(10, "Description must be at least 10 characters")
        .max(500, "Description must be less than 500 characters")
        .required("Company description is required"),
});

const TeamSchema = Yup.object().shape({
    email: Yup.string()
        .email("Please enter a valid email address")
        .required("Email is required"),
});

const steps = [
    { icon: FaBuilding, title: "Company Info", description: "Tell us about your company" },
    { icon: FaUsers, title: "Team Setup", description: "Invite team members" },
    { icon: FaRocket, title: "Launch", description: "You're ready to go!" }
];

export default function OnboardingPage() {
    const { user } = useUserStore();
    const toast = useToast();
    const router = useRouter();
    const { company, setCompany } = useCompanyStore();

    const [currentStep, setCurrentStep] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [invitedEmails, setInvitedEmails] = useState<string[]>([]);
    const { isOpen, onOpen, onClose } = useDisclosure();

    const bg = useColorModeValue("gray.900", "black");
    const text = useColorModeValue("whiteAlpha.900", "white");
    const cardBg = useColorModeValue("gray.800", "gray.900");
    const inputBg = useColorModeValue("gray.700", "gray.800");
    const borderColor = useColorModeValue("gray.600", "gray.700");

    const handleCompanySubmit = async (values: any, { resetForm }: any) => {
        setIsSubmitting(true);
        try {
            const payload = {
                name: values.name,
                description: values.description,
                ownerId: user.user?.profileId
            };

            const res = await api().post("/company", payload);

            if (res.status === 201) {
                setCompany(res.data);
                toast({
                    title: "Company created successfully! 🎉",
                    description: "Now let's set up your team!",
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                    position: "top"
                });
                setCompany(res.data); // save to global store
                resetForm();
                setCurrentStep(1);

            }
        } catch (err: any) {
            toast({
                title: "Something went wrong",
                description: err.response?.data?.message || "Failed to create company. Please try again.",
                status: "error",
                duration: 4000,
                isClosable: true,
                position: "top"
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleTeamInvite = async (values: any, { resetForm }: any) => {
        if (!company?.data.id) return;

        setIsSubmitting(true);
        try {
            const payload = {
                companyId: company?.data.id,
                email: values.email,
                role: "ADMIN"
            };

            const res = await api().post("/company/invite-organizer", payload);

            if (res.status === 200 || res.status === 201) {
                setInvitedEmails(prev => [...prev, values.email]);
                toast({
                    title: "Invitation sent! 📧",
                    description: `We've sent an invitation to ${values.email}`,
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                    position: "top"
                });
                resetForm();
            }
        } catch (err: any) {
            toast({
                title: "Invitation failed",
                description: err.response?.data?.message || "Failed to send invitation. Please try again.",
                status: "error",
                duration: 4000,
                isClosable: true,
                position: "top"
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSkipTeamSetup = () => {
        setCurrentStep(2);
    };

    const handleLaunch = () => {
        onOpen();
    };

    const handleFinalLaunch = async (companyId: number,token: string) => {

        try {
    const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}company/${companyId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    
    setCompany(res.data.data);
    localStorage.setItem("comapny", res.data.data);
      onClose();
        toast({
            title: "Welcome to Wizard Productions! ✨",
            description: "Your journey begins now. Let's create amazing events together!",
            status: "success",
            duration: 5000,
            isClosable: true,
            position: "top"
        });
    router.push("/admin/dashboard");
  } catch (err: any) {
    console.error("Error fetching company:", err.response?.data || err.message);
  }finally {
    onClose();
  }
   router.push("/admin/dashboard");
    };

    const getProgressValue = () => {
        return ((currentStep + 1) / steps.length) * 100;
    };

    return (
        <Box bg={bg} color={text} minH="100vh">
            <Header />

            <Container maxW="container.md" py={12}>
                <VStack spacing={8} textAlign="center">
                    {/* Header Section */}
                    <MotionBox
                        initial={{ y: -40, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.8 }}
                    >
                        <MotionHeading
                            size="2xl"
                            bgGradient="linear(to-r, yellow.400, yellow.600)"
                            bgClip="text"
                            mb={4}
                        >
                            {currentStep === 0 && "Welcome to Wizard Productions! ✨"}
                            {currentStep === 1 && "Build Your Dream Team! 👥"}
                            {currentStep === 2 && "Ready for Launch! 🚀"}
                        </MotionHeading>
                        <MotionText
                            fontSize="lg"
                            color="gray.300"
                            maxW="2xl"
                        >
                            {currentStep === 0 && "Let's set up your company profile to start creating magical events"}
                            {currentStep === 1 && "Invite team members to help you create and manage amazing events"}
                            {currentStep === 2 && "Everything is set up! You're ready to start creating incredible events"}
                        </MotionText>
                    </MotionBox>

                    {/* Progress Steps */}
                    <MotionBox
                        w="full"
                        maxW="md"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3, duration: 0.6 }}
                    >
                        <HStack justify="space-between" mb={8}>
                            {steps.map((step, index) => (
                                <VStack key={index} spacing={2} flex={1}>
                                    <Box
                                        p={3}
                                        borderRadius="full"
                                        bg={index <= currentStep ? "yellow.400" : "gray.700"}
                                        color={index <= currentStep ? "black" : "gray.400"}
                                        position="relative"
                                        transition="all 0.3s ease"
                                    >
                                        <Icon as={step.icon} boxSize={4} />
                                        {index < currentStep && (
                                            <Box
                                                position="absolute"
                                                top="-2px"
                                                right="-2px"
                                                bg="green.400"
                                                borderRadius="full"
                                                p={1}
                                            >
                                                <Icon as={FaCheck} boxSize={2} color="white" />
                                            </Box>
                                        )}
                                    </Box>
                                    <Text fontSize="xs" color={index <= currentStep ? "yellow.400" : "gray.500"} fontWeight="medium">
                                        {step.title}
                                    </Text>
                                </VStack>
                            ))}
                        </HStack>
                        <Progress
                            value={getProgressValue()}
                            size="sm"
                            colorScheme="yellow"
                            borderRadius="full"
                            bg="gray.700"
                            transition="all 0.3s ease"
                        />
                    </MotionBox>

                    {/* Step Content */}
                    <MotionBox
                        w="full"
                        maxW="lg"
                        bg={cardBg}
                        p={8}
                        borderRadius="2xl"
                        shadow="2xl"
                        border="1px"
                        borderColor={borderColor}
                        initial={{ y: 40, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.5, duration: 0.8 }}
                    >
                        {/* Step 0: Company Information */}
                        {currentStep === 0 && (
                            <VStack spacing={6} align="stretch">
                                <Box textAlign="center">
                                    <Box
                                        display="inline-flex"
                                        p={4}
                                        borderRadius="full"
                                        bg="yellow.400"
                                        color="black"
                                        mb={4}
                                    >
                                        <Icon as={FaBuilding} boxSize={6} />
                                    </Box>
                                    <Heading size="lg" mb={2}>Company Information</Heading>
                                    <Text color="gray.400" fontSize="sm">
                                        Tell us about your company to personalize your experience
                                    </Text>
                                </Box>

                                <Formik
                                    initialValues={{ name: "", description: "" }}
                                    validationSchema={CompanySchema}
                                    onSubmit={handleCompanySubmit}
                                >
                                    {({ errors, touched, isValid, dirty }) => (
                                        <Form>
                                            <VStack spacing={6}>
                                                <FormControl isInvalid={!!(errors.name && touched.name)}>
                                                    <FormLabel color="gray.300" fontWeight="medium">
                                                        Company Name *
                                                    </FormLabel>
                                                    <Field
                                                        as={Input}
                                                        name="name"
                                                        placeholder="Enter your company name"
                                                        bg={inputBg}
                                                        border="1px"
                                                        borderColor={borderColor}
                                                        _hover={{ borderColor: "yellow.400" }}
                                                        _focus={{
                                                            borderColor: "yellow.400",
                                                            boxShadow: "0 0 0 1px #fbbf24",
                                                            bg: inputBg
                                                        }}
                                                        _placeholder={{ color: "gray.500" }}
                                                        size="lg"
                                                        fontSize="md"
                                                    />
                                                    <FormErrorMessage color="red.400">
                                                        {errors.name}
                                                    </FormErrorMessage>
                                                </FormControl>

                                                <FormControl isInvalid={!!(errors.description && touched.description)}>
                                                    <FormLabel color="gray.300" fontWeight="medium">
                                                        Company Description *
                                                    </FormLabel>
                                                    <Field
                                                        as={Textarea}
                                                        name="description"
                                                        placeholder="Describe what your company does and what kind of events you plan to create..."
                                                        bg={inputBg}
                                                        border="1px"
                                                        borderColor={borderColor}
                                                        _hover={{ borderColor: "yellow.400" }}
                                                        _focus={{
                                                            borderColor: "yellow.400",
                                                            boxShadow: "0 0 0 1px #fbbf24",
                                                            bg: inputBg
                                                        }}
                                                        _placeholder={{ color: "gray.500" }}
                                                        size="lg"
                                                        fontSize="md"
                                                        rows={4}
                                                        resize="vertical"
                                                    />
                                                    <FormErrorMessage color="red.400">
                                                        {errors.description}
                                                    </FormErrorMessage>
                                                </FormControl>

                                                <Button
                                                    type="submit"
                                                    size="lg"
                                                    colorScheme="yellow"
                                                    w="full"
                                                    borderRadius="xl"
                                                    shadow="lg"
                                                    isLoading={isSubmitting}
                                                    loadingText="Creating Company..."
                                                    isDisabled={!isValid || !dirty}
                                                    _hover={{
                                                        transform: "translateY(-2px)",
                                                        shadow: "xl",
                                                        bg: "yellow.500"
                                                    }}
                                                    _active={{
                                                        transform: "translateY(0px)"
                                                    }}
                                                    fontWeight="bold"
                                                    rightIcon={<Icon as={FaArrowRight} />}
                                                >
                                                    Create Company & Continue
                                                </Button>
                                            </VStack>
                                        </Form>
                                    )}
                                </Formik>

                                <Box
                                    textAlign="center"
                                    pt={4}
                                    borderTop="1px"
                                    borderColor="gray.700"
                                >
                                    <Text fontSize="xs" color="gray.500">
                                        Don't worry, you can always update this information later in your settings.
                                    </Text>
                                </Box>
                            </VStack>
                        )}

                        {/* Step 1: Team Setup */}
                        {currentStep === 1 && (
                            <VStack spacing={6} align="stretch">
                                <Box textAlign="center">
                                    <Box
                                        display="inline-flex"
                                        p={4}
                                        borderRadius="full"
                                        bg="yellow.400"
                                        color="black"
                                        mb={4}
                                    >
                                        <Icon as={FaUsers} boxSize={6} />
                                    </Box>
                                    <Heading size="lg" mb={2}>Team Setup</Heading>
                                    <Text color="gray.400" fontSize="sm">
                                        Invite organizers to help you manage events and grow your business
                                    </Text>
                                </Box>

                                {invitedEmails.length > 0 && (
                                    <Box>
                                        <Text color="gray.300" fontWeight="medium" mb={3}>
                                            Invited Team Members ({invitedEmails.length})
                                        </Text>
                                        <VStack spacing={2} align="stretch">
                                            {invitedEmails.map((email, index) => (
                                                <Box
                                                    key={index}
                                                    p={3}
                                                    bg="green.50"
                                                    color="green.800"
                                                    borderRadius="lg"
                                                    border="1px"
                                                    borderColor="green.200"
                                                >
                                                    <HStack>
                                                        <Icon as={FaEnvelope} />
                                                        <Text fontSize="sm" fontWeight="medium">{email}</Text>
                                                        <Spacer />
                                                        <Badge colorScheme="green" size="sm">Invited</Badge>
                                                    </HStack>
                                                </Box>
                                            ))}
                                        </VStack>
                                        <Divider my={4} borderColor="gray.700" />
                                    </Box>
                                )}

                                <Formik
                                    initialValues={{ email: "" }}
                                    validationSchema={TeamSchema}
                                    onSubmit={handleTeamInvite}
                                >
                                    {({ errors, touched, isValid, dirty }) => (
                                        <Form>
                                            <VStack spacing={6}>
                                                <FormControl isInvalid={!!(errors.email && touched.email)}>
                                                    <FormLabel color="gray.300" fontWeight="medium">
                                                        <HStack>
                                                            <Icon as={FaUserPlus} />
                                                            <Text>Invite Organizer</Text>
                                                        </HStack>
                                                    </FormLabel>
                                                    <Field
                                                        as={Input}
                                                        name="email"
                                                        type="email"
                                                        placeholder="Enter organizer's email address"
                                                        bg={inputBg}
                                                        border="1px"
                                                        borderColor={borderColor}
                                                        _hover={{ borderColor: "yellow.400" }}
                                                        _focus={{
                                                            borderColor: "yellow.400",
                                                            boxShadow: "0 0 0 1px #fbbf24",
                                                            bg: inputBg
                                                        }}
                                                        _placeholder={{ color: "gray.500" }}
                                                        size="lg"
                                                        fontSize="md"
                                                    />
                                                    <FormErrorMessage color="red.400">
                                                        {errors.email}
                                                    </FormErrorMessage>
                                                </FormControl>

                                                <HStack spacing={4} w="full">
                                                    <Button
                                                        type="submit"
                                                        size="lg"
                                                        colorScheme="green"
                                                        flex={1}
                                                        borderRadius="xl"
                                                        shadow="lg"
                                                        isLoading={isSubmitting}
                                                        loadingText="Sending Invite..."
                                                        isDisabled={!isValid || !dirty}
                                                        _hover={{
                                                            transform: "translateY(-2px)",
                                                            shadow: "xl"
                                                        }}
                                                        _active={{
                                                            transform: "translateY(0px)"
                                                        }}
                                                        fontWeight="bold"
                                                        leftIcon={<Icon as={FaPlus} />}
                                                    >
                                                        Send Invitation
                                                    </Button>
                                                </HStack>
                                            </VStack>
                                        </Form>
                                    )}
                                </Formik>

                                <Divider borderColor="gray.700" />

                                <VStack spacing={4}>
                                    <Button
                                        size="lg"
                                        colorScheme="yellow"
                                        w="full"
                                        borderRadius="xl"
                                        shadow="lg"
                                        onClick={() => setCurrentStep(2)}
                                        _hover={{
                                            transform: "translateY(-2px)",
                                            shadow: "xl"
                                        }}
                                        _active={{
                                            transform: "translateY(0px)"
                                        }}
                                        transition="all 0.2s ease-in-out"
                                        fontWeight="bold"
                                        rightIcon={<Icon as={FaArrowRight} />}
                                    >
                                        Continue to Launch
                                    </Button>

                                    <Button
                                        size="md"
                                        variant="ghost"
                                        color="gray.400"
                                        onClick={handleSkipTeamSetup}
                                        _hover={{ color: "gray.300" }}
                                        leftIcon={<Icon as={FaForward} />}
                                    >
                                        Skip for now
                                    </Button>
                                </VStack>

                                <Box
                                    textAlign="center"
                                    pt={4}
                                    borderTop="1px"
                                    borderColor="gray.700"
                                >
                                    <Text fontSize="xs" color="gray.500">
                                        You can always invite more team members later from your dashboard.
                                    </Text>
                                </Box>
                            </VStack>
                        )}

                        {/* Step 2: Launch */}
                        {currentStep === 2 && (
                            <VStack spacing={8} align="stretch">
                                <Box textAlign="center">
                                    <Box
                                        display="inline-flex"
                                        p={4}
                                        borderRadius="full"
                                        bg="yellow.400"
                                        color="black"
                                        mb={4}
                                        position="relative"
                                    >
                                        <Icon as={FaRocket} boxSize={6} />
                                        <Box
                                            position="absolute"
                                            top="-10px"
                                            right="-10px"
                                            animation="bounce 2s infinite"
                                        >
                                            <Icon as={FaStar} color="yellow.400" boxSize={4} />
                                        </Box>
                                    </Box>
                                    <Heading size="xl" mb={2}>🎉 You're All Set!</Heading>
                                    <Text color="gray.400" fontSize="md">
                                        Your company profile is ready and your team setup is complete.
                                        Time to create your first magical event!
                                    </Text>
                                </Box>

                                <Alert
                                    status="success"
                                    bg="green.900"
                                    border="1px"
                                    borderColor="green.600"
                                    borderRadius="xl"
                                    color="green.100"
                                >
                                    <AlertIcon color="green.400" />
                                    <VStack align="start" spacing={1}>
                                        <Text fontWeight="bold">Setup Complete!</Text>
                                        <Text fontSize="sm">
                                            Company: {company?.data?.name} • Team Members: {invitedEmails.length} invited
                                        </Text>
                                    </VStack>
                                </Alert>

                                <VStack spacing={4} p={6} bg="gray.700" borderRadius="xl">
                                    <Heading size="md" color="yellow.400">What's Next?</Heading>
                                    <VStack spacing={3} align="start" w="full">
                                        <HStack>
                                            <Icon as={FaPlus} color="green.400" />
                                            <Text fontSize="sm">Create your first event</Text>
                                        </HStack>
                                        <HStack>
                                            <Icon as={FaUsers} color="blue.400" />
                                            <Text fontSize="sm">Manage your team and permissions</Text>
                                        </HStack>
                                        <HStack>
                                            <Icon as={FaRocket} color="purple.400" />
                                            <Text fontSize="sm">Customize your company settings</Text>
                                        </HStack>
                                    </VStack>
                                </VStack>

                                <MotionButton
                                    size="xl"
                                    colorScheme="yellow"
                                    w="full"
                                    borderRadius="xl"
                                    shadow="2xl"
                                    onClick={handleLaunch}
                                    _hover={{
                                        transform: "translateY(-3px)",
                                        shadow: "2xl",
                                        bg: "yellow.500"
                                    }}
                                    _active={{
                                        transform: "translateY(0px)"
                                    }}
                                    transition={{ duration: 0.2, ease: "easeInOut" }}
                                    fontWeight="bold"
                                    fontSize="lg"
                                    py={8}
                                    rightIcon={<Icon as={FaRocket} />}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    Launch Dashboard! 🚀
                                </MotionButton>

                                <Box
                                    textAlign="center"
                                    pt={4}
                                    borderTop="1px"
                                    borderColor="gray.700"
                                >
                                    <Text fontSize="xs" color="gray.500">
                                        Ready to create events that will amaze and inspire? Let's go! ✨
                                    </Text>
                                </Box>
                            </VStack>
                        )}
                    </MotionBox>

                    {/* Features Preview */}
                    <MotionBox
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8, duration: 0.6 }}
                    >
                        <Text fontSize="sm" color="gray.400" textAlign="center">
                            {currentStep === 0 && "🎯 Next up: Set up your team • 🎪 Create your first event • 🚀 Go live!"}
                            {currentStep === 1 && "👥 Build your team • 🎪 Create amazing events • 🚀 Launch and grow!"}
                            {currentStep === 2 && "🎪 Create events • 📊 Track performance • 🌟 Grow your business!"}
                        </Text>
                    </MotionBox>
                </VStack>
            </Container>

            {/* Launch Celebration Modal */}
            <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
                <ModalOverlay bg="blackAlpha.800" />
                <ModalContent bg={cardBg} border="1px" borderColor={borderColor}>
                    <ModalHeader textAlign="center" pb={2}>
                        <VStack spacing={4}>
                            <Box fontSize="4xl">🎉</Box>
                            <Heading color="yellow.400">Welcome to Wizard Productions!</Heading>
                        </VStack>
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <VStack spacing={6} textAlign="center">
                            <Text color="gray.300" fontSize="lg">
                                Congratulations! You've successfully set up your company and you're ready
                                to create magical events that will captivate your audience.
                            </Text>
                            <Box p={4} bg="yellow.50" borderRadius="lg" w="full">
                                <Text color="yellow.800" fontWeight="bold" fontSize="sm">
                                    🎯 Pro Tip: Start with a small event to get familiar with the platform,
                                    then scale up as you gain confidence!
                                </Text>
                            </Box>
                        </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <Button
                            colorScheme="yellow"
                            size="lg"
                            w="full"
                            onClick={()=>{handleFinalLaunch(company?.data?.id, user?.token)}}
                            rightIcon={<Icon as={FaStar} />}
                            _hover={{
                                transform: "translateY(-2px)",
                                shadow: "xl"
                            }}
                        >
                            Let's Create Magic! ✨
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
}