"use client";

import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  useToast,
  Divider,
  Text,
} from "@chakra-ui/react";
import { useState } from "react";
import { useUserStore } from "@/utils/stores/useUserStore";
import { useCompanyStore } from "@/utils/stores/useCompanyStore";
import axios from "axios";
import Header from "@/components/layout/Header";
import { refreshCompany } from "@/utils/stores/RefreshStore/refreshCompany";

export default function AdminProfilePage() {
  const { user, setUser } = useUserStore();
  const { company, setCompany } = useCompanyStore();
  const toast = useToast();

  const isOwner = user?.user?.profileId === company?.ownerId;

  // User fields
  const [name, setName] = useState(user?.user?.name || "");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  // Company fields
  const [companyName, setCompanyName] = useState(company?.name || "");
  const [companyDescription, setCompanyDescription] = useState(
    company?.description || ""
  );
  const [loadingCompany, setLoadingCompany] = useState(false);

  // Update Name
  const handleNameUpdate = async () => {
    try {
      setLoading(true);
      const res = await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}users/me`,
        { name },
        { headers: { Authorization: `Bearer ${user?.token}` } }
      );
      await refreshCompany();
     setUser({ user: res.data.user, token: user?.token });
      toast({ title: "Name updated", status: "success" });
    } catch (e: any) {
      toast({
        title: e.response?.data?.error || "Update failed",
        status: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // Change Password
  const handleChangePassword = async () => {
    if (newPassword !== confirm) {
      toast({ title: "Passwords do not match", status: "error" });
      return;
    }
    try {
      setLoading(true);
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}users/me/change-password`,
        { oldPassword, newPassword },
        { headers: { Authorization: `Bearer ${user?.token}` } }
      );
      toast({ title: "Password changed", status: "success" });
      setOldPassword("");
      setNewPassword("");
      setConfirm("");
    } catch (e: any) {
      toast({
        title: e.response?.data?.error || "Change failed",
        status: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // Delete Account
  const handleDelete = async () => {
    if (!window.confirm("Are you sure? This cannot be undone.")) return;
    try {
      setLoading(true);
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}users/${user?.user?.id}`,
        {
          headers: { Authorization: `Bearer ${user?.token}` },
        }
      );
      toast({ title: "Account deleted", status: "success" });
      setUser(null);
      window.location.href = "/auth/login";
    } catch (e: any) {
      toast({
        title: e.response?.data?.error || "Delete failed",
        status: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // Update Company (only if owner)
  const handleUpdateCompany = async () => {
    try {
      setLoadingCompany(true);
      const res = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}company/${company?.id}`,
        { name: companyName, description: companyDescription },
        { headers: { Authorization: `Bearer ${user?.token}` } }
      );
      await refreshCompany();
      toast({ title: "Company updated", status: "success" });
    } catch (e: any) {
      toast({
        title: e.response?.data?.error || "Update failed",
        status: "error",
      });
    } finally {
      setLoadingCompany(false);
    }
  };

  return (
    <>
      <Header />
      <Flex
        minH="100vh"
        bg="black"
        align="center"
        justify="center"
        color="yellow.400"
      >
        <Box
          bg="gray.900"
          p={8}
          rounded="2xl"
          shadow="xl"
          w="full"
          maxW="lg"
        >
          <Heading size="lg" mb={6} textAlign="center">
            Admin / Organizer Profile
          </Heading>

          {/* Update Name */}
          <VStack spacing={4} align="stretch">
            <FormControl>
              <FormLabel>Name</FormLabel>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                bg="black"
                borderColor="yellow.400"
                _focus={{ borderColor: "yellow.500" }}
              />
            </FormControl>
            <Button
              colorScheme="yellow"
              onClick={handleNameUpdate}
              isLoading={loading}
            >
              Update Name
            </Button>
          </VStack>

          <Divider my={8} borderColor="gray.700" />

          {/* Change Password */}
          <VStack spacing={4} align="stretch">
            <FormControl>
              <FormLabel>Old Password</FormLabel>
              <Input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                bg="black"
                borderColor="yellow.400"
              />
            </FormControl>
            <FormControl>
              <FormLabel>New Password</FormLabel>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                bg="black"
                borderColor="yellow.400"
              />
            </FormControl>
            <FormControl>
              <FormLabel>Confirm Password</FormLabel>
              <Input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                bg="black"
                borderColor="yellow.400"
              />
            </FormControl>
            <Button
              colorScheme="yellow"
              onClick={handleChangePassword}
              isLoading={loading}
            >
              Change Password
            </Button>
          </VStack>

          <Divider my={8} borderColor="gray.700" />

          {/* Company Info (only if Owner) */}
          {isOwner && (
            <>
              <Heading size="md" mb={4} textAlign="center">
                Company Info
              </Heading>
              <VStack spacing={4} align="stretch">
                <FormControl>
                  <FormLabel>Company Name</FormLabel>
                  <Input
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    bg="black"
                    borderColor="yellow.400"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Description</FormLabel>
                  <Input
                    value={companyDescription}
                    onChange={(e) => setCompanyDescription(e.target.value)}
                    bg="black"
                    borderColor="yellow.400"
                  />
                </FormControl>
                <Button
                  colorScheme="yellow"
                  onClick={handleUpdateCompany}
                  isLoading={loadingCompany}
                >
                  Update Company
                </Button>
              </VStack>
              <Divider my={8} borderColor="gray.700" />
            </>
          )}

          {/* Delete Account */}
          <Button
            colorScheme="red"
            w="full"
            onClick={handleDelete}
            isLoading={loading}
          >
            Delete Account
          </Button>
        </Box>
      </Flex>
    </>
  );
}