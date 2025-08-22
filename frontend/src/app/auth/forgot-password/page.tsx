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
import Link from "next/link";
import api from "@/lib/api/axios";

const MotionBox = motion(Box);
const MotionHeading = motion(Heading);
const MotionText = motion(Text);
const MotionButton = motion(Button);

const EmailSchema = Yup.object({
  email: Yup.string().email("Invalid email").required("Email is required"),
});

export default function ForgotPasswordPage() {
  return (
    <Box bg="gray.900" color="white" minH="100vh" display="flex" alignItems="center" justifyContent="center">
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
          >
            Forgot Password
          </MotionHeading>

          <MotionText fontSize="md" opacity={0.8} textAlign="center">
            Enter your email and we’ll send you a password reset link.
          </MotionText>

          <Formik
            initialValues={{ email: "" }}
            validationSchema={EmailSchema}
            onSubmit={async (values, helpers) => {
              try {
                await api.post("/auth/password/request-reset", { email: values.email });
                helpers.setStatus("If this email exists, a reset link has been sent.");
              } catch (err: any) {
                helpers.setStatus(err?.response?.data?.error || "Failed to send reset email");
              } finally {
                helpers.setSubmitting(false);
              }
            }}
          >
            {({ isSubmitting, errors, touched, status }) => (
              <Form style={{ width: "100%" }}>
                <VStack spacing={6} w="100%">
                  <MotionBox w="100%">
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

                  {status && <MotionText color="yellow.300" fontSize="sm">{status}</MotionText>}

                  <MotionButton
                    type="submit"
                    isLoading={isSubmitting}
                    colorScheme="yellow"
                    size="lg"
                    rounded="full"
                    w="100%"
                  >
                    Send Reset Link
                  </MotionButton>
                </VStack>
              </Form>
            )}
          </Formik>

          <MotionText fontSize="sm" opacity={0.8}>
            <ChakraLink as={Link} href="/auth/login" color="yellow.400">
              Back to Login
            </ChakraLink>
          </MotionText>
        </VStack>
      </Container>
    </Box>
  );
}