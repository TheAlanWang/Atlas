"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useTheme } from "@/context/ThemeContext";
import { Sun, Moon } from "lucide-react";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === "/";
  const { theme, toggle } = useTheme();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const transparent = isHome && !scrolled;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 px-12 py-4 flex justify-between items-center transition-all duration-300 ${
        transparent
          ? "bg-transparent border-b border-transparent"
          : "bg-white/80 backdrop-blur-md border-b border-black/8"
      }`}
    >
      <Link
        href="/"
        className={`font-bold ${transparent ? "text-white" : "text-slate-900"}`}
      >
        Atlas
      </Link>

      <nav
        className={`flex gap-7 text-sm transition-colors ${transparent ? "text-white/80" : "text-slate-500"}`}
      >
        <Link href="/python">Python</Link>
        <Link href="/react">React</Link>
        <Link href="/posts">All Posts</Link>
      </nav>

      <button
        onClick={toggle}
        className={`p-2 rounded-full transition-colors ${
          transparent
            ? "text-white hover:bg-white/10"
            : "text-slate-500 hover:bg-slate-100"
        }`}
      >
        {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
      </button>
    </header>
  );
}
