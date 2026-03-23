import TopicCard from '@/components/TopicCard'
import PostCard from '@/components/PostCard'
import { getAllPosts } from '@/lib/posts'

export default async function Home() {
  const recentPosts = (await getAllPosts()).slice(0, 5)

  return (
    <div className="space-y-10">
      <section>
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Hey, I&apos;m Alan 👋</h1>
        <p className="text-slate-500">TA @ Northeastern · Learning in public.</p>
      </section>

      <section>
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Topics</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TopicCard title="Python" description="Variables, functions, OOP, and beyond."
            href="/python" emoji="🐍" />
          <TopicCard title="React" description="Components, hooks, and Next.js."
            href="/react" emoji="⚛️" />
        </div>
      </section>

      <section>
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Recent Posts</h2>
        {recentPosts.length === 0
          ? <p className="text-slate-400 text-sm">No posts yet.</p>
          : <div>{recentPosts.map(p => <PostCard key={p.slug} post={p} />)}</div>
        }
      </section>
    </div>
  )
}