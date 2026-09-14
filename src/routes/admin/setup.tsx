import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createFirstAdmin, getAdminSetupStatus } from "@/lib/admin.functions";

export const Route = createFileRoute("/admin/setup")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Admin Setup | K ESSENCE" },
      {
        name: "description",
        content: "One-time setup of the first K ESSENCE admin account.",
      },
    ],
  }),
  component: AdminSetup,
});

function AdminSetup() {
  const status = useServerFn(getAdminSetupStatus);
  const create = useServerFn(createFirstAdmin);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [done, setDone] = useState(false);

  const setupStatus = useQuery({ queryKey: ["admin-setup-status"], queryFn: () => status({}) });

  const mutation = useMutation({
    mutationFn: () => create({ data: { email, password, fullName } }),
    onSuccess: () => setDone(true),
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-16">
      <div className="w-full max-w-md rounded-lg border border-border/60 bg-card/40 p-8">
        <p className="font-serif text-lg tracking-[0.2em] text-primary">K ESSENCE</p>
        <h1 className="mb-1 mt-4 font-serif text-2xl">Admin setup</h1>

        {setupStatus.isLoading ? (
          <p className="text-sm text-muted-foreground">Checking…</p>
        ) : setupStatus.data?.needsSetup === false || done ? (
          <div className="mt-4 space-y-4">
            <p className="text-sm text-muted-foreground">
              {done
                ? "Admin account created. You can sign in now."
                : "Admin setup is already complete. This page can no longer be used."}
            </p>
            <Button asChild>
              <a href="/admin/login">Go to admin login</a>
            </Button>
          </div>
        ) : (
          <form
            className="mt-4 grid gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              mutation.mutate();
            }}
          >
            <p className="text-sm text-muted-foreground">
              No admin exists yet. Create the first admin account.
            </p>
            <label className="flex flex-col gap-2">
              <span className="text-sm text-muted-foreground">Full name</span>
              <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-sm text-muted-foreground">Email</span>
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-sm text-muted-foreground">Password (min 8 characters)</span>
              <Input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>
            {mutation.error ? (
              <p className="text-sm text-destructive">{(mutation.error as Error).message}</p>
            ) : null}
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Creating…" : "Create admin account"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
