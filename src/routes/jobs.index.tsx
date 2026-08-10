import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { contentQueries } from "@/lib/content";
import { SITE } from "@/lib/site";
import { CardSkeleton, EmptyState, PageHeader } from "@/components/site/section";
import { JobCard } from "@/components/site/cards";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/jobs/")({
  head: () => ({
    meta: [
      { title: "Jobs in Rwanda | Latest Vacancies — Eze Pro Developer" },
      {
        name: "description",
        content: "Browse the latest jobs and internships in Rwanda. Filter by category, type and location, then apply before the deadline.",
      },
      { property: "og:title", content: "Latest Jobs in Rwanda — Eze Pro Developer" },
      { property: "og:description", content: "Fresh vacancies, internships and tenders updated regularly." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE.url}/jobs` },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: `${SITE.url}/jobs` }],
  }),
  component: JobsPage,
});

function JobsPage() {
  const { data: jobs = [], isLoading } = useQuery(contentQueries.jobs());
  const [q, setQ] = useState("");
  const [type, setType] = useState("all");
  const [category, setCategory] = useState("all");

  const categories = useMemo(() => Array.from(new Set(jobs.map((j) => j.category))), [jobs]);
  const types = useMemo(() => Array.from(new Set(jobs.map((j) => j.job_type))), [jobs]);

  const filtered = jobs.filter((j) => {
    const term = q.trim().toLowerCase();
    const matches =
      !term ||
      j.title.toLowerCase().includes(term) ||
      j.company.toLowerCase().includes(term) ||
      (j.location ?? "").toLowerCase().includes(term);
    return matches && (type === "all" || j.job_type === type) && (category === "all" || j.category === category);
  });

  return (
    <>
      <PageHeader
        eyebrow="Opportunities"
        title="Jobs & internships in Rwanda"
        description="Updated regularly with vacancies from trusted employers."
      />
      <div className="container-page py-12">
        <div className="grid gap-3 rounded-xl border border-border bg-card p-4 shadow-soft md:grid-cols-[minmax(0,2fr)_1fr_1fr]">
          <div className="relative min-w-0">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              maxLength={100}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search job, company or location"
              className="pl-9"
              aria-label="Search jobs"
            />
          </div>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger aria-label="Filter by job type"><SelectValue placeholder="Job type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              {types.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger aria-label="Filter by category"><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <p className="mt-6 text-sm text-muted-foreground">{filtered.length} opportunities found</p>
        <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading ? <CardSkeleton count={6} /> : filtered.map((j) => <JobCard key={j.id} job={j} />)}
        </div>
        {!isLoading && filtered.length === 0 ? <EmptyState message="No jobs match your filters yet." /> : null}
      </div>
    </>
  );
}
