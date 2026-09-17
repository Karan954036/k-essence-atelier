import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { listAdmins, addAdmin } from "@/lib/admin.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/admin/admin-management")({
  ssr: false,
  head: () => ({ meta: [{ title: "Admin — Admins | K ESSENCE" }] }),
  component: AdminManagement,
});

function AdminManagement() {
  const fetcher = useServerFn(listAdmins);
  const query = useQuery({ queryKey: ["admin-list"], queryFn: () => fetcher({}) });
  const createFn = useServerFn(addAdmin);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    await createFn({ data: { email, password, fullName } });
    query.refetch();
  }

  return (
    <div className="p-6">
      <h1 className="mb-4 text-2xl font-serif">Admin management</h1>
      <form onSubmit={onCreate} className="mb-4 grid gap-2 w-full max-w-md">
        <Input placeholder="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
        <Input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <Button type="submit">Add admin</Button>
      </form>

      <div className="rounded border border-border/60 bg-card/40 p-4">
        <h2 className="mb-2 text-lg">Existing admins</h2>
        <ul>
          {(query.data ?? []).map((a: any) => (
            <li key={a.id} className="py-1">
              {a.fullName} — {a.email}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default AdminManagement;
