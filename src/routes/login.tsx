import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/SiteShell";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { useEffect } from "react";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const Route = createFileRoute("/login")({
  component: Login,
});

function Login() {
  const { register, handleSubmit, formState } = useForm({ resolver: zodResolver(schema) });
  const { signIn, user } = useAuth();

  useEffect(() => {
    if (user) {
      // already logged in - go to account
      window.location.assign("/account");
    }
  }, [user]);

  async function onSubmit(values: any) {
    try {
      const res = await signIn({ email: values.email, password: values.password });
      if (res?.error) {
        console.error(res.error);
        alert(res.error.message || "Login failed");
        return;
      }
      // On success, return to optional returnTo
      const params = new URLSearchParams(window.location.search);
      const returnTo = params.get("returnTo");
      const safeReturn = returnTo && returnTo.startsWith("/") ? returnTo : "/account";
      window.location.assign(safeReturn as string);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      alert("Login failed");
    }
  }

  return (
    <SiteShell>
      <div className="mx-auto max-w-md px-4 py-12">
        <h1 className="mb-6 text-2xl font-semibold">Sign in</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-3">
          <label className="flex flex-col gap-2">
            <span className="text-sm text-muted-foreground">Email</span>
            <Input placeholder="you@example.com" {...register("email")} />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm text-muted-foreground">Password</span>
            <Input type="password" placeholder="Password" {...register("password")} />
          </label>

          <div className="flex items-center justify-between">
            <a href="/register" className="text-sm text-primary underline">
              Register
            </a>
            <a href="/forgot-password" className="text-sm text-primary underline">
              Forgot password?
            </a>
          </div>

          <Button type="submit">Sign in</Button>
        </form>
      </div>
    </SiteShell>
  );
}
