import { createFileRoute, Link } from "@tanstack/react-router";
import { Award, Eye, HeartHandshake, Target } from "lucide-react";
import { SITE } from "@/lib/site";
import { PageHeader, SectionHeading } from "@/components/site/section";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Eze Pro Developer | Technology & Education in Rwanda" },
      { name: "description", content: "Learn about Eze Pro Developer — a Kigali-based team building technology, teaching digital skills and opening opportunities for Rwandan youth." },
      { property: "og:title", content: "About Eze Pro Developer" },
      { property: "og:description", content: "Our mission, vision and values as a Rwandan technology and education company." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE.url}/about` },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: `${SITE.url}/about` }],
  }),
  component: AboutPage,
});

const values = [
  { icon: Target, title: "Our mission", body: "Make technology, quality education and real opportunities accessible to every Rwandan." },
  { icon: Eye, title: "Our vision", body: "A generation of digitally skilled young people building solutions for Africa." },
  { icon: HeartHandshake, title: "Our values", body: "Honesty, quality work, patience with beginners and long-term relationships." },
  { icon: Award, title: "Our promise", body: "Clear pricing, on-time delivery and support long after the project ends." },
];

function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="About us"
        title="Built in Kigali, for people who want to grow"
        description="We started with repairs and websites. Today we also teach, mentor and connect people to jobs and scholarships."
      />
      <div className="container-page py-16">
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <SectionHeading eyebrow="Our story" title="Technology should open doors, not close them" />
            <div className="mt-5 space-y-4 text-sm leading-relaxed text-muted-foreground">
              <p>
                {SITE.name} began with a simple observation: too many talented Rwandans lose opportunities because of a broken
                laptop, a weak CV, or not knowing where to look. So we built one place that solves all three.
              </p>
              <p>
                We design and develop websites and mobile apps for businesses, schools and organisations. We repair and maintain
                computers. We teach practical digital skills through short online courses. And through our Application Center we
                help students and job seekers submit strong, complete applications.
              </p>
              <p>
                Everything we do is grounded in one belief: with the right tools and the right guidance, people here can compete
                anywhere in the world.
              </p>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild><Link to="/contact">Work with us</Link></Button>
              <Button asChild variant="outline"><Link to="/services">See our services</Link></Button>
            </div>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            {values.map(({ icon: Icon, title, body }) => (
              <div key={title} className="rounded-xl border border-border bg-card p-6 shadow-soft">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-accent text-brand"><Icon className="h-5 w-5" /></div>
                <h3 className="mt-3 font-display text-base font-semibold">{title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
