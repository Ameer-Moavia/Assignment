"use client";
import { Container, Heading } from "@chakra-ui/react";
import EventForm from "@/components/event/EventForm";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CreateEventPage() {
  const { user, me } = useAuth();
  const router = useRouter();

  useEffect(() => { void me(); }, []);
  useEffect(() => {
    if (user && !(user.role === "ADMIN" || user.role === "ORGANIZER")) {
      router.replace("/events");
    }
  }, [user]);

  return (
    <Container maxW="container.md" py={10}>
      <Heading mb={6}>Create Event</Heading>
      <EventForm />
    </Container>
  );
}
