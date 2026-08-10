import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, Phone, Mail, X, MessageCircle, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MAIN_NAV, SITE } from "@/lib/site";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { user, isAdmin } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="hidden bg-navy text-navy-foreground md:block">
        <div className="container-page flex h-10 items-center justify-between text-xs">
          <div className="flex items-center gap-5">
            <a href={`tel:${SITE.phone}`} className="flex items-center gap-2 hover:text-gold">
              <Phone className="h-3.5 w-3.5" /> {SITE.phone}
            </a>
            <a href={`mailto:${SITE.email}`} className="flex items-center gap-2 hover:text-gold">
              <Mail className="h-3.5 w-3.5" /> {SITE.email}
            </a>
          </div>
          <a
            href={SITE.whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 font-medium text-gold hover:opacity-80"
          >
            <MessageCircle className="h-3.5 w-3.5" /> WhatsApp {SITE.phoneIntl}
          </a>
        </div>
      </div>

      <div className="border-b border-border bg-background/90 backdrop-blur">
        <div className="container-page grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 py-3 lg:flex lg:justify-between">
          <Link to="/" className="flex min-w-0 items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-gradient font-display text-lg font-bold text-brand-foreground">
              E
            </span>
            <span className="min-w-0">
              <span className="block truncate font-display text-base font-bold leading-tight sm:text-lg">
                {SITE.name}
              </span>
              <span className="block truncate text-[11px] text-muted-foreground">
                Tech · Learning · Opportunities
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-0.5 lg:flex">
            {MAIN_NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: item.to === "/" }}
                className="rounded-md px-2.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground data-[status=active]:text-brand"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Button asChild size="sm" className="hidden bg-brand text-brand-foreground hover:opacity-90 sm:inline-flex">
              <Link to={user ? (isAdmin ? "/admin" : "/dashboard") : "/auth"}>
                {user ? (
                  <>
                    <LayoutDashboard className="mr-1.5 h-4 w-4" />
                    {isAdmin ? "Admin" : "Dashboard"}
                  </>
                ) : (
                  "Sign in"
                )}
              </Link>
            </Button>
            <button
              type="button"
              aria-label="Toggle menu"
              onClick={() => setOpen((v) => !v)}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-border lg:hidden"
            >
              {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className={cn("lg:hidden", open ? "block" : "hidden")}>
          <nav className="container-page grid gap-1 border-t border-border py-3">
            {MAIN_NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground data-[status=active]:text-brand"
              >
                {item.label}
              </Link>
            ))}
            <Link
              to={user ? (isAdmin ? "/admin" : "/dashboard") : "/auth"}
              onClick={() => setOpen(false)}
              className="mt-1 rounded-md bg-brand px-3 py-2 text-sm font-semibold text-brand-foreground"
            >
              {user ? (isAdmin ? "Admin dashboard" : "My dashboard") : "Sign in / Register"}
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
