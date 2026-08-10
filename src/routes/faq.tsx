import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { contentQueries } from "@/lib/content";
import { SITE } from "@/lib/site";
import { EmptyState, PageHeader } from "@/components/site/section";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ | Common Questions — Eze Pro Developer" },
      { name: "description", content: "Answers about our website development, computer repair, online courses, job listings and scholarship application services." },
      { property: "og:title", content: "Frequently Asked Questions — Eze Pro Developer" },
      { property: "og:description", content: "Everything you need to know before working with us." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE.url}/faq` },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: `${SITE.url}/faq` }],
  }),
  component: FaqPage,
});

function FaqPage() {
  const { data: faqs = [], isLoading } = useQuery(contentQueries.faqs());

  return (
    <>
      <PageHeader eyebrow="Support" title="Frequently asked questions" description="Can't find your answer? Message us on WhatsApp." />
      <div className="container-page max-w-3xl py-16">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading questions…</p>
        ) : faqs.length === 0 ? (
          <EmptyState message="No questions published yet." />
        ) : (
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((f) => (
              <AccordionItem key={f.id} value={f.id}>
                <AccordionTrigger className="text-left text-base font-semibold">{f.question}</AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-muted-foreground">{f.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </div>
    </>
  );
}
