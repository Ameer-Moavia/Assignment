"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api/axios";
import { AttachmentDTO, EventDTO } from "@/types";
import { Badge, Box, Button, Container, Grid, GridItem, Heading, Image, Text, useToast } from "@chakra-ui/react";
import { DateTime } from "luxon";

export default function EventDetailPage({ params }: { params: { id: string } }) {
  const [event, setEvent] = useState<EventDTO | null>(null);
  const toast = useToast();

  async function load() {
    const { data } = await api.get(`/events/${params.id}`);
    setEvent(data);
  }

  async function join() {
    try {
      await api.post(`/events/${params.id}/join`, { answers: {} });
      toast({ title: "Joined!", status: "success" });
      await load();
    } catch (e: any) {
      toast({ title: e?.response?.data?.error || "Join failed", status: "error" });
    }
  }

  useEffect(() => { void load(); }, []);

  if (!event) return null;

  return (
    <Container maxW="container.lg" py={10}>
      <Heading mb={2}>{event.title}</Heading>
      <Badge>{event.type}</Badge>
      <Text opacity={0.8} mt={4}>{event.description}</Text>
      <Text mt={4} fontSize="sm" opacity={0.7}>
        {DateTime.fromISO(event.startDate).toLocaleString(DateTime.DATETIME_MED)} → {DateTime.fromISO(event.endDate).toLocaleString(DateTime.DATETIME_MED)}
      </Text>

      <Grid templateColumns="repeat(3, 1fr)" gap={4} mt={6}>
        {(event.attachments || []).map((a: AttachmentDTO, i) => (
          <GridItem key={i}>
            {/* for simplicity assume images; videos could use <video controls> with a.type === "VIDEO" */}
            <Image src={a.url} alt="" rounded="md" />
          </GridItem>
        ))}
      </Grid>

      <Button mt={8} variant="solid" onClick={join}>Join Event</Button>
    </Container>
  );
}
