import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

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
    <html lang="en" className="scroll-smooth">
      {/* REMOVED bg-black here so globals.css takes over */}
      <body className={`${inter.className} antialiased text-white`}>
        {children}
      </body>
    </html>
  );
}