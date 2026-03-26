// app/api/chat/route.ts
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!,
);

export async function POST(req: Request) {
  const { question, history } = await req.json();

  // 1. Embed the user's question into a vector
  const embRes = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: question,
  });
  const queryEmbedding = embRes.data[0].embedding;

  // 2. Search Supabase for the top-3 most relevant chunks
  const { data: docs } = await supabase.rpc("match_documents", {
    query_embedding: queryEmbedding,
    match_count: 3,
  });

  // 3. Build context string from retrieved chunks
  const context = docs
    ?.map(
      (d: { title: string; content: string }) => `[${d.title}]\n${d.content}`,
    )
    .join("\n\n---\n\n");

  // Deduplicate sources by slug, return title + slug + topic for linking
  const seen = new Set<string>();
  const sources =
    docs?.reduce(
      (
        acc: { title: string; slug: string; topic: string }[],
        d: { title: string; slug: string; topic: string },
      ) => {
        if (!seen.has(d.slug)) {
          seen.add(d.slug);
          acc.push({ title: d.title, slug: d.slug, topic: d.topic });
        }
        return acc;
      },
      [],
    ) ?? [];

  // 4. Call GPT-4o with context-grounded system prompt, stream the response
  const stream = await openai.chat.completions.create({
    model: "gpt-4o",
    stream: true,
    max_tokens: 300,
    messages: [
      {
        role: "system",
        content: `You are a helpful assistant for the Atlas learning platform.
Answer questions based ONLY on the context below.
If the answer is not in the context, say so honestly.
Be concise and clear.

Context:
${context}`,
      },
      ...(history ?? []),
      { role: "user", content: question },
    ],
  });

  // 5. Stream the response back — send sources first, then stream text chunks
  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      // Send sources metadata first so the UI can display reference articles
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ sources })}\n\n`),
      );
      // Stream GPT response text word by word
      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content ?? "";
        if (text) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ text })}\n\n`),
          );
        }
      }
      controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      controller.close();
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
    },
  });
}
