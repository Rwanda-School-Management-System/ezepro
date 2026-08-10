export const SITE = {
  name: "Eze Pro Developer",
  shortName: "EzePro",
  tagline: "Technology, Education and Opportunities in One Place",
  description:
    "Rwanda-based technology company offering website and mobile app development, computer repair, IT support, online courses, jobs, scholarships and application help.",
  url: "https://hello-world-hug-7426.lovable.app",
  phone: "0793054502",
  phoneIntl: "+250793054502",
  whatsapp: "250793054502",
  whatsappUrl: "https://wa.me/250793054502",
  email: "ezeprodeveloper@gmail.com",
  location: "Kigali, Rwanda",
} as const;

export const MAIN_NAV = [
  { label: "Home", to: "/" },
  { label: "Services", to: "/services" },
  { label: "Courses", to: "/courses" },
  { label: "Jobs", to: "/jobs" },
  { label: "Scholarships", to: "/scholarships" },
  { label: "Applications", to: "/applications" },
  { label: "Repair", to: "/repair" },
  { label: "Blog", to: "/blog" },
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
] as const;

export function waLink(message: string) {
  return `${SITE.whatsappUrl}?text=${encodeURIComponent(message)}`;
}

export function formatDate(value?: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function daysLeft(deadline?: string | null) {
  if (!deadline) return null;
  const diff = Math.ceil((new Date(deadline).getTime() - Date.now()) / 86_400_000);
  return diff;
}
