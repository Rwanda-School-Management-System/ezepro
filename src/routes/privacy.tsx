import { createFileRoute } from "@tanstack/react-router";
import { SITE } from "@/lib/site";
import { PageHeader } from "@/components/site/section";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Eze Pro Developer" },
      { name: "description", content: "How Eze Pro Developer collects, uses and protects your personal information." },
      { property: "og:title", content: "Privacy Policy — Eze Pro Developer" },
      { property: "og:description", content: "Our commitment to protecting your data." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE.url}/privacy` },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: `${SITE.url}/privacy` }],
  }),
  component: PrivacyPage,
});

const sections = [
  {
    title: "Information we collect",
    body: "We collect the details you submit through our forms: name, email, phone number, the service you request and any documents or links you share. We also store account information when you register.",
  },
  {
    title: "How we use your information",
    body: "Your information is used only to respond to your request, deliver the service you asked for, and send updates you opted into. We never sell your data.",
  },
  {
    title: "Data storage and security",
    body: "Data is stored on secure managed cloud infrastructure with row-level access rules. Only authorised staff can view submissions relevant to your request.",
  },
  {
    title: "Newsletter and communication",
    body: "You can unsubscribe from our newsletter at any time by replying to any email or contacting us directly.",
  },
  {
    title: "Your rights",
    body: "You can request a copy of your data, ask for corrections, or ask us to delete your information by emailing us.",
  },
];

function PrivacyPage() {
  return (
    <>
      <PageHeader eyebrow="Legal" title="Privacy policy" description="Last updated: 2026" />
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
