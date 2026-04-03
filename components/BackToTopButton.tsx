"use client";

import { useEffect, useState } from "react";
import { ChevronUp } from "lucide-react";

export default function BackToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > 480);
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      type="button"
      aria-label="Back to top"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-40 md:hidden flex h-12 w-12 items-center justify-center rounded-full border border-black/8 dark:border-white/10 bg-white/92 dark:bg-slate-900/92 text-slate-600 dark:text-slate-300 shadow-[0_8px_24px_rgba(15,23,42,0.12)] dark:shadow-[0_10px_28px_rgba(2,6,23,0.34)] backdrop-blur-sm transition-all duration-200 ${
        visible
          ? "opacity-100 pointer-events-auto"
          : "translate-y-2 opacity-0 pointer-events-none"
      }`}
    >
      <ChevronUp size={18} />
    </button>
  );
}
