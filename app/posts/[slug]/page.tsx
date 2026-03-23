import { getPost, getAllPosts } from '@/lib/posts'
import MarkdownRenderer from '@/components/MarkdownRenderer'
import { notFound } from 'next/navigation'

type Props = { params: Promise<{ slug: string }> }

// tells Next.js which slugs exist, so it can pre-build all post pages at build time
export async function generateStaticParams() {
  const posts = await getAllPosts()
  return posts.map(p => ({ slug: p.slug }))
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) notFound()

  return (
    <article className="max-w-2xl">
      <div className="mb-6">
        <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">{post.topic}</span>
        <h1 className="text-3xl font-bold text-slate-900 mt-1">{post.title}</h1>
        <p className="text-sm text-slate-400 mt-1">{post.date}</p>
      </div>
      <MarkdownRenderer html={post.content} />
    </article>
  )
}