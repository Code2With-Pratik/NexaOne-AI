import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { AuthSync } from "@/components/auth-sync";
import { dark } from '@clerk/themes';
import "./globals.css";
import { StarBackground } from "@/components/ui/StarBackground";
import "@livekit/components-styles";

// 👇 1. Import the SocketProvider
import { SocketProvider } from "@/providers/SocketProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NexaOne AI",
  description: "The future of AI and communication.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
        variables: { 
          colorPrimary: '#6366f1', 
          colorBackground: '#040404' 
        }
      }}
    >
      <html lang="en" className="scroll-smooth">
        <body className={`${inter.className} antialiased text-white`}>
          <AuthSync />
          <StarBackground />
          
          {/* 👇 2. Wrap the content with SocketProvider */}
          <SocketProvider>
            <div className="relative z-10">
               {children}
            </div>
          </SocketProvider>

        </body>
      </html>
    </ClerkProvider>
  );
}