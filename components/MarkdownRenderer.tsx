import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import CodeBlock from "./CodeBlock";
import { highlight } from "@/lib/highlight";
import { slugify } from "@/lib/utils";

type Props = { content: string };

function resolveImageSrc(src: string | undefined, imageBasePath: string | undefined) {
  if (!src) return "";
  if (!imageBasePath) return src;
  if (src.startsWith("/") || src.startsWith("http://") || src.startsWith("https://") || src.startsWith("data:")) {
    return src;
  }

  const normalizedSrc = src.replace(/^\.\//, "");
  const normalizedBase = imageBasePath.replace(/\/$/, "");
  return `${normalizedBase}/${normalizedSrc}`;
}

function extractText(node: React.ReactNode): string {
  if (typeof node === "string") return node;
  if (Array.isArray(node)) return node.map(extractText).join("");
  if (React.isValidElement<{ children?: React.ReactNode }>(node))
    return extractText(node.props.children);
  return "";
}

export default async function MarkdownRenderer({ content, imageBasePath }: Props & { imageBasePath?: string }) {
  const normalized = content.replace(/\*\*([^*\n]+)\*\*/g, " **$1** ");

  const codeMap = new Map<string, string>();
  const jobs: Promise<void>[] = [];

  for (const match of normalized.matchAll(/```(\w+)?\n([\s\S]*?)```/g)) {
    const lang = match[1] ?? "text";
    const code = match[2].trimEnd();
    jobs.push(
      highlight(code, lang).then((html) => {
        codeMap.set(code, html);
      }),
    );
  }
  await Promise.all(jobs);

  // Track seen slugs to deduplicate heading IDs — must match extractHeadings logic
  const seen = new Map<string, number>();
  let imageIndex = 0;
  function makeId(children: React.ReactNode): string {
    const base = slugify(extractText(children)) || "heading";
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    return count === 0 ? base : `${base}-${count}`;
  }

  return (
    <div className="prose prose-slate dark:prose-invert max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h2: ({ children }) => {
            const id = makeId(children);
            return <h2 id={id} className="scroll-mt-24">{children}</h2>;
          },
          h3: ({ children }) => {
            const id = makeId(children);
            return <h3 id={id} className="scroll-mt-24">{children}</h3>;
          },
          pre: ({ children }) => <>{children}</>,
          code: ({ className, children }) => {
            const code = String(children).trimEnd();
            const html = codeMap.get(code);
            if (!html) return <code className={className}>{children}</code>;
            const lang = className?.replace("language-", "") ?? "";
            return <CodeBlock language={lang} highlightedHtml={html} />;
          },
          img: ({ src, alt = "", title = "" }) => {
            const currentImageIndex = imageIndex++;
            const resolvedSrc = resolveImageSrc(
              typeof src === "string" ? src : "",
              imageBasePath,
            );

            return (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={resolvedSrc}
                alt={alt}
                title={typeof title === "string" ? title : ""}
                className="w-full rounded-2xl border border-slate-200 dark:border-slate-800"
                loading={currentImageIndex === 0 ? "eager" : "lazy"}
              />
            );
          },
        }}
      >
        {normalized}
      </ReactMarkdown>
    </div>
  );
}
