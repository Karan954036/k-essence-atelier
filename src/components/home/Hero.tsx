import { Link } from "@tanstack/react-router";
import { ClientOnly } from "@tanstack/react-router";
import { Suspense, lazy, useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";

/** 3D stage is loaded only in the browser, after hydration, to keep TTI low. */
const BottleStage = lazy(() => import("@/components/three/BottleStage"));

function useAllowMotion() {
  const [ok, setOk] = useState(true);
  useEffect(() => {
    setOk(!window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);
  return ok;
}

function StaticBottleFallback() {
  return (
    <div
      className="absolute inset-0"
      style={{
        background:
          "radial-gradient(45% 40% at 50% 45%, oklch(0.4 0.07 68) 0%, transparent 70%)",
      }}
    />
  );
}

export function Hero() {
  const allowMotion = useAllowMotion();

  return (
    <section className="relative flex min-h-[92vh] items-center overflow-hidden">
      <div className="absolute inset-0">
        {allowMotion ? (
          <ClientOnly fallback={<StaticBottleFallback />}>
            <Suspense fallback={<StaticBottleFallback />}>
              <BottleStage variant="hero" className="h-full w-full" />
            </Suspense>
          </ClientOnly>
        ) : (
          <StaticBottleFallback />
        )}
      </div>

      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, oklch(0.11 0.006 60 / 55%) 0%, transparent 35%, oklch(0.09 0.005 60 / 80%) 100%)",
        }}
      />

      <div className="relative mx-auto w-full max-w-7xl px-4 py-24 lg:px-8">
        <div className="reveal max-w-xl">
          <p className="eyebrow">K ESSENCE</p>
          <h1 className="mt-5 font-display text-4xl leading-[1.05] text-ivory sm:text-5xl lg:text-6xl xl:text-7xl">
            THE ART OF
            <br />
            <span className="text-gold-gradient">FRAGRANCE</span>
          </h1>
          <p className="mt-6 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
            Crafted for those who leave a trace.
          </p>
          <div className="mt-9 flex flex-wrap gap-4">
            <Link
              to="/"
              className="light-sweep inline-flex items-center rounded-sm border border-gold/60 bg-gold/10 px-7 py-3.5 text-[0.7rem] tracking-[0.24em] text-champagne uppercase transition hover:bg-gold/20"
            >
              Explore Collection
            </Link>
            <Link
              to="/"
              className="inline-flex items-center rounded-sm border border-border px-7 py-3.5 text-[0.7rem] tracking-[0.24em] text-foreground/80 uppercase transition hover:border-gold/50 hover:text-gold"
            >
              Discover Attars
            </Link>
          </div>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-7 flex flex-col items-center gap-2 text-muted-foreground">
        <span className="text-[0.55rem] tracking-[0.34em] uppercase">Scroll</span>
        <ChevronDown className="h-4 w-4 animate-bounce text-gold/70" />
      </div>
    </section>
  );
}
