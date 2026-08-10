import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { contentQueries } from "@/lib/content";
import { Button } from "@/components/ui/button";

export function HeroSlider() {
  const { data: slides = [] } = useQuery(contentQueries.slides());
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (slides.length < 2) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % slides.length), 6500);
    return () => clearInterval(id);
  }, [slides.length]);

  const active = slides[index % Math.max(slides.length, 1)];

  return (
    <section className="relative overflow-hidden bg-hero-gradient text-navy-foreground">
      <div className="container-page relative grid min-h-[520px] items-center gap-10 py-16 lg:grid-cols-2 lg:py-24">
        <div className="relative z-10 min-w-0">
          <span className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-gold">
            Kigali, Rwanda
          </span>
          <h1 key={active?.id ?? "fallback"} className="mt-5 animate-fade-up text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
            {active?.title ?? "Technology, Education and Opportunities in One Place"}
          </h1>
          <p className="mt-5 max-w-xl text-sm text-navy-foreground/80 sm:text-base">
            {active?.subtitle ??
              "We build websites and apps, repair computers, teach practical digital skills and connect you to jobs and scholarships."}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="bg-gold text-gold-foreground hover:opacity-90">
              <a href={active?.button_url ?? "/services"}>{active?.button_text ?? "Explore services"}</a>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/30 bg-transparent text-navy-foreground hover:bg-white/10 hover:text-navy-foreground"
            >
              <a href={active?.secondary_button_url ?? "/courses"}>
                {active?.secondary_button_text ?? "Start learning"}
              </a>
            </Button>
          </div>

          {slides.length > 1 ? (
            <div className="mt-10 flex items-center gap-3">
              <button
                aria-label="Previous slide"
                onClick={() => setIndex((i) => (i - 1 + slides.length) % slides.length)}
                className="grid h-9 w-9 place-items-center rounded-full border border-white/25 hover:bg-white/10"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <div className="flex gap-2">
                {slides.map((s, i) => (
                  <button
                    key={s.id}
                    aria-label={`Go to slide ${i + 1}`}
                    onClick={() => setIndex(i)}
                    className={`h-1.5 rounded-full transition-all ${
                      i === index ? "w-8 bg-gold" : "w-3 bg-white/30"
                    }`}
                  />
                ))}
              </div>
              <button
                aria-label="Next slide"
                onClick={() => setIndex((i) => (i + 1) % slides.length)}
                className="grid h-9 w-9 place-items-center rounded-full border border-white/25 hover:bg-white/10"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          ) : null}
        </div>

        <div className="relative hidden lg:block">
          <div className="aspect-[4/3] overflow-hidden rounded-3xl border border-white/15 bg-white/5 shadow-lift">
            {active?.image_url ? (
              <img
                key={active.id}
                src={active.image_url}
                alt={active.title}
                className="h-full w-full animate-fade-in object-cover"
              />
            ) : null}
          </div>
          <Link
            to="/applications"
            className="absolute -bottom-6 left-8 rounded-2xl bg-card p-5 text-card-foreground shadow-lift"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-brand">Application Center</p>
            <p className="mt-1 text-sm font-medium">We apply for jobs & scholarships for you</p>
          </Link>
        </div>
      </div>
    </section>
  );
}
