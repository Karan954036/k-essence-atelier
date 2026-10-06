// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// Public (publishable) backend config. .env is git-ignored in this project, so hosted
// builds may not receive it; these fallbacks keep the browser client working.
const SUPABASE_URL =
  process.env['VITE_SUPABASE_URL'] || "https://xjbkxfidutrezjtwdyxe.supabase.co";
const SUPABASE_PUBLISHABLE_KEY =
  process.env['VITE_SUPABASE_PUBLISHABLE_KEY'] || "sb_publishable_CwBdZGatnaZQv-yYqV_aEw_Qq-g3two";

export default defineConfig({
  vite: {
    define: {
      "import.meta.env.VITE_SUPABASE_URL": JSON.stringify(SUPABASE_URL),
      "import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY": JSON.stringify(SUPABASE_PUBLISHABLE_KEY),
      "import.meta.env.VITE_SUPABASE_PROJECT_ID": JSON.stringify("xjbkxfidutrezjtwdyxe"),
    },
  },
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
});
