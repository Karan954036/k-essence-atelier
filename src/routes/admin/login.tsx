import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/login")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Admin Login | K ESSENCE" },
      { name: "description", content: "Sign in to the K ESSENCE admin panel." },
    ],
  }),
  component: AdminLogin,
});

function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (signInError || !data.user) {
        setError(signInError?.message ?? "Sign in failed");
        return;
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", data.user.id)
        .maybeSingle();

      if (!profile?.is_admin) {
        await supabase.auth.signOut();
        setError("This account does not have admin access.");
        return;
      }
      window.location.assign("/admin/dashboard");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-16">
      <div className="w-full max-w-md rounded-lg border border-border/60 bg-card/40 p-8">
        <p className="font-serif text-lg tracking-[0.2em] text-primary">K ESSENCE</p>
        <h1 className="mb-4 mt-4 font-serif text-2xl">Admin sign in</h1>
        <form className="grid gap-3" onSubmit={onSubmit}>
          <label className="flex flex-col gap-2">
            <span className="text-sm text-muted-foreground">Email</span>
            <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-sm text-muted-foreground">Password</span>
            <Input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <Button type="submit" disabled={busy}>
            {busy ? "Signing in…" : "Sign in"}
          </Button>
          <a href="/admin/setup" className="text-xs text-muted-foreground underline">
            First-time admin setup
          </a>
        </form>
      </div>
    </div>
  );
}
