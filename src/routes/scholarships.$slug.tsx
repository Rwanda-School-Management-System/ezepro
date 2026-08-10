import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, CalendarClock, Globe2, GraduationCap, Landmark } from "lucide-react";
import { contentQueries } from "@/lib/content";
import { SITE, formatDate, waLink } from "@/lib/site";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/scholarships/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `Scholarship: ${params.slug.replace(/-/g, " ")} — Eze Pro Developer` },
      { name: "description", content: "Eligibility, benefits, required documents and how to apply for this scholarship." },
      { property: "og:title", content: "Scholarship details — Eze Pro Developer" },
      { property: "og:description", content: "Eligibility, benefits and application instructions." },
      { property: "og:type", content: "article" },
      { property: "og:url", content: `${SITE.url}/scholarships/${params.slug}` },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: `${SITE.url}/scholarships/${params.slug}` }],
  }),
  component: ScholarshipDetail,
});

function ScholarshipDetail() {
  const { slug } = Route.useParams();
  const { data: item, isLoading } = useQuery(contentQueries.bySlug("scholarships", slug));

  if (isLoading) return <div className="container-page py-24 text-sm text-muted-foreground">Loading scholarship…</div>;
  if (!item) {
    return (
      <div className="container-page py-24 text-center">
        <h1 className="text-2xl font-bold">Scholarship not found</h1>
        <Button asChild className="mt-6"><Link to="/scholarships">Back to scholarships</Link></Button>
      </div>
    );
  }

  const sections = [
    { title: "Eligibility", body: item.eligibility },
    { title: "Benefits", body: item.benefits },
    { title: "Required documents", body: item.requirements },
    { title: "How to apply", body: item.instructions },
  ].filter((s) => s.body);

  return (
    <article className="container-page py-12">
      <Link to="/scholarships" className="inline-flex items-center text-sm text-muted-foreground hover:text-brand">
        <ArrowLeft className="mr-1 h-4 w-4" /> All scholarships
      </Link>

      <header className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-soft sm:p-8">
        <div className="flex flex-wrap gap-2">
          <Badge className="bg-leaf text-leaf-foreground">{item.funding_type ?? "Scholarship"}</Badge>
          <Badge variant="secondary">{item.category}</Badge>
        </div>
        <h1 className="mt-4 text-2xl font-bold sm:text-3xl">{item.title}</h1>
        <div className="mt-4 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
          <p className="flex items-center gap-2"><Landmark className="h-4 w-4 shrink-0" /> {item.organization}</p>
          <p className="flex items-center gap-2"><Globe2 className="h-4 w-4 shrink-0" /> {item.country ?? "International"}</p>
          <p className="flex items-center gap-2"><GraduationCap className="h-4 w-4 shrink-0" /> {item.degree_level ?? "Any level"}</p>
          <p className="flex items-center gap-2"><CalendarClock className="h-4 w-4 shrink-0" /> Deadline {formatDate(item.deadline)}</p>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          {item.application_link ? (
            <Button asChild><a href={item.application_link} target="_blank" rel="noreferrer">Apply now</a></Button>
          ) : null}
          <Button asChild variant="outline">
            <Link to="/applications" search={{ service: `Scholarship application: ${item.title}` }}>Let us apply for you</Link>
          </Button>
          <Button asChild variant="ghost">
            <a href={waLink(`Hello, I need help applying for the ${item.title} scholarship.`)} target="_blank" rel="noreferrer">
              Ask on WhatsApp
            </a>
          </Button>
        </div>
      </header>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          {sections.map((s) => (
            <section key={s.title}>
              <h2 className="font-display text-xl font-semibold">{s.title}</h2>
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{s.body}</p>
            </section>
          ))}
        </div>
        <aside className="h-fit rounded-2xl border border-border bg-muted/40 p-6">
          <h2 className="font-display text-base font-semibold">Application support</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            We help with motivation letters, document scanning and full submission.
          </p>
          <Button asChild className="mt-4 w-full"><Link to="/applications">Request support</Link></Button>
        </aside>
      </div>
    </article>
  );
}
