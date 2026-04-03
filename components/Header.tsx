"use client";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useTheme } from "@/context/ThemeContext";
import { Sun, Moon, Search, Menu, X, ChevronDown } from "lucide-react";
import type { CategoryGroup } from "@/types";
import SearchModal from "./SearchModal";

type SearchItem = {
  title: string;
  topic: string;
  section: string;
  slug: string;
};

const CATEGORY_LABELS: Record<string, string> = {
  languages: "Languages",
  frontend: "Frontend",
  ai: "AI",
  systems: "Systems",
  database: "Database",
  tools: "Tools",
  other: "Other",
};

function formatNavTopicLabel(slug: string) {
  return slug === "aws" ? "AWS" : slug;
}

export default function Header({
  categoryGroups,
  mapTopics,
  searchItems,
}: {
  categoryGroups: CategoryGroup[];
  mapTopics: string[];
  searchItems: SearchItem[];
}) {
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileCategory, setMobileCategory] = useState<string | null>(null);
  const { theme, toggle } = useTheme();
  const navRef = useRef<HTMLElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function openMenu(category: string) {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpenCategory(category);
  }

  function scheduleClose() {
    closeTimer.current = setTimeout(() => setOpenCategory(null), 280);
  }

  function closeNavigation() {
    setMobileOpen(false);
    setMobileCategory(null);
    setOpenCategory(null);
  }

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

  return (
    <>
      {openCategory && (
        <div
          className="fixed inset-0 top-[57px] z-30 backdrop-blur-sm bg-black/20 transition-opacity"
          onClick={() => setOpenCategory(null)}
        />
      )}
      <header className="fixed top-0 left-0 right-0 z-50 px-6 md:px-12 py-4 flex justify-between items-center bg-white dark:bg-slate-900 border-b border-black/8 dark:border-white/10">
        <Link
          href="/"
          onClick={closeNavigation}
          className="font-bold text-slate-900 dark:text-white"
        >
          Atlas
        </Link>

        <nav
          ref={navRef}
          className="hidden md:flex gap-6 text-sm text-slate-500 dark:text-slate-300"
          onMouseLeave={scheduleClose}
        >
          <div
            className="relative"
            onMouseEnter={() => openMenu("__knowledge__")}
          >
            <Link
              href="/knowledge"
              onClick={closeNavigation}
              className="outline-none hover:text-slate-900 dark:hover:text-white transition-colors py-1 block"
            >
              Knowledge
            </Link>

            {openCategory === "__knowledge__" && (
              <div
                className="fixed top-[57px] left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-black/8 dark:border-white/10 shadow-md"
                onMouseEnter={() => openMenu("__knowledge__")}
                onMouseLeave={scheduleClose}
              >
                <div className="max-w-6xl mx-auto px-12 py-6">
                  <div className="mb-6 border-b border-black/8 pb-5 dark:border-white/10">
                    <Link
                      href="/knowledge"
                      onClick={closeNavigation}
                      className="inline-flex text-sm font-semibold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      All Knowledge
                    </Link>

                    <div className="mt-4">
                      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-slate-400 dark:text-slate-500">
                        Roadmaps
                      </p>
                      <div className="flex flex-wrap gap-x-5 gap-y-2">
                        {mapTopics.map((slug) => (
                          <Link
                            key={slug}
                            href={`/${slug}/map`}
                            onClick={closeNavigation}
                            className="text-sm font-semibold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 capitalize transition-colors"
                          >
                            {formatNavTopicLabel(slug)}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-x-10 gap-y-8">
                    {categoryGroups.map(({ category, topics }) => (
                      <div key={category} className="min-w-0">
                        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-slate-400 dark:text-slate-500">
                          {CATEGORY_LABELS[category] ?? category}
                        </p>
                        <div className="flex flex-col gap-2">
                          {topics
                            .filter((t) => !t.parent)
                            .map((t) => (
                              <div key={t.slug} className="flex flex-col gap-1">
                                <Link
                                  href={`/${t.slug}`}
                                  onClick={closeNavigation}
                                  className="text-sm font-semibold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 capitalize transition-colors"
                                >
                                  {t.slug}
                                </Link>
                                {topics
                                  .filter((c) => c.parent === t.slug)
                                  .map((c) => (
                                    <Link
                                      key={c.slug}
                                      href={`/${c.slug}`}
                                      onClick={closeNavigation}
                                      className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white capitalize transition-colors pl-2"
                                    >
                                      {c.slug}
                                    </Link>
                                  ))}
                              </div>
                            ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <Link
            href="/sketches"
            onClick={closeNavigation}
            className="hover:text-slate-900 dark:hover:text-white transition-colors py-1"
          >
            Sketches
          </Link>
          <Link
            href="/projects"
            onClick={closeNavigation}
            className="hover:text-slate-900 dark:hover:text-white transition-colors py-1"
          >
            Projects
          </Link>
        </nav>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-full text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
          <button
            onClick={() => setSearchOpen(true)}
            className="p-2 rounded-full text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Search size={16} />
          </button>
          <button
            onClick={toggle}
            className="p-2 rounded-full text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </header>

      {mobileOpen && (
        <div className="md:hidden fixed top-[57px] left-0 right-0 bottom-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md overflow-y-auto">
          <div className="px-6 py-5 flex flex-col gap-7">
            <div className="pb-5">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
                Explore
              </p>
              <div className="grid grid-cols-3 gap-2">
                <Link
                  href="/knowledge"
                  onClick={closeNavigation}
                  className="rounded-2xl px-3 py-3 text-center text-sm font-semibold text-slate-800 transition-colors hover:text-slate-950 dark:text-slate-200 dark:hover:text-white"
                >
                  Knowledge
                </Link>
                <Link
                  href="/sketches"
                  onClick={closeNavigation}
                  className="rounded-2xl px-3 py-3 text-center text-sm font-semibold text-slate-800 transition-colors hover:text-slate-950 dark:text-slate-200 dark:hover:text-white"
                >
                  Sketches
                </Link>
                <Link
                  href="/projects"
                  onClick={closeNavigation}
                  className="rounded-2xl px-3 py-3 text-center text-sm font-semibold text-slate-800 transition-colors hover:text-slate-950 dark:text-slate-200 dark:hover:text-white"
                >
                  Projects
                </Link>
              </div>
            </div>

            <section className="pb-2">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
                  Roadmaps
                </p>
                <Link
                  href="/knowledge"
                  onClick={closeNavigation}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                >
                  All Knowledge
                </Link>
              </div>
              <div className="flex flex-wrap gap-2">
                {mapTopics.map((slug) => (
                  <Link
                    key={slug}
                    href={`/${slug}/map`}
                    onClick={closeNavigation}
                    className="rounded-full px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:text-slate-950 dark:text-slate-300 dark:hover:text-white"
                  >
                    {formatNavTopicLabel(slug)}
                  </Link>
                ))}
              </div>
            </section>

            <section>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
                Browse Topics
              </p>
              <div className="flex flex-col">
                {categoryGroups.map(({ category, topics }) => {
                  const isOpen = mobileCategory === category;

                  return (
                    <div key={category}>
                      <button
                        type="button"
                        onClick={() =>
                          setMobileCategory(isOpen ? null : category)
                        }
                        className="flex w-full items-center justify-between px-4 py-4 text-left"
                      >
                        <span className="text-sm font-semibold text-slate-900 dark:text-white">
                          {CATEGORY_LABELS[category] ?? category}
                        </span>
                        <ChevronDown
                          size={16}
                          className={`text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
                        />
                      </button>

                      {isOpen && (
                        <div className="px-4 pb-4">
                          <div className="flex flex-col gap-3">
                            {topics
                              .filter((t) => !t.parent)
                              .map((t) => (
                                <div key={t.slug} className="px-1 py-2">
                                  <Link
                                    href={`/${t.slug}`}
                                    onClick={closeNavigation}
                                    className="block text-sm font-semibold text-slate-800 hover:text-blue-600 dark:text-slate-100 dark:hover:text-blue-400"
                                  >
                                    {t.slug}
                                  </Link>
                                  {topics.some((c) => c.parent === t.slug) && (
                                    <div className="mt-2 flex flex-wrap gap-2">
                                      {topics
                                        .filter((c) => c.parent === t.slug)
                                        .map((c) => (
                                          <Link
                                            key={c.slug}
                                            href={`/${c.slug}`}
                                            onClick={closeNavigation}
                                            className="rounded-full px-2.5 py-1 text-xs font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                                          >
                                            {c.slug}
                                          </Link>
                                        ))}
                                    </div>
                                  )}
                                </div>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        </div>
      )}

      {searchOpen &&
        createPortal(
          <SearchModal
            items={searchItems}
            onClose={() => setSearchOpen(false)}
          />,
          document.body,
        )}
    </>
  );
}
