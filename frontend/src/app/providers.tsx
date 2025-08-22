"use client";

import { Provider } from "react-redux";
import { store } from "@/state/redux/store";
import { ChakraProvider, extendTheme, ThemeConfig } from "@chakra-ui/react";

const config: ThemeConfig = {
  initialColorMode: "dark", // 👈 default is dark
  useSystemColorMode: false, // don’t follow OS theme
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
      500: "#f59e0b", // main yellow
      600: "#d97706",
      700: "#b45309",
      800: "#92400e",
      900: "#78350f",
    },
  },
});


export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <ChakraProvider theme={theme}>{children}</ChakraProvider>
    </Provider>
  );
}
