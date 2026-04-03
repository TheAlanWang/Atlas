"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

type Props = {
  svgContent: string;
  title: string;
};

const MIN_SCALE = 0.6;
const MAX_SCALE = 4;
const ZOOM_STEP = 0.08;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function normalizeSvgMarkup(svgContent: string) {
  return svgContent.replace(/<svg\b([^>]*)>/i, (match, attrs) => {
    const withoutSize = attrs
      .replace(/\swidth="[^"]*"/i, "")
      .replace(/\sheight="[^"]*"/i, "")
      .trim();

    return `<svg ${withoutSize} preserveAspectRatio="xMidYMid meet">`;
  });
}

export default function SketchViewer({ svgContent, title }: Props) {
  const normalizedSvg = useMemo(
    () => normalizeSvgMarkup(svgContent),
    [svgContent],
  );
  const [open, setOpen] = useState(false);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragState = useRef<{
    x: number;
    y: number;
    startX: number;
    startY: number;
  } | null>(null);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function resetView() {
    setScale(1);
    setOffset({ x: 0, y: 0 });
  }

  function zoomBy(delta: number) {
    setScale((current) =>
      clamp(Number((current + delta).toFixed(2)), MIN_SCALE, MAX_SCALE),
    );
  }

  function openViewer() {
    resetView();
    setOpen(true);
  }

  function handleWheel(event: React.WheelEvent<HTMLDivElement>) {
    event.preventDefault();
    zoomBy(event.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP);
  }

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    dragState.current = {
      x: offset.x,
      y: offset.y,
      startX: event.clientX,
      startY: event.clientY,
    };
    setDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (!dragState.current) return;

    const nextX =
      dragState.current.x + event.clientX - dragState.current.startX;
    const nextY =
      dragState.current.y + event.clientY - dragState.current.startY;
    setOffset({ x: nextX, y: nextY });
  }

  function handlePointerUp(event: React.PointerEvent<HTMLDivElement>) {
    if (!dragState.current) return;
    dragState.current = null;
    setDragging(false);
    event.currentTarget.releasePointerCapture(event.pointerId);
  }

  return (
    <>
      <div className="space-y-4">
        <button
          type="button"
          onClick={openViewer}
          className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:text-slate-900 dark:border-slate-800 dark:text-slate-300 dark:hover:border-slate-700 dark:hover:text-white"
        >
          Open Viewer
        </button>

        <button
          type="button"
          onClick={openViewer}
          className="block w-full cursor-zoom-in rounded-[24px] bg-white p-3 text-left transition-transform hover:scale-[1.01] dark:bg-slate-900 sm:p-4"
          aria-label={`Open viewer for ${title}`}
        >
          <div
            className="mx-auto max-w-[1180px] [&_svg]:mx-auto [&_svg]:block [&_svg]:h-auto [&_svg]:max-w-full [&_svg]:w-full"
            dangerouslySetInnerHTML={{ __html: normalizedSvg }}
          />
        </button>
      </div>

      {open &&
        createPortal(
          <div
            className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          >
            <div
              className="flex h-full flex-col"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center justify-between gap-4 border-b border-white/10 px-4 py-3 sm:px-6">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                    Viewer
                  </p>
                  <h2 className="text-lg font-semibold text-white">{title}</h2>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => zoomBy(-ZOOM_STEP)}
                    className="rounded-full border border-white/10 px-3 py-1.5 text-sm font-semibold text-slate-200 transition-colors hover:border-white/20 hover:text-white"
                  >
                    -
                  </button>
                  <button
                    type="button"
                    onClick={resetView}
                    className="rounded-full border border-white/10 px-3 py-1.5 text-sm font-semibold text-slate-200 transition-colors hover:border-white/20 hover:text-white"
                  >
                    Reset
                  </button>
                  <button
                    type="button"
                    onClick={() => zoomBy(ZOOM_STEP)}
                    className="rounded-full border border-white/10 px-3 py-1.5 text-sm font-semibold text-slate-200 transition-colors hover:border-white/20 hover:text-white"
                  >
                    +
                  </button>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="rounded-full border border-white/10 px-3 py-1.5 text-sm font-semibold text-slate-200 transition-colors hover:border-white/20 hover:text-white"
                  >
                    Close
                  </button>
                </div>
              </div>

              <div
                className="flex-1 overflow-hidden px-4 py-4 sm:px-6 sm:py-6"
                onWheel={handleWheel}
              >
                <div
                  className="flex h-full items-center justify-center overflow-hidden rounded-[28px] border border-white/10 bg-white dark:bg-slate-900"
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerCancel={handlePointerUp}
                  onDoubleClick={resetView}
                  style={{ cursor: dragging ? "grabbing" : "grab" }}
                >
                  <div
                    className="[&_svg]:block [&_svg]:h-auto [&_svg]:w-[min(90vw,1400px)] [&_svg]:max-w-none"
                    style={{
                      transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
                      transformOrigin: "center center",
                      transition: dragging
                        ? "none"
                        : "transform 120ms ease-out",
                    }}
                    dangerouslySetInnerHTML={{ __html: normalizedSvg }}
                  />
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
