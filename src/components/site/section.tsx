import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "max-w-2xl",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      {eyebrow ? (
        <span className="inline-flex items-center rounded-full bg-accent px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand">
          {eyebrow}
        </span>
      ) : null}
      <h2 className="mt-3 text-2xl font-bold sm:text-3xl md:text-4xl">{title}</h2>
      {description ? (
        <p className="mt-3 text-sm text-muted-foreground sm:text-base">{description}</p>
      ) : null}
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <section className="bg-hero-gradient text-navy-foreground">
      <div className="container-page py-14 sm:py-20">
        {eyebrow ? (
          <span className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-gold">
            {eyebrow}
          </span>
        ) : null}
        <h1 className="mt-4 max-w-3xl text-3xl font-bold sm:text-4xl md:text-5xl">{title}</h1>
        {description ? (
          <p className="mt-4 max-w-2xl text-sm text-navy-foreground/80 sm:text-base">{description}</p>
        ) : null}
      </div>
    </section>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-muted/40 p-10 text-center text-sm text-muted-foreground">
      {message}
    </div>
  );
}

export function CardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="h-64 animate-pulse rounded-xl border border-border bg-muted/50" />
      ))}
    </>
  );
}
