import { getAllKnowledgeArticles } from "@/lib/knowledge";
import KnowledgeCard from "@/components/KnowledgeCard";

export default async function KnowledgePage() {
  const articles = await getAllKnowledgeArticles();

  // Group by topic
  const grouped = articles.reduce<Record<string, typeof articles>>((acc, article) => {
    if (!acc[article.topic]) acc[article.topic] = [];
    acc[article.topic].push(article);
    return acc;
  }, {});

  return (
    <div className="max-w-6xl mx-auto">
      <p className="text-xs font-semibold tracking-widest uppercase text-slate-400 mb-3">Archive</p>
      <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-12" style={{ letterSpacing: "-0.02em" }}>
        Knowledge
      </h1>

      {articles.length === 0 ? (
        <p className="text-slate-400">No knowledge articles yet.</p>
      ) : (
        <div className="space-y-12">
          {Object.entries(grouped).map(([topic, topicArticles]) => (
            <section key={topic}>
              <h2 className="text-xs font-semibold tracking-widest uppercase text-slate-400 dark:text-slate-500 mb-2 capitalize">
                {topic}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-6">
                {topicArticles.map((article) => (
                  <KnowledgeCard key={article.slug} article={article} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
