"use client";

import { useEffect, useRef, useState } from "react";

type Heading = {
  level: 2 | 3;
  text: string;
  id: string;
};

type Props = {
  headings: Heading[];
};

export default function TableOfContents({ headings }: Props) {
  const [activeId, setActiveId] = useState<string>("");
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    // track which heading is currently in view
    observerRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: "0px 0px -70% 0px" } // trigger when heading is in top 30% of viewport
    );

    const els = headings.map((h) => document.getElementById(h.id)).filter(Boolean);
    els.forEach((el) => observerRef.current!.observe(el!));

    return () => observerRef.current?.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <aside className="w-40 shrink-0 hidden xl:block sticky top-24 self-start">
      <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">
        On this page
      </p>
      <nav className="space-y-0.5">
        {headings.map((h) => {
          const isActive = h.id === activeId;
          return (
            <a
              key={h.id}
              href={`#${h.id}`}
              className={`block text-xs py-1 transition-colors leading-snug ${
                h.level === 3 ? "pl-3" : ""
              } ${
                isActive
                  ? "text-blue-600 dark:text-blue-400 font-medium"
                  : "text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              {h.text}
            </a>
          );
        })}
      </nav>
    </aside>
  );
}
