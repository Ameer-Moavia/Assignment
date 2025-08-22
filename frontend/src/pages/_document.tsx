import { Html, Head, Main, NextScript } from "next/document";
import { ColorModeScript } from "@chakra-ui/react";
import theme from "@/theme";

export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <body>
        {/* Ensures SSR and client hydration color modes match */}
        <ColorModeScript initialColorMode={theme.config.initialColorMode} />
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
