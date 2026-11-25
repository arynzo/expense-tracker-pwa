# AGENTS.md — Repository Context & Engineering Guide

This file provides complete architectural and file-level context for AI coding agents and developers working on `expense-tracker-pwa`.

---

## 1. Architecture Overview

- **Type**: 100% client-side React 19 Single-Page Application (SPA) + Offline Progressive Web App (PWA).
- **Zero Backend**: There is **no server, no API routes, no SSR, no MongoDB, and no authentication/lock system**.
- **Persistence**: All data lives in browser `localStorage` via `src/lib/storage.ts` and `src/lib/themes.ts`.
- **Bundling & Offline**: Configured with `vite-plugin-pwa` (`registerType: "autoUpdate"`, Workbox `generateSW`, `navigateFallback: "/index.html"`). Production builds split vendor chunks (`react-vendor`, `charts-vendor`, `icons-vendor`) and lazy-load pages.

---

## 2. Routing (`src/App.tsx`)

| Route | Page Component | Description |
| :--- | :--- | :--- |
| `/` | `DashboardPage` | Quick Presets, Period Filter, Animated Summary Cards, 5 Charts, Recent Transactions (max 5 today) |
| `/transactions` | `TransactionsPage` | Searchable, filterable, paginated (20/page) transaction ledger grouped by date |
| `/settings` | `SettingsPage` | Links to Presets & Categories, Theme Mode, Theme Presets + Custom Shadcn CSS, Font Weights, CSV Export/Import, Clear Data |
| `/settings/categories` | `CategoriesPage` | Income & Expense category CRUD with 3 icon modes (Default Icons, Icon Link, Emoji) |
| `/settings/chips` | `ChipsSettingsPage` | Quick-Add Preset CRUD with Expense/Income type, payment method, category, and 3 icon modes |
| `*` | `Navigate to "/"` | Fallback redirect to Dashboard |

---

## 3. Data Models & `localStorage` Keys (`src/lib/storage.ts`)

### `TransactionRecord` (`expense_tracker_transactions`)
> Note: `date` and `updatedAt` were intentionally removed. Only `createdAt` is stored; `readAllTransactionsRaw()` normalizes legacy `date` fields to `createdAt` on read.
```ts
interface TransactionRecord {
  _id: string;
  type: "income" | "expense";
  title: string;
  note: string;
  amount: number;
  method: "cash" | "upi";
  category: string;
  createdAt: string; // ISO 8601 timestamp
}
```

### `CategoryRecord` (`expense_tracker_categories`)
> Note: `createdAt` is intentionally not stored on categories.
```ts
interface CategoryRecord {
  _id: string;
  name: string;
  type: "income" | "expense";
  icon: string;      // Lucide icon name, URL (https://... or data:image/...), or Emoji
  color: string;
  isDefault: boolean;
}
```
- Seeding flag: `expense_tracker_categories_initialized` (`"true"`). Prevents re-seeding if the user intentionally clears or deletes all categories.

### `PresetRecord` (`expense_tracker_presets`)
> Note: `createdAt` is intentionally not stored on presets.
```ts
interface PresetRecord {
  _id: string;
  label: string;
  amount: number;
  type: "income" | "expense";
  method: "cash" | "upi";
  category: string;
  icon: string;      // Lucide icon name, URL, or Emoji
  order: number;
}
```
- Seeding flag: `expense_tracker_presets_initialized` (`"true"`).

### Preference Keys
- `expense_tracker_period_range`: `"today" | "week" | "month" | "last_month" | "year" | "custom" | "all"`
- `expense_tracker_custom_from`, `expense_tracker_custom_to`: `YYYY-MM-DD`
- `expense_tracker_barchart_interval`: `"day" | "week" | "month" | "year"`
- `expense_tracker_theme_preset`: `"default" | "emerald" | "indigo" | "amber" | "mono" | "custom"`
- `expense_tracker_custom_theme_css`: Raw Shadcn `:root` / `.dark` CSS text
- `expense_tracker_heading_weight`: `"400" | "500" | "600" | "700" | "800"` (default `"600"`)
- `expense_tracker_body_weight`: `"300" | "400" | "500" | "600"` (default `"400"`)

---

## 4. Complete File-by-File Map

### Root Configuration
- `index.html`: HTML5 shell, mobile viewport (`user-scalable=no`), PWA `theme-color` (`#059669`), Apple mobile web app meta tags, SVG/PNG icons.
- `vite.config.ts`: Configures React, `@tailwindcss/vite`, `VitePWA` (Workbox precache + manifest), `@/` alias via `import.meta.dirname`, and `rolldownOptions.output.manualChunks` (`charts-vendor`, `icons-vendor`, `react-vendor`).
- `tsconfig.json` & `tsconfig.app.json`: TypeScript 6 config with `strict` / `verbatimModuleSyntax: true`, `erasableSyntaxOnly: true`, `@/* -> ./src/*` path alias, and `types: ["vite/client", "vite-plugin-pwa/client"]`.
- `eslint.config.js`: Flat ESLint config ignoring `dist` and `dev-dist`, enforcing `react-hooks` (including `react-hooks/set-state-in-effect`) and `react-refresh`.

### `src/` Core & Utilities
- `src/main.tsx`: Imports `@fontsource-variable/dm-sans`, applies saved theme preset & typography weights before mount, registers PWA service worker (`registerSW({ immediate: true })`), and mounts `<App />`.
- `src/App.tsx`: Sets up `ThemeProvider` (`next-themes`), `BrowserRouter`, lazy-loaded `Routes` inside `Suspense`, and `Toaster` (`sonner`).
- `src/index.css`: Tailwind CSS v4 `@import "tailwindcss"`, `tw-animate-css`, `shadcn/tailwind.css`, `@custom-variant dark`, `--font-sans` / `--font-heading` (`"DM Sans Variable"`), light/dark OKLCH CSS variables, `.no-scrollbar`, custom scrollbars, and mobile `input[type="date"]` fixes.
- `src/hooks/use-mounted.ts`: `useSyncExternalStore`-based mount check for theme toggle rendering.
- `src/lib/constants.ts`: `EXPENSE_CATEGORIES`, `INCOME_CATEGORIES`, `ALL_CATEGORIES`, `DEFAULT_PRESETS`, `PAYMENT_METHODS`, `AVAILABLE_ICONS` (42 Lucide icon names), plus `isIconUrl()` and `isLucideIconName()` helpers.
- `src/lib/utils.ts`: `cn()`, `formatINR()`, `formatDateLabel()`, `formatTimeLabel()`, `formatShortDate()`, `formatFullDate()`, and `toLocalDateKey()` (local-timezone `YYYY-MM-DD`).
- `src/lib/validations.ts`: Zod v4 schemas: `transactionSchema`, `quickPresetSchema`, `categorySchema`.
- `src/lib/storage.ts`: All `localStorage` CRUD operations, `getDashboardSummary()` (computes period totals, all-time `netBalance`, `methodSplit`, `categoryBreakdown`, `incomeCategoryBreakdown`, `dailyTrend`, `allDailyTrend`, `recentTransactions`), RFC-4180 CSV export (`generateTransactionsCSV`, `downloadTransactionsCSV`, `copyTransactionsCSV`), `importTransactionsFromCSV()`, and clear helpers (`clearAllTransactions`, `clearCategoriesByType`, `clearAllPresets`).
- `src/lib/themes.ts`: `THEME_PRESETS` (`default`, `emerald`, `indigo`, `amber`, `mono`), `HEADING_WEIGHT_OPTIONS`, `BODY_WEIGHT_OPTIONS`, `buildCustomShadcnStyle()` (extracts CSS vars and auto-wraps bare HSL triplets with `hsl(...)`), `applyThemePreset()`, and `applyTypographyWeights()` (injects `<style>` tags into `document.head`).

### `src/components/`
- `src/components/theme-provider.tsx`: Thin wrapper around `next-themes` `ThemeProvider`.
- `src/components/app-layout-wrapper.tsx`: Shared page shell rendering `<AppNav />`, `<AppHeader />`, `<main>` render-prop children (`openAddModal`, `openEditModal`, `refreshKey`, `triggerRefresh`), and global `<TransactionModal />`.
- `src/components/app-nav.tsx`: Desktop sticky sidebar + Mobile 5-column bottom navigation bar (Home, Transactions, center `+` FAB, Categories with `FolderOpen`, Settings). No lock button.
- `src/components/app-header.tsx`: Sticky header showing page icon, title, subtitle, desktop `Add Entry` button, and Light/Dark toggle.
- `src/components/quick-presets.tsx`: Horizontal scrollable 1-tap preset chips on Dashboard; color-codes amount green (`income`) or red (`expense`); triggers `Undo` toast via `deleteTransaction()`.
- `src/components/period-filter.tsx`: Period pills (`Today`, `This Week`, `This Month`, `Last Month`, `This Year`, `All Time`, `Custom`) + custom date inputs persisted in `localStorage`.
- `src/components/summary-cards.tsx`: 3 cards (**Total Income**, **Total Expense**, **Net Balance**) with `AnimatedINR` (`requestAnimationFrame` ease-out cubic 650ms count-up animation, respecting `prefers-reduced-motion`).
- `src/components/recent-transactions.tsx`: Shows today's latest 5 transactions under the title **Recent Transactions** (`Latest entries (Max 5)`) with `View All` link.
- `src/components/transaction-modal.tsx`: Add/Edit/Delete transaction modal using keyed inner component `TransactionModalContent` (avoids `setState` in `useEffect`). Includes `Expense`/`Income` toggle, amount, title, category select, `UPI`/`Cash` toggle, clickable `Date` & `Time` pickers (`showPicker?.()`), and expandable/resizable `Note` textarea.
- `src/components/charts/cash-flow-bar-chart.tsx`: `Day`/`Week`/`Month`/`Year` Recharts `BarChart` with year selector in `month` mode; enables horizontal scrolling when `chartData.length > 10`.
- `src/components/charts/charts-container.tsx`: Renders `CashFlowBarChart`, Daily Spending Trend `AreaChart`, Category Breakdown `PieChart` (with `Expense`/`Income` toggle and scrollable legend), Income vs Expense `BarChart`, and Payment Method Split (`Expense`/`Income` toggle).
- `src/components/ui/category-icon.tsx`: Renders Lucide icons from `ICON_MAP`, `<img>` for URLs, `<span>` for Emojis, and falls back to `getCategories()` lookup by category name or keyword heuristics.
- `src/components/ui/select.tsx`: Accessible Shadcn-style Select built on `@base-ui/react/select`.

### `src/pages/`
- `src/pages/DashboardPage.tsx`: Computes summary synchronously with `useMemo` from `getDashboardSummary()` and wires `QuickPresets`, `PeriodFilter`, `SummaryCards`, `ChartsContainer`, `RecentTransactions`.
- `src/pages/TransactionsPage.tsx`: Computes filtered/paginated transactions with `useMemo` from `getTransactions()`, grouped by `formatDateLabel(t.createdAt)`.
- `src/pages/SettingsPage.tsx`: Navigation cards to Presets & Categories, Theme Mode buttons, Theme Preset Select (with color dot preview in trigger) + Custom Shadcn CSS editor & `ui.shadcn.com/create` link, Title & Body Font Weight Selects, Data Backup & Restore (Download CSV, Copy CSV, Import CSV modal), and Clear Data card with confirmation modal.
- `src/pages/CategoriesPage.tsx`: Expense/Income tabs, dynamic `New Category` button colored by active tab, category grid, Add/Edit modal with `Default Icons` / `Icon Link` / `Emoji` selector, and Delete confirmation modal.
- `src/pages/ChipsSettingsPage.tsx`: Presets management page (`Quick-Add Presets`) with Expense/Income type toggle, filtered category dropdown, and `Default Icons` / `Icon Link` / `Emoji` selector.

---

## 5. Engineering Conventions & Gotchas

1. **ESLint `react-hooks/set-state-in-effect`**: Never call `setState` synchronously inside `useEffect` (since `localStorage` is synchronous, use lazy `useState(() => ...)` initializers or `useMemo`, or key-reset child components like `TransactionModalContent`).
2. **TypeScript `verbatimModuleSyntax: true`**: Always use `import type` for type-only imports.
3. **Only export React components from `.tsx` files** that are hot-reloaded, or ESLint `react-refresh/only-export-components` will fail. Put shared helpers/constants in `src/lib/`.
4. **Always verify changes** with:
   ```bash
   npm run lint
   npm run build
   ```
