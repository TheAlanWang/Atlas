import fs from "fs"; // Node.js built-in: read files from disk
import path from "path"; // Node.js built-in: handle file paths cross-platform
import matter from "gray-matter"; // split Markdown into frontmatter + body
import type { Post, RoadmapSection, RoadmapItem } from "@/types"; // TypeScript types only, no runtime code

// directory where Markdown posts are stored
const POSTS_DIR = path.join(process.cwd(), "content/posts");

// check if a Chinese version (.cn.md) exists for a given slug
export function hasCnVersion(slug: string): boolean {
  const filePath = path.join(POSTS_DIR, `${slug}.cn.md`);
  return fs.existsSync(filePath);
}

// parse a single Markdown file into a Post object
function parsePost(slug: string, fileContents: string) {
  const { data, content } = matter(fileContents);

  // validate required frontmatter fields at runtime
  const required = ["title", "topic", "section", "order", "date"];
  for (const field of required) {
    if (data[field] === undefined) {
      throw new Error(`Post "${slug}" is missing required field: ${field}`);
    }
  }

  return {
    slug,
    title: data.title as string,
    topic: data.topic as string,
    section: data.section as string,
    order: data.order as number,
    date: String(data.date),
    rawContent: content,
  };
}

// get all posts, sorted by date descending
export async function getAllPosts(): Promise<Post[]> {
  if (!fs.existsSync(POSTS_DIR)) return [];
  const files = fs
    .readdirSync(POSTS_DIR)
    .filter((f) => f.endsWith(".md") && !f.endsWith(".cn.md"));
  const posts = await Promise.all(
    files.map(async (file) => {
      const slug = file.replace(/\.md$/, "");
      const raw = fs.readFileSync(path.join(POSTS_DIR, file), "utf8");
      const { rawContent, ...meta } = parsePost(slug, raw);
      return { ...meta, content: rawContent };
    }),
  );
  return posts.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
}

// get a single post by slug (filename without .md)
export async function getPost(slug: string): Promise<Post | null> {
  const filePath = path.join(POSTS_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, "utf8");
  const { rawContent, ...meta } = parsePost(slug, raw);
  return { ...meta, content: rawContent };
}

// get the Chinese version of a post (returns null if not found)
export async function getPostCn(slug: string): Promise<Post | null> {
  const filePath = path.join(POSTS_DIR, `${slug}.cn.md`);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, "utf8");
  const { rawContent, ...meta } = parsePost(slug, raw);
  return { ...meta, content: rawContent };
}

// get all posts for a given topic
export async function getPostsByTopic(topic: string): Promise<Post[]> {
  const all = await getAllPosts();
  return all.filter((p) => p.topic === topic);
}

// load section order from content/topics/<topic>.json
// falls back to alphabetical if no config exists
function getSectionRank(topic: string): Map<string, number> {
  const configPath = path.join(process.cwd(), "content/topics", `${topic}.json`);
  if (!fs.existsSync(configPath)) return new Map();
  const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
  const rank = new Map<string, number>();
  for (const section of config.sections) {
    rank.set(section.title, section.order);
  }
  return rank;
}

// build sidebar structure: group posts by section, sort by order
export async function getRoadmapSections(
  topic: string,
): Promise<RoadmapSection[]> {
  const posts = await getPostsByTopic(topic);
  const sectionRank = getSectionRank(topic);
  const sectionsMap = new Map<string, RoadmapItem[]>();

  for (const post of posts) {
    if (!sectionsMap.has(post.section)) sectionsMap.set(post.section, []);
    sectionsMap.get(post.section)!.push({
      slug: post.slug,
      title: post.title,
      order: post.order,
    });
  }

  return Array.from(sectionsMap.entries())
    .map(([title, items]) => ({
      title,
      items: items.sort((a, b) => a.order - b.order),
    }))
    .sort((a, b) => {
      const ra = sectionRank.get(a.title) ?? 999;
      const rb = sectionRank.get(b.title) ?? 999;
      return ra - rb;
    });
}

// get all unique topics — used by generateStaticParams to pre-build pages
export async function getAllTopics(): Promise<string[]> {
  const posts = await getAllPosts();
  return [...new Set(posts.map((p) => p.topic))].sort();
}
