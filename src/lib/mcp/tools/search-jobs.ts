import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "search_jobs",
  title: "Search jobs",
  description: "Search published job listings by keyword, category, job type or location.",
  inputSchema: {
    query: z.string().trim().optional().describe("Keyword matched against job title or company."),
    category: z.string().trim().optional().describe("Job category filter."),
    job_type: z.string().trim().optional().describe("Job type, e.g. Full-time, Internship."),
    location: z.string().trim().optional().describe("Location filter."),
    limit: z.number().int().min(1).max(50).optional().describe("Max results (default 10)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ query, category, job_type, location, limit }, ctx) => {
    if (!ctx.isAuthenticated()) return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    let q = supabaseForUser(ctx)
      .from("jobs")
      .select("slug,title,company,location,job_type,category,salary,deadline,application_link")
      .eq("is_published", true)
      .order("created_at", { ascending: false })
      .limit(limit ?? 10);
    if (query) q = q.or(`title.ilike.%${query}%,company.ilike.%${query}%`);
    if (category) q = q.ilike("category", `%${category}%`);
    if (job_type) q = q.ilike("job_type", `%${job_type}%`);
    if (location) q = q.ilike("location", `%${location}%`);
    const { data, error } = await q;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? []) }],
      structuredContent: { jobs: data ?? [] },
    };
  },
});
