import Link from "next/link";
import { notFound } from "next/navigation";
import { formatDate } from "@/lib/utils";
import { getAllSketchSlugs, getSketchBySlug } from "@/lib/sketches";
import SketchViewer from "@/components/SketchViewer";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return getAllSketchSlugs();
}

export default async function SketchDetailPage({ params }: Props) {
  const { slug } = await params;
  const sketch = getSketchBySlug(slug);

  if (!sketch) notFound();

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/sketches"
          className="text-sm font-semibold text-slate-500 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
        >
          ← Back to Sketches
        </Link>
        <p className="text-sm font-medium text-slate-400 dark:text-slate-500">
          {formatDate(sketch.date)}
        </p>
      </div>

      <div className="mb-8 max-w-4xl">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-slate-400 dark:text-slate-500">
          {sketch.topic}
        </p>
        <h1 className="text-4xl font-black tracking-[-0.03em] text-slate-900 dark:text-white">
          {sketch.title}
        </h1>
        <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
          {sketch.excerpt}
        </p>
      </div>

      <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-white p-4 shadow-[0_20px_60px_rgba(15,23,42,0.08)] dark:border-slate-800 dark:bg-slate-950 dark:shadow-none sm:p-6">
        {sketch.svgSrc ? (
          <SketchViewer svgSrc={sketch.svgSrc} title={sketch.title} />
        ) : (
          <div className="flex min-h-[420px] items-center justify-center rounded-[24px] border border-dashed border-slate-300 bg-white text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
            Preview not added yet.
          </div>
        )}
      </div>
    </div>
  );
}
