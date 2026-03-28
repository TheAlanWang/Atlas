"use client";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { useTheme } from "@/context/ThemeContext";
import { Sun, Moon, ChevronDown, Search, Menu, X } from "lucide-react";
import type { CategoryGroup } from "@/types";
import SearchModal from "./SearchModal";

type SearchItem = { title: string; topic: string; section: string; slug: string };

const CATEGORY_LABELS: Record<string, string> = {
  languages: "Languages",
  frontend: "Frontend",
  ai: "AI",
  systems: "Systems",
  database: "Database",
  tools: "Tools",
  other: "Other",
};

export default function Header({ categoryGroups, searchItems }: { categoryGroups: CategoryGroup[]; searchItems: SearchItem[] }) {
  const [scrolled, setScrolled] = useState(false);
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
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
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenCategory(null);
        setMobileOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setOpenCategory(null);
  }, [pathname]);

  const transparent = isHome && !scrolled;

  return (
    <>
      {openCategory && (
        <div
          className="fixed inset-0 top-[57px] z-30"
          onClick={() => setOpenCategory(null)}
        />
      )}
      <header
        className={`fixed top-0 left-0 right-0 z-50 px-6 md:px-12 py-4 flex justify-between items-center transition-all duration-300 ${
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
          className={`hidden md:flex gap-6 text-sm transition-colors ${transparent ? "text-white/80" : "text-slate-500 dark:text-slate-300"}`}
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
                <div className="fixed top-[57px] left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-black/8 dark:border-white/10 shadow-md">
                  <div className="max-w-6xl mx-auto px-12 py-6 flex items-start">
                    <div className="flex gap-10">
                      {topics.filter((t) => !t.parent).map((t) => (
                        <div key={t.slug} className="flex flex-col gap-2">
                          <Link
                            href={`/${t.slug}`}
                            onClick={() => setOpenCategory(null)}
                            className="text-sm font-semibold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 capitalize transition-colors"
                          >
                            {t.slug}
                          </Link>
                          {topics.filter((c) => c.parent === t.slug).map((c) => (
                            <Link
                              key={c.slug}
                              href={`/${c.slug}`}
                              onClick={() => setOpenCategory(null)}
                              className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white capitalize transition-colors pl-2"
                            >
                              {c.slug}
                            </Link>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
          <Link href="/posts">All Posts</Link>
        </nav>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className={`md:hidden p-2 rounded-full transition-colors ${
              transparent
                ? "text-white hover:bg-white/10"
                : "text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>

          <button
            onClick={() => setSearchOpen(true)}
            className={`p-2 rounded-full transition-colors ${
              transparent
                ? "text-white hover:bg-white/10"
                : "text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Search size={16} />
          </button>
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
        </div>
      </header>

      {mobileOpen && (
        <div className="md:hidden fixed top-[57px] left-0 right-0 bottom-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md overflow-y-auto">
          <div className="px-6 py-4 flex flex-col gap-6">
            {categoryGroups.map(({ category, topics }) => (
              <div key={category}>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  {CATEGORY_LABELS[category] ?? category}
                </p>
                <div className="flex flex-col gap-1">
                  {topics.filter((t) => !t.parent).map((t) => (
                    <Link
                      key={t.slug}
                      href={`/${t.slug}`}
                      onClick={() => setMobileOpen(false)}
                      className="text-sm text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 capitalize py-1"
                    >
                      {t.slug}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
            <Link
              href="/posts"
              onClick={() => setMobileOpen(false)}
              className="text-sm text-slate-700 dark:text-slate-300 py-1"
            >
              All Posts
            </Link>
          </div>
        </div>
      )}

      {searchOpen && createPortal(
        <SearchModal items={searchItems} onClose={() => setSearchOpen(false)} />,
        document.body
      )}
    </>
  );
}
