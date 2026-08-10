import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Linkedin, Mail, MapPin, MessageCircle, Phone, Twitter, Youtube } from "lucide-react";
import { SITE } from "@/lib/site";
import { NewsletterForm } from "@/components/site/newsletter-form";

const columns = [
  {
    title: "Company",
    links: [
      { label: "About us", to: "/about" },
      { label: "Services", to: "/services" },
      { label: "Contact", to: "/contact" },
      { label: "FAQ", to: "/faq" },
    ],
  },
  {
    title: "Learn & Grow",
    links: [
      { label: "Online courses", to: "/courses" },
      { label: "Blog & news", to: "/blog" },
      { label: "Application center", to: "/applications" },
      { label: "Computer repair", to: "/repair" },
    ],
  },
  {
    title: "Opportunities",
    links: [
      { label: "Jobs", to: "/jobs" },
      { label: "Scholarships", to: "/scholarships" },
      { label: "Privacy policy", to: "/privacy" },
      { label: "Terms & conditions", to: "/terms" },
    ],
  },
] as const;

const socials = [
  { icon: Facebook, href: "https://facebook.com", label: "Facebook" },
  { icon: Twitter, href: "https://x.com", label: "X" },
  { icon: Instagram, href: "https://instagram.com", label: "Instagram" },
  { icon: Linkedin, href: "https://linkedin.com", label: "LinkedIn" },
  { icon: Youtube, href: "https://youtube.com", label: "YouTube" },
];

export function SiteFooter() {
  return (
    <footer className="mt-24 bg-navy text-navy-foreground">
      <div className="container-page grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-gradient font-display text-lg font-bold text-brand-foreground">
              E
            </span>
            <span className="font-display text-lg font-bold">{SITE.name}</span>
          </div>
          <p className="mt-4 max-w-sm text-sm text-navy-foreground/70">
            {SITE.description}
          </p>
          <div className="mt-5 space-y-2 text-sm">
            <a href={`tel:${SITE.phone}`} className="flex items-center gap-2 hover:text-gold">
              <Phone className="h-4 w-4 shrink-0" /> {SITE.phone}
            </a>
            <a href={SITE.whatsappUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-gold">
              <MessageCircle className="h-4 w-4 shrink-0" /> {SITE.phoneIntl}
            </a>
            <a href={`mailto:${SITE.email}`} className="flex items-center gap-2 break-all hover:text-gold">
              <Mail className="h-4 w-4 shrink-0" /> {SITE.email}
            </a>
            <p className="flex items-center gap-2 text-navy-foreground/70">
              <MapPin className="h-4 w-4 shrink-0" /> {SITE.location}
            </p>
          </div>
        </div>

        {columns.map((col) => (
          <div key={col.title}>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-gold">{col.title}</h3>
            <ul className="mt-4 space-y-2 text-sm">
              {col.links.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="text-navy-foreground/75 hover:text-navy-foreground">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-white/10">
        <div className="container-page grid gap-6 py-8 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
          <div className="min-w-0">
            <h3 className="font-display text-base font-semibold">Get opportunities in your inbox</h3>
            <p className="mt-1 text-sm text-navy-foreground/70">
              New jobs, scholarships and courses — no spam.
            </p>
            <NewsletterForm className="mt-3 max-w-md" />
          </div>
          <div className="flex gap-2">
            {socials.map(({ icon: Icon, href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                className="grid h-9 w-9 place-items-center rounded-full bg-white/10 transition-colors hover:bg-brand"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-page flex flex-col gap-2 py-5 text-xs text-navy-foreground/60 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {SITE.name}. All rights reserved.</p>
          <p>Built in {SITE.location}</p>
        </div>
      </div>
    </footer>
  );
}
