"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Fuse from "fuse.js";

type SearchItem = {
  title: string;
  topic: string;
  section: string;
  slug: string;
};

export default function SearchModal({
  items,
  onClose,
}: {
  items: SearchItem[];
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const fuse = new Fuse(items, {
    keys: ["title", "topic", "section"],
    threshold: 0.4,
  });

  const results = query.trim() ? fuse.search(query).slice(0, 8) : [];

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center pt-24"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-xl mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search articles..."
          className="w-full px-4 py-3 text-slate-900 dark:text-white bg-transparent
                     border-b border-slate-200 dark:border-slate-700 outline-none rounded-t-xl"
        />

        <div className="max-h-80 overflow-y-auto rounded-b-xl">
          {results.map(({ item }) => (
            <button
              key={item.slug}
              onClick={() => {
                router.push(`/${item.topic}?slug=${item.slug}`);
                onClose();
              }}
              className="w-full px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <div className="text-xs text-slate-400 mb-0.5 capitalize">
                {item.topic} · {item.section}
              </div>
              <div className="text-slate-800 dark:text-slate-200">{item.title}</div>
            </button>
          ))}

          {query.trim() && results.length === 0 && (
            <div className="px-4 py-6 text-center text-slate-400 text-sm">No results</div>
          )}

          {!query.trim() && (
            <div className="px-4 py-6 text-center text-slate-400 text-sm">Type to search...</div>
          )}
        </div>
      </div>
    </div>
  );
}
