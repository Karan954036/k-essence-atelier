import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/SiteShell";
import { useAuth } from "@/lib/auth";
import { useEffect } from "react";

export const Route = createFileRoute("/account")({
  component: Account,
});

function Account() {
  const { user, isLoading, signOut } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      const returnTo = window.location.pathname;
      window.location.assign(`/login?returnTo=${encodeURIComponent(returnTo)}`);
    }
  }, [isLoading, user]);

  if (isLoading || !user) return <SiteShell><div className="mx-auto max-w-md px-4 py-12">Loading...</div></SiteShell>;

  const fullName = user.user_metadata?.full_name ?? "";

  return (
    <SiteShell>
      <div className="mx-auto max-w-md px-4 py-12">
        <h1 className="mb-4 text-2xl font-semibold">Your account</h1>
        <p className="mb-2">Name: {fullName}</p>
        <p className="mb-4">Email: {user.email}</p>
        <button
          className="inline-flex items-center rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground"
          onClick={() => signOut()}
        >
          Sign out
        </button>
      </div>
    </SiteShell>
  );
}
