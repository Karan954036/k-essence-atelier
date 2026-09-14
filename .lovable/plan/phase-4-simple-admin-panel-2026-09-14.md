# Phase 4 — Simple Admin Panel

Nothing in the customer site changes: registration, login, account, forgot/reset password and all shop pages stay exactly as they are.

One thing I found while checking: the `profiles` table was written as a setup file earlier but never actually created in the database, so no profile rows exist today. Account pages currently read the name straight from the login record, so nothing is broken — but I need to create `profiles` properly now so admin status can live on it. Order tables don't exist yet either (checkout is a later phase), so I'll create them now; the Orders screen will simply be empty until checkout is built.

## Database

**profiles** (new, one row per registered person, auto-created on signup)
- full name, phone, avatar
- `is_admin` (true/false, default false)

**orders** (new)
- order number, customer, status (pending / processing / shipped / delivered / cancelled), payment status, total, shipping address, contact details

**order_items** (new)
- order, product, variant label, unit price, quantity

**stock_movements** (new)
- product variant, change amount (positive or negative), resulting stock, reason text, who made the change

Existing catalog tables (products, variants, categories, collections, media, notes) keep their public read rules and gain admin write rules.

## Access rules

- A helper `is_admin()` check runs with elevated rights so rules can ask "is this person an admin?" without loops.
- Everyone signed in can read and edit **their own** profile — but the admin flag is protected by a guard that silently keeps its old value on any normal profile update. Only backend code can change it.
- Admins can read every profile, every order, and all stock history.
- Customers can read only their own orders and order items.
- Admins get full add/edit/delete on products, variants, categories, collections, media, notes, orders, and stock movements. Public read stays unchanged.
- Stock history is insert-only for admins; rows can never be edited or deleted, so every change stays on record.

## One-time admin setup

- New page `/admin/setup`.
- Before showing the form, and again when the form is submitted, the backend counts existing admins. If one exists, it refuses with "Admin setup is already complete" — the check is server-side, never just hidden in the UI.
- Creating the first admin makes the account and marks it admin using backend-only privileges.

## Admin pages

- `/admin/login` — separate from customer login; refuses anyone whose profile isn't marked admin.
- `/admin` — dark sidebar layout; cards for today's orders, today's revenue, pending orders, low-stock count.
- `/admin/products` — list, add, edit, delete, publish/unpublish, image upload into a new `product-images` storage area (public read, admin-only upload).
- `/admin/categories` — simple add/edit/delete.
- `/admin/orders` — list, view details, move status through pending → processing → shipped → delivered → cancelled.
- `/admin/inventory` — stock per product size, manual add/reduce with a required reason, and the full change history.
- `/admin/customers` — read-only list with each person's orders.
- `/admin/admins` — add another admin, or change your own password.

Everything under `/admin` (except setup and login) sits behind an admin-only gate, and each backend action re-checks admin status itself.

## Out of scope, as you asked

No roles beyond the single admin flag, no manufacturing/BOM/batches/QC/warehouses, no invoicing, coupons, CMS, analytics charts, and no raw database-command endpoints.

## Technical notes

- Postgres: `is_admin()` as a `security definer` function; a `BEFORE UPDATE` trigger on `profiles` that resets `is_admin` to `OLD.is_admin` unless the caller is `service_role`; `GRANT`s issued for every new table.
- Admin writes and setup run through `createServerFn` handlers using `requireSupabaseAuth` plus an explicit `is_admin` check, escalating to the service-role client only after that check; setup counts admins with the service-role client.
- Admin routes live under `src/routes/admin/*` with a client-side gate layout; the customer `_authenticated` pattern is untouched.
- The stale `supabase/migrations/20260911_add_profiles.sql` file contains invalid SQL and was never applied; the new migration supersedes it.
