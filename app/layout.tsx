import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import { ThemeProvider } from "@/context/ThemeContext";
import Footer from "@/components/Footer";
import { getTopicsByCategory } from "@/lib/posts";
import ChatWidget from "@/components/ChatWidget";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Atlas",
  description: "Learning Site",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const categoryGroups = getTopicsByCategory();
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen`}>
        <ThemeProvider>
          <Header categoryGroups={categoryGroups} />
          <main className="max-w-6xl mx-auto px-6 pt-20 pb-16">{children}</main>
          <ChatWidget />
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
