import { ChakraProvider } from "@chakra-ui/react";
import theme from "@/theme";
import type { AppProps } from "next/app";
import AuthGuard from "@/components/auth/AuthGuard";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider theme={theme}>
      <AuthGuard>
      <Component {...pageProps} />
      </AuthGuard>
    </ChakraProvider>
  );
}

export default MyApp;
