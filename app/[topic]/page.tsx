import RoadmapSidebar from "@/components/RoadmapSidebar";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import TableOfContents from "@/components/TableOfContents";
import ViewToggle from "@/components/ViewToggle";
import MapFlowClient from "@/components/MapFlowClient";
import { notFound } from "next/navigation";
import { formatDate, extractHeadings } from "@/lib/utils";
import {
  getKnowledgeSections,
  getKnowledgeArticle,
  getAllTopics,
  getKnowledgeArticleCn,
  hasArticleCnVersion,
  getRoadmapJson,
} from "@/lib/knowledge";
import LangToggle from "@/components/LangToggle";

type Props = {
  params: Promise<{ topic: string }>;
  searchParams: Promise<{ slug?: string; view?: string }>;
};

export async function generateStaticParams() {
  const topics = await getAllTopics();
  return topics.map((topic) => ({ topic }));
}

export default async function TopicPage({ params, searchParams }: Props) {
  const { topic } = await params;
  const { slug, view } = await searchParams;

  const sections = await getKnowledgeSections(topic);
  if (sections.length === 0) notFound();

  const activeSlug = slug ?? sections[0]?.items[0]?.slug ?? "";
  const activeArticle = activeSlug ? await getKnowledgeArticle(activeSlug) : null;
  const cnArticle =
    activeArticle && hasArticleCnVersion(activeSlug)
      ? await getKnowledgeArticleCn(activeSlug)
      : null;
  const enHeadings = activeArticle ? extractHeadings(activeArticle.content) : [];
  const cnHeadings = cnArticle ? extractHeadings(cnArticle.content) : [];

  const roadmapJson = getRoadmapJson(topic);
  const isMapView = view === "map" && roadmapJson !== null;

  // Article content — same layout for both EN-only and CN+EN
  const articleContent = activeArticle ? (
    <article>
      <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
        {activeArticle.section}
      </span>
      {cnArticle ? (
        <LangToggle
          title={activeArticle.title}
          date={formatDate(activeArticle.date)}
          enContent={<MarkdownRenderer content={activeArticle.content} />}
          cnContent={<MarkdownRenderer content={cnArticle.content} />}
          enHeadings={enHeadings}
          cnHeadings={cnHeadings}
        />
      ) : (
        // Same flex layout as LangToggle — TOC inline, no outer grid column needed
        <div className="flex gap-8 mt-6">
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              {activeArticle.title}
            </h1>
            <p className="text-sm text-slate-400 mt-1 mb-6">
              {formatDate(activeArticle.date)}
            </p>
            <MarkdownRenderer content={activeArticle.content} />
          </div>
          <TableOfContents headings={enHeadings} />
        </div>
      )}
    </article>
  ) : (
    <p className="text-slate-400">Select a topic from the roadmap.</p>
  );

  // Two-column layout: fixed sidebar | article (with inline TOC)
  //
  // TOC is now inline inside the article area (same for EN-only and CN+EN),
  // so the outer grid only needs two columns.
  return (
    <div className="mx-auto grid w-full max-w-[1360px] gap-6 lg:grid-cols-[280px_minmax(0,1fr)] xl:gap-8">

      {/* ── LEFT: roadmap sidebar or map ────────────────────────────────────── */}
      {/* sticky: stays at top-[57px] while article scrolls                     */}
      {/* map mode:  flex column so MapFlow can fill remaining height            */}
      {/* list mode: overflow-y-auto so long roadmaps can scroll                 */}
      <div className={`md:sticky md:top-[57px] md:h-[calc(100vh-57px)] ${isMapView ? "flex flex-col min-h-[420px] sm:min-h-[520px] md:overflow-hidden" : "md:overflow-y-auto"}`}>

        {/* Header row: "ROADMAP" label on left, List/Map toggle on right */}
        <div className="flex items-center justify-between mb-3 shrink-0">
          <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Roadmap</p>
          {roadmapJson && <ViewToggle activeView={isMapView ? "map" : "list"} />}
        </div>

        {isMapView ? (
          // flex-1 min-h-0: fills remaining height after the header row
          <div className="flex-1 min-h-[360px] sm:min-h-[440px] md:min-h-0">
            <MapFlowClient
              sections={roadmapJson!.sections}
              basePath={`/${topic}`}
              activeSlug={activeSlug}
              viewMode="map"
            />
          </div>
        ) : (
          <RoadmapSidebar
            sections={sections}
            activeSlug={activeSlug}
            basePath={`/${topic}`}
          />
        )}
      </div>

      {/* ── CENTER: article content ──────────────────────────────────────────── */}
      {/* Normal page scroll — no sticky, no independent overflow.               */}
      {/* ── CENTER: article fills the full 1fr column width ────────────────────── */}
      <div className="min-w-0">
        <div className="w-full max-w-[980px]">
          {articleContent}
        </div>
      </div>

    </div>
  );
}
