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
  database: "Database",
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
