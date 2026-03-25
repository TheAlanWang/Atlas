import TopicCard from "@/components/TopicCard";
import PostCard from "@/components/PostCard";
import { getAllPosts } from "@/lib/posts";
import { getAllTopics } from "@/lib/posts";

export default async function Home() {
  const allPosts = await getAllPosts();
  const recentPosts = allPosts.slice(0, 10);
  const topics = await getAllTopics();

  return (
    <div className="space-y-10">
      <section className="relative h-120 overflow-hidden left-1/2 -translate-x-1/2 w-screen -mt-20 mb-10">
        <img
          src="/images/mountain.jpg"
          alt="hero"
          className="w-full h-full object-cover object-[center_35%]"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to right, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.35) 50%, rgba(0,0,0,0) 100%)",
          }}
        />
        <div className="absolute inset-0 flex flex-col justify-end pb-10 fade-in-up-delay">
          <div className="max-w-6xl mx-auto px-12 w-full">
            <h1
              className="font-black text-white leading-tight tracking-tight mb-4 whitespace-nowrap"
              style={{ fontSize: "clamp(32px, 4vw, 52px)" }}
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
                  {allPosts.length}
                </strong>
                <span className="text-xs text-white/50 uppercase tracking-wider">
                  articles
                </span>
              </div>
              <div>
                <strong className="text-3xl font-black text-white block">
                  {topics.length}
                </strong>
                <span className="text-xs text-white/50 uppercase tracking-wider">
                  topics
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4">
          Languages
        </h2>
        <div className="flex gap-4 overflow-x-auto pb-2">
          <TopicCard title="Python" href="/python" />
          <TopicCard title="React" href="/react" />
          <TopicCard title="Java" href="/java" />
        </div>
      </section>

      <section>
        <h2 className="text-1xl font-black text-slate-900 dark:text-white mb-4">
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
      </section>
    </div>
  );
}
