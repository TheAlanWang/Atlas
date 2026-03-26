// scripts/embed-posts.ts
import fs from "fs";
import path from "path";
import crypto from "crypto";
import matter from "gray-matter";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!,
);

const POSTS_DIR = path.join(process.cwd(), "content/posts");
const CHUNK_SIZE = 500; // ~500 characters per chunk

// Generate MD5 hash of content — used to detect changes
function hashContent(content: string): string {
  return crypto.createHash("md5").update(content).digest("hex");
}

// Split article content into smaller chunks by paragraph
function chunkText(text: string, size: number): string[] {
  const paragraphs = text.split(/\n\n+/);
  const chunks: string[] = [];
  let current = "";

  for (const para of paragraphs) {
    if ((current + para).length > size && current) {
      // Current accumulator has reached the size limit
      // Save it as a chunk and start a new one with this paragraph
      chunks.push(current.trim());
      current = para;
    } else {
      current += "\n\n" + para;
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks;
}

async function embedAndInsert(
  slug: string,
  title: string,
  topic: string,
  content: string,
  hash: string,
) {
  const chunks = chunkText(content, CHUNK_SIZE);
  console.log(`Embedding ${slug}: ${chunks.length} chunks`);

  for (const chunk of chunks) {
    // Generate embedding vector via OpenAI
    const res = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: chunk,
    });
    const embedding = res.data[0].embedding;

    // Insert chunk + embedding + hash into Supabase
    await supabase.from("documents").insert({
      slug,
      title,
      topic,
      content: chunk,
      embedding,
      content_hash: hash,
    });
  }
}

async function main() {
  // Read all English .md files, skip Chinese versions (.cn.md)
  const files = fs
    .readdirSync(POSTS_DIR)
    .filter((f) => f.endsWith(".md") && !f.endsWith(".cn.md"));

  for (const file of files) {
    const slug = file.replace(/\.md$/, "");
    const raw = fs.readFileSync(path.join(POSTS_DIR, file), "utf8");
    const { data, content } = matter(raw);
    const hash = hashContent(content);

    // Check if this slug already exists in the database
    const { data: existing } = await supabase
      .from("documents")
      .select("content_hash")
      .eq("slug", slug)
      .limit(1);

    if (existing && existing.length > 0) {
      if (existing[0].content_hash === hash) {
        // Case 1: Article unchanged — skip
        console.log(`Skipping ${slug} (no changes)`);
        continue;
      } else {
        // Case 2: Article modified — delete old chunks, re-embed
        console.log(`Updating ${slug} (content changed)`);
        await supabase.from("documents").delete().eq("slug", slug);
      }
    } else {
      // Case 3: New article — embed and insert
      console.log(`New article: ${slug}`);
    }

    await embedAndInsert(slug, data.title, data.topic ?? "", content, hash);
  }

  console.log("All done!");
}

main().catch(console.error);
