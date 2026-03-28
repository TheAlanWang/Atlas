"use client";
import { useEffect, useRef } from "react";

type Props = {
  articleCount: number;
  topicCount: number;
};

export default function HeroParallax({ articleCount, topicCount }: Props) {
  // ref points directly to the img DOM element — no re-render needed on scroll
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const onScroll = () => {
      if (imgRef.current) {
        // image moves at 40% of scroll speed → creates depth effect
        imgRef.current.style.transform = `translateY(${window.scrollY * 0.4}px)`;
      }
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll); // cleanup on unmount
  }, []);

  return (
    <section className="relative h-150 overflow-hidden left-1/2 -translate-x-1/2 w-screen -mt-20 mb-10">
      {/* background image — extends beyond container so parallax shift doesn't show white edges */}
      <img
        ref={imgRef}
        src="/images/mountain.jpg"
        alt="hero"
        className="absolute w-full h-[120%] -top-[10%] object-cover object-[center_35%]"
        style={{ willChange: "transform" }}
      />

      {/* gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to right, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.35) 50%, rgba(0,0,0,0) 100%)",
        }}
      />

      {/* text layer — scrolls at normal speed */}
      <div className="absolute inset-0 flex flex-col justify-end pb-12 md:pb-24 fade-in-up-delay">
        <div className="max-w-6xl mx-auto px-6 md:px-12 w-full">
          <h1
            className="font-black text-white leading-tight tracking-tight mb-4"
            style={{ fontSize: "clamp(24px, 4vw, 52px)" }}
          >
            Every concept has a place on the map.
          </h1>
          <p className="text-lg text-white/75 mb-10">
            Atlas is a living notebook — built while learning, shared while
            building.
          </p>
          <div className="flex gap-9">
            <div>
              <strong className="text-3xl font-black text-white block">
                {articleCount}
              </strong>
              <span className="text-xs text-white/50 uppercase tracking-wider">
                articles
              </span>
            </div>
            <div>
              <strong className="text-3xl font-black text-white block">
                {topicCount}
              </strong>
              <span className="text-xs text-white/50 uppercase tracking-wider">
                topics
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
