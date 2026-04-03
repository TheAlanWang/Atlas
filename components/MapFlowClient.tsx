"use client";
import { startTransition, useEffect, useState, type ComponentType } from "react";
import type { RoadmapSection } from "@/lib/mapGraph";

type Props = {
  sections: RoadmapSection[];
  basePath: string;
  activeSlug?: string;
  viewMode?: "map";
};

type MapFlowComponent = ComponentType<Props>;

export default function MapFlowClient(props: Props) {
  const [MapFlow, setMapFlow] = useState<MapFlowComponent | null>(null);

  useEffect(() => {
    let cancelled = false;

    import("./MapFlow").then((mod) => {
      if (cancelled) return;
      startTransition(() => {
        setMapFlow(() => mod.default);
      });
    });

    return () => {
      cancelled = true;
    };
  }, []);

  if (!MapFlow) return null;

  return <MapFlow {...props} />;
}
