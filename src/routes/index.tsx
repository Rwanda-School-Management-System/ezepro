import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Award, BriefcaseBusiness, GraduationCap, Laptop, Quote, ShieldCheck, Wrench } from "lucide-react";
import { contentQueries } from "@/lib/content";
import { SITE } from "@/lib/site";
import { HeroSlider } from "@/components/site/hero-slider";
import { SectionHeading } from "@/components/site/section";
import { CourseCard, JobCard, PostCard, ScholarshipCard, ServiceCard } from "@/components/site/cards";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Eze Pro Developer | Tech, Courses, Jobs & Scholarships in Rwanda" },
      {
        name: "description",
        content:
          "Website & app development, computer repair, IT support, online courses, jobs, scholarships and application help from Kigali, Rwanda.",
      },
      { property: "og:title", content: "Eze Pro Developer | Technology, Education & Opportunities" },
      {
        property: "og:description",
        content: "Build, learn and grow with Rwanda's all-in-one technology, education and opportunities platform.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE.url}/` },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: `${SITE.url}/` }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: SITE.name,
          url: SITE.url,
          email: SITE.email,
          telephone: SITE.phoneIntl,
          address: { "@type": "PostalAddress", addressLocality: "Kigali", addressCountry: "RW" },
        }),
      },
    ],
  }),
  component: Home,
});

const stats = [
  { value: "500+", label: "Projects & repairs delivered" },
  { value: "2,000+", label: "Learners trained" },
  { value: "1,500+", label: "Applications submitted" },
  { value: "24/7", label: "Support on WhatsApp" },
];

const whyUs = [
  { icon: Laptop, title: "Modern technology", body: "Fast, secure websites and mobile apps built with current tools." },
  { icon: Wrench, title: "Reliable repairs", body: "Honest diagnostics and quick turnaround on laptops and desktops." },
  { icon: GraduationCap, title: "Practical learning", body: "Short, job-focused courses you can complete on your phone." },
  { icon: ShieldCheck, title: "Trusted guidance", body: "Real people helping you apply for jobs and scholarships." },
];

function Home() {
  const { data: services = [] } = useQuery(contentQueries.services());
  const { data: jobs = [] } = useQuery(contentQueries.jobs(3));
  const { data: scholarships = [] } = useQuery(contentQueries.scholarships(3));
  const { data: courses = [] } = useQuery(contentQueries.courses(3));
  const { data: posts = [] } = useQuery(contentQueries.posts(3));
  const { data: testimonials = [] } = useQuery(contentQueries.testimonials());

  return (
    <>
      <HeroSlider />

      <section className="border-b border-border bg-card">
        <div className="container-page grid grid-cols-2 gap-6 py-10 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label}>
              <p className="font-display text-2xl font-bold text-brand sm:text-3xl">{s.value}</p>
              <p className="mt-1 text-xs text-muted-foreground sm:text-sm">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-page py-16 sm:py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading
            eyebrow="What we do"
            title="Services built for people and businesses"
            description="From your first website to your next career move, we cover the full journey."
          />
          <Button asChild variant="outline">
            <Link to="/services">All services <ArrowRight className="ml-1 h-4 w-4" /></Link>
          </Button>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.slice(0, 6).map((s) => (
            <ServiceCard key={s.id} service={s} />
          ))}
        </div>
      </section>

      <section className="bg-muted/50 py-16 sm:py-20">
        <div className="container-page">
          <SectionHeading
            align="center"
            eyebrow="Why choose us"
            title="A partner that stays with you"
            description="We combine technical skill with genuine mentorship for Rwandan youth and businesses."
          />
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {whyUs.map(({ icon: Icon, title, body }) => (
              <div key={title} className="rounded-xl border border-border bg-card p-6 shadow-soft">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-accent text-brand">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-display text-base font-semibold">{title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page py-16 sm:py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading eyebrow="Learn" title="Popular online courses" description="Learn at your own pace and track your progress." />
          <Button asChild variant="outline">
            <Link to="/courses">Browse courses <ArrowRight className="ml-1 h-4 w-4" /></Link>
          </Button>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((c) => (
            <CourseCard key={c.id} course={c} />
          ))}
        </div>
      </section>

      <section className="bg-muted/50 py-16 sm:py-20">
        <div className="container-page grid gap-12 lg:grid-cols-2">
          <div>
            <div className="flex flex-wrap items-end justify-between gap-3">
              <SectionHeading eyebrow="Jobs" title="Latest job openings" />
              <Button asChild variant="ghost" size="sm">
                <Link to="/jobs">See all</Link>
              </Button>
            </div>
            <div className="mt-8 grid gap-5">
              {jobs.map((j) => (
                <JobCard key={j.id} job={j} />
              ))}
            </div>
          </div>
          <div>
            <div className="flex flex-wrap items-end justify-between gap-3">
              <SectionHeading eyebrow="Scholarships" title="Open scholarships" />
              <Button asChild variant="ghost" size="sm">
                <Link to="/scholarships">See all</Link>
              </Button>
            </div>
            <div className="mt-8 grid gap-5">
              {scholarships.map((s) => (
                <ScholarshipCard key={s.id} scholarship={s} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="container-page py-16 sm:py-20">
        <SectionHeading align="center" eyebrow="Testimonials" title="What our clients and students say" />
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.slice(0, 6).map((t) => (
            <figure key={t.id} className="rounded-xl border border-border bg-card p-6 shadow-soft">
              <Quote className="h-6 w-6 text-gold" />
              <blockquote className="mt-3 text-sm text-muted-foreground">{t.story}</blockquote>
              <figcaption className="mt-5 text-sm font-semibold">
                {t.name}
                <span className="block text-xs font-normal text-muted-foreground">{t.service_used}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="container-page pb-20">
        <div className="overflow-hidden rounded-3xl bg-hero-gradient px-6 py-14 text-center text-navy-foreground sm:px-12">
          <Award className="mx-auto h-10 w-10 text-gold" />
          <h2 className="mt-4 font-display text-2xl font-bold sm:text-3xl">Ready to start your next project or career step?</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-navy-foreground/80">
            Tell us what you need and we will respond on WhatsApp or email within one working day.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" className="bg-gold text-gold-foreground hover:opacity-90">
              <Link to="/applications">Start an application</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white/30 bg-transparent text-navy-foreground hover:bg-white/10 hover:text-navy-foreground">
              <Link to="/contact">Contact us</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="container-page pb-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading eyebrow="Blog" title="News, tips and guides" />
          <Button asChild variant="outline">
            <Link to="/blog">
              <BriefcaseBusiness className="mr-1 h-4 w-4" /> Read the blog
            </Link>
          </Button>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((p) => (
            <PostCard key={p.id} post={p} />
          ))}
        </div>
      </section>
    </>
  );
}
