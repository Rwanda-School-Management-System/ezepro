import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Building2, CalendarClock, MapPin, Wallet } from "lucide-react";
import { contentQueries } from "@/lib/content";
import { SITE, formatDate, waLink } from "@/lib/site";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/jobs/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `Job opening: ${params.slug.replace(/-/g, " ")} — Eze Pro Developer` },
      { name: "description", content: "Full job details, requirements and how to apply before the deadline." },
      { property: "og:title", content: `Job opening — Eze Pro Developer` },
      { property: "og:description", content: "Full job details, requirements and application instructions." },
      { property: "og:type", content: "article" },
      { property: "og:url", content: `${SITE.url}/jobs/${params.slug}` },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: `${SITE.url}/jobs/${params.slug}` }],
  }),
  component: JobDetail,
});

function JobDetail() {
  const { slug } = Route.useParams();
  const { data: job, isLoading } = useQuery(contentQueries.bySlug("jobs", slug));

  if (isLoading) return <div className="container-page py-24 text-sm text-muted-foreground">Loading job…</div>;
  if (!job) {
    return (
      <div className="container-page py-24 text-center">
        <h1 className="text-2xl font-bold">Job not found</h1>
        <Button asChild className="mt-6"><Link to="/jobs">Back to jobs</Link></Button>
      </div>
    );
  }

  return (
    <article className="container-page py-12">
      <Link to="/jobs" className="inline-flex items-center text-sm text-muted-foreground hover:text-brand">
        <ArrowLeft className="mr-1 h-4 w-4" /> All jobs
      </Link>

      <header className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-soft sm:p-8">
        <div className="flex flex-wrap gap-2">
          <Badge className="bg-accent text-accent-foreground">{job.job_type}</Badge>
          <Badge variant="secondary">{job.category}</Badge>
          {job.experience_level ? <Badge variant="outline">{job.experience_level}</Badge> : null}
        </div>
        <h1 className="mt-4 text-2xl font-bold sm:text-3xl">{job.title}</h1>
        <div className="mt-4 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
          <p className="flex items-center gap-2"><Building2 className="h-4 w-4 shrink-0" /> {job.company}</p>
          <p className="flex items-center gap-2"><MapPin className="h-4 w-4 shrink-0" /> {job.location ?? "Not specified"}</p>
          <p className="flex items-center gap-2"><Wallet className="h-4 w-4 shrink-0" /> {job.salary ?? "Negotiable"}</p>
          <p className="flex items-center gap-2"><CalendarClock className="h-4 w-4 shrink-0" /> Deadline {formatDate(job.deadline)}</p>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          {job.application_link ? (
            <Button asChild><a href={job.application_link} target="_blank" rel="noreferrer">Apply now</a></Button>
          ) : null}
          <Button asChild variant="outline">
            <Link to="/applications" search={{ service: `Job application: ${job.title}` }}>Let us apply for you</Link>
          </Button>
          <Button asChild variant="ghost">
            <a href={waLink(`Hello, I need help applying for ${job.title} at ${job.company}.`)} target="_blank" rel="noreferrer">
              Ask on WhatsApp
            </a>
          </Button>
        </div>
      </header>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          <section>
            <h2 className="font-display text-xl font-semibold">Job description</h2>
            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{job.description}</p>
          </section>
          {job.requirements ? (
            <section>
              <h2 className="font-display text-xl font-semibold">Requirements</h2>
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{job.requirements}</p>
            </section>
          ) : null}
        </div>
        <aside className="h-fit rounded-2xl border border-border bg-muted/40 p-6">
          <h2 className="font-display text-base font-semibold">Need help applying?</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Our Application Center writes your CV, cover letter and submits the application on your behalf.
          </p>
          <Button asChild className="mt-4 w-full"><Link to="/applications">Start now</Link></Button>
        </aside>
      </div>
    </article>
  );
}
