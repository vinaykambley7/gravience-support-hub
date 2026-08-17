import { useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Loader2 } from "lucide-react";
import { useEffect, type ReactNode } from "react";

import { useAuth } from "@/hooks/useAuth";
import { getMe } from "@/lib/staff.functions";

export type Me = {
  userId: string;
  isAdmin: boolean;
  isTrainer: boolean;
  trainer: { id: string; code: string; name: string; email: string; is_active: boolean } | null;
};

function Centered({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 text-center">
      <div className="max-w-sm">{children}</div>
    </div>
  );
}

/** Client-side session + role gate for staff areas. */
export function AuthGate({
  require: requiredRole,
  loginPath,
  children,
}: {
  require: "admin" | "trainer";
  loginPath: string;
  children: (me: Me) => ReactNode;
}) {
  const navigate = useNavigate();
  const { session, loading } = useAuth();
  const meFn = useServerFn(getMe);

  const { data: me, isLoading: meLoading } = useQuery({
    queryKey: ["me", session?.user.id ?? null],
    queryFn: () => meFn() as Promise<Me>,
    enabled: !!session,
  });

  useEffect(() => {
    if (!loading && !session) navigate({ to: loginPath });
  }, [loading, session, navigate, loginPath]);

  if (loading || !session || meLoading || !me) {
    return (
      <Centered>
        <Loader2 className="mx-auto size-6 animate-spin text-muted-foreground" />
      </Centered>
    );
  }

  const allowed = requiredRole === "admin" ? me.isAdmin : me.isTrainer || me.isAdmin;
  if (!allowed) {
    return (
      <Centered>
        <h1 className="font-display text-xl font-semibold">Access denied</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This account does not have {requiredRole} access to this portal.
        </p>
      </Centered>
    );
  }

  return <>{children(me)}</>;
}
