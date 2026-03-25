// convert heading text to a URL-safe id, e.g. "What is Git?" → "what-is-git"
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/`[^`]*`/g, (m) => m.slice(1, -1)) // strip backticks but keep content
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

// extract ## and ### headings from raw markdown content
export function extractHeadings(content: string) {
  return content
    .split("\n")
    .flatMap((line) => {
      const match = line.match(/^(#{2,3})\s+(.+)/);
      if (!match) return [];
      const level = match[1].length as 2 | 3;
      const text = match[2].trim();
      return [{ level, text, id: slugify(text) }];
    });
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
