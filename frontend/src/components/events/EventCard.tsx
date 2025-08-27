"use client";
import { Box, Heading, Text, Badge, HStack } from "@chakra-ui/react";
import Link from "next/link";
import { EventDTO } from "@/utils/types";
import { DateTime } from "luxon";

export default function EventCard({ e }: { e: EventDTO }) {
  const start = DateTime.fromISO(e.startDate).toLocaleString(DateTime.DATETIME_MED);
  const end = DateTime.fromISO(e.endDate).toLocaleString(DateTime.DATETIME_MED);

  return (
    <Box as={Link} href={`/events/${e.id}`} p={4} border="1px" borderColor="whiteAlpha.200" rounded="xl" _hover={{ borderColor: "brand.500" }}>
      <HStack justify="space-between" mb={2}>
        <Badge colorScheme={e.type === "ONLINE" ? "purple" : "green"}>{e.type}</Badge>
        {typeof e.confirmedParticipants === "number" && (
          <Badge>{e.confirmedParticipants} joined</Badge>
        )}
      </HStack>
      <Heading size="md">{e.title}</Heading>
      <Text noOfLines={2} opacity={0.8} mt={2}>{e.description}</Text>
      <Text mt={3} fontSize="sm" opacity={0.7}>{start} → {end}</Text>
    </Box>
  );
}
