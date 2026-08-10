import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Tables = Database["public"]["Tables"];
export type HeroSlide = Tables["hero_slides"]["Row"];
export type Service = Tables["services"]["Row"];
export type Job = Tables["jobs"]["Row"];
export type Scholarship = Tables["scholarships"]["Row"];
export type Course = Tables["courses"]["Row"];
export type BlogPost = Tables["blog_posts"]["Row"];
export type Testimonial = Tables["testimonials"]["Row"];
export type Faq = Tables["faqs"]["Row"];

function unwrap<T>(res: { data: T | null; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message);
  return (res.data ?? []) as T;
}

export const contentQueries = {
  slides: () => ({
    queryKey: ["hero_slides"],
    queryFn: async () =>
      unwrap<HeroSlide[]>(
        await supabase
          .from("hero_slides")
          .select("*")
          .eq("is_active", true)
          .order("sort_order", { ascending: true }),
      ),
  }),
  services: () => ({
    queryKey: ["services"],
    queryFn: async () =>
      unwrap<Service[]>(
        await supabase
          .from("services")
          .select("*")
          .eq("is_published", true)
          .order("sort_order", { ascending: true }),
      ),
  }),
  jobs: (limit?: number) => ({
    queryKey: ["jobs", limit ?? "all"],
    queryFn: async () => {
      let q = supabase
        .from("jobs")
        .select("*")
        .eq("is_published", true)
        .order("created_at", { ascending: false });
      if (limit) q = q.limit(limit);
      return unwrap<Job[]>(await q);
    },
  }),
  scholarships: (limit?: number) => ({
    queryKey: ["scholarships", limit ?? "all"],
    queryFn: async () => {
      let q = supabase
        .from("scholarships")
        .select("*")
        .eq("is_published", true)
        .order("created_at", { ascending: false });
      if (limit) q = q.limit(limit);
      return unwrap<Scholarship[]>(await q);
    },
  }),
  courses: (limit?: number) => ({
    queryKey: ["courses", limit ?? "all"],
    queryFn: async () => {
      let q = supabase
        .from("courses")
        .select("*")
        .eq("is_published", true)
        .order("created_at", { ascending: false });
      if (limit) q = q.limit(limit);
      return unwrap<Course[]>(await q);
    },
  }),
  posts: (limit?: number) => ({
    queryKey: ["blog_posts", limit ?? "all"],
    queryFn: async () => {
      let q = supabase
        .from("blog_posts")
        .select("*")
        .eq("is_published", true)
        .order("published_at", { ascending: false });
      if (limit) q = q.limit(limit);
      return unwrap<BlogPost[]>(await q);
    },
  }),
  testimonials: () => ({
    queryKey: ["testimonials"],
    queryFn: async () =>
      unwrap<Testimonial[]>(
        await supabase
          .from("testimonials")
          .select("*")
          .eq("is_approved", true)
          .order("created_at", { ascending: false }),
      ),
  }),
  faqs: () => ({
    queryKey: ["faqs"],
    queryFn: async () =>
      unwrap<Faq[]>(
        await supabase
          .from("faqs")
          .select("*")
          .eq("is_published", true)
          .order("sort_order", { ascending: true }),
      ),
  }),
  bySlug: <K extends "jobs" | "scholarships" | "courses" | "blog_posts">(table: K, slug: string) => ({
    queryKey: [table, "slug", slug],
    queryFn: async () => {
      const query = supabase.from(table).select("*") as unknown as {
        eq: (col: string, val: unknown) => typeof query;
        maybeSingle: () => Promise<{ data: unknown; error: { message: string } | null }>;
      };
      const { data, error } = await query.eq("slug", slug).eq("is_published", true).maybeSingle();
      if (error) throw new Error(error.message);
      return (data ?? null) as Tables[K]["Row"] | null;
    },
  }),
};

