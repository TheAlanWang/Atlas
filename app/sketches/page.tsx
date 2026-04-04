import Image from "next/image";
import Link from "next/link";
import { getAllSketches } from "@/lib/sketches";
import { formatDate } from "@/lib/utils";

const PAGE_CLASS = "mx-auto max-w-7xl";
const LIST_CLASS = "grid gap-6 md:grid-cols-2 xl:grid-cols-3";
const SKETCH_CARD_CLASS =
  "group flex h-full flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-950 dark:hover:border-slate-700 sm:p-6";
const TAG_LIST_CLASS = "mb-3 flex flex-wrap gap-2";
const TAG_CLASS =
  "rounded-full border border-slate-200 dark:border-slate-800 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400";
const TITLE_CLASS =
  "mb-2 text-[1.85rem] font-black tracking-[-0.03em] text-slate-900 transition-colors duration-300 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400";
const DATE_CLASS = "mb-3 text-sm font-medium text-slate-400 dark:text-slate-500";
const EXCERPT_CLASS = "text-sm leading-6 text-slate-600 dark:text-slate-300";

export default function SketchesPage() {
  const sketches = getAllSketches();

  return (
    <div className={PAGE_CLASS}>
      <p className="text-xs font-semibold tracking-widest uppercase text-slate-400 dark:text-slate-500 mb-3">
        Visual Library
      </p>
      <h1
        className="text-4xl font-black text-slate-900 dark:text-white mb-12"
        style={{ letterSpacing: "-0.02em" }}
      >
          Sketches
      </h1>

      {sketches.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">No sketches yet.</p>
      ) : (
        <div className={LIST_CLASS}>
          {sketches.map((entry) => (
            <Link
              key={entry.slug}
              href={`/sketches/${entry.slug}`}
              className={SKETCH_CARD_CLASS}
            >
              <div className={TAG_LIST_CLASS}>
                <span className={TAG_CLASS}>{entry.topic}</span>
              </div>
              <h2 className={TITLE_CLASS}>{entry.title}</h2>
              <p className={DATE_CLASS}>{formatDate(entry.date)}</p>
              <p className={EXCERPT_CLASS} style={{ textAlign: "justify" }}>
                {entry.excerpt}
              </p>

              {entry.svgSrc && (
                <div className="relative mt-5 aspect-[4/3] overflow-hidden rounded-[22px] bg-slate-50 transition-transform duration-300 group-hover:scale-[1.01] dark:bg-slate-900">
                  <Image
                    src={entry.svgSrc}
                    alt={entry.title}
                    fill
                    sizes="(min-width: 1280px) 30vw, (min-width: 768px) 50vw, 100vw"
                    className="object-contain p-2"
                    unoptimized
                  />
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
