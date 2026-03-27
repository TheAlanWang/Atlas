"use client";
import { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import TopicCard from "./TopicCard";
import type { TopicMeta } from "@/types";

export default function TopicCarousel({ topics }: { topics: TopicMeta[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateArrows = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  };

  useEffect(() => {
    updateArrows();
    const el = scrollRef.current;
    el?.addEventListener("scroll", updateArrows);
    return () => el?.removeEventListener("scroll", updateArrows);
  }, []);

  const scroll = (dir: number) => {
    scrollRef.current?.scrollBy({ left: dir * 300, behavior: "smooth" });
  };

  return (
    <div className="relative">
      {canScrollLeft && (
        <button
          onClick={() => scroll(-1)}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 z-10
                     w-14 h-14 rounded-full bg-[#e8e8ed] dark:bg-[#3a3a3c]
                     flex items-center justify-center
                     text-[#3d3d3f] dark:text-[#e8e8ed]
                     hover:brightness-95 transition-all"
        >
          <ChevronLeft size={24} strokeWidth={2.5} />
        </button>
      )}

      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto pb-2
                   [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {topics.map((t) => (
          <TopicCard key={t.slug} title={t.slug} href={`/${t.slug}`} />
        ))}
      </div>

      {canScrollRight && (
        <button
          onClick={() => scroll(1)}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10
                     w-14 h-14 rounded-full bg-[#e8e8ed] dark:bg-[#3a3a3c]
                     flex items-center justify-center
                     text-[#3d3d3f] dark:text-[#e8e8ed]
                     hover:brightness-95 transition-all"
        >
          <ChevronRight size={24} strokeWidth={2.5} />
        </button>
      )}
    </div>
  );
}
