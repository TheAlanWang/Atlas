# Topic Categories Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `category` layer above topics so the Header shows grouped dropdowns instead of a flat list of all topics.

**Architecture:** Each `content/topics/*.json` gets a `category` field. A new `getTopicsMeta()` function in `lib/posts.ts` returns topics with their category. `layout.tsx` passes grouped topic data to `Header`, which renders category dropdowns. The homepage groups `TopicCard`s by category.

**Tech Stack:** Next.js, TypeScript, Tailwind CSS

---

## Category Mapping

| Category | Topics |
|----------|--------|
| `languages` | python, typescript |
| `frontend` | react |
| `ai` | llm, rag |
| `systems` | distributed, network |
| `tools` | git |

---

## File Map

| File | Change |
|------|--------|
| `content/topics/*.json` (8 files) | Add `category` field |
| `types/index.ts` | Add `TopicMeta` type |
| `lib/posts.ts` | Add `getTopicsMeta()` |
| `app/layout.tsx` | Replace `getAllTopics()` with `getTopicsMeta()` |
| `components/Header.tsx` | Replace flat nav links with category dropdowns |
| `app/page.tsx` | Group TopicCards by category |

---

## Task 1: Add `category` to all topic JSON files

**Files:**
- Modify: `content/topics/python.json`
- Modify: `content/topics/typescript.json`
- Modify: `content/topics/react.json`
- Modify: `content/topics/llm.json`
- Modify: `content/topics/rag.json`
- Modify: `content/topics/distributed.json`
- Modify: `content/topics/network.json`
- Modify: `content/topics/git.json`

- [ ] **Step 1: Update python.json**

```json
{
  "category": "languages",
  "sections": [
    { "title": "Introduction", "order": 1 },
    { "title": "Fundamentals", "order": 2 },
    { "title": "Advanced", "order": 3 },
    { "title": "Testing", "order": 4 },
    { "title": "Interview", "order": 5 }
  ]
}
```

- [ ] **Step 2: Update typescript.json**

```json
{
  "category": "languages",
  "sections": [
    { "title": "Introduction", "order": 1 },
    { "title": "Fundamentals", "order": 2 },
    { "title": "Advanced", "order": 3 },
    { "title": "Interview", "order": 4 }
  ]
}
```

- [ ] **Step 3: Update react.json**

```json
{
  "category": "frontend",
  "sections": [
    { "title": "Introduction", "order": 1 },
    { "title": "Components", "order": 2 },
    { "title": "Hooks", "order": 3 },
    { "title": "Interview", "order": 4 }
  ]
}
```

- [ ] **Step 4: Update llm.json**

```json
{
  "category": "ai",
  "sections": [
    { "title": "Foundations", "order": 1 },
    { "title": "Using LLM APIs", "order": 2 },
    { "title": "RAG", "order": 3 },
    { "title": "Prompt Engineering", "order": 4 }
  ]
}
```

- [ ] **Step 5: Update rag.json**

```json
{
  "category": "ai",
  "sections": [
    { "title": "Introduction", "order": 1 },
    { "title": "Pipeline", "order": 2 },
    { "title": "Advanced", "order": 3 },
    { "title": "Interview", "order": 4 }
  ]
}
```

- [ ] **Step 6: Update distributed.json**

```json
{
  "category": "systems",
  "sections": [
    { "title": "Fundamentals", "order": 1 },
    { "title": "Messaging", "order": 2 },
    { "title": "Caching", "order": 3 },
    { "title": "Architecture", "order": 4 },
    { "title": "Interview", "order": 5 }
  ]
}
```

- [ ] **Step 7: Update network.json**

```json
{
  "category": "systems",
  "sections": [
    { "title": "Fundamentals", "order": 1 },
    { "title": "Protocols", "order": 2 },
    { "title": "Application Layer", "order": 3 },
    { "title": "Interview", "order": 4 }
  ]
}
```

- [ ] **Step 8: Update git.json**

```json
{
  "category": "tools",
  "sections": [
    { "title": "Basics", "order": 1 },
    { "title": "Branching", "order": 2 },
    { "title": "Collaboration", "order": 3 },
    { "title": "Interview", "order": 4 }
  ]
}
```

---

## Task 2: Add `TopicMeta` type and `getTopicsMeta()` to lib

**Files:**
- Modify: `types/index.ts`
- Modify: `lib/posts.ts`

- [ ] **Step 1: Add `TopicMeta` to `types/index.ts`**

Add after the existing types:

```typescript
export type TopicMeta = {
  slug: string        // e.g. "python"
  category: string    // e.g. "languages"
}

export type CategoryGroup = {
  category: string    // e.g. "languages"
  topics: TopicMeta[] // topics in this category
}
```

- [ ] **Step 2: Add `getTopicsMeta()` to `lib/posts.ts`**

Add this import at the top of `lib/posts.ts`:
```typescript
import type { Post, RoadmapSection, RoadmapItem, TopicMeta, CategoryGroup } from "@/types";
```

Add these two functions at the bottom of `lib/posts.ts`:

```typescript
// read category from content/topics/<slug>.json
export function getTopicsMeta(): TopicMeta[] {
  const topicsDir = path.join(process.cwd(), "content/topics");
  if (!fs.existsSync(topicsDir)) return [];
  return fs
    .readdirSync(topicsDir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => {
      const slug = f.replace(/\.json$/, "");
      const config = JSON.parse(fs.readFileSync(path.join(topicsDir, f), "utf8"));
      return { slug, category: config.category ?? "other" };
    })
    .sort((a, b) => a.slug.localeCompare(b.slug));
}

// group topics by category, preserving a fixed display order
export function getTopicsByCategory(): CategoryGroup[] {
  const CATEGORY_ORDER = ["languages", "frontend", "ai", "systems", "tools", "other"];
  const topics = getTopicsMeta();
  const map = new Map<string, TopicMeta[]>();
  for (const t of topics) {
    if (!map.has(t.category)) map.set(t.category, []);
    map.get(t.category)!.push(t);
  }
  return CATEGORY_ORDER
    .filter((c) => map.has(c))
    .map((c) => ({ category: c, topics: map.get(c)! }));
}
```

---

## Task 3: Update `layout.tsx` to pass category groups to Header

**Files:**
- Modify: `app/layout.tsx`

- [ ] **Step 1: Replace `getAllTopics` with `getTopicsByCategory`**

```typescript
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
  const categoryGroups = await getTopicsByCategory();
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
```

---

## Task 4: Rewrite `Header` with category dropdowns

**Files:**
- Modify: `components/Header.tsx`

- [ ] **Step 1: Replace flat topic links with category dropdowns**

```typescript
"use client";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useTheme } from "@/context/ThemeContext";
import { Sun, Moon, ChevronDown } from "lucide-react";
import type { CategoryGroup } from "@/types";

const CATEGORY_LABELS: Record<string, string> = {
  languages: "Languages",
  frontend: "Frontend",
  ai: "AI",
  systems: "Systems",
  tools: "Tools",
  other: "Other",
};

export default function Header({ categoryGroups }: { categoryGroups: CategoryGroup[] }) {
  const [scrolled, setScrolled] = useState(false);
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const pathname = usePathname();
  const isHome = pathname === "/";
  const { theme, toggle } = useTheme();
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // close dropdown when clicking outside
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenCategory(null);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const transparent = isHome && !scrolled;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 px-12 py-4 flex justify-between items-center transition-all duration-300 ${
        transparent
          ? "bg-transparent dark:bg-black/30 border-b border-transparent"
          : "bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-black/8 dark:border-white/10"
      }`}
    >
      <Link
        href="/"
        className={`font-bold ${transparent ? "text-white" : "text-slate-900 dark:text-white"}`}
      >
        Atlas
      </Link>

      <nav
        ref={navRef}
        className={`flex gap-6 text-sm transition-colors ${transparent ? "text-white/80" : "text-slate-500 dark:text-slate-300"}`}
      >
        {categoryGroups.map(({ category, topics }) => (
          <div key={category} className="relative">
            <button
              onClick={() => setOpenCategory(openCategory === category ? null : category)}
              className="flex items-center gap-1 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              {CATEGORY_LABELS[category] ?? category}
              <ChevronDown size={14} className={`transition-transform ${openCategory === category ? "rotate-180" : ""}`} />
            </button>

            {openCategory === category && (
              <div className="absolute top-full left-0 mt-2 py-1 bg-white dark:bg-slate-900 border border-black/8 dark:border-white/10 rounded-lg shadow-lg min-w-32 z-50">
                {topics.map((t) => (
                  <Link
                    key={t.slug}
                    href={`/${t.slug}`}
                    onClick={() => setOpenCategory(null)}
                    className="block px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 capitalize"
                  >
                    {t.slug}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
        <Link href="/posts">All Posts</Link>
      </nav>

      <button
        onClick={toggle}
        className={`p-2 rounded-full transition-colors ${
          transparent
            ? "text-white hover:bg-white/10"
            : "text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
        }`}
      >
        {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
      </button>
    </header>
  );
}
```

---

## Task 5: Update homepage to group TopicCards by category

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Replace hardcoded TopicCards with category-grouped cards**

```typescript
import TopicCard from "@/components/TopicCard";
import PostCard from "@/components/PostCard";
import HeroParallax from "@/components/HeroParallax";
import { getAllPosts, getTopicsByCategory } from "@/lib/posts";

const CATEGORY_LABELS: Record<string, string> = {
  languages: "Languages",
  frontend: "Frontend",
  ai: "AI",
  systems: "Systems",
  tools: "Tools",
  other: "Other",
};

export default async function Home() {
  const allPosts = await getAllPosts();
  const recentPosts = allPosts.slice(0, 10);
  const categoryGroups = getTopicsByCategory();

  return (
    <div className="space-y-10">
      <HeroParallax articleCount={allPosts.length} topicCount={categoryGroups.flatMap(g => g.topics).length} />

      <section className="mt-28">
        <h2 className="text-5xl font-black text-slate-900 dark:text-white mb-10">
          Topics
        </h2>
        <div className="space-y-8">
          {categoryGroups.map(({ category, topics }) => (
            <div key={category}>
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
                {CATEGORY_LABELS[category] ?? category}
              </h3>
              <div className="flex gap-2 flex-wrap">
                {topics.map((t) => (
                  <TopicCard key={t.slug} title={t.slug} href={`/${t.slug}`} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="relative left-1/2 -translate-x-1/2 w-screen bg-slate-100 dark:bg-slate-800/50 mt-4 py-12 -mb-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-6">
            Recent Posts
          </h2>
          {recentPosts.length === 0 ? (
            <p className="text-slate-400 text-sm">No posts yet.</p>
          ) : (
            <div>
              {recentPosts.map((p) => (
                <PostCard key={p.slug} post={p} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
```

---

## Self-Review

**Spec coverage:**
- ✅ category field added to all 8 topic JSONs
- ✅ `TopicMeta` and `CategoryGroup` types defined
- ✅ `getTopicsMeta()` and `getTopicsByCategory()` added to lib
- ✅ `layout.tsx` passes `CategoryGroup[]` to Header
- ✅ Header shows category dropdowns, closes on outside click
- ✅ Homepage groups TopicCards by category

**Placeholder scan:** No TBDs or placeholders found.

**Type consistency:**
- `CategoryGroup` used consistently across `types/index.ts`, `lib/posts.ts`, `layout.tsx`, `Header.tsx`, `page.tsx`
- `getTopicsByCategory()` is synchronous (reads from filesystem directly, no async needed) — `page.tsx` calls it without `await` ✅
