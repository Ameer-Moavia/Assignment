"use client";
import { Box, Container, VStack, Heading, Text, Flex, Stack, SimpleGrid, useColorModeValue, Button } from "@chakra-ui/react";
import { motion } from "framer-motion";
import Link from "next/link";
import { FaCalendarCheck, FaUsers, FaLock, FaBolt } from "react-icons/fa";

import FeatureCard from "@/components/layout/FeatureCard";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";

const MotionHeading = motion(Heading);
const MotionText = motion(Text);
const MotionBox = motion(Box);

export default function HomePage() {
  const bg = useColorModeValue("gray.900", "black");
  const text = useColorModeValue("whiteAlpha.900", "white");

  return (
    <Box bg={bg} color={text}>
      <Header />

      {/* Hero Section */}
      <Container maxW="container.xl" py={28}>
        <VStack spacing={8} textAlign="center">
          <MotionHeading
            size="4xl"
            bgGradient="linear(to-r, yellow.400, yellow.600)"
            bgClip="text"
            initial={{ y: -40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            Wizard Productions
          </MotionHeading>

          <MotionText
            fontSize="xl"
            maxW="2xl"
            opacity={0.85}
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            Create, manage, and join awesome events. A powerful <b>Black & Yellow</b> event platform — fast, secure, and built for everyone.
          </MotionText>

          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            <Flex gap={4} justify="center">
              <Link href="/events" passHref>
                <Button size="lg" colorScheme="yellow" rounded="full">
                  Browse Events
                </Button>
              </Link>
              <Link href="/auth/signup" passHref>
                <Button size="lg" variant="outline" rounded="full" borderColor="yellow.400" color="yellow.400" _hover={{ bg: "yellow.400", color: "black" }}>
                  Get Started
                </Button>
              </Link>
            </Flex>
          </motion.div>
        </VStack>
      </Container>

      {/* Features Section */}
      <Box py={20} bg="gray.800">
        <Container maxW="container.xl">
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={10}>
            {features.map((f, i) => (
              <FeatureCard key={f.title} {...f} delay={i * 0.2} />
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      {/* CTA Section */}
      <MotionBox py={20} textAlign="center" initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }}>
        <Stack spacing={6} align="center">
          <MotionHeading size="2xl" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.8 }} viewport={{ once: true }}>
            Ready to make your <span style={{ color: "#fbbf24" }}>event</span> unforgettable?
          </MotionHeading>
          <MotionText fontSize="lg" opacity={0.8} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.8 }} viewport={{ once: true }}>
            Sign up today and start hosting or joining events in seconds.
          </MotionText>
          <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ delay: 0.6, duration: 0.6 }} viewport={{ once: true }}>
            <Link href="/auth/signup" passHref>
              <Button size="lg" colorScheme="yellow" rounded="full">
                Get Started Now
              </Button>
            </Link>
          </motion.div>
        </Stack>
      </MotionBox>

      <Footer />
    </Box>
  );
}

const features = [
  { title: "Secure Access", desc: "Login with password or OTP, and reset securely anytime.", icon: <FaLock /> },
  { title: "Event Management", desc: "Create, manage and customize onsite or online events with ease.", icon: <FaCalendarCheck /> },
  { title: "Community", desc: "Organizers and participants connect in one powerful platform.", icon: <FaUsers /> },
  { title: "Fast & Reliable", desc: "Real-time updates, seat management, and smooth performance.", icon: <FaBolt /> },
];
