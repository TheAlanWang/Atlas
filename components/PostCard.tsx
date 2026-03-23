import Link from 'next/link'
import type { Post } from '@/types'

export default function PostCard({ post }: { post: Post }) {
  return (
    <Link href={`/posts/${post.slug}`}
      className="flex items-center justify-between py-3 px-2 border-b border-slate-100 hover:bg-slate-50 rounded">
      <div>
        <span className="text-sm font-medium text-slate-800">{post.title}</span>
        <span className="ml-2 text-xs text-slate-400 capitalize">{post.topic}</span>
      </div>
      <span className="text-xs text-slate-400">{post.date}</span>
    </Link>
  )
}