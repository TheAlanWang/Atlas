export default function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-200 dark:border-slate-800 py-8 text-center">
      <p className="text-sm text-slate-400 dark:text-slate-500">
        © 2026{" "}
        <a
          href="https://www.linkedin.com/in/alanwang166/"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
        >
          Alan Wang
        </a>
      </p>
      <p className="text-xs text-slate-300 dark:text-slate-600 mt-1">
        Built while learning. Shared while building.
      </p>
    </footer>
  );
}
