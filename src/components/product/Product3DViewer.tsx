import { useState, useRef, Suspense } from "react";
import { Box, Sparkles, RotateCcw, Eye } from "lucide-react";
import BottleStage from "@/components/three/BottleStage";
import { cn } from "@/lib/utils";

type Product3DViewerProps = {
  name: string;
  tint: string;
  modelUrl?: string | null;
  badge?: string | null;
  family: string;
};

export function Product3DViewer({ name, tint, modelUrl, badge, family }: Product3DViewerProps) {
  const [mode, setMode] = useState<"3d" | "studio">("3d");
  const [resetKey, setResetKey] = useState(0);

  const handleResetCamera = () => {
    setResetKey((prev) => prev + 1);
  };

  return (
    <div className="relative flex flex-col overflow-hidden rounded-sm border border-border bg-card/40">
      {/* Visual Canvas / Frame */}
      <div className="relative aspect-square w-full sm:aspect-4/5 overflow-hidden">
        {mode === "3d" ? (
          <div className="relative h-full w-full">
            {/* 3D Canvas */}
            <Suspense
              fallback={
                <div className="flex h-full w-full items-center justify-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold border-t-transparent" />
                    <span className="eyebrow text-[0.6rem]">Loading 3D Showroom...</span>
                  </div>
                </div>
              }
            >
              <BottleStage
                key={resetKey}
                modelUrl={modelUrl ?? undefined}
                tint={tint}
                variant="viewer"
                controls={true}
                className="h-full w-full cursor-grab active:cursor-grabbing"
              />
            </Suspense>

            {/* Viewer Floating Controls */}
            <div className="pointer-events-none absolute inset-x-0 bottom-4 flex items-center justify-between px-4 z-20">
              <span className="pointer-events-auto inline-flex items-center gap-1.5 rounded-sm border border-border/80 bg-obsidian/85 px-3 py-1.5 text-[0.6rem] tracking-[0.18em] text-muted-foreground uppercase backdrop-blur-md">
                <Box className="h-3.5 w-3.5 text-gold" />
                {modelUrl ? "Verified 3D Scan" : "Interactive 3D Flacon"}
              </span>

              <button
                type="button"
                onClick={handleResetCamera}
                title="Reset Camera View"
                className="pointer-events-auto inline-flex items-center gap-1 rounded-sm border border-border/80 bg-obsidian/85 px-2.5 py-1.5 text-[0.6rem] tracking-[0.16em] text-foreground/80 uppercase backdrop-blur-md transition hover:border-gold/50 hover:text-gold"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Reset</span>
              </button>
            </div>
          </div>
        ) : (
          /* Studio Visual Mode */
          <div className="light-sweep relative h-full w-full flex items-center justify-center overflow-hidden">
            <div
              className="absolute inset-0 transition-transform duration-1000"
              style={{
                background: `radial-gradient(70% 65% at 50% 35%, ${tint} 0%, oklch(0.12 0.008 60) 75%)`,
              }}
            />
            {/* Atmospheric rays */}
            <div
              className="pointer-events-none absolute inset-0 opacity-40"
              style={{
                background:
                  "radial-gradient(ellipse 60% 40% at 50% 20%, oklch(0.78 0.13 82 / 20%), transparent 70%)",
              }}
            />
            {/* Luxury bottle silhouette representation */}
            <div className="relative flex h-[58%] w-[32%] flex-col items-center justify-center rounded-[14%/8%] border border-champagne/35 shadow-2xl backdrop-blur-sm">
              <div
                className="absolute inset-0 rounded-[14%/8%]"
                style={{
                  background:
                    "linear-gradient(155deg, oklch(1 0 0 / 22%), transparent 40%, oklch(1 0 0 / 10%))",
                }}
              />
              <div className="-mt-8 h-6 w-1/3 rounded-xs border border-gold/40 bg-gold/80 shadow-md" />
              <div className="my-auto text-center px-2">
                <p className="font-display text-sm tracking-widest text-champagne">{name}</p>
                <p className="eyebrow mt-1 text-[0.5rem]">{family}</p>
              </div>
            </div>

            <div className="absolute inset-x-0 bottom-4 flex justify-center z-20">
              <span className="inline-flex items-center gap-1.5 rounded-sm border border-border/80 bg-obsidian/85 px-3 py-1.5 text-[0.6rem] tracking-[0.18em] text-muted-foreground uppercase backdrop-blur-md">
                <Sparkles className="h-3.5 w-3.5 text-gold" />
                Studio Presentation
              </span>
            </div>
          </div>
        )}

        {/* Top Badges */}
        <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-4 z-20">
          {badge ? (
            <span className="rounded-sm border border-gold/40 bg-obsidian/80 px-2.5 py-1 text-[0.6rem] tracking-[0.2em] text-gold-soft uppercase backdrop-blur-md">
              {badge}
            </span>
          ) : (
            <span />
          )}
          <span className="rounded-sm border border-border/60 bg-obsidian/80 px-2.5 py-1 text-[0.6rem] tracking-[0.16em] text-muted-foreground uppercase backdrop-blur-md">
            K ESSENCE ATELIER
          </span>
        </div>
      </div>

      {/* Mode Switcher Bar */}
      <div className="grid grid-cols-2 border-t border-border bg-charcoal/40 p-1.5">
        <button
          type="button"
          onClick={() => setMode("3d")}
          className={cn(
            "flex items-center justify-center gap-2 rounded-xs py-2 text-[0.65rem] tracking-[0.2em] uppercase transition",
            mode === "3d"
              ? "border border-gold/40 bg-obsidian text-champagne shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <Box className="h-3.5 w-3.5 text-gold" />
          <span>3D Experience</span>
        </button>
        <button
          type="button"
          onClick={() => setMode("studio")}
          className={cn(
            "flex items-center justify-center gap-2 rounded-xs py-2 text-[0.65rem] tracking-[0.2em] uppercase transition",
            mode === "studio"
              ? "border border-gold/40 bg-obsidian text-champagne shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <Eye className="h-3.5 w-3.5 text-gold" />
          <span>Studio Visual</span>
        </button>
      </div>

      {/* Helpful hint */}
      <div className="border-t border-border/60 bg-obsidian/70 px-4 py-2 text-center text-[0.65rem] text-muted-foreground/70">
        {mode === "3d"
          ? "Drag to rotate in 360° • Pinch or scroll to zoom"
          : "Crafted flacon architecture designed for light refraction"}
      </div>
    </div>
  );
}
