// app/api/chat/route.ts
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!,
);
const CHAT_ROUTE = "/api/chat";
const CHAT_ENV = process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? "unknown";
const DEFAULT_CHAT_TOP_K = 3;
const DEFAULT_CANDIDATE_COUNT = 8;

type ChatRequestBody = {
  question?: unknown;
  history?: unknown;
};

type ChatHistoryMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type RetrievedDoc = {
  title: string;
  content: string;
  slug: string;
  topic: string;
  lexical_score?: number;
};

type ChatLatencyEvent = {
  eventType: "chat_latency";
  timestamp: string;
  env: string;
  route: typeof CHAT_ROUTE;
  trafficType: string;
  status: "ok" | "error";
  ttftMs: number | null;
  totalLatencyMs: number;
  questionLength: number;
  answerLength: number;
};

function roundMs(value: number): number {
  return Number(value.toFixed(1));
}

function createLatencyEvent({
  trafficType,
  status,
  ttftMs,
  totalLatencyMs,
  questionLength,
  answerLength,
}: Omit<
  ChatLatencyEvent,
  "eventType" | "timestamp" | "env" | "route"
>): ChatLatencyEvent {
  return {
    eventType: "chat_latency",
    timestamp: new Date().toISOString(),
    env: CHAT_ENV,
    route: CHAT_ROUTE,
    trafficType,
    status,
    ttftMs,
    totalLatencyMs: roundMs(totalLatencyMs),
    questionLength,
    answerLength,
  };
}

function logLatencyEvent(event: ChatLatencyEvent): void {
  const payload = JSON.stringify(event);
  if (event.status === "ok") {
    console.log(payload);
    return;
  }
  console.error(payload);
}

function getTrafficType(req: Request): string {
  return req.headers.get("x-atlas-traffic-type")?.trim() || "prod_user";
}

function hybridRetrievalEnabled(): boolean {
  return process.env.NEXT_CHAT_HYBRID_RETRIEVAL_ENABLED?.toLowerCase() !== "false";
}

function vectorCandidateCount(): number {
  return Number(
    process.env.NEXT_CHAT_VECTOR_CANDIDATES ?? DEFAULT_CANDIDATE_COUNT,
  );
}

function lexicalCandidateCount(): number {
  return Number(
    process.env.NEXT_CHAT_LEXICAL_CANDIDATES ?? DEFAULT_CANDIDATE_COUNT,
  );
}

function docIdentity(doc: RetrievedDoc): string {
  return `${doc.slug}\u0000${doc.content}`;
}

function mergeCandidates(
  vectorDocs: RetrievedDoc[],
  lexicalDocs: RetrievedDoc[],
): RetrievedDoc[] {
  const merged: RetrievedDoc[] = [];
  const seen = new Set<string>();

  for (const doc of [...vectorDocs, ...lexicalDocs]) {
    const identity = docIdentity(doc);
    if (seen.has(identity)) {
      continue;
    }
    seen.add(identity);
    merged.push(doc);
  }

  return merged;
}

async function vectorRetrieve(question: string, matchCount: number): Promise<RetrievedDoc[]> {
  const embRes = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: question,
  });
  const queryEmbedding = embRes.data[0].embedding;

  const { data, error } = await supabase.rpc("match_documents", {
    query_embedding: queryEmbedding,
    match_count: matchCount,
  });

  if (error) {
    throw error;
  }

  return (data ?? []) as RetrievedDoc[];
}

async function lexicalRetrieve(question: string, matchCount: number): Promise<RetrievedDoc[]> {
  const { data, error } = await supabase.rpc("search_documents_lexical", {
    query_text: question,
    match_count: matchCount,
  });

  if (error) {
    throw error;
  }

  return (data ?? []) as RetrievedDoc[];
}

async function retrieveDocuments(question: string): Promise<RetrievedDoc[]> {
  const vectorDocs = await vectorRetrieve(question, vectorCandidateCount());

  if (!hybridRetrievalEnabled()) {
    return vectorDocs.slice(0, DEFAULT_CHAT_TOP_K);
  }

  try {
    const lexicalDocs = await lexicalRetrieve(question, lexicalCandidateCount());
    return mergeCandidates(vectorDocs, lexicalDocs).slice(0, DEFAULT_CHAT_TOP_K);
  } catch (error) {
    console.warn(
      `[Atlas chat retrieval] lexical retrieval failed in ${CHAT_ROUTE}; falling back to vector-only`,
      error,
    );
    return vectorDocs.slice(0, DEFAULT_CHAT_TOP_K);
  }
}

function normalizeHistory(history: unknown): ChatHistoryMessage[] {
  if (!Array.isArray(history)) {
    return [];
  }

  return history.flatMap((entry) => {
    if (
      !entry ||
      typeof entry !== "object" ||
      !("role" in entry) ||
      !("content" in entry)
    ) {
      return [];
    }

    const role = entry.role;
    const content = entry.content;

    if (
      (role === "system" || role === "user" || role === "assistant") &&
      typeof content === "string"
    ) {
      return [{ role, content }];
    }

    return [];
  });
}

export async function POST(req: Request) {
  const requestStartedAt = performance.now();
  const trafficType = getTrafficType(req);
  let questionLength = 0;
  let answerLength = 0;
  let timeToFirstTokenMs: number | null = null;

  try {
    const body = (await req.json()) as ChatRequestBody;
    const question =
      typeof body.question === "string" ? body.question.trim() : "";
    const history = normalizeHistory(body.history);

    if (!question) {
      throw new Error("Question is required");
    }

    questionLength = question.length;

    const retrievedDocs = await retrieveDocuments(question);
    const context = retrievedDocs
      .map((doc) => `[${doc.title}]\n${doc.content}`)
      .join("\n\n---\n\n");

    const seen = new Set<string>();
    const sources = retrievedDocs.reduce(
      (acc: { title: string; slug: string; topic: string }[], doc) => {
        if (!seen.has(doc.slug)) {
          seen.add(doc.slug);
          acc.push({ title: doc.title, slug: doc.slug, topic: doc.topic });
        }
        return acc;
      },
      [],
    );

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
        ...history,
        { role: "user", content: question },
      ],
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ sources })}\n\n`),
          );

          for await (const chunk of stream) {
            const text = chunk.choices[0]?.delta?.content ?? "";
            if (!text) {
              continue;
            }

            if (timeToFirstTokenMs === null) {
              timeToFirstTokenMs = roundMs(
                performance.now() - requestStartedAt,
              );
            }
            answerLength += text.length;
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ text })}\n\n`),
            );
          }

          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          logLatencyEvent(
            createLatencyEvent({
              trafficType,
              status: "ok",
              ttftMs: timeToFirstTokenMs,
              totalLatencyMs: performance.now() - requestStartedAt,
              questionLength,
              answerLength,
            }),
          );
          controller.close();
        } catch (error) {
          logLatencyEvent(
            createLatencyEvent({
              trafficType,
              status: "error",
              ttftMs: timeToFirstTokenMs,
              totalLatencyMs: performance.now() - requestStartedAt,
              questionLength,
              answerLength,
            }),
          );
          controller.error(error);
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
      },
    });
  } catch {
    logLatencyEvent(
      createLatencyEvent({
        trafficType,
        status: "error",
        ttftMs: timeToFirstTokenMs,
        totalLatencyMs: performance.now() - requestStartedAt,
        questionLength,
        answerLength,
      }),
    );

    return Response.json({ error: "Chat request failed" }, { status: 500 });
  }
}
