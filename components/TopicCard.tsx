import Link from "next/link";

type Props = {
  title: string;
  description: string;
  href: string;
};

export default function TopicCard({ title, description, href }: Props) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center p-4 w-32 flex-shrink-0"
    >
      <img
        src={`/icons/${title.toLowerCase()}.svg`}
        alt={title}
        className="w-12 h-12 mb-2"
      />
      <span className="text-sm font-medium text-slate-700 hover:underline hover:decoration-1 hover:underline-offset-2 transition-all">
        {title}
      </span>
    </Link>
  );
}
