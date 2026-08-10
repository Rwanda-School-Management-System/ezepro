import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { BookOpen, FileText, LogOut, Wrench } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { formatDate } from "@/lib/site";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "My Dashboard — Eze Pro Developer" },
      { name: "description", content: "Track your service requests, repairs and applications." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: requests = [] } = useQuery({
    queryKey: ["my-service-requests", user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      const { data } = await supabase
        .from("service_requests")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const { data: repairs = [] } = useQuery({
    queryKey: ["my-repairs", user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      const { data } = await supabase
        .from("repair_requests")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="container-page py-12">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-bold sm:text-3xl">My dashboard</h1>
          <p className="mt-1 truncate text-sm text-muted-foreground">{user?.email}</p>
        </div>
        <div className="flex gap-2">
          {isAdmin ? <Button asChild variant="outline"><Link to="/admin">Admin</Link></Button> : null}
          <Button variant="ghost" onClick={signOut}><LogOut className="mr-1 h-4 w-4" /> Sign out</Button>
        </div>
      </header>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
            <FileText className="h-5 w-5 text-brand" /> My requests & applications
          </h2>
          <div className="mt-4 space-y-3">
            {requests.length === 0 ? (
              <p className="text-sm text-muted-foreground">No requests yet. <Link to="/applications" className="text-brand underline">Start one</Link>.</p>
            ) : (
              requests.map((r) => (
                <div key={r.id} className="rounded-lg border border-border p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-medium">{r.service_needed}</p>
                    <Badge variant="secondary">{r.status}</Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{formatDate(r.created_at)}</p>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
            <Wrench className="h-5 w-5 text-brand" /> My repair bookings
          </h2>
          <div className="mt-4 space-y-3">
            {repairs.length === 0 ? (
              <p className="text-sm text-muted-foreground">No repairs booked. <Link to="/repair" className="text-brand underline">Book one</Link>.</p>
            ) : (
              repairs.map((r) => (
                <div key={r.id} className="rounded-lg border border-border p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-medium">{r.device_type} — {r.brand ?? "device"}</p>
                    <Badge variant="secondary">{r.status}</Badge>
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{r.problem}</p>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      <section className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-soft">
        <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
          <BookOpen className="h-5 w-5 text-brand" /> Continue learning
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Your course progress is saved on this device as you complete lessons.
        </p>
        <Button asChild className="mt-4"><Link to="/courses">Browse courses</Link></Button>
      </section>
    </div>
  );
}
