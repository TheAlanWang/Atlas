import TopicCard from "@/components/TopicCard";
import PostCard from "@/components/PostCard";
import HeroParallax from "@/components/HeroParallax";
import { getAllPosts, getTopicsByCategory } from "@/lib/posts";

const CATEGORY_LABELS: Record<string, string> = {
  languages: "Languages",
  frontend: "Frontend",
  ai: "AI",
  systems: "Systems",
  tools: "Tools",
  other: "Other",
};

export default async function Home() {
  const allPosts = await getAllPosts();
  const recentPosts = allPosts.slice(0, 10);
  const categoryGroups = getTopicsByCategory();

  return (
    <div className="space-y-10">
      <HeroParallax articleCount={allPosts.length} topicCount={categoryGroups.flatMap(g => g.topics).length} />

      <section className="mt-28">
        <h2 className="text-5xl font-black text-slate-900 dark:text-white mb-10">
          Topics
        </h2>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categoryGroups.flatMap(({ topics }) =>
            topics.filter((t) => t.homepage).map((t) => (
              <TopicCard key={t.slug} title={t.slug} href={`/${t.slug}`} />
            ))
          )}
        </div>
      </section>

      <section className="relative left-1/2 -translate-x-1/2 w-screen bg-slate-100 dark:bg-slate-800/50 mt-4 py-12 -mb-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-6">
            Recent Posts
          </h2>
          {recentPosts.length === 0 ? (
            <p className="text-slate-400 text-sm">No posts yet.</p>
          ) : (
            <div>
              {recentPosts.map((p) => (
                <PostCard key={p.slug} post={p} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
