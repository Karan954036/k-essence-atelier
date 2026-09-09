import type { ReactNode } from "react";
import { AnnouncementBar, Header } from "./Header";
import { Footer } from "./Footer";
import { MobileBottomNav } from "./MobileBottomNav";

/** Shared page shell: announcement bar, sticky header, content, footer, mobile nav. */
export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <div className="grain min-h-screen">
      <AnnouncementBar />
      <Header />
      <main className="pb-20 lg:pb-0">{children}</main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}
