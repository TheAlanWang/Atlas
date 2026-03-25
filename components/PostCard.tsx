import Link from "next/link";
import type { Post } from "@/types";
import { formatDate } from "@/lib/utils";

export default function PostCard({ post }: { post: Post }) {
  return (
    <Link
      href={`/${post.topic}?slug=${post.slug}`}
      className="flex items-center justify-between py-3 px-2 border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded"
    >
      <div>
        <span className="text-sm font-medium text-slate-800 dark:text-slate-100">
          {post.title}
        </span>
        <span className="ml-2 text-xs text-slate-400 dark:text-slate-500 capitalize">
          {post.topic}
        </span>
      </div>
      <span className="text-xs text-slate-400 dark:text-slate-500">
        {formatDate(post.date)}
      </span>
    </Link>
  );
}
