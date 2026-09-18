# Lumberyard App — Change Log

## Session: Global Navigation Updates
**Date:** April 9, 2026  
**Scope:** Contractor Portal (Dashboard + Pipeline) · Lumberyard Dashboard (consistency pass)  
**Status:** Completed ✅

---

### 1. Messages / Communications — Added to Sidebar (All Roles)

**Files modified:**
- `/src/app/components/layout/AppLayout.tsx`
- `/src/app/routes.ts`

**Files created:**
- `/src/app/pages/shared/MessagesPage.tsx`

**What was done:**

- Added `MessageSquare` (lucide-react) to the icon import set in `AppLayout.tsx`.
- Extended the `NavItem` interface with an optional `badge?: number` field to support unread count indicators.
- Added a `unreadMessageCounts` map (mock values, keyed by role) so each role shows its own unread count. In production this would be wired to a real-time context or API.
- Added a **Messages** nav item to every role's sidebar nav (`contractor`, `lumberyard`, `architect`, `homeowner`), each pointing to `/{role}/messages`.
  - The nav item renders a **red unread badge** on both the expanded label (right side) and the collapsed icon (top-right dot) so the count is always visible regardless of sidebar state.
- Created `/src/app/pages/shared/MessagesPage.tsx` — a full threaded messaging UI with:
  - **Left panel:** conversation list with search, four filter tabs (All / Unread / Projects / Support), per-conversation unread badges, tag chips (Project / Support / Platform / Internal), and participant metadata.
  - **Right panel:** active thread view with message bubbles (mine = green right-aligned, theirs = white left-aligned), date separators, per-message delivery indicators (in-app ⚡ vs email relay ✉), and double-checkmark read receipts on sent messages.
  - **Email relay concept:** a persistent blue banner in the thread header confirms that messages are also delivered to the recipient's email when they are offline. A footer line in the left panel reiterates the relay behavior. Each message timestamp row shows its delivery channel.
  - **Compose area:** textarea with Enter-to-send / Shift+Enter-for-newline, attachment button, and a send button that disables when the draft is empty. Sends append to local state (ready for API integration).
  - **Role-aware mock data:** each role loads a different set of realistic, construction-domain conversations:
    - **Contractor:** Austin Timber Supply (quote thread, 2 unread), James Chen PE (structural review, 1 unread), Delivery Dispatch, Platform Support.
    - **Lumberyard:** Mike Torres / Torres Construction (RFQ-001, 3 unread), Jennifer Walsh (bulk pricing), Platform Operations (new RFQ alert, 1 unread).
    - **Architect:** Mike Torres (takeoff review request, 2 unread), Platform Support.
    - **Homeowner:** Platform Support (welcome + onboarding, 1 unread).
- Added four route-wrapper components in `routes.ts` (`ContractorMessages`, `LumberyardMessages`, `ArchitectMessages`, `HomeownerMessages`) following the exact same pattern as the existing `*Settings` wrappers.
- Registered `{ path: "messages", Component: *Messages }` inside all four role route groups.

**Not changed (finalized):**
- Layout structure, sidebar collapse behavior, role switcher, logo, user section, desktop/mobile responsive logic.

---

### 2. Role Badge — Normalized to Consistent Top-Bar Placement

**Files modified:**
- `/src/app/components/layout/AppLayout.tsx`

**What was done:**

- The role badge (`<HardHat />` Contractor / `<Building2 />` Lumberyard / `<Ruler />` Architect / `<UserCircle />` Homeowner) already lived exclusively in the shared `AppLayout` top-bar, meaning it was architecturally consistent across all screens. This session reinforced that by:
  - Keeping the badge at the **fixed position** in the top-bar right cluster: `Bell → Messages → Role Badge → Avatar` — this order is now locked and identical on every page for every role.
  - Adding `font-semibold` and `select-none` to the badge for improved visual weight and UX hygiene (was previously `font-medium`).
  - Adding a **Messages shortcut icon button** (`MessageSquare`) to the top-bar right cluster, with its own red unread count bubble, so the header action cluster is complete and role-consistent across all screens.

**Not changed (finalized):**
- Badge color palette per role (`bg-blue-500` Contractor, `bg-amber-500` Lumberyard, `bg-violet-500` Architect, `bg-rose-500` Homeowner).
- `hidden sm:flex` visibility rule (badge is intentionally hidden on very small mobile viewports where the sidebar provides role context).
- No page-level headers were touched — role identity remains solely in the shared AppLayout.

---

### Summary of All Files Touched

| File | Action | Notes |
|---|---|---|
| `/src/app/components/layout/AppLayout.tsx` | Modified | Added MessageSquare import, NavItem badge field, Messages nav items (all 4 roles), Messages header shortcut button, role badge font-semibold, `useNavigate` in AppLayout |
| `/src/app/routes.ts` | Modified | Added MessagesPage import, 4 role wrapper components, 4 messages routes |
| `/src/app/pages/shared/MessagesPage.tsx` | Created | Full threaded messaging UI with email relay concept, role-aware mock data |
| `/src/CHANGELOG.md` | Created | This file |

---

### What Was NOT Modified (Preserved as Finalized)

- `/src/app/pages/contractor/ContractorDashboard.tsx`
- `/src/app/pages/contractor/ContractorProjects.tsx`
- `/src/app/pages/contractor/TakeoffResults.tsx`
- `/src/app/components/contractor/QuoteBanner.tsx`
- `/src/app/pages/contractor/Checkout.tsx` (previously updated this session for quote data — not touched here)
- All lumberyard page components (`LumberyardDashboard`, `LumberyardOrders`, `LumberyardQuotations`, `ProductCatalog`, `CapacityManagement`, `LumberyardAnalytics`)
- `/src/app/pages/shared/SettingsPage.tsx`
- `/src/styles/theme.css`
- All context files (`QuoteContext.tsx`)
- All data files (`mockData.ts`, `priceData.ts`)
