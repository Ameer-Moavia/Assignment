"use client";

import { Box, Button, Heading, Text, VStack, Icon } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <Box
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bgGradient="linear(to-r, purple.600, blue.600)"
      color="white"
      px={6}
    >
      <VStack spacing={6} textAlign="center" maxW="lg">
        <Icon as={Lock} boxSize={16} color="whiteAlpha.900" />
        <Heading size="2xl">Unauthorized Access</Heading>
        <Text fontSize="lg" opacity={0.9}>
          You don’t have the necessary permissions to view this page.
        </Text>
        <Button
          size="lg"
          bg="white"
          color="purple.700"
          _hover={{ bg: "whiteAlpha.900" }}
          rounded="full"
          onClick={() => router.push("/auth/login")}
        >
          Go to Login
        </Button>
      </VStack>
    </Box>
  );
}
