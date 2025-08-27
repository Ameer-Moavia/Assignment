"use client";
import { Container, Heading, Table, Tbody, Td, Th, Thead, Tr, Select, Button, useToast } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import api from "@/lib/api/axios";
import { UserDTO } from "@/utils/types";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserDTO[]>([]);
  const toast = useToast();

  async function load() {
    const { data } = await api.get("/users");
    setUsers(data);
  }
  async function changeRole(id: number, role: "ADMIN"|"ORGANIZER"|"PARTICIPANT") {
    await api.patch(`/users/${id}/role`, { role });
    toast({ title: "Role updated", status: "success" });
    await load();
  }
  async function remove(id: number) {
    await api.delete(`/users/${id}`);
    toast({ title: "User deleted", status: "success" });
    await load();
  }

  useEffect(() => { void load(); }, []);

  return (
    <Container maxW="container.lg" py={10}>
      <Heading mb={6}>Users</Heading>
      <Table variant="simple">
        <Thead>
          <Tr><Th>ID</Th><Th>Email</Th><Th>Role</Th><Th>Action</Th></Tr>
        </Thead>
        <Tbody>
          {users.map(u => (
            <Tr key={u.id}>
              <Td>{u.id}</Td>
              <Td>{u.email}</Td>
              <Td>
                <Select defaultValue={u.role} onChange={(e) => changeRole(u.id, e.target.value as any)} w="48">
                  <option value="ADMIN">ADMIN</option>
                  <option value="ORGANIZER">ORGANIZER</option>
                  <option value="PARTICIPANT">PARTICIPANT</option>
                </Select>
              </Td>
              <Td><Button size="sm" colorScheme="red" variant="ghost" onClick={() => remove(u.id)}>Delete</Button></Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Container>
  );
}
