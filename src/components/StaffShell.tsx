import { Link, useNavigate } from "@tanstack/react-router";
import { LogOut, Menu, ShieldCheck, X } from "lucide-react";
import { useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { PORTAL_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";

export type NavItem = { label: string; to: string };

export function StaffShell({
  area,
  navItems,
  userLabel,
  loginPath,
  children,
}: {
  area: string;
  navItems: NavItem[];
  userLabel: string;
  loginPath: string;
  children: ReactNode;
}) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: loginPath });
  };

  return (
    <div className="min-h-screen bg-background lg:flex">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 shrink-0 bg-sidebar text-sidebar-foreground transition-transform lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-5">
          <ShieldCheck className="size-5 text-sidebar-primary" />
          <div className="leading-tight">
            <p className="text-sm font-semibold">{PORTAL_NAME}</p>
            <p className="text-[11px] text-sidebar-foreground/70">{area}</p>
          </div>
          <button
            className="ml-auto lg:hidden"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
          >
            <X className="size-5" />
          </button>
        </div>
        <nav className="space-y-1 p-3">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              activeProps={{
                className:
                  "block rounded-lg px-3 py-2 text-sm font-semibold bg-sidebar-accent text-sidebar-accent-foreground",
              }}
              activeOptions={{ exact: false }}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      {open && (
        <div
          className="fixed inset-0 z-30 bg-foreground/40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-surface/95 px-4 backdrop-blur">
          <button className="lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu">
            <Menu className="size-5" />
          </button>
          <p className="text-sm font-semibold">{area}</p>
          <nav className="hidden flex-1 justify-center gap-1 lg:flex">
            {navItems.slice(0, 5).map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                activeProps={{ className: "rounded-md px-3 py-1.5 text-sm font-semibold bg-muted" }}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-3">
            <span className="hidden text-sm text-muted-foreground sm:inline">{userLabel}</span>
            <Button variant="outline" size="sm" onClick={signOut}>
              <LogOut className="mr-1.5 size-4" /> Sign out
            </Button>
          </div>
        </header>
        <main className="flex-1 px-4 py-6 lg:px-8">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}

export function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number | string;
  accent?: string | undefined;
}) {
  return (
    <div className="card-surface p-4">
      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{label}</p>
      <p className={cn("mt-1 font-display text-2xl font-semibold", accent)}>{value}</p>
    </div>
  );
}
