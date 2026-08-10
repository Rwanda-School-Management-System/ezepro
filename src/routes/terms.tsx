import { createFileRoute } from "@tanstack/react-router";
import { SITE } from "@/lib/site";
import { PageHeader } from "@/components/site/section";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms & Conditions — Eze Pro Developer" },
      { name: "description", content: "The terms that apply when you use Eze Pro Developer services, courses and application support." },
      { property: "og:title", content: "Terms & Conditions — Eze Pro Developer" },
      { property: "og:description", content: "Service terms, payments, refunds and acceptable use." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE.url}/terms` },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: `${SITE.url}/terms` }],
  }),
  component: TermsPage,
});

const sections = [
  { title: "Using our services", body: "By requesting a service, booking a repair or enrolling in a course you agree to provide accurate information and to use the platform lawfully." },
  { title: "Quotes and payments", body: "Project quotes are valid for 30 days. Repairs are quoted after a free diagnosis. Course fees are stated on each course page." },
  { title: "Opportunity listings", body: "Jobs and scholarships are shared for information only. We verify sources where possible but we are not the employer or funder, and we never charge to view a listing." },
  { title: "Application support", body: "We prepare and submit applications on your behalf with the details you provide. We cannot guarantee selection outcomes." },
  { title: "Intellectual property", body: "Course materials, designs and site content belong to Eze Pro Developer and may not be resold or redistributed without permission." },
  { title: "Changes to these terms", body: "We may update these terms. Continued use of the site after an update means you accept the revised terms." },
];

function TermsPage() {
  return (
    <>
      <PageHeader eyebrow="Legal" title="Terms & conditions" description="Last updated: 2026" />
      <div className="container-page max-w-3xl py-16">
        {sections.map((s) => (
          <section key={s.title} className="mb-8">
            <h2 className="font-display text-xl font-semibold">{s.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
          </section>
        ))}
        <p className="text-sm text-muted-foreground">
          Questions? Email <a className="text-brand underline" href={`mailto:${SITE.email}`}>{SITE.email}</a>.
        </p>
      </div>
    </>
  );
}
