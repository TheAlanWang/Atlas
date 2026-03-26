# Atlas

A personal learning site built with Next.js, featuring an AI assistant powered by RAG (Retrieval Augmented Generation).

Live at: [thealanwang.xyz](https://thealanwang.xyz)

## Features

- Articles organized by topic
- Dark mode support
- AI chat assistant — ask questions about any article on the site
  - Powered by OpenAI `text-embedding-3-small` + Supabase pgvector
  - Streams responses via GPT-4o
  - Cites source articles

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS
- **AI**: OpenAI API (embeddings + GPT-4o)
- **Vector DB**: Supabase pgvector
- **Deployment**: Vercel

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

Create a `.env.local` file:

```
OPENAI_API_KEY=sk-...
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
```

## Embedding Articles

After adding or editing articles, re-run the embedding script to update the vector database:

```bash
npx tsx --env-file=.env.local scripts/embed-posts.ts
```

This script:
- Skips unchanged articles (MD5 hash check)
- Re-embeds modified articles
- Inserts new articles
