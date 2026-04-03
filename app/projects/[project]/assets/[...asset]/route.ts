import fs from "fs/promises";
import path from "path";

const MIME_TYPES: Record<string, string> = {
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

export async function GET(
  _request: Request,
  context: { params: Promise<{ project: string; asset: string[] }> },
) {
  const { project, asset } = await context.params;

  if (!asset.length || asset.some((segment) => segment === "..")) {
    return new Response("Not found", { status: 404 });
  }

  const projectRoot = path.resolve(process.cwd(), "content", "projects", project);
  const filePath = path.resolve(projectRoot, ...asset);

  if (!filePath.startsWith(`${projectRoot}${path.sep}`)) {
    return new Response("Not found", { status: 404 });
  }

  try {
    const file = await fs.readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();
    return new Response(file, {
      headers: {
        "Content-Type": MIME_TYPES[ext] ?? "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
