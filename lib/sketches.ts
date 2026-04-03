import fs from "fs";
import path from "path";

export type SketchItem = {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
};

export type SketchTopicIndex = {
  topic: string;
  title: string;
  items: SketchItem[];
};

export type SketchTopicSummary = {
  topic: string;
  title: string;
  itemCount: number;
  latestDate: string | null;
};

export type SketchSummary = SketchItem & {
  topic: string;
  svgContent: string | null;
};

export type Sketch = SketchItem & {
  topic: string;
  svgContent: string | null;
  sourceExists: boolean;
};

const SKETCHES_DIR = path.join(process.cwd(), "content", "sketches");

function getTopicDir(topic: string) {
  return path.join(SKETCHES_DIR, topic);
}

function getIndexPath(topic: string) {
  return path.join(getTopicDir(topic), "index.json");
}

function getSvgPath(topic: string, slug: string) {
  return path.join(getTopicDir(topic), `${slug}.svg`);
}

function getSourcePath(topic: string, slug: string) {
  return path.join(getTopicDir(topic), `${slug}.excalidraw`);
}

export function getSketchTopics(): string[] {
  if (!fs.existsSync(SKETCHES_DIR)) return [];

  return fs
    .readdirSync(SKETCHES_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && fs.existsSync(getIndexPath(entry.name)))
    .map((entry) => entry.name)
    .sort();
}

export function getSketchTopicIndex(topic: string): SketchTopicIndex | null {
  const filePath = getIndexPath(topic);
  if (!fs.existsSync(filePath)) return null;

  const raw = JSON.parse(fs.readFileSync(filePath, "utf8")) as Partial<SketchTopicIndex>;
  const items = Array.isArray(raw.items)
    ? raw.items
        .filter(
          (item): item is SketchItem =>
            typeof item?.slug === "string" &&
            typeof item?.title === "string" &&
            typeof item?.date === "string" &&
            typeof item?.excerpt === "string",
        )
    : [];

  return {
    topic,
    title: typeof raw.title === "string" ? raw.title : `${topic} Sketches`,
    items,
  };
}

export function getSketchTopicSummaries(): SketchTopicSummary[] {
  return getSketchTopics()
    .map((topic) => getSketchTopicIndex(topic))
    .filter((index): index is SketchTopicIndex => index !== null)
    .map((index) => ({
      topic: index.topic,
      title: index.title,
      itemCount: index.items.length,
      latestDate:
        index.items.length > 0
          ? index.items
              .map((item) => item.date)
              .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0]
          : null,
    }));
}

export function hasSketches(topic: string): boolean {
  const index = getSketchTopicIndex(topic);
  return index !== null && index.items.length > 0;
}

export function getAllSketches(): SketchSummary[] {
  return getSketchTopics()
    .flatMap((topic) => {
      const index = getSketchTopicIndex(topic);
      if (!index) return [];
      return index.items.map((item) => ({
        ...item,
        topic,
        svgContent: fs.existsSync(getSvgPath(topic, item.slug))
          ? fs.readFileSync(getSvgPath(topic, item.slug), "utf8")
          : null,
      }));
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getAllSketchSlugs(): { slug: string }[] {
  return getAllSketches().map((item) => ({ slug: item.slug }));
}

export function getAllSketchParams(): { topic: string; slug: string }[] {
  return getSketchTopics().flatMap((topic) => {
    const index = getSketchTopicIndex(topic);
    if (!index) return [];
    return index.items.map((item) => ({ topic, slug: item.slug }));
  });
}

export function getSketch(topic: string, slug: string): Sketch | null {
  const index = getSketchTopicIndex(topic);
  const item = index?.items.find((entry) => entry.slug === slug);
  if (!item) return null;

  const svgPath = getSvgPath(topic, slug);
  const sourcePath = getSourcePath(topic, slug);

  return {
    ...item,
    topic,
    svgContent: fs.existsSync(svgPath) ? fs.readFileSync(svgPath, "utf8") : null,
    sourceExists: fs.existsSync(sourcePath),
  };
}

export function getSketchBySlug(slug: string): Sketch | null {
  const match = getAllSketches().find((item) => item.slug === slug);
  if (!match) return null;
  return getSketch(match.topic, match.slug);
}
