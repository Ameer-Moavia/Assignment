"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api/axios";
import { EventDTO, Paginated } from "@/types";
import { Box, Container, Grid, GridItem, HStack, Input, Select, Spinner, Text } from "@chakra-ui/react";
import EventCard from "@/components/events/EventCard";

export default function EventsPage() {
  const [data, setData] = useState<Paginated<EventDTO> | null>(null);
  const [status, setStatus] = useState<"loading"|"idle"|"error">("loading");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"active"|"past">("active");
  const [page, setPage] = useState(1);

  async function load() {
    setStatus("loading");
    try {
      const { data } = await api.get("/events", { params: { search, status: statusFilter, page, pageSize: 12 } });
      setData(data);
      setStatus("idle");
    } catch {
      setStatus("error");
    }
  }

  useEffect(() => { void load(); }, [search, statusFilter, page]);

  return (
    <Container maxW="container.lg" py={10}>
      <HStack mb={6} spacing={4}>
        <Input placeholder="Search events..." value={search} onChange={(e) => setSearch(e.target.value)} variant="filled" />
        <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)} w="200px" variant="filled">
          <option value="active">Active</option>
          <option value="past">Past</option>
        </Select>
      </HStack>

      {status === "loading" && <Spinner />}
      {status === "error" && <Text color="tomato">Failed to load events.</Text>}

      {data && (
        <>
          <Grid templateColumns="repeat(3, 1fr)" gap={6}>
            {data.items.map((e) => (
              <GridItem key={e.id}><EventCard e={e} /></GridItem>
            ))}
          </Grid>
          <HStack mt={6} spacing={4}>
            <Box as="button" onClick={() => setPage(p => Math.max(1, p - 1))} opacity={page === 1 ? 0.5 : 1}>Prev</Box>
            <Text>Page {data.page} / {Math.ceil(data.total / data.pageSize) || 1}</Text>
            <Box as="button" onClick={() => setPage(p => p + 1)} opacity={(data.page * data.pageSize) >= data.total ? 0.5 : 1}>Next</Box>
          </HStack>
        </>
      )}
    </Container>
  );
}
