import { useNavigate } from "@tanstack/react-router";
import { Loader2, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { PORTAL_NAME } from "@/lib/constants";

/** Shared email/password sign-in card for the trainer and admin portals. */
export function StaffLogin({
  title,
  subtitle,
  redirectTo,
}: {
  title: string;
  subtitle: string;
  redirectTo: string;
}) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setBusy(false);
    if (error) {
      toast.error(error.message || "Sign in failed. Check your email and password.");
      return;
    }
    navigate({ to: redirectTo });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center text-center">
          <span className="flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <ShieldCheck className="size-6" />
          </span>
          <p className="mt-3 text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {PORTAL_NAME}
          </p>
          <h1 className="mt-1 font-display text-2xl font-semibold">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        </div>

        <form onSubmit={submit} className="card-surface mt-6 space-y-4 p-6">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              className="h-11"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              className="h-11"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button type="submit" size="lg" className="w-full" disabled={busy}>
            {busy && <Loader2 className="mr-1.5 size-4 animate-spin" />}
            Sign in
          </Button>
        </form>
      </div>
    </div>
  );
}
