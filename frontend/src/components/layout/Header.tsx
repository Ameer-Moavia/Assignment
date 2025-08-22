"use client";
import { Flex, Box, Button, Link as ChakraLink } from "@chakra-ui/react";
import Link from "next/link";

export default function Header() {
  return (
    <Flex
      as="header"
      py={4}
      px={8}
      justify="space-between"
      align="center"
      bg="gray.900"
      color="white"
    >
      <ChakraLink as={Link} href="/" fontWeight="bold" fontSize="xl">
        Wizard Productions
      </ChakraLink>

      <Flex gap={4}>
        <Button as={Link} href="/events" size="sm" colorScheme="yellow">
          Events
        </Button>
        <Button
          as={Link}
          href="/auth/login"
          size="sm"
          variant="solid"
          colorScheme="yellow"
        >
          Login
        </Button>
        <Button
          as={Link}
          href="/auth/signup"
          size="sm"
          variant="outline"
          borderColor="yellow.400"
          color="yellow.400"
        >
          Sign Up
        </Button>
      </Flex>
    </Flex>
  );
}