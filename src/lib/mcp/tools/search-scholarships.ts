import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "search_scholarships",
  title: "Search scholarships",
  description: "Search published scholarship opportunities by keyword, country or study level.",
  inputSchema: {
    query: z.string().trim().optional().describe("Keyword matched against scholarship title or provider."),
    country: z.string().trim().optional().describe("Host country filter."),
    level: z.string().trim().optional().describe("Study level, e.g. Bachelor, Masters, PhD."),
    limit: z.number().int().min(1).max(50).optional().describe("Max results (default 10)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ query, country, level, limit }, ctx) => {
    if (!ctx.isAuthenticated()) return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    let q = supabaseForUser(ctx)
      .from("scholarships")
      .select("*")
      .eq("is_published", true)
      .order("created_at", { ascending: false })
      .limit(limit ?? 10);
    if (query) q = q.ilike("title", `%${query}%`);
    if (country) q = q.ilike("country", `%${country}%`);
    if (level) q = q.ilike("level", `%${level}%`);
    const { data, error } = await q;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? []) }],
      structuredContent: { scholarships: data ?? [] },
    };
  },
});
