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
import { useUserStore } from "@/utils/stores/useUserStore";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api/axios";
import Header from "@/components/layout/Header";
import { useCompanyStore } from "@/utils/stores/useCompanyStore";
import axios from "axios";



const MotionBox = motion(Box);
const MotionHeading = motion(Heading);
const MotionText = motion(Text);
const MotionButton = motion(Button);

const Schema = Yup.object({
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be 6+ chars")
    .required("Password is required"),
});



export default function LoginPage() {
  const { setUser } = useUserStore();
  const { setCompany } = useCompanyStore();
  const router = useRouter();



  const setData = async (companyId: number,token: string, helpers: any) => {
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
  }finally {
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
        <Header />
        <Formik
          initialValues={{ email: "", password: "" }}
          validationSchema={Schema}
          onSubmit={async (values, helpers) => {
            try {
              const { data } = await api.post("/auth/login", values);

              // Save user into Redux (you already set up userSlice)
              setUser(data);
              localStorage.setItem("user", data);

              // Redirect to events/dashboard
              if (data?.user?.role === 'ADMIN' || data?.user?.role === 'ORGANIZER') {
                data?.user?.companyId ? setData(data?.user?.companyId,data?.token, helpers) : router.push("/onboarding");
                helpers.setSubmitting(false);
              }else if(data?.user?.role === 'PARTICIPANT'){
                router.push("/participant/dashboard");
                helpers.setSubmitting(false);
              }
            } catch (err: any) {
              helpers.setStatus(err?.response?.data?.error || "Login failed");
            } 
          }}
        >
          {({ isSubmitting, errors, touched, status }) => (
            <Form>
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
                  Login
                </MotionHeading>

                <MotionText
                  fontSize="md"
                  opacity={0.8}
                  textAlign="center"
                  variants={{
                    hidden: { opacity: 0 },
                    show: { opacity: 1 },
                  }}
                >
                  Welcome back! Please enter your details to continue.
                </MotionText>

                {/* Email */}
                <MotionBox
                  w="100%"
                  variants={{
                    hidden: { opacity: 0, x: -20 },
                    show: { opacity: 1, x: 0 },
                  }}
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

                {/* Password */}
                <MotionBox
                  w="100%"
                  variants={{
                    hidden: { opacity: 0, x: 20 },
                    show: { opacity: 1, x: 0 },
                  }}
                >
                  <FormControl
                    isInvalid={!!errors.password && touched.password}
                  >
                    <FormLabel>Password</FormLabel>
                    <Field
                      as={Input}
                      name="password"
                      type="password"
                      variant="filled"
                      bg="gray.700"
                      _hover={{ bg: "gray.600" }}
                      _focus={{ borderColor: "yellow.400", bg: "gray.600" }}
                    />
                    <FormErrorMessage>{errors.password}</FormErrorMessage>
                  </FormControl>
                </MotionBox>

                {/* Error Message */}
                {status && (
                  <MotionText
                    color="red.300"
                    fontSize="sm"
                    variants={{
                      hidden: { opacity: 0 },
                      show: { opacity: 1 },
                    }}
                  >
                    {status}
                  </MotionText>
                )}

                {/* Submit */}
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
                  Login
                </MotionButton>

                {/* Links */}
                <VStack spacing={2} fontSize="sm">
                  <MotionText
                    variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }}
                  >
                    <ChakraLink
                      as={Link}
                      href="/auth/otp/send"
                      color="yellow.400"
                    >
                      Login with OTP
                    </ChakraLink>
                  </MotionText>

                  <MotionText
                    variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }}
                  >
                    <ChakraLink
                      as={Link}
                      href="/auth/forgot-password"
                      color="yellow.400"
                    >
                      Forgot password?
                    </ChakraLink>
                  </MotionText>

                  <MotionText
                    variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }}
                  >
                    Don’t have an account?{" "}
                    <ChakraLink
                      as={Link}
                      href="/auth/signup"
                      color="yellow.400"
                      fontWeight="bold"
                    >
                      Sign Up
                    </ChakraLink>
                  </MotionText>
                </VStack>
              </VStack>
            </Form>
          )}
        </Formik>
      </Container>
    </Box>
  );
}