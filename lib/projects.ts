import fs from "fs";
import path from "path";
import matter from "gray-matter";
import type { Project } from "@/types";
import { formatDate } from "@/lib/utils";

const PROJECTS_DIR = path.join(process.cwd(), "content", "projects");

function getProjectDirs(): string[] {
  if (!fs.existsSync(PROJECTS_DIR)) return [];
  return fs
    .readdirSync(PROJECTS_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

function getProjectFilePath(slug: string) {
  return path.join(PROJECTS_DIR, slug, "index.md");
}

function getProjectArchitecturePath(slug: string) {
  return path.join(PROJECTS_DIR, slug, "architecture.svg");
}

function extractExcerpt(content: string): string {
  const lines = content
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  for (const line of lines) {
    if (line.startsWith("#")) continue;
    if (line.startsWith("![")) continue;
    if (line.startsWith("```")) continue;
    if (line.startsWith("- ")) continue;
    if (line.startsWith("1. ")) continue;
    return line.replace(/`([^`]+)`/g, "$1");
  }

  return "";
}

function resolveProjectDate(rawDate: unknown, fallbackDate: Date): string {
  if (typeof rawDate === "string" || typeof rawDate === "number") {
    return String(rawDate);
  }

  if (rawDate instanceof Date && !Number.isNaN(rawDate.getTime())) {
    return rawDate.toISOString();
  }

  return fallbackDate.toISOString();
}

function parseProject(slug: string, raw: string, filePath: string): Project {
  const { data, content } = matter(raw);

  if (!data.title) {
    throw new Error(`Project "${slug}" is missing the title field.`);
  }

  const stat = fs.statSync(filePath);
  const rawDate = resolveProjectDate(data.date, stat.mtime);

  return {
    slug,
    title: String(data.title),
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    excerpt: extractExcerpt(content),
    architectureSrc: fs.existsSync(getProjectArchitecturePath(slug))
      ? `/projects/${slug}/assets/architecture.svg`
      : undefined,
    date: formatDate(rawDate),
    content,
  };
}

export async function getAllProjectSlugs(): Promise<string[]> {
  return getProjectDirs();
}

export async function getAllProjects(): Promise<Project[]> {
  return getProjectDirs()
    .map((slug) => {
      const filePath = getProjectFilePath(slug);
      const raw = fs.readFileSync(filePath, "utf8");
      const { data } = matter(raw);
      const stat = fs.statSync(filePath);
      const rawDate = resolveProjectDate(data.date, stat.mtime);

      return {
        project: parseProject(slug, raw, filePath),
        sortTime: new Date(rawDate).getTime(),
      };
    })
    .sort((a, b) => b.sortTime - a.sortTime || a.project.slug.localeCompare(b.project.slug))
    .map(({ project }) => project);
}

export async function getProject(slug: string): Promise<Project | null> {
  const filePath = getProjectFilePath(slug);
  if (!fs.existsSync(filePath)) return null;
  return parseProject(slug, fs.readFileSync(filePath, "utf8"), filePath);
}
