import { useMemo } from "react";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

const TONES = ["text-heart-1", "text-heart-2", "text-heart-3", "text-heart-4"];

/** Decorative, non-interactive floating hearts. Respects reduced motion. */
export function FloatingHearts({ count = 14, className }: { count?: number; className?: string }) {
  const hearts = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        left: (i * 37 + 7) % 100,
        size: 12 + ((i * 13) % 26),
        duration: 9 + ((i * 7) % 10),
        delay: -((i * 1.7) % 12),
        tone: TONES[i % TONES.length],
        spin: i % 2 === 0,
      })),
    [count],
  );
  return (
    <div aria-hidden="true" className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      {hearts.map((h, i) => (
        <span
          key={i}
          className={cn("heart-float absolute bottom-[-3rem]", h.tone)}
          style={{
            left: `${h.left}%`,
            animationDuration: `${h.duration}s`,
            animationDelay: `${h.delay}s`,
          }}
        >
          <Heart
            className={cn("heart-glow fill-current", h.spin && "heart-spin")}
            style={{ width: h.size, height: h.size }}
          />
        </span>
      ))}
    </div>
  );
}
