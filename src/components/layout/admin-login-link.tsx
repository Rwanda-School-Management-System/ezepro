import { Link } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";

/** Discreet admin entry point, pinned to the very bottom-right of the page. */
export function AdminLoginLink() {
  return (
    <div className="border-t border-white/10 bg-navy text-navy-foreground">
      <div className="container-page flex justify-end py-2">
        <Link
          to="/admin-login"
          className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wide text-navy-foreground/35 transition-colors hover:text-gold"
        >
          <ShieldCheck className="h-3 w-3" />
          Admin Login
        </Link>
      </div>
    </div>
  );
}
