import { getRoadmapSections, getPost, getPostsByTopic, getAllTopics } from '@/lib/posts'
import RoadmapSidebar from '@/components/RoadmapSidebar'
import MarkdownRenderer from '@/components/MarkdownRenderer'
import { notFound } from 'next/navigation'

type Props = {
  params: Promise<{ topic: string }>
  searchParams: Promise<{ slug?: string }>
}

export async function generateStaticParams() {
  const topics = await getAllTopics()
  return topics.map(topic => ({ topic }))
}

export default async function TopicPage({ params, searchParams }: Props) {
  const { topic } = await params
  const { slug } = await searchParams

  const sections = await getRoadmapSections(topic)
  if (sections.length === 0) notFound()

  const allPosts = await getPostsByTopic(topic)
  const activeSlug = slug ?? allPosts[0]?.slug ?? ''
  const activePost = activeSlug ? await getPost(activeSlug) : null

  return (
    <div className="flex gap-8">
      {/* RoadmapSidebar used here for the first time — defined back in Task 6 */}
      <RoadmapSidebar sections={sections} activeSlug={activeSlug} basePath={`/${topic}`} />

      <div className="flex-1 min-w-0">
        {activePost ? (
          <article>
            <div className="mb-6">
              <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">{activePost.section}</span>
              <h1 className="text-2xl font-bold text-slate-900 mt-1">{activePost.title}</h1>
              <p className="text-sm text-slate-400 mt-1">{activePost.date}</p>
            </div>
            <MarkdownRenderer html={activePost.content} />
          </article>
        ) : (
          <p className="text-slate-400">Select a topic from the roadmap.</p>
        )}
      </div>
    </div>
  )
}