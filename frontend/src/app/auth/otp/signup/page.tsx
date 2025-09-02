"use client";

import React, { useState } from "react";
import {
    Box,
    Container,
    VStack,
    Heading,
    Text,
    Button,
    FormControl,
    FormErrorMessage,
    FormLabel,
    Input,
    Radio,
    RadioGroup,
    Link as ChakraLink,
    useToast,
} from "@chakra-ui/react";
import { Formik, Field, Form } from "formik";
import * as Yup from "yup";
import Link from "next/link";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import api from "@/lib/api/axios";
import { useUserStore } from "@/utils/stores/useUserStore";
import axios from "axios";
import { useCompanyStore } from "@/utils/stores/useCompanyStore";

const MotionBox = motion(Box);
const MotionHeading = motion(Heading);
const MotionText = motion(Text);
const MotionButton = motion(Button);


const RequestSchema = Yup.object({
    email: Yup.string().email("Invalid email").required("Email is required"),
    role: Yup.string().oneOf(["PARTICIPANT", "ORGANIZER"]).required("Select a role"),
    name: Yup.string().min(2, "Name is too short").required("Name is required"),
});

const VerifySchema = Yup.object({
    code: Yup.string().length(6, "Enter 6 digit OTP").required("OTP is required"),
});

export default function SignupOtpPage() {
    const toast = useToast();
    const router = useRouter();
    const { setUser } = useUserStore();
    const { setCompany } = useCompanyStore();
    const [step, setStep] = useState<"request" | "verify">("request");
    const [formData, setFormData] = useState<{ email: string; role: string }>({
        email: "",
        role: "PARTICIPANT",
    });
    const setData = async (companyId: number, token: string, helpers: any) => {
        try {
            const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}company/${companyId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            setCompany(res.data.data);
            localStorage.setItem("comapny", res.data.data);

            router.push("/admin/dashboard");
        } catch (err: any) {
            console.error("Error fetching company:", err.response?.data || err.message);
        } finally {
            helpers.setSubmitting(false);
        }

    }
    return (
        <Box
            bg="gray.900"
            color="white"
            minH="100vh"
            display="flex"
            alignItems="center"
            justifyContent="center"
        >
            <Container maxW="xl" p={0}>
                <VStack
                    spacing={8}
                    p={10}
                    rounded="2xl"
                    bg="gray.800"
                    boxShadow="2xl"
                    as={motion.div}
                    initial="hidden"
                    animate="show"
                    variants={{
                        hidden: { opacity: 0, y: 40 },
                        show: { opacity: 1, y: 0, transition: { staggerChildren: 0.2 } },
                    }}
                >
                    <MotionHeading
                        size="2xl"
                        bgGradient="linear(to-r, yellow.400, yellow.600)"
                        bgClip="text"
                        textAlign="center"
                        variants={{ hidden: { opacity: 0, y: -20 }, show: { opacity: 1, y: 0 } }}
                    >
                        Sign Up with OTP
                    </MotionHeading>

                    {step === "request" && (
                        <Formik
                            initialValues={{ name: "", email: "", role: "PARTICIPANT" }}
                            validationSchema={RequestSchema}
                            onSubmit={async (values, helpers) => {
                                try {

                                    const data = await api.post("/auth/otp/send", { email: values.email, purpose: "SIGNUP" });
                                    if (data.status === 200) {
                                        toast({
                                            title: "OTP Sent",
                                            description: "Please check your email for the OTP",
                                            status: "success",
                                            duration: 5000,
                                            isClosable: true,
                                            position: "top",
                                        });
                                    }
                                    setFormData(values);
                                    setStep("verify");

                                } catch (err: any) {
                                    helpers.setStatus(err?.response?.data?.error || "Failed to send OTP");
                                } finally {
                                    helpers.setSubmitting(false);
                                }
                            }}
                        >
                            {({ isSubmitting, errors, touched, status, setFieldValue, values }) => (
                                <Form style={{ width: "100%" }}>
                                    <VStack spacing={6} w="100%">
                                        {/* Name */}
                                        <MotionBox
                                            w="100%"
                                            variants={{ hidden: { opacity: 0, x: -20 }, show: { opacity: 1, x: 0 } }}
                                        >
                                            <FormControl isInvalid={!!errors.name && touched.name}>
                                                <FormLabel>Name</FormLabel>
                                                <Field
                                                    as={Input}
                                                    name="name"
                                                    type="text"
                                                    placeholder="Enter your name"
                                                    variant="filled"
                                                    bg="gray.700"
                                                    _hover={{ bg: "gray.600" }}
                                                    _focus={{ borderColor: "yellow.400", bg: "gray.600" }}
                                                />
                                                <FormErrorMessage>{errors.name}</FormErrorMessage>
                                            </FormControl>
                                        </MotionBox>

                                        {/* Email */}
                                        <MotionBox
                                            w="100%"
                                            variants={{ hidden: { opacity: 0, x: -20 }, show: { opacity: 1, x: 0 } }}
                                        >
                                            <FormControl isInvalid={!!errors.email && touched.email}>
                                                <FormLabel>Email</FormLabel>
                                                <Field
                                                    as={Input}
                                                    name="email"
                                                    type="email"
                                                    variant="filled"
                                                    bg="gray.700"
                                                    _hover={{ bg: "gray.600" }}
                                                    _focus={{ borderColor: "yellow.400", bg: "gray.600" }}
                                                />
                                                <FormErrorMessage>{errors.email}</FormErrorMessage>
                                            </FormControl>
                                        </MotionBox>

                                        {/* Role as Radio */}
                                        <MotionBox
                                            w="100%"
                                            variants={{ hidden: { opacity: 0, x: 20 }, show: { opacity: 1, x: 0 } }}
                                        >
                                            <FormControl isInvalid={!!errors.role && touched.role}>
                                                <FormLabel>Role</FormLabel>
                                                <Field name="role">
                                                    {({ field }: any) => (
                                                        <RadioGroup
                                                            {...field}
                                                            onChange={(e) => {
                                                                console.log("RadioGroup onChange", e);
                                                                setFieldValue("role", e);
                                                            }
                                                            }
                                                            value={field.value}
                                                        >
                                                            <VStack align="flex-start">
                                                                <Radio value="PARTICIPANT">Participant</Radio>
                                                                <Radio value="ORGANIZER">Organizer</Radio>
                                                            </VStack>
                                                        </RadioGroup>
                                                    )}
                                                </Field>
                                                <FormErrorMessage>{errors.role}</FormErrorMessage>
                                            </FormControl>
                                        </MotionBox>

                                        {status && <Text color="red.300">{status}</Text>}

                                        <MotionButton
                                            type="submit"
                                            isLoading={isSubmitting}
                                            colorScheme="yellow"
                                            size="lg"
                                            rounded="full"
                                            w="100%"
                                            variants={{ hidden: { opacity: 0, scale: 0.9 }, show: { opacity: 1, scale: 1 } }}
                                        >
                                            Send OTP
                                        </MotionButton>
                                    </VStack>
                                </Form>
                            )}
                        </Formik>
                    )}

                    {step === "verify" && (
                        <Formik
                            initialValues={{ code: "" }}
                            validationSchema={VerifySchema}
                            onSubmit={async (values, helpers) => {



                                try {

                                    const { data } = await api.post("/auth/otp/verify", {
                                        ...values,
                                        ...formData,

                                    });
                                    // Save user into Zustand
                                    setUser(data);
                                    localStorage.setItem("user", data);
                                    if (data?.user?.role === 'ADMIN' || data?.user?.role === 'ORGANIZER') {
                                        data?.user?.companyId ? setData(data?.user?.companyId, data?.token, helpers) : router.push("/onboarding");
                                        helpers.setSubmitting(false);
                                    } else if (data?.user.role === "PARTICIPANT") {
                                        router.push("/participant/dashboard")
                                    }
                                } catch (err: any) {
                                    helpers.setStatus(err?.response?.data?.error || "Invalid OTP");
                                } finally {
                                    helpers.setSubmitting(false);
                                }
                            }}
                        >
                            {({ isSubmitting, errors, touched, status }) => (
                                <Form style={{ width: "100%" }}>
                                    <VStack spacing={6} w="100%">
                                        <MotionBox
                                            w="100%"
                                            variants={{ hidden: { opacity: 0, x: -20 }, show: { opacity: 1, x: 0 } }}
                                        >
                                            <FormControl isInvalid={!!errors.code && touched.code}>
                                                <FormLabel>Enter OTP</FormLabel>
                                                <Field
                                                    as={Input}
                                                    name="code"
                                                    maxLength={6}
                                                    variant="filled"
                                                    bg="gray.700"
                                                    _hover={{ bg: "gray.600" }}
                                                    _focus={{ borderColor: "yellow.400", bg: "gray.600" }}
                                                />
                                                <FormErrorMessage>{errors.code}</FormErrorMessage>
                                            </FormControl>
                                        </MotionBox>

                                        {status && <Text color="red.300">{status}</Text>}

                                        <MotionButton
                                            type="submit"
                                            isLoading={isSubmitting}
                                            colorScheme="yellow"
                                            size="lg"
                                            rounded="full"
                                            w="100%"
                                            variants={{ hidden: { opacity: 0, scale: 0.9 }, show: { opacity: 1, scale: 1 } }}
                                        >
                                            Verify OTP
                                        </MotionButton>

                                    </VStack>
                                </Form>
                            )}
                        </Formik>
                    )}
                    {/* Back to login link */}
                    <MotionText
                        fontSize="sm"
                        textAlign="center"
                        variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }}
                    >
                        <ChakraLink as={Link} href="/auth/signup" color="yellow.400">
                            Back to SignUp
                        </ChakraLink>
                    </MotionText>
                </VStack>
            </Container>
        </Box>
    );
}
