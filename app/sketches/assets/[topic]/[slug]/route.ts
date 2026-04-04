import fs from "fs/promises";
import path from "path";

export async function GET(
  _request: Request,
  context: { params: Promise<{ topic: string; slug: string }> },
) {
  const { topic, slug } = await context.params;

  if ([topic, slug].some((segment) => !segment || segment === "..")) {
    return new Response("Not found", { status: 404 });
  }

  const sketchesRoot = path.resolve(process.cwd(), "content", "sketches");
  const filePath = path.resolve(sketchesRoot, topic, `${slug}.svg`);

  if (!filePath.startsWith(`${sketchesRoot}${path.sep}`)) {
    return new Response("Not found", { status: 404 });
  }

  try {
    const file = await fs.readFile(filePath);
    return new Response(file, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
