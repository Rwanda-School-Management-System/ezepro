import { auth, defineMcp } from "@lovable.dev/mcp-js";
import searchJobs from "./tools/search-jobs";
import searchScholarships from "./tools/search-scholarships";
import listCourses from "./tools/list-courses";
import listMyRequests from "./tools/list-my-requests";
import createServiceRequest from "./tools/create-service-request";

const projectRef = import.meta.env['VITE_SUPABASE_PROJECT_ID'] ?? "project-ref-unset";

export default defineMcp({
  name: "eze-pro-developer",
  title: "Eze Pro Developer",
  version: "0.1.0",
  instructions:
    "Tools for Eze Pro Developer, a Rwanda-based technology, education and opportunities company. Search jobs and scholarships, browse online courses, review the signed-in user's service and repair requests, and submit new service requests on their behalf.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [searchJobs, searchScholarships, listCourses, listMyRequests, createServiceRequest],
});
