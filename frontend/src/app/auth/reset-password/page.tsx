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
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api/axios";

const MotionBox = motion(Box);
const MotionHeading = motion(Heading);
const MotionText = motion(Text);
const MotionButton = motion(Button);

const ResetSchema = Yup.object({
  newPassword: Yup.string().min(6, "Password must be 6+ chars").required("New password is required"),
});

export default function ResetPasswordPage() {
    
  const router = useRouter();
const searchParams = useSearchParams();
const token = searchParams?.get("token") ?? ""; // if null, becomes empty string
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
            Reset Password
          </MotionHeading>

          <MotionText fontSize="md" opacity={0.8} textAlign="center">
            Enter your new password below.
          </MotionText>

          {!token ? (
            <MotionText color="red.300" fontSize="sm">Invalid or missing token</MotionText>
          ) : (
            <Formik
              initialValues={{ newPassword: "" }}
              validationSchema={ResetSchema}
              onSubmit={async (values, helpers) => {
                try {
                  await api.post("/auth/password/reset", { token, newPassword: values.newPassword });
                  helpers.setStatus("Password reset successful! Redirecting to login...");
                  setTimeout(() => router.push("/auth/login"), 2000);
                } catch (err: any) {
                  helpers.setStatus(err?.response?.data?.error || "Failed to reset password");
                } finally {
                  helpers.setSubmitting(false);
                }
              }}
            >
              {({ isSubmitting, errors, touched, status }) => (
                <Form style={{ width: "100%" }}>
                  <VStack spacing={6} w="100%">
                    <MotionBox w="100%">
                      <FormControl isInvalid={!!errors.newPassword && touched.newPassword}>
                        <FormLabel>New Password</FormLabel>
                        <Field
                          as={Input}
                          name="newPassword"
                          type="password"
                          variant="filled"
                          bg="gray.700"
                          _hover={{ bg: "gray.600" }}
                          _focus={{ borderColor: "yellow.400", bg: "gray.600" }}
                        />
                        <FormErrorMessage>{errors.newPassword}</FormErrorMessage>
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
                      Reset Password
                    </MotionButton>
                  </VStack>
                </Form>
              )}
            </Formik>
          )}

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
