import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs"; // <--- Added Import
import { dark } from '@clerk/themes'
import "./globals.css";
// Import the new component
import { StarBackground } from "@/components/ui/StarBackground";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI Super App",
  description: "The future of AI and communication.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // <--- Wrapped everything in ClerkProvider
    <ClerkProvider
    appearance={{
        baseTheme: dark,
        variables: { 
          colorPrimary: '#6366f1', // Optional: Matches your Indigo-500 brand color
          colorBackground: '#040404' // Optional: Matches gray-900 if you want it darker
        }
      }}
    >
      <html lang="en" className="scroll-smooth">
        {/* Ensure base text color is white */}
        <body className={`${inter.className} antialiased text-white`}>
          {/* Mount the animated background here */}
          <StarBackground />
          
          {/* Your app content sits on top */}
          <div className="relative z-10">
             {children}
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}