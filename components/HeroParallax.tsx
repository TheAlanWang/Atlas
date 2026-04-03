"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";

type Props = {
  articleCount: number;
  topicCount: number;
  roadmapCount: number;
};

export default function HeroParallax({ articleCount, topicCount, roadmapCount }: Props) {
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => {
      if (imgRef.current) {
        imgRef.current.style.transform = `translateY(${window.scrollY * 0.4}px)`;
      }
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section className="relative flex flex-col items-center justify-center text-center overflow-hidden left-1/2 -translate-x-1/2 w-screen -mt-20" style={{ height: "100vh" }}>
      {/* background image */}
      <div
        ref={imgRef}
        className="absolute inset-x-0 h-[120%] -top-[10%]"
        style={{ willChange: "transform" }}
      >
        <Image
          src="/images/mountain.jpg"
          alt="hero"
          fill
          preload
          sizes="100vw"
          className="object-cover object-[center_35%]"
        />
      </div>

      {/* gradient overlay — darker for better contrast */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.6) 100%)",
        }}
      />

      {/* centered text */}
      <div className="relative z-10 max-w-3xl px-6 fade-in-up-delay">
        <p className="text-xs font-semibold tracking-widest uppercase text-white/50 mb-5">
          A living notebook
        </p>
        <h1
          className="font-black text-white leading-tight tracking-tight mb-5"
          style={{ fontSize: "clamp(36px, 5.5vw, 72px)", letterSpacing: "-0.02em" }}
        >
          Every concept has<br />a place on the map.
        </h1>
        <p className="text-white/65 mb-8" style={{ fontSize: "clamp(15px, 1.8vw, 20px)" }}>
          Built while learning. Shared while building.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link
            href="/knowledge"
            className="px-7 py-3 rounded-full bg-white text-slate-900 text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Knowledge
          </Link>
          <Link
            href="/sketches"
            className="px-7 py-3 rounded-full bg-white/10 text-white text-sm font-semibold border border-white/30 hover:bg-white/20 transition-colors"
          >
            Sketches
          </Link>
          <Link
            href="/projects"
            className="px-7 py-3 rounded-full bg-white/10 text-white text-sm font-semibold border border-white/30 hover:bg-white/20 transition-colors"
          >
            Projects
          </Link>
        </div>
      </div>

      {/* stats pinned to bottom */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-10 flex gap-12">
        <div className="text-center">
          <strong className="block text-4xl font-black text-white leading-none">{articleCount}</strong>
          <span className="text-xs font-semibold tracking-widest uppercase text-white/40 mt-1 block">Articles</span>
        </div>
        <div className="text-center">
          <strong className="block text-4xl font-black text-white leading-none">{topicCount}</strong>
          <span className="text-xs font-semibold tracking-widest uppercase text-white/40 mt-1 block">Topics</span>
        </div>
        <div className="text-center">
          <strong className="block text-4xl font-black text-white leading-none">{roadmapCount}</strong>
          <span className="text-xs font-semibold tracking-widest uppercase text-white/40 mt-1 block">Roadmaps</span>
        </div>
      </div>
    </section>
  );
}
