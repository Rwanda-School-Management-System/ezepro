import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { contentQueries } from "@/lib/content";
import { SITE } from "@/lib/site";
import { CardSkeleton, EmptyState, PageHeader } from "@/components/site/section";
import { PostCard } from "@/components/site/cards";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/blog")({
  head: () => ({
    meta: [
      { title: "Blog | Tech, Career & Scholarship Guides — Eze Pro Developer" },
      {
        name: "description",
        content: "Practical guides on technology, job hunting, scholarships and digital skills for Rwandan youth and businesses.",
      },
      { property: "og:title", content: "Blog — Eze Pro Developer" },
      { property: "og:description", content: "News, tips and guides on tech, careers and education in Rwanda." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE.url}/blog` },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: `${SITE.url}/blog` }],
  }),
  component: BlogPage,
});

function BlogPage() {
  const { data: posts = [], isLoading } = useQuery(contentQueries.posts());
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("all");
  const categories = useMemo(() => Array.from(new Set(posts.map((p) => p.category))), [posts]);

  const filtered = posts.filter((p) => {
    const term = q.trim().toLowerCase();
    const matches = !term || p.title.toLowerCase().includes(term) || (p.excerpt ?? "").toLowerCase().includes(term);
    return matches && (category === "all" || p.category === category);
  });

  return (
    <>
      <PageHeader eyebrow="Blog" title="News, tips and practical guides" description="Written to help you build, learn and grow." />
      <div className="container-page py-12">
        <div className="grid gap-3 rounded-xl border border-border bg-card p-4 shadow-soft md:grid-cols-[minmax(0,2fr)_1fr]">
          <div className="relative min-w-0">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} maxLength={100} onChange={(e) => setQ(e.target.value)} placeholder="Search articles" className="pl-9" aria-label="Search articles" />
          </div>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger aria-label="Filter by category"><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading ? <CardSkeleton count={6} /> : filtered.map((p) => <PostCard key={p.id} post={p} />)}
        </div>
        {!isLoading && filtered.length === 0 ? <EmptyState message="No articles found." /> : null}
      </div>
    </>
  );
}
