"use client";

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
  Link as ChakraLink,
} from "@chakra-ui/react";
import { Formik, Field, Form } from "formik";
import * as Yup from "yup";
import { motion } from "framer-motion";
import { useDispatch } from "react-redux";
import { setUser } from "@/state/redux/userSlice";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api/axios";
import React, { useState } from "react";

const MotionBox = motion(Box);
const MotionHeading = motion(Heading);
const MotionText = motion(Text);
const MotionButton = motion(Button);

const RequestSchema = Yup.object({
  email: Yup.string().email("Invalid email").required("Email is required"),
});

const VerifySchema = Yup.object({
  otp: Yup.string().length(6, "Enter 6 digit OTP").required("OTP is required"),
});

export default function OtpLoginPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const [step, setStep] = useState<"request" | "verify">("request");
  const [email, setEmail] = useState("");

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
            show: {
              opacity: 1,
              y: 0,
              transition: { staggerChildren: 0.2 },
            },
          }}
        >
          {/* Heading */}
          <MotionHeading
            size="2xl"
            bgGradient="linear(to-r, yellow.400, yellow.600)"
            bgClip="text"
            textAlign="center"
            variants={{
              hidden: { opacity: 0, y: -20 },
              show: { opacity: 1, y: 0 },
            }}
          >
            Login with OTP
          </MotionHeading>

          {step === "request" && (
            <Formik
              initialValues={{ email: "" }}
              validationSchema={RequestSchema}
              onSubmit={async (values, helpers) => {
                try {
                  await api.post("/auth/otp/send", values);
                  setEmail(values.email);
                  setStep("verify");
                } catch (err: any) {
                  helpers.setStatus(
                    err?.response?.data?.error || "Failed to send OTP"
                  );
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
                      variants={{
                        hidden: { opacity: 0, x: -20 },
                        show: { opacity: 1, x: 0 },
                      }}
                    >
                      <FormControl
                        isInvalid={!!errors.email && touched.email}
                      >
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

                    {status && <Text color="red.300">{status}</Text>}

                    <MotionButton
                      type="submit"
                      isLoading={isSubmitting}
                      colorScheme="yellow"
                      size="lg"
                      rounded="full"
                      w="100%"
                      variants={{
                        hidden: { opacity: 0, scale: 0.9 },
                        show: { opacity: 1, scale: 1 },
                      }}
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
              initialValues={{ otp: "" }}
              validationSchema={VerifySchema}
              onSubmit={async (values, helpers) => {
                try {
                  const { data } = await api.post("/auth/otp/verify", {
                    ...values,
                    email,
                  });
                  dispatch(setUser(data.user ?? data));
                  router.push("/events");
                } catch (err: any) {
                  helpers.setStatus(
                    err?.response?.data?.error || "Invalid OTP"
                  );
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
                      variants={{
                        hidden: { opacity: 0, x: -20 },
                        show: { opacity: 1, x: 0 },
                      }}
                    >
                      <FormControl isInvalid={!!errors.otp && touched.otp}>
                        <FormLabel>Enter OTP</FormLabel>
                        <Field
                          as={Input}
                          name="otp"
                          maxLength={6}
                          variant="filled"
                          bg="gray.700"
                          _hover={{ bg: "gray.600" }}
                          _focus={{ borderColor: "yellow.400", bg: "gray.600" }}
                        />
                        <FormErrorMessage>{errors.otp}</FormErrorMessage>
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
                      variants={{
                        hidden: { opacity: 0, scale: 0.9 },
                        show: { opacity: 1, scale: 1 },
                      }}
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
            <ChakraLink as={Link} href="/auth/login" color="yellow.400">
              Back to Login
            </ChakraLink>
          </MotionText>
        </VStack>
      </Container>
    </Box>
  );
}