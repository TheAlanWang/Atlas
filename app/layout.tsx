import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import { ThemeProvider } from "@/context/ThemeContext";
import Footer from "@/components/Footer";
import {
  getTopicsByCategory,
  getAllKnowledgeArticles,
  getMapTopics,
} from "@/lib/knowledge";
import ChatWidget from "@/components/ChatWidget";
import BackToTopButton from "@/components/BackToTopButton";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

// Root layout — wraps every page in the app.
//
// Responsibilities:
//   1. Set the global font (Inter) and base HTML structure
//   2. Provide ThemeProvider (dark/light mode) to all pages
//   3. Render the sticky Header and Footer around page content
//   4. Inject the floating ChatWidget (AI assistant bubble)
//
// What it intentionally does NOT do:
//   - No max-width constraint — each page controls its own width.
//     (e.g. homepage uses max-w-6xl; topic pages go full-width for the 3-column layout)
//   - No page-specific layout — that lives in each page's own file.
//
// Data fetched here (server-side, runs once per request):
//   - categoryGroups: powers the Header nav dropdowns
//   - searchItems: powers the Header search modal

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
  const mapTopics = getMapTopics();
  const allArticles = await getAllKnowledgeArticles();
  const searchItems = allArticles.map((article) => ({
    title: article.title,
    topic: article.topic,
    section: article.section,
    slug: article.slug,
  }));
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen`}>
        <ThemeProvider>
          {/* Sticky top navbar — 57px tall, sits above all content */}
          <Header
            categoryGroups={categoryGroups}
            mapTopics={mapTopics}
            searchItems={searchItems}
          />

          {/* Page content area
              px-10: 40px side padding — breathing room from screen edges
              pt-20: 80px top padding — clears the sticky 57px header with extra space
              pb-16: 64px bottom padding — space before the footer */}
          <main className="px-4 sm:px-6 lg:px-10 pt-16 sm:pt-20 pb-12 sm:pb-16">
            {children}
          </main>

          {/* Floating AI chat bubble — fixed position, overlays all content */}
          <BackToTopButton />
          <ChatWidget />
          <Footer />
          <Analytics />
          <SpeedInsights />
        </ThemeProvider>
      </body>
    </html>
  );
}
