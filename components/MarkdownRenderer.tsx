import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import CodeBlock from "./CodeBlock";
import { highlight } from "@/lib/highlight";
import { slugify } from "@/lib/utils";

type Props = { content: string };

export default async function MarkdownRenderer({ content }: Props) {
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

  return (
    <div className="prose prose-slate dark:prose-invert max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h2: ({ children }) => {
            const id = slugify(String(children));
            return <h2 id={id} className="scroll-mt-24">{children}</h2>;
          },
          h3: ({ children }) => {
            const id = slugify(String(children));
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
        }}
      >
        {normalized}
      </ReactMarkdown>
    </div>
  );
}
