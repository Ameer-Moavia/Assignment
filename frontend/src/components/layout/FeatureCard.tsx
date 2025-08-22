"use client";
import { Box, Heading, Text } from "@chakra-ui/react";
import { motion } from "framer-motion";

const MotionBox = motion(Box);

export default function FeatureCard({
  icon,
  title,
  desc,
  delay = 0,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  delay?: number;
}) {
  return (
    <MotionBox
      p={6}
      bg="gray.900"
      rounded="2xl"
      shadow="xl"
      whileHover={{ scale: 1.05 }}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.6 }}
      viewport={{ once: true }}
    >
      <Box fontSize="4xl" color="yellow.400">
        {icon}
      </Box>
      <Heading size="md" mt={4}>
        {title}
      </Heading>
      <Text mt={2} opacity={0.8}>
        {desc}
      </Text>
    </MotionBox>
  );
}
