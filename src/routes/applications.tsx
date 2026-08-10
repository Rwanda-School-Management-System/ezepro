import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { FileCheck2, Loader2, Send, UserCheck } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { SITE } from "@/lib/site";
import { useAuth } from "@/hooks/use-auth";
import { PageHeader } from "@/components/site/section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const SERVICES = [
  "Job application support",
  "Scholarship application support",
  "CV / Resume writing",
  "Cover letter writing",
  "Website development",
  "Mobile app development",
  "Computer repair",
  "Graphic design",
  "Other",
];

export const Route = createFileRoute("/applications")({
  validateSearch: (search: Record<string, unknown>) => ({
    service: typeof search["service"] === "string" ? search["service"].slice(0, 150) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Application Center | We Apply For Jobs & Scholarships For You" },
      { name: "description", content: "Send your details and we handle CV writing, cover letters and full job or scholarship submissions on your behalf." },
      { property: "og:title", content: "Application Center — Eze Pro Developer" },
      { property: "og:description", content: "Professional help applying for jobs, scholarships and services in Rwanda." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE.url}/applications` },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: `${SITE.url}/applications` }],
  }),
  component: ApplicationsPage,
});

const schema = z.object({
  full_name: z.string().trim().min(2, "Enter your name").max(100),
  email: z.string().trim().email("Enter a valid email").max(255),
  phone: z.string().trim().max(20).optional(),
  description: z.string().trim().min(10, "Tell us a bit more").max(1500),
  document_url: z.string().trim().url("Enter a valid link").max(500).optional().or(z.literal("")),
});

const steps = [
  { icon: Send, title: "1. Send your request", body: "Fill the form with your details and the opportunity you want." },
  { icon: UserCheck, title: "2. We review & prepare", body: "We polish your CV, write your letter and check requirements." },
  { icon: FileCheck2, title: "3. We submit & confirm", body: "You receive proof of submission and follow-up guidance." },
];

function ApplicationsPage() {
  const { service } = Route.useSearch();
  const { user } = useAuth();
  const [serviceNeeded, setServiceNeeded] = useState(service ?? SERVICES[0]!);
  const [contact, setContact] = useState("WhatsApp");
  const [loading, setLoading] = useState(false);
  const options = SERVICES.includes(serviceNeeded) ? SERVICES : [serviceNeeded, ...SERVICES];

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const parsed = schema.safeParse(Object.fromEntries(new FormData(form)));
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Please check the form");
      return;
    }
    setLoading(true);
    const d = parsed.data;
    const { error } = await supabase.from("service_requests").insert({
      full_name: d.full_name,
      email: d.email,
      phone: d.phone ?? null,
      description: d.description,
      document_url: d.document_url ? d.document_url : null,
      service_needed: serviceNeeded,
      preferred_contact: contact,
      user_id: user?.id ?? null,
    });
    setLoading(false);
    if (error) {
      toast.error("Could not submit your request. Please try again.");
      return;
    }
    form.reset();
    toast.success("Request received. We'll contact you shortly.");
  }

  return (
    <>
      <PageHeader
        eyebrow="Application Center"
        title="We apply on your behalf"
        description="Jobs, scholarships, CVs and cover letters — handled by people who know what reviewers look for."
      />
      <div className="container-page py-16">
        <div className="grid gap-6 sm:grid-cols-3">
          {steps.map(({ icon: Icon, title, body }) => (
            <div key={title} className="rounded-xl border border-border bg-card p-6 shadow-soft">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-accent text-brand"><Icon className="h-5 w-5" /></div>
              <h3 className="mt-3 font-display text-base font-semibold">{title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>

        <form onSubmit={onSubmit} className="mt-12 rounded-2xl border border-border bg-card p-6 shadow-soft sm:p-8">
          <h2 className="font-display text-xl font-semibold">Start your application</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="full_name">Full name</Label>
              <Input id="full_name" name="full_name" required maxLength={100} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required maxLength={255} defaultValue={user?.email ?? ""} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone / WhatsApp</Label>
              <Input id="phone" name="phone" maxLength={20} />
            </div>
            <div className="grid gap-2">
              <Label>What do you need?</Label>
              <Select value={serviceNeeded} onValueChange={setServiceNeeded}>
                <SelectTrigger aria-label="Service needed"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {options.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="document_url">Link to your CV / documents (optional)</Label>
              <Input id="document_url" name="document_url" maxLength={500} placeholder="Google Drive or Dropbox link" />
            </div>
            <div className="grid gap-2">
              <Label>Preferred contact</Label>
              <Select value={contact} onValueChange={setContact}>
                <SelectTrigger aria-label="Preferred contact"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["WhatsApp", "Phone call", "Email"].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-4 grid gap-2">
            <Label htmlFor="description">Details</Label>
            <Textarea id="description" name="description" rows={6} required maxLength={1500} placeholder="Tell us about the opportunity, deadline and your background." />
          </div>
          <Button type="submit" size="lg" className="mt-6 w-full sm:w-auto" disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Submit request
          </Button>
        </form>
      </div>
    </>
  );
}
