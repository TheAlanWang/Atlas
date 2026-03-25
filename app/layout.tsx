import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import { ThemeProvider } from "@/context/ThemeContext";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] }); // google fonts

export const metadata: Metadata = {
  title: "Atlas",
  description: "Learning Site",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen`}>
        <ThemeProvider>
          <Header />
          <main className="max-w-6xl mx-auto px-6 pt-20 pb-8">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
