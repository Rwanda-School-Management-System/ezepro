import { defineTool } from "@lovable.dev/mcp-js";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_my_requests",
  title: "List my requests",
  description: "List the signed-in user's service requests and computer repair requests with their status.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    if (!ctx.isAuthenticated()) return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    const supabase = supabaseForUser(ctx);
    const [services, repairs] = await Promise.all([
      supabase
        .from("service_requests")
        .select("id,service_needed,status,description,created_at")
        .order("created_at", { ascending: false }),
      supabase
        .from("repair_requests")
        .select("id,device_type,brand,problem,status,preferred_date,created_at")
        .order("created_at", { ascending: false }),
    ]);
    const error = services.error ?? repairs.error;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    const payload = { service_requests: services.data ?? [], repair_requests: repairs.data ?? [] };
    return { content: [{ type: "text", text: JSON.stringify(payload) }], structuredContent: payload };
  },
});
