"use client";

import { ChakraProvider, extendTheme, ThemeConfig } from "@chakra-ui/react";
import AuthGuard from "@/components/auth/AuthGuard";

const config: ThemeConfig = {
  initialColorMode: "dark",
  useSystemColorMode: false,
};

const theme = extendTheme({
  config,
  colors: {
    brand: {
      50: "#fffbea",
      100: "#fef3c7",
      200: "#fde68a",
      300: "#fcd34d",
      400: "#fbbf24",
      500: "#f59e0b",
      600: "#d97706",
      700: "#b45309",
      800: "#92400e",
      900: "#78350f",
    },
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  return <ChakraProvider theme={theme}>
    <AuthGuard>
    {children}
    </AuthGuard>
    </ChakraProvider>;
}
