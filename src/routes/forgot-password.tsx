import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/SiteShell";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";

const schema = z.object({ email: z.string().email() });

export const Route = createFileRoute("/forgot-password")({
  component: Forgot,
});

function Forgot() {
  const { register, handleSubmit } = useForm({ resolver: zodResolver(schema) });
  const { sendPasswordReset } = useAuth();

  async function onSubmit(values: any) {
    try {
      await sendPasswordReset(values.email);
      alert("If an account exists, a password reset email was sent.");
    } catch (e) {
      console.error(e);
      alert("Failed to request password reset");
    }
  }

  return (
    <SiteShell>
      <div className="mx-auto max-w-md px-4 py-12">
        <h1 className="mb-6 text-2xl font-semibold">Reset password</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-3">
          <label className="flex flex-col gap-2">
            <span className="text-sm text-muted-foreground">Email</span>
            <Input placeholder="you@example.com" {...register("email")} />
          </label>
          <Button type="submit">Send reset email</Button>
        </form>
      </div>
    </SiteShell>
  );
}
