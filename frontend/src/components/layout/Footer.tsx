"use client";
import { Box } from "@chakra-ui/react";

export default function Footer() {
  return (
    <Box py={6} bg="black" textAlign="center" fontSize="sm" opacity={0.7}>
      © {new Date().getFullYear()} Wizard Productions. All rights reserved.
    </Box>
  );
}