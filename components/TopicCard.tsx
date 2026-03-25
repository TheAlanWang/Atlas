import Link from "next/link";

type Props = {
  title: string;
  href: string;
};

export default function TopicCard({ title, href }: Props) {
  return (
    <Link href={href} className="group flex flex-col items-center py-4 px-6 shrink-0">
      <img
        src={`/icons/${title.toLowerCase()}.svg`}
        alt={title}
        className="w-12 h-12 mb-3 transition-transform duration-200 hover:scale-110"
      />
      <span className="text-sm text-slate-500 dark:text-slate-400 group-hover:underline">
        {title}
      </span>
    </Link>
  );
}
