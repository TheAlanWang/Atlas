export type Post = {
    slug: String
}

export type RoadmapItem = {
    slug: string
    title: string
}

export type RoadmapSection = {
    title: string
    items: RoadmapItem[]
}