import { useRef, useState } from "react";
import { FloatingHearts } from "./floating-hearts";
import { Button } from "@/components/ui/button";

const THRESHOLD = 140;
const LEAVES = Array.from({ length: 38 }, (_, i) => ({
  cx: 200 + Math.cos(i * 2.4) * (40 + ((i * 17) % 110)),
  cy: 150 + Math.sin(i * 2.4) * (30 + ((i * 11) % 70)),
  r: 22 + ((i * 7) % 20),
  tone: i % 3,
}));

/** Full-screen tree + rope intro. Pull the rope down (mouse/touch/keyboard) to enter. */
export function RopeIntro({ onDone }: { onDone: () => void }) {
  const [pull, setPull] = useState(0);
  const [sway, setSway] = useState(0);
  const [opening, setOpening] = useState(false);
  const start = useRef<{ y: number; x: number } | null>(null);

  function finish() {
    if (opening) return;
    setOpening(true);
    setPull(THRESHOLD);
    window.setTimeout(onDone, 1100);
  }

  function onDown(e: React.PointerEvent) {
    (e.target as Element).setPointerCapture(e.pointerId);
    start.current = { y: e.clientY, x: e.clientX };
  }
  function onMove(e: React.PointerEvent) {
    if (!start.current || opening) return;
    const dy = Math.max(0, Math.min(THRESHOLD * 1.2, e.clientY - start.current.y));
    setPull(dy);
    setSway(Math.max(-30, Math.min(30, e.clientX - start.current.x)));
    if (dy >= THRESHOLD) finish();
  }
  function onUp() {
    start.current = null;
    if (!opening) {
      setPull(0);
      setSway(0);
    }
  }

  const bend = pull * 0.08;
  const ropeEnd = 330 + pull;
  const intensity = pull / THRESHOLD;

  return (
    <div className="bg-aurora fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden">
      <FloatingHearts count={Math.round(10 + intensity * 16)} />
      {opening && <div aria-hidden="true" className="intro-wave absolute left-1/2 top-1/2 h-24 w-24 rounded-full" />}

      <svg viewBox="0 0 400 560" className="relative h-[78vh] max-h-[640px] w-auto" role="img" aria-label="A magical tree with a rope hanging from a branch">
        <defs>
          <radialGradient id="glow" cx="50%" cy="35%" r="60%">
            <stop offset="0%" stopColor="var(--gold)" stopOpacity="0.45" />
            <stop offset="100%" stopColor="var(--gold)" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="trunk" x1="0" x2="1">
            <stop offset="0%" stopColor="var(--tree-bark-dark)" />
            <stop offset="100%" stopColor="var(--tree-bark)" />
          </linearGradient>
        </defs>
        <circle cx="200" cy="170" r="200" fill="url(#glow)" />
        <path d="M182 560 C186 460 176 360 190 250 L212 250 C222 360 214 460 222 560 Z" fill="url(#trunk)" />
        <path d="M195 300 C150 270 120 250 80 245" stroke="var(--tree-bark)" strokeWidth="12" fill="none" strokeLinecap="round" />
        {/* rope branch reacts to pull */}
        <g style={{ transform: `rotate(${bend}deg)`, transformOrigin: "205px 280px", transition: start.current ? "none" : "transform .5s cubic-bezier(.3,1.6,.5,1)" }}>
          <path d="M205 285 C250 265 285 255 310 250" stroke="var(--tree-bark)" strokeWidth="12" fill="none" strokeLinecap="round" />
          <g className="leaf-sway">
            {LEAVES.map((l, i) => (
              <circle key={i} cx={l.cx} cy={l.cy} r={l.r} fill={`var(--tree-leaf-${l.tone + 1})`} opacity="0.92" />
            ))}
          </g>
          <path
            d={`M300 252 Q ${300 + sway * 0.6} ${(252 + ropeEnd) / 2} ${300 + sway} ${ropeEnd}`}
            stroke="var(--tree-rope)"
            strokeWidth="5"
            strokeDasharray="7 3"
            fill="none"
            strokeLinecap="round"
            style={{ transition: start.current ? "none" : "d .5s cubic-bezier(.3,1.6,.5,1)" }}
          />
          <g
            role="button"
            tabIndex={0}
            aria-label="Pull the rope to enter"
            className="cursor-grab touch-none outline-none active:cursor-grabbing focus-visible:[&>circle]:stroke-ring"
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerCancel={onUp}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") && (e.preventDefault(), finish())}
          >
            <circle cx={300 + sway} cy={ropeEnd + 14} r="26" fill="transparent" />
            <circle cx={300 + sway} cy={ropeEnd + 14} r="14" fill="var(--tree-rope)" stroke="var(--gold)" strokeWidth="3" />
          </g>
        </g>
        {intensity > 0.3 &&
          [0, 1, 2].map((i) => (
            <circle key={i} className="leaf-fall" cx={150 + i * 60} cy={200} r="8" fill={`var(--tree-leaf-${i + 1})`} style={{ animationDelay: `${i * 0.3}s` }} />
          ))}
      </svg>

      <p className="relative mt-2 animate-pulse font-display text-lg font-semibold text-navy-foreground">
        Pull the Rope to Enter
      </p>
      <Button variant="outline" size="sm" onClick={finish} className="relative mt-4 border-white/30 bg-white/10 text-navy-foreground backdrop-blur hover:bg-white/20">
        Skip Intro
      </Button>
    </div>
  );
}
