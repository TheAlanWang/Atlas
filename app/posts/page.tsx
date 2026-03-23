import { getAllPosts } from '@/lib/posts'
import PostCard from '@/components/PostCard'

export default async function PostsPage() {
  const posts = await getAllPosts()
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">All Posts</h1>
      {posts.length === 0
        ? <p className="text-slate-400">No posts yet.</p>
        : <div>{posts.map(p => <PostCard key={p.slug} post={p} />)}</div>
      }
    </div>
  )
}