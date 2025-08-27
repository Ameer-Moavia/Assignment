import { useRouter } from "next/router";
import { useEffect } from "react";
import { useUserStore } from "@/utils/stores/useUserStore";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user } = useUserStore();

  useEffect(() => {
    if (!user && !router.pathname.startsWith("/auth")) {
      router.push("/auth/login");
    }
  }, [user, router]);

  return <>{children}</>;
}
