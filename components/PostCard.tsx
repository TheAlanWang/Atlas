import Link from "next/link";
import type { Post } from "@/types";
import { formatDate } from "@/lib/utils";

export default function PostCard({ post }: { post: Post }) {
  return (
    <Link
      href={`/${post.topic}?slug=${post.slug}`}
      className="flex items-center justify-between py-3 px-4 rounded-xl mb-2 transition-all duration-200 hover:scale-[1.02] hover:bg-slate-200 dark:hover:bg-slate-700"
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
