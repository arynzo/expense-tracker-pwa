import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  ReceiptText,
  Settings,
  Plus,
  FolderOpen,
} from "lucide-react";

interface AppNavProps {
  onOpenAddModal: () => void;
}

export function AppNav({ onOpenAddModal }: AppNavProps) {
  const { pathname } = useLocation();

  const navItems = [
    { label: "Dashboard", href: "/", icon: LayoutDashboard },
    { label: "Transactions", href: "/transactions", icon: ReceiptText },
    { label: "Categories", href: "/settings/categories", icon: FolderOpen },
    { label: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-sidebar border-r border-sidebar-border p-5 shrink-0 justify-between h-screen sticky top-0">
        <div className="space-y-6">
          <div className="px-2 py-1 space-y-1">
            <h1 className="font-bold text-lg text-sidebar-foreground tracking-tight leading-tight">
              Expense Tracker
            </h1>
            <p className="text-xs text-muted-foreground">
              Offline Personal Finance
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenAddModal}
            className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            Add Transaction
          </button>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold shadow-xs"
                      : "text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="pt-4 border-t border-sidebar-border px-2">
          <p className="text-[11px] text-muted-foreground">
            Saved locally on device
          </p>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar (5-Column Grid with Dead-Center Plus Button) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-md border-t border-border px-2 py-1.5 shadow-lg select-none">
        <div className="grid grid-cols-5 items-center w-full max-w-md mx-auto">
          {/* 1. Home */}
          <Link
            to="/"
            className={`flex flex-col items-center justify-center gap-1 py-1 text-[11px] font-medium transition ${
              pathname === "/"
                ? "text-emerald-600 dark:text-emerald-400 font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span>Home</span>
          </Link>

          {/* 2. Transactions */}
          <Link
            to="/transactions"
            className={`flex flex-col items-center justify-center gap-1 py-1 text-[11px] font-medium transition ${
              pathname === "/transactions"
                ? "text-emerald-600 dark:text-emerald-400 font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <ReceiptText className="w-5 h-5" />
            <span>Transactions</span>
          </Link>

          {/* 3. Dead-Center Plus Floating Action Button */}
          <div className="flex items-center justify-center">
            <button
              type="button"
              onClick={onOpenAddModal}
              title="Add Transaction"
              className="-mt-6 w-14 h-14 rounded-full bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white flex items-center justify-center shadow-lg border-4 border-card transition active:scale-95 cursor-pointer shrink-0"
            >
              <Plus className="w-7 h-7 stroke-[3]" />
            </button>
          </div>

          {/* 4. Categories (Replaced Lock Icon) */}
          <Link
            to="/settings/categories"
            className={`flex flex-col items-center justify-center gap-1 py-1 text-[11px] font-medium transition ${
              pathname === "/settings/categories"
                ? "text-emerald-600 dark:text-emerald-400 font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <FolderOpen className="w-5 h-5" />
            <span>Categories</span>
          </Link>

          {/* 5. Settings */}
          <Link
            to="/settings"
            className={`flex flex-col items-center justify-center gap-1 py-1 text-[11px] font-medium transition ${
              pathname === "/settings"
                ? "text-emerald-600 dark:text-emerald-400 font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </Link>
        </div>
      </nav>
    </>
  );
}
