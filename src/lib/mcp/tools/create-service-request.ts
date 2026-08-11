import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "create_service_request",
  title: "Create service request",
  description: "Submit a new service request (job/scholarship application help, web design, etc.) for the signed-in user.",
  inputSchema: {
    full_name: z.string().trim().min(2).max(100).describe("Requester's full name."),
    email: z.string().trim().email().max(255).describe("Contact email."),
    service_needed: z.string().trim().min(2).max(150).describe("The service being requested."),
    description: z.string().trim().max(2000).optional().describe("Details about the request."),
    phone: z.string().trim().max(30).optional().describe("Contact phone number."),
    preferred_contact: z.string().trim().max(30).optional().describe("Preferred contact channel, e.g. Email, WhatsApp."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async (input, ctx) => {
    if (!ctx.isAuthenticated()) return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    const { data, error } = await supabaseForUser(ctx)
      .from("service_requests")
      .insert({ ...input, user_id: ctx.getUserId() })
      .select("id,service_needed,status,created_at");
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data?.[0] ?? null) }],
      structuredContent: { request: data?.[0] ?? null },
    };
  },
});
