"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTransition } from "react";
import { LayoutList, Map } from "lucide-react";

type Props = { activeView: "list" | "map" };

export default function ViewToggle({ activeView }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  function switchTo(view: "list" | "map") {
    const params = new URLSearchParams(searchParams.toString());
    if (view === "list") params.delete("view");
    else params.set("view", "map");
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  return (
    <div className={`flex items-center gap-1 p-1 rounded-lg bg-slate-100 dark:bg-slate-800 transition-opacity ${isPending ? "opacity-50" : "opacity-100"}`}>
      <button
        onClick={() => switchTo("list")}
        disabled={isPending}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
          activeView === "list"
            ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
            : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
        }`}
      >
        <LayoutList size={14} />
        List
      </button>
      <button
        onClick={() => switchTo("map")}
        disabled={isPending}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
          activeView === "map"
            ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
            : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
        }`}
      >
        <Map size={14} />
        Map
      </button>
    </div>
  );
}
