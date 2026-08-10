import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Loader2, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { SITE, waLink } from "@/lib/site";
import { PageHeader } from "@/components/site/section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Eze Pro Developer | Kigali, Rwanda" },
      { name: "description", content: "Talk to our team in Kigali about websites, apps, repairs, courses, jobs and scholarship applications." },
      { property: "og:title", content: "Contact Eze Pro Developer" },
      { property: "og:description", content: "Call, WhatsApp or email us — we reply within one working day." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE.url}/contact` },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: `${SITE.url}/contact` }],
  }),
  component: ContactPage,
});

const schema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(100),
  email: z.string().trim().email("Enter a valid email").max(255),
  phone: z.string().trim().max(20).optional(),
  subject: z.string().trim().max(150).optional(),
  message: z.string().trim().min(10, "Message is too short").max(1500),
});

function ContactPage() {
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = schema.safeParse(Object.fromEntries(fd));
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Please check the form");
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("contact_messages").insert(parsed.data);
    setLoading(false);
    if (error) {
      toast.error("Could not send your message. Please try WhatsApp.");
      return;
    }
    e.currentTarget.reset();
    toast.success("Message sent. We'll get back to you shortly.");
  }

  return (
    <>
      <PageHeader eyebrow="Contact" title="Let's talk about your project" description="We reply on WhatsApp, phone or email within one working day." />
      <div className="container-page grid gap-10 py-16 lg:grid-cols-[1fr_1.2fr]">
        <div className="space-y-4">
          {[
            { icon: Phone, label: "Call us", value: SITE.phone, href: `tel:${SITE.phone}` },
            { icon: MessageCircle, label: "WhatsApp", value: SITE.phoneIntl, href: waLink("Hello Eze Pro Developer, I'd like to ask about your services.") },
            { icon: Mail, label: "Email", value: SITE.email, href: `mailto:${SITE.email}` },
            { icon: MapPin, label: "Location", value: SITE.location, href: null },
          ].map(({ icon: Icon, label, value, href }) => (
            <div key={label} className="flex items-start gap-4 rounded-xl border border-border bg-card p-5 shadow-soft">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent text-brand">
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
                {href ? (
                  <a href={href} target="_blank" rel="noreferrer" className="break-all text-sm font-medium hover:text-brand">{value}</a>
                ) : (
                  <p className="text-sm font-medium">{value}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={onSubmit} className="rounded-2xl border border-border bg-card p-6 shadow-soft sm:p-8">
          <h2 className="font-display text-xl font-semibold">Send us a message</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="name">Full name</Label>
              <Input id="name" name="name" required maxLength={100} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required maxLength={255} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone (optional)</Label>
              <Input id="phone" name="phone" maxLength={20} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="subject">Subject</Label>
              <Input id="subject" name="subject" maxLength={150} />
            </div>
          </div>
          <div className="mt-4 grid gap-2">
            <Label htmlFor="message">Message</Label>
            <Textarea id="message" name="message" rows={6} required maxLength={1500} />
          </div>
          <Button type="submit" size="lg" className="mt-6 w-full sm:w-auto" disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Send message
          </Button>
        </form>
      </div>
    </>
  );
}
