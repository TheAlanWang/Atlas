import Link from "next/link";
import { notFound } from "next/navigation";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import TableOfContents from "@/components/TableOfContents";
import { extractHeadings } from "@/lib/utils";
import { getAllProjectSlugs, getProject } from "@/lib/projects";

type Props = {
  params: Promise<{ project: string }>;
};

export async function generateStaticParams() {
  const projects = await getAllProjectSlugs();
  return projects.map((project) => ({ project }));
}

export default async function ProjectPage({ params }: Props) {
  const { project: slug } = await params;
  const project = await getProject(slug);

  if (!project) notFound();

  const headings = extractHeadings(project.content);

  return (
    <div className="mx-auto grid w-full max-w-[1360px] gap-8 xl:grid-cols-[minmax(0,1fr)_160px]">
      <article className="min-w-0">
        <div className="max-w-[980px]">
          <div className="mb-8">
            <Link
              href="/projects"
              className="text-sm font-semibold text-slate-500 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            >
              ← Back to Projects
            </Link>
          </div>

          <div className="flex flex-wrap gap-2 mb-5">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-slate-200 dark:border-slate-800 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400"
              >
                {tag}
              </span>
            ))}
          </div>

          <h1 className="text-4xl sm:text-5xl font-black tracking-[-0.03em] text-slate-900 dark:text-white">
            {project.title}
          </h1>

          <MarkdownRenderer
            content={project.content}
            imageBasePath={`/projects/${project.slug}/assets`}
          />
        </div>
      </article>

      <TableOfContents headings={headings} />
    </div>
  );
}
