"use client";

import { useState } from "react";
import Link from "next/link";
import type { RoadmapSection } from "@/types";

type Props = {
  sections: RoadmapSection[]; // all section data
  activeSlug: string; // currently selected post slug
  basePath: string; // base path, e.g. "/python"
};

export default function RoadmapSidebar({
  sections,
  activeSlug,
  basePath,
}: Props) {
  // useState returns two things: current value + function to update it
  // openSections: a Set storing which section titles are currently open
  // setOpenSections: the function to update openSections (must use this, not direct assignment)
  const initialOpen = new Set(
    sections
      .filter((s) => s.items.some((item) => item.slug === activeSlug))
      .map((s) => s.title)
  );
  const [openSections, setOpenSections] = useState<Set<string>>(initialOpen);
  const [mobileOpen, setMobileOpen] = useState(false);

  // called when user clicks a section title
  function toggleSection(title: string) {
    // copy the current openSections (never mutate state directly)
    const next = new Set(openSections);

    // if already open → close it; if closed → open it
    next.has(title) ? next.delete(title) : next.add(title);

    // update state — React will re-render the sidebar automatically
    setOpenSections(next);
  }

  return (
    <nav className="md:w-44 md:shrink-0">
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="md:hidden flex items-center gap-2 w-full text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3"
      >
        <span>{mobileOpen ? "▼" : "▶"}</span>
        Roadmap
      </button>

      <p className="hidden md:block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">
        Roadmap
      </p>

      <div className={`space-y-1 ${mobileOpen ? "block" : "hidden"} md:block`}>
        {/* loop through each section */}
        {sections.map((section) => {
          // is this section currently open?
          const isOpen = openSections.has(section.title);

          return (
            <div key={section.title}>
              {/* section title button — clicking calls toggleSection */}
              <button
                onClick={() => toggleSection(section.title)}
                className="flex items-center gap-2 w-full text-left px-2 py-1.5 rounded text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {/* show ▼ when open, ▶ when closed */}
                <span className="text-xs">{isOpen ? "▼" : "▶"}</span>
                {section.title}
              </button>

              {/* only render the item list when this section is open */}
              {isOpen && (
                <div className="ml-4 mt-0.5 space-y-0.5">
                  {section.items.map((item) => {
                    // is this the currently selected post?
                    const isActive = item.slug === activeSlug;

                    // active post gets blue highlight, others get grey
                    const linkStyle = isActive
                      ? "bg-blue-600 text-white font-medium"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800";

                    return (
                      <Link
                        key={item.slug}
                        href={`${basePath}?slug=${item.slug}`}
                        className={`block px-2 py-1 rounded text-xs transition-colors ${linkStyle}`}
                      >
                        {item.title}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </nav>
  );
}
