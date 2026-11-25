# Expense Tracker PWA

A fast, **100% offline-first** personal finance & budgeting Progressive Web App (PWA) built with **React 19**, **TypeScript**, **Vite**, **Tailwind CSS v4**, and **Recharts**. All data is stored locally on your device using `localStorage` — no backend, no database server, and no login required.

---

## Key Features

### 1. 100% Offline PWA
- **Installable** on Android, iOS, and Desktop (`manifest.webmanifest` + 192×192, 512×512 PNG & SVG icons).
- **Workbox Service Worker** (`vite-plugin-pwa`) precaches all JS chunks, CSS, HTML, icons, and bundled **DM Sans** variable fonts so the app loads and works completely offline.

### 2. LocalStorage CRUD Engine
- **Transactions** (`income` & `expense`) with `cash` and `upi` payment methods, custom date & time, expandable notes (up to 500 chars), and `createdAt`-based sorting.
- **Categories** (separate `expense` & `income` lists) auto-seeded on first launch with full Create, Edit, and Delete support.
- **1-Tap Quick Presets** auto-seeded on first launch for instant 1-tap logging with **Undo** toast support.

### 3. Dashboard & Interactive Analytics
- **Animated Summary Cards**: Smooth count-up animation for **Total Income**, **Total Expense**, and all-time **Net Balance**.
- **Period Filter**: `Today`, `This Week`, `This Month`, `Last Month`, `This Year`, `All Time`, and `Custom` date range (persisted in `localStorage`).
- **Cash Flow Analytics**: `Day`, `Week`, `Month` (with year picker), and `Year` bar chart with automatic horizontal scrolling when more than 10 bars are displayed.
- **Daily Spending Trend**: Area chart comparing daily income vs expense.
- **Category Breakdown Donut Chart**: Toggle between **Expense** and **Income** categories with scrollable legend and percentage share.
- **Income vs Expense Comparison**: Direct volume bar chart.
- **Payment Method Split**: Toggle between **Expense** and **Income** to compare **UPI / Online** vs **Cash** distribution.
- **Recent Transactions**: Quick view of today's latest 5 entries with 1-tap edit.

### 4. Transactions Ledger
- Full history grouped by date (`Today`, `Yesterday`, formatted dates).
- Real-time search by title, note, or category.
- Collapsible filters for **Transaction Type** (`All` / `Expense` / `Income`), **Payment Method** (`All` / `UPI` / `Cash`), and **Category**.
- Pagination (20 items per page).

### 5. Category & Preset Management
- **3 Icon Modes** for both Categories and Presets:
  - **Default Icons**: 42 built-in Lucide icons.
  - **Icon Link**: Any direct image/icon URL (`https://...`) with live preview.
  - **Emoji**: Any emoji typed or pasted from your keyboard with live preview.
- **Quick-Add Presets** (`/settings/chips`): Support both `Expense` (red) and `Income` (green) presets with filtered category selection.

### 6. Themes, Shadcn Presets & Typography
- **Mode**: `Dark`, `Light`, and `System` theme switching.
- **Theme Presets**:
  - `Default Zinc`
  - `Emerald Finance`
  - `Midnight Indigo`
  - `Warm Amber`
  - `Sharp Mono`
  - **Custom Shadcn CSS**: Paste `:root` / `.dark` CSS variables directly from [ui.shadcn.com/create](https://ui.shadcn.com/create) and apply them live.
- **Typography Controls**:
  - **Title Font Weight**: `Normal (400)`, `Medium (500)`, `Semibold (600)`, `Bold (700)`, `Extra Bold (800)`.
  - **Body Font Weight**: `Light (300)`, `Normal (400)`, `Medium (500)`, `Semibold (600)`.
  - Uses locally bundled **DM Sans Variable** font for crisp offline rendering.

### 7. Data Backup, Restore & Clear Data
- **Export Transactions (CSV)**: Downloads a `.csv` backup file directly from the browser.
- **Copy CSV to Clipboard**: Copies all transactions in CSV format to your clipboard.
- **Import CSV Backup**: Paste CSV text or pick a `.csv` file to import/restore transactions (duplicate IDs are automatically skipped, and missing categories are auto-created).
- **Clear Data**: Individual confirmation-protected actions to clear Transactions, Income Categories, Expense Categories, or Presets.

---

## Tech Stack

- **Framework**: React 19 + TypeScript + Vite 8
- **Routing**: React Router DOM v7 (lazy-loaded routes)
- **Styling**: Tailwind CSS v4 + `tw-animate-css` + Base UI (`@base-ui/react`)
- **Charts**: Recharts v3
- **Icons**: Lucide React + custom URL/Emoji icon renderer
- **Validation**: Zod v4
- **Notifications**: Sonner
- **PWA**: `vite-plugin-pwa` (Workbox `generateSW`)
- **Font**: `@fontsource-variable/dm-sans`

---

## Project Structure

```text
expense-tracker-pwa/
├── index.html                  # App shell, meta tags, PWA theme-color
├── vite.config.ts              # Vite, Tailwind, PWA Workbox & chunking config
├── eslint.config.js            # ESLint flat config
├── public/                     # Static PWA icons (icon.svg, pwa-192x192.png, pwa-512x512.png)
└── src/
    ├── main.tsx                # Entry point: DM Sans font, theme/typography init, SW register
    ├── App.tsx                 # BrowserRouter, lazy routes, ThemeProvider, Toaster
    ├── index.css               # Tailwind v4 theme tokens & custom scrollbar/date styles
    ├── hooks/
    │   └── use-mounted.ts      # Hydration-safe mount hook
    ├── lib/
    │   ├── constants.ts        # Default categories, presets, 42 icons, icon type helpers
    │   ├── storage.ts          # localStorage CRUD, aggregations, CSV export/import, clear helpers
    │   ├── themes.ts           # Shadcn theme presets, custom CSS parser, font-weight engine
    │   ├── utils.ts            # cn(), formatINR(), date/time formatting helpers
    │   └── validations.ts      # Zod schemas for transactions, presets, categories
    ├── components/
    │   ├── app-header.tsx      # Top sticky header with page icon, Add Entry & theme toggle
    │   ├── app-layout-wrapper.tsx # Responsive shell (desktop sidebar + mobile bottom bar + modal)
    │   ├── app-nav.tsx         # Desktop sidebar & 5-column mobile bottom navigation
    │   ├── period-filter.tsx   # Period pills & custom date range selector
    │   ├── quick-presets.tsx   # 1-tap preset chips row with Undo toast
    │   ├── recent-transactions.tsx # Today's latest 5 transactions card
    │   ├── summary-cards.tsx   # Animated Income, Expense, and Net Balance cards
    │   ├── theme-provider.tsx  # next-themes wrapper
    │   ├── transaction-modal.tsx # Add/Edit/Delete modal with date, time & expandable note
    │   ├── charts/
    │   │   ├── cash-flow-bar-chart.tsx # Day/Week/Month/Year bar chart
    │   │   └── charts-container.tsx    # Trend, Category Donut, Comparison, Method Split
    │   └── ui/
    │       ├── category-icon.tsx # Renders Lucide icons, URLs, or Emojis
    │       └── select.tsx        # Base UI accessible Select component
    └── pages/
        ├── DashboardPage.tsx     # Main overview dashboard (/)
        ├── TransactionsPage.tsx  # Searchable/filterable ledger (/transactions)
        ├── SettingsPage.tsx      # Themes, fonts, CSV backup/restore, clear data (/settings)
        ├── CategoriesPage.tsx    # Income & Expense category CRUD (/settings/categories)
        └── ChipsSettingsPage.tsx # Quick-Add Preset CRUD (/settings/chips)
```

---

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Lint code
npm run lint

# Build production PWA bundle
npm run build

# Preview production PWA locally (test offline & installability)
npm run preview
```

---

## LocalStorage Keys

| Key | Purpose |
| :--- | :--- |
| `expense_tracker_transactions` | Array of `TransactionRecord` objects |
| `expense_tracker_categories` | Array of `CategoryRecord` objects |
| `expense_tracker_categories_initialized` | Prevents re-seeding after intentional clear/delete |
| `expense_tracker_presets` | Array of `PresetRecord` objects |
| `expense_tracker_presets_initialized` | Prevents re-seeding after intentional clear/delete |
| `expense_tracker_period_range` | Selected dashboard period filter |
| `expense_tracker_custom_from` / `_to` | Custom date range values |
| `expense_tracker_barchart_interval` | Cash Flow bar chart interval (`day`/`week`/`month`/`year`) |
| `expense_tracker_theme_preset` | Active theme preset ID (`default`, `emerald`, `indigo`, `amber`, `mono`, `custom`) |
| `expense_tracker_custom_theme_css` | User-pasted Shadcn CSS variables |
| `expense_tracker_heading_weight` | Selected title font weight (`400`–`800`) |
| `expense_tracker_body_weight` | Selected body font weight (`300`–`600`) |
