import { Link } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";

import { PORTAL_NAME, PORTAL_SUBTITLE } from "@/lib/constants";

/** Public (operator) chrome. Deliberately contains no staff/admin links. */
export function PublicShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border bg-surface">
        <div className="container-page flex h-16 items-center">
          <Link to="/operator" className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <ShieldCheck className="size-5" />
            </span>
            <span className="leading-tight">
              <span className="block font-display text-sm font-semibold">{PORTAL_NAME}</span>
              <span className="block text-[11px] text-muted-foreground">{PORTAL_SUBTITLE}</span>
            </span>
          </Link>
        </div>
      </header>
      <main className="container-page flex-1 py-6 sm:py-10">{children}</main>
      <footer className="border-t border-border bg-surface py-5">
        <div className="container-page text-center text-xs text-muted-foreground">
          {PORTAL_NAME} · {PORTAL_SUBTITLE}. For training support use only.
        </div>
      </footer>
    </div>
  );
}
