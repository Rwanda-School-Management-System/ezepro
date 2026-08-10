import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { contentQueries } from "@/lib/content";
import { SITE } from "@/lib/site";
import { CardSkeleton, EmptyState, PageHeader } from "@/components/site/section";
import { ScholarshipCard } from "@/components/site/cards";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/scholarships/")({
  head: () => ({
    meta: [
      { title: "Scholarships for Rwandan Students | Fully Funded & Partial" },
      {
        name: "description",
        content: "Find fully funded and partial scholarships for Rwandan students. Filter by country, degree level and funding type.",
      },
      { property: "og:title", content: "Scholarships for Rwandan Students — Eze Pro Developer" },
      { property: "og:description", content: "Undergraduate, masters and PhD scholarship opportunities with clear deadlines." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE.url}/scholarships` },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: `${SITE.url}/scholarships` }],
  }),
  component: ScholarshipsPage,
});

function ScholarshipsPage() {
  const { data: items = [], isLoading } = useQuery(contentQueries.scholarships());
  const [q, setQ] = useState("");
  const [level, setLevel] = useState("all");
  const [funding, setFunding] = useState("all");

  const levels = useMemo(() => Array.from(new Set(items.map((s) => s.degree_level).filter(Boolean) as string[])), [items]);
  const fundings = useMemo(() => Array.from(new Set(items.map((s) => s.funding_type).filter(Boolean) as string[])), [items]);

  const filtered = items.filter((s) => {
    const term = q.trim().toLowerCase();
    const matches =
      !term ||
      s.title.toLowerCase().includes(term) ||
      s.organization.toLowerCase().includes(term) ||
      (s.country ?? "").toLowerCase().includes(term);
    return matches && (level === "all" || s.degree_level === level) && (funding === "all" || s.funding_type === funding);
  });

  return (
    <>
      <PageHeader
        eyebrow="Opportunities"
        title="Scholarships open to Rwandan students"
        description="Fully funded and partial scholarships, with eligibility and deadlines explained simply."
      />
      <div className="container-page py-12">
        <div className="grid gap-3 rounded-xl border border-border bg-card p-4 shadow-soft md:grid-cols-[minmax(0,2fr)_1fr_1fr]">
          <div className="relative min-w-0">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              maxLength={100}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search scholarship, provider or country"
              className="pl-9"
              aria-label="Search scholarships"
            />
          </div>
          <Select value={level} onValueChange={setLevel}>
            <SelectTrigger aria-label="Filter by degree level"><SelectValue placeholder="Degree level" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All levels</SelectItem>
              {levels.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={funding} onValueChange={setFunding}>
            <SelectTrigger aria-label="Filter by funding"><SelectValue placeholder="Funding" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All funding</SelectItem>
              {fundings.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <p className="mt-6 text-sm text-muted-foreground">{filtered.length} scholarships found</p>
        <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading ? <CardSkeleton count={6} /> : filtered.map((s) => <ScholarshipCard key={s.id} scholarship={s} />)}
        </div>
        {!isLoading && filtered.length === 0 ? <EmptyState message="No scholarships match your filters yet." /> : null}
      </div>
    </>
  );
}
