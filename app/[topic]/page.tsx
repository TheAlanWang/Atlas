import RoadmapSidebar from "@/components/RoadmapSidebar";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import TableOfContents from "@/components/TableOfContents";
import { notFound } from "next/navigation";
import { formatDate, extractHeadings } from "@/lib/utils";
import {
  getRoadmapSections,
  getPost,
  getPostsByTopic,
  getAllTopics,
  getPostCn,
  hasCnVersion,
} from "@/lib/posts";
import LangToggle from "@/components/LangToggle";

// params.topic comes from the [topic] folder name — e.g. visiting /python → topic = "python"
// searchParams.slug comes from the URL query string — e.g. /python?slug=python-functions
type Props = {
  params: Promise<{ topic: string }>;
  searchParams: Promise<{ slug?: string }>;
};

// build time: scans all MD files, collects unique topic values, pre-builds one page per topic
export async function generateStaticParams() {
  const topics = await getAllTopics();
  return topics.map((topic) => ({ topic }));
}

export default async function TopicPage({ params, searchParams }: Props) {
  const { topic } = await params;
  const { slug } = await searchParams;

  const sections = await getRoadmapSections(topic);
  if (sections.length === 0) notFound();

  const allPosts = await getPostsByTopic(topic);
  const activeSlug = slug ?? allPosts[0]?.slug ?? "";
  const activePost = activeSlug ? await getPost(activeSlug) : null;
  const cnPost =
    activePost && hasCnVersion(activeSlug) ? await getPostCn(activeSlug) : null;
  const enHeadings = activePost ? extractHeadings(activePost.content) : [];
  const cnHeadings = cnPost ? extractHeadings(cnPost.content) : [];

  return (
    <div className="flex gap-6 -mx-6 px-2">
      {/* RoadmapSidebar used here for the first time — defined back in Task 6 */}
      <RoadmapSidebar
        sections={sections}
        activeSlug={activeSlug}
        basePath={`/${topic}`}
      />

      <div className="flex-1 min-w-0 flex gap-8">
        <div className="flex-1 min-w-0">
          {activePost ? (
            <article>
              <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
                {activePost.section}
              </span>
              {cnPost ? (
                <LangToggle
                  title={activePost.title}
                  date={formatDate(activePost.date)}
                  enContent={<MarkdownRenderer content={activePost.content} />}
                  cnContent={<MarkdownRenderer content={cnPost.content} />}
                  enHeadings={enHeadings}
                  cnHeadings={cnHeadings}
                />
              ) : (
                <>
                  <div className="mb-6">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mt-1">
                      {activePost.title}
                    </h1>
                    <p className="text-sm text-slate-400 mt-1">
                      {formatDate(activePost.date)}
                    </p>
                  </div>
                  <MarkdownRenderer content={activePost.content} />
                </>
              )}
            </article>
          ) : (
            <p className="text-slate-400">Select a topic from the roadmap.</p>
          )}
        </div>
      {!cnPost && <TableOfContents headings={enHeadings} />}
      </div>
    </div>
  );
}
