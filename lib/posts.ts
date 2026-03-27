import fs from "fs"; // Node.js built-in: read files from disk
import path from "path"; // Node.js built-in: handle file paths cross-platform
import matter from "gray-matter"; // split Markdown into frontmatter + body
import type { Post, RoadmapSection, RoadmapItem, TopicMeta, CategoryGroup } from "@/types"; // TypeScript types only, no runtime code

// directory where Markdown posts are stored
const POSTS_DIR = path.join(process.cwd(), "content/posts");

// recursively find a post file by slug across all topic subdirectories
function findPostFile(slug: string, cn = false): string | null {
  const suffix = cn ? ".cn.md" : ".md";
  if (!fs.existsSync(POSTS_DIR)) return null;
  for (const entry of fs.readdirSync(POSTS_DIR, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      const candidate = path.join(POSTS_DIR, entry.name, `${slug}${suffix}`);
      if (fs.existsSync(candidate)) return candidate;
    }
  }
  return null;
}

// get all .md files (non-cn) from all topic subdirectories
function getAllPostFiles(): { slug: string; filePath: string }[] {
  if (!fs.existsSync(POSTS_DIR)) return [];
  const results: { slug: string; filePath: string }[] = [];
  for (const entry of fs.readdirSync(POSTS_DIR, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      const subDir = path.join(POSTS_DIR, entry.name);
      for (const file of fs.readdirSync(subDir)) {
        if (file.endsWith(".md") && !file.endsWith(".cn.md")) {
          results.push({
            slug: file.replace(/\.md$/, ""),
            filePath: path.join(subDir, file),
          });
        }
      }
    }
  }
  return results;
}

// check if a Chinese version (.cn.md) exists for a given slug
export function hasCnVersion(slug: string): boolean {
  return findPostFile(slug, true) !== null;
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
  const files = getAllPostFiles();
  const posts = await Promise.all(
    files.map(async ({ slug, filePath }) => {
      const raw = fs.readFileSync(filePath, "utf8");
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
  const filePath = findPostFile(slug);
  if (!filePath) return null;
  const raw = fs.readFileSync(filePath, "utf8");
  const { rawContent, ...meta } = parsePost(slug, raw);
  return { ...meta, content: rawContent };
}

// get the Chinese version of a post (returns null if not found)
export async function getPostCn(slug: string): Promise<Post | null> {
  const filePath = findPostFile(slug, true);
  if (!filePath) return null;
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

// read category from content/topics/<slug>.json
export function getTopicsMeta(): TopicMeta[] {
  const topicsDir = path.join(process.cwd(), "content/topics");
  if (!fs.existsSync(topicsDir)) return [];
  return fs
    .readdirSync(topicsDir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => {
      const slug = f.replace(/\.json$/, "");
      const config = JSON.parse(fs.readFileSync(path.join(topicsDir, f), "utf8"));
      return { slug, category: config.category ?? "other", homepage: config.homepage ?? false, parent: config.parent };
    })
    .sort((a, b) => a.slug.localeCompare(b.slug));
}

// group topics by category, preserving a fixed display order
export function getTopicsByCategory(): CategoryGroup[] {
  const CATEGORY_ORDER = ["ai", "languages", "frontend", "systems", "database", "tools", "other"];
  const topics = getTopicsMeta();
  const map = new Map<string, TopicMeta[]>();
  for (const t of topics) {
    if (!map.has(t.category)) map.set(t.category, []);
    map.get(t.category)!.push(t);
  }
  return CATEGORY_ORDER
    .filter((c) => map.has(c))
    .map((c) => ({ category: c, topics: map.get(c)! }));
}
