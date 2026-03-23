import Link from 'next/link'

type Props = {
  title: string
  description: string
  href: string
  emoji: string
}

export default function TopicCard({ title, description, href, emoji }: Props) {
  return (
    <Link href={href} className="block rounded-xl border-2 border-slate-200 bg-white p-6 hover:border-blue-300 transition-colors">
      <div className="text-3xl mb-3">{emoji}</div>
      <h2 className="text-lg font-bold text-slate-800 mb-1">{title}</h2>
      <p className="text-sm text-slate-500">{description}</p>
    </Link>
  )
}