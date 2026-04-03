import Link from "next/link";
import type { KnowledgeArticle } from "@/types";
import { formatDate } from "@/lib/utils";

export default function KnowledgeCard({
  article,
}: {
  article: KnowledgeArticle;
}) {
  return (
    <Link
      href={`/${article.topic}?slug=${article.slug}`}
      className="block py-6 border-t border-slate-200 dark:border-slate-700 hover:opacity-70 transition-opacity"
    >
      <p className="text-xs font-semibold tracking-widest uppercase text-blue-600 dark:text-blue-400 mb-2">
        {article.topic}
        {article.section && <> · {article.section}</>}
      </p>
      <p className="text-lg font-bold text-slate-900 dark:text-white mb-1 leading-snug">
        {article.title}
      </p>
      <p className="text-sm text-slate-400 dark:text-slate-500">
        {formatDate(article.date)}
      </p>
    </Link>
  );
}
