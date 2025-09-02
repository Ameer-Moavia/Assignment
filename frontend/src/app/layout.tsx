import "./globals.css";
import { Providers } from "./providers"; // 👈 import the Providers you made


export const metadata = { 
  title: "Wizard Productions", 
  description: "Event management" 
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
