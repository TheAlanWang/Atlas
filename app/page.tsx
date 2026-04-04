import Link from "next/link";
import Image from "next/image";
import TopicCard from "@/components/TopicCard";
import KnowledgeCard from "@/components/KnowledgeCard";
import HeroParallax from "@/components/HeroParallax";
import {
  getAllKnowledgeArticles,
  getTopicsByCategory,
  getMapTopics,
} from "@/lib/knowledge";
import { getAllProjects } from "@/lib/projects";
import { getAllSketches } from "@/lib/sketches";

export default async function Home() {
  const allArticles = await getAllKnowledgeArticles();
  const allProjects = await getAllProjects();
  const allSketches = getAllSketches();
  const recentArticles = allArticles.slice(0, 9);
  const categoryGroups = getTopicsByCategory();
  const mapTopics = getMapTopics();

  const topics = categoryGroups
    .flatMap((g) => g.topics)
    .filter((t) => t.homepage);

  const countByTopic = allArticles.reduce<Record<string, number>>(
    (acc, article) => {
      acc[article.topic] = (acc[article.topic] ?? 0) + 1;
      return acc;
    },
    {},
  );

  return (
    <div className="max-w-6xl mx-auto">
      <HeroParallax
        articleCount={allArticles.length}
        topicCount={categoryGroups.flatMap((g) => g.topics).length}
        roadmapCount={mapTopics.length}
      />

      {/* Topics — white */}
      <section id="topics" className="py-16">
        <p className="text-xs font-semibold tracking-widest uppercase text-slate-400 dark:text-slate-500 mb-3">
          Explore
        </p>
        <h2
          className="text-4xl font-black text-slate-900 dark:text-white mb-10"
          style={{ letterSpacing: "-0.02em" }}
        >
          Topics
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {topics.map((t) => (
            <TopicCard
              key={t.slug}
              title={t.slug}
              href={`/${t.slug}`}
              count={countByTopic[t.slug]}
            />
          ))}
        </div>
      </section>

      {/* Projects — grey full-bleed */}
      <section
        id="projects"
        className="relative left-1/2 -translate-x-1/2 w-screen overflow-hidden bg-[#f5f5f7] dark:bg-slate-900 py-20"
      >
        <div className="relative max-w-6xl mx-auto">
          <p className="text-xs font-semibold tracking-[0.22em] uppercase text-slate-400 dark:text-slate-500 mb-3">
            Visual
          </p>
          <h2
            className="text-4xl font-black text-slate-900 dark:text-white mb-10"
            style={{ letterSpacing: "-0.02em" }}
          >
            Projects
          </h2>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
            {allProjects.map((project, index) => (
              <Link
                key={project.slug}
                href={`/projects/${project.slug}`}
                className="group block"
              >
                <article className="overflow-hidden rounded-[30px] border border-black/6 bg-white shadow-[0_1px_1px_rgba(15,23,42,0.02),0_10px_30px_rgba(15,23,42,0.06)] transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_1px_1px_rgba(15,23,42,0.02),0_18px_36px_rgba(15,23,42,0.1)] dark:border-white/10 dark:bg-slate-950 dark:shadow-[0_1px_1px_rgba(255,255,255,0.02),0_14px_32px_rgba(2,6,23,0.34)] dark:group-hover:shadow-[0_1px_1px_rgba(255,255,255,0.02),0_18px_40px_rgba(2,6,23,0.42)]">
                  <div className="relative aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-slate-900">
                    {project.architectureSrc ? (
                      <Image
                        src={project.architectureSrc}
                        alt={`${project.title} architecture`}
                        fill
                        sizes="(min-width: 640px) 50vw, 100vw"
                        loading={index === 0 ? "eager" : "lazy"}
                        fetchPriority={index === 0 ? "high" : "auto"}
                        className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-[1.03]"
                        unoptimized
                      />
                    ) : null}
                  </div>
                  <div className="min-h-28 px-5 py-5">
                    <h3 className="text-xl font-semibold tracking-[-0.02em] text-slate-900 transition-colors group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                      {project.title}
                    </h3>
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                      {project.date}
                    </p>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <p className="text-xs font-semibold tracking-[0.22em] uppercase text-slate-400 dark:text-slate-500 mb-3">
          Visual
        </p>
        <h2
          className="text-4xl font-black text-slate-900 dark:text-white mb-10"
          style={{ letterSpacing: "-0.02em" }}
        >
          Sketches
        </h2>
        <div className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4 pr-6 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {allSketches.map((sketch) => (
            <Link
              key={sketch.slug}
              href={`/sketches/${sketch.slug}`}
              className="group block shrink-0 snap-start basis-[82vw] sm:basis-[18rem] lg:basis-[calc((100%-3.75rem)/4)]"
            >
              <article className="flex h-full flex-col overflow-hidden rounded-[30px] border border-black/6 bg-white shadow-[0_1px_1px_rgba(15,23,42,0.02),0_10px_30px_rgba(15,23,42,0.06)] transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_1px_1px_rgba(15,23,42,0.02),0_18px_36px_rgba(15,23,42,0.1)] dark:border-white/10 dark:bg-slate-950 dark:shadow-[0_1px_1px_rgba(255,255,255,0.02),0_14px_32px_rgba(2,6,23,0.34)] dark:group-hover:shadow-[0_1px_1px_rgba(255,255,255,0.02),0_18px_40px_rgba(2,6,23,0.42)]">
                <div className="relative aspect-8/10 overflow-hidden bg-slate-100 dark:bg-slate-900">
                  {sketch.svgSrc ? (
                    <Image
                      src={sketch.svgSrc}
                      alt={sketch.title}
                      fill
                      sizes="(min-width: 1024px) 25vw, (min-width: 640px) 18rem, 82vw"
                      className="object-cover object-center transition-transform duration-500 group-hover:scale-[1.03]"
                      unoptimized
                    />
                  ) : null}
                </div>
                <div className="flex min-h-28 flex-1 flex-col px-5 py-5">
                  <h3 className="min-h-[3.5rem] text-xl font-semibold tracking-[-0.02em] text-slate-900 transition-colors group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                    {sketch.title}
                  </h3>
                  <p className="mt-auto pt-2 text-sm text-slate-500 dark:text-slate-400">
                    {sketch.date}
                  </p>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent Articles — white */}
      <section className="py-16 -mb-16">
        <p className="text-xs font-semibold tracking-widest uppercase text-slate-400 dark:text-slate-500 mb-3">
          Knowledge
        </p>
        <h2
          className="text-4xl font-black text-slate-900 dark:text-white mb-10"
          style={{ letterSpacing: "-0.02em" }}
        >
          Recent Articles
        </h2>
        {recentArticles.length === 0 ? (
          <p className="text-slate-400 text-sm">No knowledge articles yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {recentArticles.map((article) => (
              <KnowledgeCard key={article.slug} article={article} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
