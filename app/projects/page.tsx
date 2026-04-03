import Image from "next/image";
import Link from "next/link";
import { getAllProjects } from "@/lib/projects";

const PAGE_CLASS = "max-w-7xl mx-auto";
const LIST_CLASS = "space-y-14";

// Full-width project row with editorial dividers instead of card chrome.
const PROJECT_ROW_CLASS =
  "group block border-t border-black/6 pt-10 first:border-t-0 first:pt-0 transition-colors duration-300 hover:border-slate-300 dark:border-white/10 dark:hover:border-slate-700";

// Desktop: text on the left, a restrained diagram column on the right.
const PROJECT_LAYOUT_CLASS =
  "grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(320px,520px)] lg:items-start xl:grid-cols-[minmax(0,1fr)_minmax(360px,560px)]";

// Keep copy readable and let the row read like an editorial spread.
const PROJECT_TEXT_COLUMN_CLASS =
  "min-w-0 max-w-2xl";

// Constrain the diagram so it does not overpower the copy block.
const PROJECT_IMAGE_COLUMN_CLASS =
  "min-w-0 lg:justify-self-end";

const TAG_LIST_CLASS = "flex flex-wrap gap-2 mb-4";
const TAG_CLASS =
  "rounded-full border border-slate-200 dark:border-slate-800 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400";

const TITLE_CLASS =
  "text-2xl font-black tracking-[-0.02em] text-slate-900 dark:text-white mb-3 transition-colors duration-300 group-hover:text-blue-600 dark:group-hover:text-blue-400";

const DATE_CLASS =
  "mb-4 text-sm font-medium text-slate-400 dark:text-slate-500";

const EXCERPT_CLASS = "text-sm leading-6 text-slate-600 dark:text-slate-300";

const ARCHITECTURE_IMAGE_CLASS =
  "block h-auto w-full rounded-[20px] object-contain object-center transition-transform duration-300 group-hover:scale-[1.015]";

export default async function ProjectsPage() {
  const projects = await getAllProjects();

  return (
    <div className={PAGE_CLASS}>
      <p className="text-xs font-semibold tracking-widest uppercase text-slate-400 dark:text-slate-500 mb-3">
        Work
      </p>
      <h1
        className="text-4xl font-black text-slate-900 dark:text-white mb-12"
        style={{ letterSpacing: "-0.02em" }}
      >
        Projects
      </h1>

      <div className={LIST_CLASS}>
        {projects.map((project, index) => (
          <Link
            key={project.slug}
            href={`/projects/${project.slug}`}
            className={PROJECT_ROW_CLASS}
          >
            {/* Two-column layout on desktop: content left, architecture preview right. */}
            <div className={PROJECT_LAYOUT_CLASS}>
              <div className={PROJECT_TEXT_COLUMN_CLASS}>
                <div className={TAG_LIST_CLASS}>
                  {project.tags.map((tag) => (
                    <span key={tag} className={TAG_CLASS}>
                      {tag}
                    </span>
                  ))}
                </div>
                <h2 className={TITLE_CLASS}>{project.title}</h2>
                <p className={DATE_CLASS}>{project.date}</p>
                <p className={EXCERPT_CLASS} style={{ textAlign: "justify" }}>
                  {project.excerpt}
                </p>
              </div>

              {project.architectureSrc && (
                <div className={PROJECT_IMAGE_COLUMN_CLASS}>
                  <Image
                    src={project.architectureSrc}
                    alt={`${project.title} architecture`}
                    className={ARCHITECTURE_IMAGE_CLASS}
                    width={620}
                    height={420}
                    sizes="(min-width: 1280px) 560px, (min-width: 1024px) 40vw, 100vw"
                    loading={index === 0 ? "eager" : "lazy"}
                    fetchPriority={index === 0 ? "high" : "auto"}
                    unoptimized
                  />
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
