"use client";
import { useState } from "react";
import type { ReactNode } from "react";
import TableOfContents from "./TableOfContents";

type Heading = { level: 2 | 3; text: string; id: string };

type Props = {
  title: string;
  date: string;
  enContent: ReactNode;
  cnContent: ReactNode;
  enHeadings: Heading[];
  cnHeadings: Heading[];
};

export default function LangToggle({ title, date, enContent, cnContent, enHeadings = [], cnHeadings = [] }: Props) {
  const [lang, setLang] = useState<"en" | "cn">("en");
  const headings = lang === "en" ? enHeadings : cnHeadings;

  return (
    <div className="flex gap-8 mt-6">
      <div className="flex-1 min-w-0">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          {title}
        </h1>
        <div className="flex items-center justify-between mt-1 mb-6">
          <p className="text-sm text-slate-400">{date}</p>
          <button
            onClick={() => setLang(lang === "en" ? "cn" : "en")}
            className="text-xs px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {lang === "en" ? "CN" : "EN"}
          </button>
        </div>
        {lang === "en" ? enContent : cnContent}
      </div>
      <TableOfContents headings={headings} />
    </div>
  );
}
