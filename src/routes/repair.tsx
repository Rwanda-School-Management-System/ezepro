import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Loader2, ShieldCheck, Timer, Wrench } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { SITE, waLink } from "@/lib/site";
import { useAuth } from "@/hooks/use-auth";
import { PageHeader } from "@/components/site/section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/repair")({
  head: () => ({
    meta: [
      { title: "Computer & Laptop Repair in Kigali | Book a Technician" },
      { name: "description", content: "Book fast, affordable laptop and desktop repair in Kigali: screens, batteries, software, data recovery and upgrades." },
      { property: "og:title", content: "Computer Repair in Kigali — Eze Pro Developer" },
      { property: "og:description", content: "Describe your device problem and get a technician the same week." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE.url}/repair` },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: `${SITE.url}/repair` }],
  }),
  component: RepairPage,
});

const schema = z.object({
  customer_name: z.string().trim().min(2, "Enter your name").max(100),
  phone: z.string().trim().min(8, "Enter a valid phone number").max(20),
  email: z.string().trim().email().max(255).optional().or(z.literal("")),
  device_type: z.string().min(1, "Select a device type"),
  brand: z.string().trim().max(60).optional(),
  problem: z.string().trim().min(10, "Describe the problem").max(1000),
  location: z.string().trim().max(120).optional(),
  preferred_date: z.string().max(20).optional(),
});

const perks = [
  { icon: Timer, title: "Fast turnaround", body: "Most repairs are completed within 24–72 hours." },
  { icon: ShieldCheck, title: "Warranty on work", body: "Every repair comes with a service warranty." },
  { icon: Wrench, title: "Honest diagnosis", body: "Free assessment before we quote you anything." },
];

function RepairPage() {
  const { user } = useAuth();
  const [deviceType, setDeviceType] = useState("Laptop");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const parsed = schema.safeParse({ ...Object.fromEntries(fd), device_type: deviceType });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Please check the form");
      return;
    }
    setLoading(true);
    const d = parsed.data;
    const { error } = await supabase.from("repair_requests").insert({
      customer_name: d.customer_name,
      phone: d.phone,
      email: d.email ? d.email : null,
      device_type: d.device_type,
      brand: d.brand ?? null,
      problem: d.problem,
      location: d.location ?? null,
      preferred_date: d.preferred_date ? d.preferred_date : null,
      user_id: user?.id ?? null,
    });
    setLoading(false);
    if (error) {
      toast.error("Could not submit. Please contact us on WhatsApp.");
      return;
    }
    form.reset();
    toast.success("Repair request received. We'll call you soon.");
  }

  return (
    <>
      <PageHeader
        eyebrow="Repair"
        title="Computer & laptop repair booking"
        description="Tell us what's wrong with your device and we'll take it from there."
      />
      <div className="container-page grid gap-10 py-16 lg:grid-cols-[1fr_1.2fr]">
        <div className="space-y-4">
          {perks.map(({ icon: Icon, title, body }) => (
            <div key={title} className="rounded-xl border border-border bg-card p-5 shadow-soft">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-accent text-brand"><Icon className="h-5 w-5" /></div>
              <h3 className="mt-3 font-display text-base font-semibold">{title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{body}</p>
            </div>
          ))}
          <Button asChild variant="outline" className="w-full">
            <a href={waLink("Hello, I need a computer repair.")} target="_blank" rel="noreferrer">Chat on WhatsApp instead</a>
          </Button>
        </div>

        <form onSubmit={onSubmit} className="rounded-2xl border border-border bg-card p-6 shadow-soft sm:p-8">
          <h2 className="font-display text-xl font-semibold">Book a repair</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="customer_name">Full name</Label>
              <Input id="customer_name" name="customer_name" required maxLength={100} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" required maxLength={20} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email (optional)</Label>
              <Input id="email" name="email" type="email" maxLength={255} />
            </div>
            <div className="grid gap-2">
              <Label>Device type</Label>
              <Select value={deviceType} onValueChange={setDeviceType}>
                <SelectTrigger aria-label="Device type"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Laptop", "Desktop", "Printer", "Phone", "Other"].map((d) => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="brand">Brand / model</Label>
              <Input id="brand" name="brand" maxLength={60} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="preferred_date">Preferred date</Label>
              <Input id="preferred_date" name="preferred_date" type="date" />
            </div>
          </div>
          <div className="mt-4 grid gap-2">
            <Label htmlFor="location">Your location</Label>
            <Input id="location" name="location" maxLength={120} placeholder="e.g. Kicukiro, Kigali" />
          </div>
          <div className="mt-4 grid gap-2">
            <Label htmlFor="problem">Describe the problem</Label>
            <Textarea id="problem" name="problem" rows={5} required maxLength={1000} />
          </div>
          <Button type="submit" size="lg" className="mt-6 w-full sm:w-auto" disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Submit request
          </Button>
        </form>
      </div>
    </>
  );
}
