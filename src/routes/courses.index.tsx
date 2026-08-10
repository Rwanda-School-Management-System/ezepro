import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { contentQueries } from "@/lib/content";
import { SITE } from "@/lib/site";
import { CardSkeleton, EmptyState, PageHeader } from "@/components/site/section";
import { CourseCard } from "@/components/site/cards";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/courses")({
  head: () => ({
    meta: [
      { title: "Online Courses in Rwanda | Learn Web, Design & Digital Skills" },
      {
        name: "description",
        content: "Practical online courses in web development, graphic design, computer basics and digital marketing. Learn at your own pace.",
      },
      { property: "og:title", content: "Online Courses — Eze Pro Developer" },
      { property: "og:description", content: "Short, job-focused digital skills courses built for Rwandan learners." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE.url}/courses` },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: `${SITE.url}/courses` }],
  }),
  component: CoursesPage,
});

function CoursesPage() {
  const { data: courses = [], isLoading } = useQuery(contentQueries.courses());
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("all");
  const [level, setLevel] = useState("all");

  const categories = useMemo(() => Array.from(new Set(courses.map((c) => c.category))), [courses]);
  const levels = useMemo(() => Array.from(new Set(courses.map((c) => c.level))), [courses]);

  const filtered = courses.filter((c) => {
    const term = q.trim().toLowerCase();
    const matches = !term || c.title.toLowerCase().includes(term) || (c.description ?? "").toLowerCase().includes(term);
    return matches && (category === "all" || c.category === category) && (level === "all" || c.level === level);
  });

  return (
    <>
      <PageHeader
        eyebrow="Learn"
        title="Online courses that lead to real work"
        description="Enroll for free or premium courses and track your progress from your dashboard."
      />
      <div className="container-page py-12">
        <div className="grid gap-3 rounded-xl border border-border bg-card p-4 shadow-soft md:grid-cols-[minmax(0,2fr)_1fr_1fr]">
          <div className="relative min-w-0">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              maxLength={100}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search courses"
              className="pl-9"
              aria-label="Search courses"
            />
          </div>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger aria-label="Filter by category"><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={level} onValueChange={setLevel}>
            <SelectTrigger aria-label="Filter by level"><SelectValue placeholder="Level" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All levels</SelectItem>
              {levels.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading ? <CardSkeleton count={6} /> : filtered.map((c) => <CourseCard key={c.id} course={c} />)}
        </div>
        {!isLoading && filtered.length === 0 ? <EmptyState message="No courses match your search." /> : null}
      </div>
    </>
  );
}
