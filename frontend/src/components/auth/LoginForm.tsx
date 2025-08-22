"use client";
import {
  Button,
  Input,
  VStack,
  Text,
  FormControl,
  FormErrorMessage,
  InputGroup,
  InputRightElement,
  IconButton,
} from "@chakra-ui/react";
import { Formik, Field, Form } from "formik";
import * as Yup from "yup";
import { useState } from "react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface LoginFormValues {
  email: string;
  password: string;
}

const LoginSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email").required("Email required"),
  password: Yup.string().required("Password required"),
});

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleLogin = async (values: LoginFormValues, helpers: any) => {
    try {
      console.log("Logging in with:", values);
      // Replace with API call
      setTimeout(() => {
        helpers.setSubmitting(false);
        router.push("/events");
      }, 1000);
    } catch (err: any) {
      helpers.setStatus(err?.response?.data?.error || "Login failed");
      helpers.setSubmitting(false);
    }
  };

  return (
    <Formik
      initialValues={{ email: "", password: "" }}
      validationSchema={LoginSchema}
      onSubmit={handleLogin}
    >
      {({ isSubmitting, errors, touched, status }) => (
        <Form>
          <VStack spacing={4} align="stretch">
            {/* Email */}
            <FormControl isInvalid={!!errors.email && !!touched.email}>
              <Field name="email">
                {({ field }: any) => (
                  <Input
                    {...field}
                    placeholder="Enter your email"
                    size="lg"
                    variant="filled"
                  />
                )}
              </Field>
              <FormErrorMessage>{errors.email}</FormErrorMessage>
            </FormControl>

            {/* Password */}
            <FormControl isInvalid={!!errors.password && !!touched.password}>
              <Field name="password">
                {({ field }: any) => (
                  <InputGroup>
                    <Input
                      {...field}
                      placeholder="Enter your password"
                      type={showPassword ? "text" : "password"}
                      size="lg"
                      variant="filled"
                    />
                    <InputRightElement>
                      <IconButton
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                        size="sm"
                        variant="ghost"
                        onClick={() => setShowPassword(!showPassword)}
                      />
                    </InputRightElement>
                  </InputGroup>
                )}
              </Field>
              <FormErrorMessage>{errors.password}</FormErrorMessage>
            </FormControl>

            {status && (
              <Text color="red.500" textAlign="center" fontSize="sm">
                {status}
              </Text>
            )}

            {/* Login Button */}
            <Button
              type="submit"
              isLoading={isSubmitting}
              colorScheme="yellow"
              size="lg"
              fontWeight="semibold"
              borderRadius="full"
              width="full"
            >
              Login
            </Button>

            {/* OTP Login */}
            <Button
              as={Link}
              href="/auth/otp/send"
              variant="ghost"
              size="sm"
              color="yellow.500"
              fontWeight="medium"
            >
              Login with OTP
            </Button>
          </VStack>
        </Form>
      )}
    </Formik>
  );
}