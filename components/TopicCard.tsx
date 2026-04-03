import Image from "next/image";
import Link from "next/link";

type Props = {
  title: string;
  href: string;
  count?: number;
};

export default function TopicCard({ title, href, count }: Props) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 py-2 hover:scale-105 transition-transform duration-150"
    >
      <Image
        src={`/icons/${title.toLowerCase()}.svg`}
        alt={title}
        width={40}
        height={40}
        className="h-10 w-10 object-contain"
        unoptimized
      />
      <div>
        <span className="block text-sm font-semibold text-slate-800 dark:text-slate-100 capitalize">
          {title}
        </span>
        {count !== undefined && (
          <span className="block text-xs text-slate-400 dark:text-slate-500">
            {count} {count === 1 ? "article" : "articles"}
          </span>
        )}
      </div>
    </Link>
  );
}
