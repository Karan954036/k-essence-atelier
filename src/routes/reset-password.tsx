import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/SiteShell";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/reset-password")({
  component: ResetPassword,
});

function ResetPassword() {
  const { getSessionFromUrl } = useAuth();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");

  useEffect(() => {
    (async () => {
      try {
        await getSessionFromUrl();
      } catch (e) {
        console.error(e);
      } finally {
        setReady(true);
      }
    })();
  }, [getSessionFromUrl]);

  async function onSubmit(e: any) {
    e.preventDefault();
    try {
      // @ts-ignore
      const { error } = await (await import("@/integrations/supabase/client")).supabase.auth.updateUser({ password });
      if (error) throw error;
      alert("Password updated. You can now sign in.");
      window.location.assign("/login");
    } catch (err) {
      console.error(err);
      alert("Failed to update password");
    }
  }

  return (
    <SiteShell>
      <div className="mx-auto max-w-md px-4 py-12">
        <h1 className="mb-6 text-2xl font-semibold">Set a new password</h1>
        {!ready ? (
          <p>Preparing...</p>
        ) : (
          <form onSubmit={onSubmit} className="grid gap-3">
            <label className="flex flex-col gap-2">
              <span className="text-sm text-muted-foreground">New password</span>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </label>
            <Button type="submit">Update password</Button>
          </form>
        )}
      </div>
    </SiteShell>
  );
}
