"use client";
import { Button, Container, FormControl, FormErrorMessage, FormLabel, Input, Select, VStack, Heading } from "@chakra-ui/react";
import { Formik, Field, Form } from "formik";
import * as Yup from "yup";
import api from "@/lib/api/axios";
import { useRouter, useSearchParams } from "next/navigation";

const Schema = Yup.object({
  email: Yup.string().email().required(),
  code: Yup.string().length(6).required(),
  role: Yup.mixed().oneOf(["PARTICIPANT","ADMIN"]).optional(),
  name: Yup.string().optional()
});

export default function VerifyOtpPage() {
const router = useRouter();
const qs = useSearchParams();
const getParam = (key: string, fallback = "") => qs?.get(key) ?? fallback;

const email = getParam("email");
const purpose = getParam("purpose", "LOGIN");

  return (
    <Container maxW="md" py={12}>
      <VStack spacing={6} align="stretch">
        <Heading size="lg">Verify OTP</Heading>
        <Formik
          initialValues={{ email, code: "", role: "PARTICIPANT", name: "" }}
          validationSchema={Schema}
          onSubmit={async (values, helpers) => {
            try {
              const { data } = await api.post("/auth/otp/verify", {
                email: values.email,
                code: values.code,
                // For SIGNUP you may pass role & name; backend supports both admin/participant creation by OTP
                role: purpose === "SIGNUP" ? values.role : undefined,
                name: purpose === "SIGNUP" ? values.name : undefined
              });
              router.push("/events");
            } catch (err: any) {
              helpers.setStatus(err?.response?.data?.error || "OTP verification failed");
            } finally {
              helpers.setSubmitting(false);
            }
          }}
        >
          {({ isSubmitting, errors, touched, status }) => (
            <Form>
              <VStack align="stretch" spacing={4}>
                <FormControl isInvalid={!!errors.email && touched.email}>
                  <FormLabel>Email</FormLabel>
                  <Field as={Input} name="email" type="email" variant="filled" />
                  <FormErrorMessage>{errors.email}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={!!errors.code && touched.code}>
                  <FormLabel>OTP Code</FormLabel>
                  <Field as={Input} name="code" placeholder="6-digit code" variant="filled" />
                  <FormErrorMessage>{errors.code}</FormErrorMessage>
                </FormControl>

                {purpose === "SIGNUP" && (
                  <>
                    <FormControl>
                      <FormLabel>Name</FormLabel>
                      <Field as={Input} name="name" variant="filled" />
                    </FormControl>
                    <FormControl>
                      <FormLabel>Role</FormLabel>
                      <Field as={Select} name="role" variant="filled">
                        <option value="PARTICIPANT">Participant</option>
                        <option value="ADMIN">Admin/Organizer</option>
                      </Field>
                    </FormControl>
                  </>
                )}

                {status && <div style={{ color: "salmon" }}>{status}</div>}
                <Button type="submit" isLoading={isSubmitting} variant="solid">Verify</Button>
              </VStack>
            </Form>
          )}
        </Formik>
      </VStack>
    </Container>
  );
}
