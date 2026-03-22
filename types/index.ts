export type Post = {
  slug: string            // filename without .md, also used in URL
  title: string           // post title
  topic: string           // e.g. "python" or "react"
  section: string         // sidebar group name, e.g. "Basics"
  order: number           // sort order within section
  date: string            // ISO date string, e.g. "2026-03-21"
  content: string         // rendered HTML (converted from Markdown by remark)
}

export type RoadmapItem = {
  slug: string
  title: string
  order: number
}

export type RoadmapSection = {
  title: string           // section name
  items: RoadmapItem[]    // posts in this section
}