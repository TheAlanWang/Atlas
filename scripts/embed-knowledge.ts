// scripts/embed-knowledge.ts
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
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

const KNOWLEDGE_DIR = path.join(process.cwd(), "content/knowledge");
const CHUNK_SIZE = 500; // ~500 characters per chunk

// Generate MD5 hash of content — used to detect changes
function hashContent(content: string): string {
  return crypto.createHash("md5").update(content).digest("hex");
}

// Recursive character text splitter — mirrors LangChain's RecursiveCharacterTextSplitter
// Tries separators in order: paragraph → line → sentence → word → character
function chunkText(text: string, size: number, overlap: number = 50): string[] {
  const separators = ["\n\n", "\n", ". ", " ", ""];

  function split(text: string, separators: string[]): string[] {
    const [sep, ...rest] = separators;

    // Base case: no more separators, split by character
    if (sep === "" || sep === undefined) {
      const chunks = [];
      for (let i = 0; i < text.length; i += size - overlap) {
        chunks.push(text.slice(i, i + size));
      }
      return chunks;
    }

    const parts = text.split(sep).filter(Boolean);
    const chunks: string[] = [];
    let current = "";

    for (const part of parts) {
      const candidate = current ? current + sep + part : part;
      if (candidate.length <= size) {
        current = candidate;
      } else {
        if (current) chunks.push(current.trim());
        // Part itself is too large — recurse with next separator
        current = part.length > size ? "" : part;
        if (part.length > size) chunks.push(...split(part, rest));
      }
    }
    if (current.trim()) chunks.push(current.trim());
    return chunks;
  }

  return split(text, separators);
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

function getAllMarkdownFiles(dir: string): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  return entries.flatMap((e) =>
    e.isDirectory()
      ? getAllMarkdownFiles(path.join(dir, e.name))
      : e.name.endsWith(".md") && !e.name.endsWith(".cn.md")
        ? [path.join(dir, e.name)]
        : [],
  );
}

async function main() {
  const files = getAllMarkdownFiles(KNOWLEDGE_DIR);

  for (const file of files) {
    const slug = path.basename(file, ".md");
    const raw = fs.readFileSync(file, "utf8");
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
