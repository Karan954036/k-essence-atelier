import { createFileRoute, Outlet, useRouterState } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";
import { useAdmin } from "@/lib/use-admin";
import { useEffect } from "react";
import AdminDashboard from "./dashboard";

export const Route = createFileRoute("/admin")({
  ssr: false,
  component: AdminLayout,
});

const PUBLIC_ADMIN_PATHS = ["/admin/login", "/admin/setup"];

function AdminLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isPublic = PUBLIC_ADMIN_PATHS.includes(pathname);
  const { user, isAdmin, isLoading } = useAdmin();

  useEffect(() => {
    if (isPublic || isLoading) return;
    if (!user || !isAdmin) window.location.assign("/admin/login");
  }, [isPublic, isLoading, user, isAdmin]);

  if (isPublic) return <Outlet />;
  if (isLoading || !user || !isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">
        Checking admin access…
      </div>
    );
  }

  // Render dashboard directly at /admin for a better default landing.
  if (pathname === "/admin") {
    return (
      <AdminShell>
        <AdminDashboard />
      </AdminShell>
    );
  }

  return (
    <AdminShell>
      <Outlet />
    </AdminShell>
  );
}
