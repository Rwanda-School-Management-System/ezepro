import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function NewsletterForm({ className }: { className?: string }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const value = email.trim().toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value) || value.length > 255) {
      toast.error("Please enter a valid email address");
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("newsletter_subscribers").insert({ email: value });
    setLoading(false);
    if (error && !error.message.includes("duplicate")) {
      toast.error("Could not subscribe. Please try again.");
      return;
    }
    setEmail("");
    toast.success("You're subscribed. Watch your inbox!");
  }

  return (
    <form onSubmit={onSubmit} className={cn("flex flex-col gap-2 sm:flex-row", className)}>
      <Input
        type="email"
        required
        maxLength={255}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        aria-label="Email address"
        className="bg-background text-foreground"
      />
      <Button type="submit" disabled={loading} className="bg-gold text-gold-foreground hover:opacity-90">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Subscribe"}
      </Button>
    </form>
  );
}
