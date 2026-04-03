import { getAllTopics } from "@/lib/knowledge";
import { notFound } from "next/navigation";
import MapFlowClient from "@/components/MapFlowClient";
import { buildGraph, PAD } from "@/lib/mapGraph";
import fs from "fs";
import path from "path";

type Props = {
  params: Promise<{ topic: string }>;
};

export async function generateStaticParams() {
  const topics = await getAllTopics();
  return topics.map((topic) => ({ topic }));
}

function getRoadmap(topic: string) {
  const filePath = path.join(process.cwd(), "content", "roadmaps", `${topic}.json`);
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

export default async function MapPage({ params }: Props) {
  const { topic } = await params;
  const roadmap = getRoadmap(topic);
  if (!roadmap) notFound();

  const { graphH } = buildGraph(roadmap.sections, `/${topic}`);
  const canvasH = Math.ceil(graphH + PAD * 2);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <div className="px-4 sm:px-6 py-4 border-b border-slate-100 dark:border-slate-800">
        <span className="text-sm font-semibold text-slate-900 dark:text-white capitalize">
          {topic} Roadmap
        </span>
      </div>
      <div className="flex justify-center px-4 sm:px-6 py-6 sm:py-8">
        <div className="w-full max-w-[480px]" style={{ height: canvasH }}>
          <MapFlowClient sections={roadmap.sections} basePath={`/${topic}`} />
        </div>
      </div>
    </div>
  );
}
