"use client";
import {
    Box,
    Container,
    VStack,
    Heading,
    Text,
    Button,
    Alert,
    AlertIcon,
    AlertTitle,
    AlertDescription,
    Spinner,
    useColorModeValue
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import api from "@/lib/api/axios";
import Header from "@/components/layout/Header";

const MotionHeading = motion.create(Heading);
const MotionText = motion.create(Text);
const MotionBox = motion.create(Box);

interface VerificationState {
    loading: boolean;
    success: boolean;
    error: string | null;
    message: string | null;
}

export default function VerifyAccountPage() {
    const searchParams = useSearchParams();
    const token = searchParams?.get('token');

    const [verificationState, setVerificationState] = useState<VerificationState>({
        loading: true,
        success: false,
        error: null,
        message: null
    });

    const bg = useColorModeValue("gray.900", "black");
    const text = useColorModeValue("whiteAlpha.900", "white");
    const cardBg = useColorModeValue("gray.800", "gray.900");

    useEffect(() => {
        const verifyAccount = async () => {
            if (!token || typeof token !== "string") {
                setVerificationState({
                    loading: false,
                    success: false,
                    error: "Invalid verification token",
                    message: null
                });
                return;
            }

            try {
                const data: {
                    [key: string]: any;
                } = await api.get(`/auth/verify?token=${encodeURIComponent(token)}`);
                console.log(data)
                if (data.status === 201) {
                  setVerificationState({
                    loading: false,
                    success: true,
                    error: null,
                    message: data.message || "Email verified successfully!"
                  });
                } else if (data.status === 400) {
                  setVerificationState({
                    loading: false,
                    success: false,
                    error: data.error || "Invalid Token",
                    message: null
                  });

                }
            } catch (_) {
                  setVerificationState({
                    loading: false,
                    success: false,
                    error: "Invalid Token or User Already Verified",
                    message: null
                  });
            }
        };

        verifyAccount();
    }, [token]);

    return (
        <Box bg={bg} color={text} minH="100vh">
            <Header />

            <Container maxW="container.md" py={20}>
                <VStack spacing={8} textAlign="center">
                    <MotionHeading
                        size="2xl"
                        bgGradient="linear(to-r, yellow.400, yellow.600)"
                        bgClip="text"
                        initial={{ y: -40, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.8 }}
                    >
                        Account Verification
                    </MotionHeading>

                    <MotionBox
                        bg={cardBg}
                        p={8}
                        borderRadius="xl"
                        shadow="xl"
                        w="full"
                        maxW="md"
                        initial={{ y: 40, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.8 }}
                    >
                        {verificationState.loading && (
                            <VStack spacing={4}>
                                <Spinner size="xl" color="yellow.400" thickness="4px" />
                                <MotionText
                                    fontSize="lg"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.5, duration: 0.8 }}
                                >
                                    Verifying your account...
                                </MotionText>
                            </VStack>
                        )}

                        {!verificationState.loading && verificationState.success && (
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.6 }}
                            >
                                <VStack spacing={6}>
                                    <Box color="green.400" fontSize="4xl">
                                        <FaCheckCircle />
                                    </Box>
                                    <Alert status="success" bg="green.800" borderRadius="lg">
                                        <AlertIcon />
                                        <Box>
                                            <AlertTitle>Verification Successful!</AlertTitle>
                                            <AlertDescription>
                                                {verificationState.message}
                                            </AlertDescription>
                                        </Box>
                                    </Alert>
                                    <Text opacity={0.8}>
                                        Your account has been successfully verified. You can now log in and start using Wizard Productions.
                                    </Text>
                                    <VStack spacing={3} w="full">
                                        <Link href="/auth/login" passHref>
                                            <Button
                                                size="lg"
                                                colorScheme="yellow"
                                                rounded="full"
                                                w="full"
                                            >
                                                Login to Your Account
                                            </Button>
                                        </Link>
                                        <Link href="/events" passHref>
                                            <Button
                                                size="md"
                                                variant="ghost"
                                                color="yellow.400"
                                                _hover={{ bg: "yellow.400", color: "black" }}
                                            >
                                                Browse Events
                                            </Button>
                                        </Link>
                                    </VStack>
                                </VStack>
                            </motion.div>
                        )}

                        {!verificationState.loading && !verificationState.success && (
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.6 }}
                            >
                                <VStack spacing={6}>
                                    <Box color="red.400" fontSize="4xl">
                                        <FaTimesCircle />
                                    </Box>
                                    <Alert status="error" bg="red.800" borderRadius="lg">
                                        <AlertIcon />
                                        <Box>
                                            <AlertTitle>Verification Failed</AlertTitle>
                                            <AlertDescription>
                                                {verificationState.error}
                                            </AlertDescription>
                                        </Box>
                                    </Alert>
                                    <VStack spacing={3} w="full">
                                        <Link href="/auth/signup" passHref>
                                            <Button
                                                size="lg"
                                                colorScheme="yellow"
                                                rounded="full"
                                                w="full"
                                            >
                                                Request New Verification
                                            </Button>
                                        </Link>
                                        <Link href="/auth/login" passHref>
                                            <Button
                                                size="md"
                                                variant="ghost"
                                                color="yellow.400"
                                                _hover={{ bg: "yellow.400", color: "black" }}
                                            >
                                                Back to Login
                                            </Button>
                                        </Link>
                                    </VStack>
                                </VStack>
                            </motion.div>
                        )}
                    </MotionBox>

                    {!verificationState.loading && (
                        <MotionText
                            fontSize="sm"
                            opacity={0.6}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1, duration: 0.8 }}
                        >
                            Having trouble? Contact our support team for assistance.
                        </MotionText>
                    )}
                </VStack>
            </Container>
        </Box>
    );
}