import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/SiteShell";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { useEffect } from "react";

const schema = z
  .object({
    fullName: z.string().min(1, "Required"),
    email: z.string().email(),
    password: z.string().min(6),
    confirm: z.string().min(6),
  })
  .refine((d) => d.password === d.confirm, { message: "Passwords must match", path: ["confirm"] });

export const Route = createFileRoute("/register")({
  component: Register,
});

function Register() {
  const { register: r, handleSubmit } = useForm({ resolver: zodResolver(schema) });
  const { signUp, user } = useAuth();

  useEffect(() => {
    if (user) window.location.assign("/account");
  }, [user]);

  async function onSubmit(values: any) {
    try {
      await signUp({ email: values.email, password: values.password, fullName: values.fullName });
      alert("Registration successful. Check your email for confirmation if required.");
      window.location.assign("/login");
    } catch (e) {
      console.error(e);
      alert("Registration failed");
    }
  }

  return (
    <SiteShell>
      <div className="mx-auto max-w-md px-4 py-12">
        <h1 className="mb-6 text-2xl font-semibold">Create an account</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-3">
          <label className="flex flex-col gap-2">
            <span className="text-sm text-muted-foreground">Full name</span>
            <Input placeholder="Your full name" {...r("fullName")} />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm text-muted-foreground">Email</span>
            <Input placeholder="you@example.com" {...r("email")} />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm text-muted-foreground">Password</span>
            <Input type="password" placeholder="Password" {...r("password")} />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm text-muted-foreground">Confirm password</span>
            <Input type="password" placeholder="Confirm password" {...r("confirm")} />
          </label>

          <Button type="submit">Create account</Button>
        </form>
      </div>
    </SiteShell>
  );
}
