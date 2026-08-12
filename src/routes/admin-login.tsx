import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Loader2, ShieldCheck } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { SITE } from "@/lib/site";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/admin-login")({
  head: () => ({
    meta: [
      { title: "Administrator login — Eze Pro Developer" },
      {
        name: "description",
        content: "Restricted access for Eze Pro Developer administrators.",
      },
      { property: "og:title", content: "Administrator login — Eze Pro Developer" },
      { property: "og:description", content: "Restricted administrator access." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminLoginPage,
});

const schema = z.object({
  email: z.string().trim().email("Enter a valid email").max(255),
  password: z.string().min(6, "Enter your password").max(72),
});

function AdminLoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const parsed = schema.safeParse(Object.fromEntries(new FormData(e.currentTarget)));
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]!.message);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword(parsed.data);
    if (error || !data.user) {
      setLoading(false);
      toast.error(error?.message ?? "Sign in failed");
      return;
    }
    const { data: isAdmin } = await supabase.rpc("has_role", {
      _user_id: data.user.id,
      _role: "admin",
    });
    if (!isAdmin) {
      await supabase.auth.signOut();
      setLoading(false);
      toast.error("This account is not an administrator.");
      return;
    }
    setLoading(false);
    toast.success("Welcome back, admin.");
    navigate({ to: "/admin", replace: true });
  }

  return (
    <div className="relative flex min-h-[85vh] items-center justify-center overflow-hidden px-4 py-16">
      <div className="bg-aurora absolute inset-0 -z-10" aria-hidden="true" />
      <div className="w-full max-w-sm rounded-2xl border border-white/15 bg-card/90 p-6 shadow-lift backdrop-blur-xl sm:p-8">
        <div className="mx-auto grid h-11 w-11 place-items-center rounded-xl bg-navy text-navy-foreground">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <h1 className="mt-4 text-center font-display text-xl font-bold">Administrator login</h1>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Restricted area for {SITE.shortName} staff.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="admin-email">Email</Label>
            <Input
              id="admin-email"
              name="email"
              type="email"
              autoComplete="username"
              required
              maxLength={255}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="admin-password">Password</Label>
            <Input
              id="admin-password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              maxLength={72}
            />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Sign in as admin
          </Button>
        </form>
      </div>
    </div>
  );
}
