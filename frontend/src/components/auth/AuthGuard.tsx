"use client";

import { useEffect, useState } from "react";
import { useUserStore } from "@/utils/stores/useUserStore";
import { useRouter, usePathname } from "next/navigation";
import { Box, Spinner, Text, VStack } from "@chakra-ui/react";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useUserStore();
  const [hydrated, setHydrated] = useState(false);

  // ✅ wait for Zustand rehydration
  useEffect(() => {
    const unsub = useUserStore.persist.onFinishHydration(() => {
      setHydrated(true);
    });

    if (useUserStore.persist.hasHydrated()) {
      setHydrated(true);
    }

    return () => {
      unsub();
    };
  }, []);

  useEffect(() => {
    if (!hydrated || !pathname) return;

    console.log("ROLE:", user?.user?.role);

    // ✅ allow auth pages without checks
    if (pathname.startsWith("/auth") && !user) return;
    if (pathname.startsWith("/auth") && !!user) {
      if (user?.user?.role === "PARTICIPANT") {
        router.push("/participant/dashboard");
      } else if (user?.user?.role === "ORGANIZER" || user?.user?.role === "ADMIN") {
        router.push("/admin/dashboard");
      }
    }

    // ✅ if not logged in → redirect to login
    if (!user) {
      router.push("/auth/login");
      return;
    }

    // ✅ participant routes
    if (pathname.startsWith("/participant")) {
      if (user.user.role !== "PARTICIPANT") {
        router.push("/unauthorized");
        return;
      }
    }

    // ✅ admin routes
    if (pathname.startsWith("/admin")) {
      if (user.user.role !== "ADMIN" && user.user.role !== "ORGANIZER") {
        router.push("/unauthorized");
        return;
      }
    }

    // ✅ onboarding routes
    if (pathname.startsWith("/onboarding")) {
      if (user.user.role === "ADMIN" || user.user.role === "ORGANIZER") {
        if (!user?.user?.companyId || user?.user?.companyId === 0) {
          return;
        } else {
          router.push("/admin/dashboard");
        }
      } else {
        router.push("/unauthorized");
      }
    }
  }, [hydrated, user, pathname, router]);

  if (!hydrated) {
    return (
      <Box
        minH="100vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
        bg="black"
        color="yellow.400"
      >
        <VStack spacing={4}>
          <Spinner
            thickness="4px"
            speed="0.65s"
            emptyColor="gray.700"
            color="yellow.400"
            size="xl"
          />
          <Text fontSize="lg" fontWeight="semibold" color="yellow.400">
            Loading, please wait...
          </Text>
        </VStack>
      </Box>

    );
  }

  return <>{children}</>;
}
