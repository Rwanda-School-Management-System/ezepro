import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { formatDate } from "@/lib/site";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Admin dashboard — Eze Pro Developer" },
      { name: "description", content: "Manage content, opportunities and submissions." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

type ContentTable = "jobs" | "scholarships" | "courses" | "blog_posts" | "services" | "hero_slides" | "testimonials" | "faqs";

function useTable(table: string) {
  return useQuery({
    queryKey: ["admin", table],
    queryFn: async () => {
      const { data, error } = await supabase.from(table as ContentTable).select("*").limit(200);
      if (error) throw new Error(error.message);
      return (data ?? []) as Record<string, unknown>[];
    },
  });
}

function PublishList({ table, titleKey, flag }: { table: ContentTable; titleKey: string; flag: string }) {
  const { data = [], isLoading } = useTable(table);
  const queryClient = useQueryClient();

  async function toggle(id: string, value: boolean) {
    const patch = { [flag]: value } as never;
    const { error } = await supabase.from(table).update(patch).eq("id", id);
    if (error) {
      toast.error("Update failed — admin access required.");
      return;
    }
    toast.success("Updated");
    queryClient.invalidateQueries({ queryKey: ["admin", table] });
  }

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading…</p>;

  return (
    <div className="divide-y divide-border overflow-hidden rounded-xl border border-border">
      {data.map((row) => (
        <div key={String(row["id"])} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 bg-card p-4">
          <p className="min-w-0 truncate text-sm font-medium">{String(row[titleKey])}</p>
          <div className="flex shrink-0 items-center gap-2">
            <span className="text-xs text-muted-foreground">{row[flag] ? "Live" : "Hidden"}</span>
            <Switch checked={Boolean(row[flag])} onCheckedChange={(v) => toggle(String(row["id"]), v)} />
          </div>
        </div>
      ))}
      {data.length === 0 ? <p className="bg-card p-4 text-sm text-muted-foreground">Nothing here yet.</p> : null}
    </div>
  );
}

function Submissions({ table, primary, secondary, status }: { table: string; primary: string; secondary: string; status?: string }) {
  const { data = [], isLoading } = useTable(table);
  if (isLoading) return <p className="text-sm text-muted-foreground">Loading…</p>;
  return (
    <div className="divide-y divide-border overflow-hidden rounded-xl border border-border">
      {data.map((row) => (
        <div key={String(row["id"])} className="bg-card p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-medium">{String(row[primary])}</p>
            {status ? <Badge variant="secondary">{String(row[status])}</Badge> : null}
          </div>
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{String(row[secondary] ?? "")}</p>
          <p className="mt-1 text-xs text-muted-foreground">{formatDate(String(row["created_at"]))}</p>
        </div>
      ))}
      {data.length === 0 ? <p className="bg-card p-4 text-sm text-muted-foreground">No submissions yet.</p> : null}
    </div>
  );
}

function AdminPage() {
  const { isAdmin, loading } = useAuth();

  if (loading) return <div className="container-page py-24 text-sm text-muted-foreground">Checking access…</div>;
  if (!isAdmin) {
    return (
      <div className="container-page py-24 text-center">
        <h1 className="text-2xl font-bold">Admin access required</h1>
        <p className="mt-2 text-sm text-muted-foreground">This area is restricted to administrators.</p>
        <Button asChild className="mt-6"><Link to="/dashboard">Back to my dashboard</Link></Button>
      </div>
    );
  }

  return (
    <div className="container-page py-12">
      <h1 className="text-2xl font-bold sm:text-3xl">Admin dashboard</h1>
      <p className="mt-1 text-sm text-muted-foreground">Publish content and review incoming submissions.</p>

      <Tabs defaultValue="jobs" className="mt-8">
        <TabsList className="flex h-auto flex-wrap justify-start">
          <TabsTrigger value="jobs">Jobs</TabsTrigger>
          <TabsTrigger value="scholarships">Scholarships</TabsTrigger>
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="blog">Blog</TabsTrigger>
          <TabsTrigger value="slides">Hero slides</TabsTrigger>
          <TabsTrigger value="requests">Requests</TabsTrigger>
          <TabsTrigger value="repairs">Repairs</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="jobs"><PublishList table="jobs" titleKey="title" flag="is_published" /></TabsContent>
          <TabsContent value="scholarships"><PublishList table="scholarships" titleKey="title" flag="is_published" /></TabsContent>
          <TabsContent value="courses"><PublishList table="courses" titleKey="title" flag="is_published" /></TabsContent>
          <TabsContent value="blog"><PublishList table="blog_posts" titleKey="title" flag="is_published" /></TabsContent>
          <TabsContent value="slides"><PublishList table="hero_slides" titleKey="title" flag="is_active" /></TabsContent>
          <TabsContent value="requests"><Submissions table="service_requests" primary="service_needed" secondary="description" status="status" /></TabsContent>
          <TabsContent value="repairs"><Submissions table="repair_requests" primary="customer_name" secondary="problem" status="status" /></TabsContent>
          <TabsContent value="messages"><Submissions table="contact_messages" primary="name" secondary="message" /></TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
