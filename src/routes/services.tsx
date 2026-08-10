import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { contentQueries } from "@/lib/content";
import { SITE } from "@/lib/site";
import { PageHeader } from "@/components/site/section";
import { ServiceCard } from "@/components/site/cards";
import { CardSkeleton, EmptyState } from "@/components/site/section";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "IT Services in Rwanda | Web, Apps & Repair — Eze Pro Developer" },
      {
        name: "description",
        content:
          "Website development, mobile apps, computer repair, software installation, IT support, graphic design and digital marketing in Kigali.",
      },
      { property: "og:title", content: "IT Services in Rwanda — Eze Pro Developer" },
      { property: "og:description", content: "Professional technology services for individuals, schools and businesses in Rwanda." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE.url}/services` },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: `${SITE.url}/services` }],
  }),
  component: ServicesPage,
});

function ServicesPage() {
  const { data: services = [], isLoading } = useQuery(contentQueries.services());

  return (
    <>
      <PageHeader
        eyebrow="Services"
        title="Technology services that move you forward"
        description="Everything from your first website to keeping your devices running smoothly."
      />
      <div className="container-page py-16">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading ? <CardSkeleton count={6} /> : services.map((s) => <ServiceCard key={s.id} service={s} />)}
        </div>
        {!isLoading && services.length === 0 ? <EmptyState message="No services published yet." /> : null}
      </div>
    </>
  );
}
