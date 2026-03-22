import Link from 'next/link'

export default function Header() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-lg font-bold text-slate-900">
          Atlas
        </Link>
        <nav className="flex gap-6">
          <Link href="/python" className="text-sm text-slate-600 hover:text-slate-900">Python</Link>
          <Link href="/react" className="text-sm text-slate-600 hover:text-slate-900">React</Link>
          <Link href="/posts" className="text-sm text-slate-600 hover:text-slate-900">All Posts</Link>
        </nav>
      </div>
    </header>
  )
}