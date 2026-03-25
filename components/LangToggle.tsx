"use client";
import { useState } from "react";
import type { ReactNode } from "react";

type Props = {
  title: string;
  date: string;
  enContent: ReactNode;
  cnContent: ReactNode;
};

export default function LangToggle({
  title,
  date,
  enContent,
  cnContent,
}: Props) {
  const [lang, setLang] = useState<"en" | "cn">("en");

  return (
    <>
      <div className="flex items-center justify-between mt-1">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          {title}
        </h1>
        <button
          onClick={() => setLang(lang === "en" ? "cn" : "en")}
          className="text-xs px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          {lang === "en" ? "CN" : "EN"}
        </button>
      </div>
      <p className="text-sm text-slate-400 mt-1">{date}</p>
      <div className="mt-6">
        {lang === "en" ? enContent : cnContent}
      </div>
    </>
  );
}
