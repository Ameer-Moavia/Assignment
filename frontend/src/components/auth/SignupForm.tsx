"use client";
import { Button, FormControl, FormErrorMessage, FormLabel, Input, Select, VStack } from "@chakra-ui/react";
import { Formik, Field, Form } from "formik";
import * as Yup from "yup";
import api from "@/lib/api/axios";
import { useDispatch } from "react-redux";
import { setUser } from "@/state/redux/userSlice";
import { useRouter } from "next/navigation";

const Schema = Yup.object({
  name: Yup.string().min(2).required(),
  email: Yup.string().email().required(),
  password: Yup.string().min(8).required(),
  role: Yup.mixed<"PARTICIPANT"|"ADMIN">().oneOf(["PARTICIPANT","ADMIN"]).required()
});

export default function SignupForm() {
  const dispatch = useDispatch();
  const router = useRouter();

  return (
    <Formik
      initialValues={{ name: "", email: "", password: "", role: "PARTICIPANT" as const }}
      validationSchema={Schema}
      onSubmit={async (values, helpers) => {
        try {
          const { data } = await api.post("/auth/signup", values);
          dispatch(setUser(data.user ?? data));
          router.push("/events");
        } catch (err: any) {
          helpers.setStatus(err?.response?.data?.error || "Signup failed");
        } finally {
          helpers.setSubmitting(false);
        }
      }}
    >
      {({ isSubmitting, errors, touched, status }) => (
        <Form>
          <VStack align="stretch" spacing={4}>
            <FormControl isInvalid={!!errors.name && touched.name}>
              <FormLabel>Name</FormLabel>
              <Field as={Input} name="name" variant="filled" />
              <FormErrorMessage>{errors.name}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.email && touched.email}>
              <FormLabel>Email</FormLabel>
              <Field as={Input} name="email" type="email" variant="filled" />
              <FormErrorMessage>{errors.email}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.password && touched.password}>
              <FormLabel>Password</FormLabel>
              <Field as={Input} name="password" type="password" variant="filled" />
              <FormErrorMessage>{errors.password}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.role && touched.role}>
              <FormLabel>Role</FormLabel>
              <Field as={Select} name="role" variant="filled">
                <option value="PARTICIPANT">Participant</option>
                <option value="ADMIN">Admin/Organizer</option>
              </Field>
              <FormErrorMessage>{errors.role}</FormErrorMessage>
            </FormControl>

            {status && <div style={{ color: "salmon" }}>{status}</div>}

            <Button type="submit" isLoading={isSubmitting} variant="solid">Create Account</Button>
          </VStack>
        </Form>
      )}
    </Formik>
  );
}
