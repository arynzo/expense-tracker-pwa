import {
  Plus,
  Sun,
  Moon,
  LayoutDashboard,
  ReceiptText,
  Settings,
  FolderTree,
  Zap,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useMounted } from "@/hooks/use-mounted";

interface AppHeaderProps {
  onOpenAddModal: () => void;
  title?: string;
}

export function AppHeader({ onOpenAddModal, title }: AppHeaderProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const mounted = useMounted();

  const toggleTheme = () => {
    const current = resolvedTheme || theme;
    setTheme(current === "dark" ? "light" : "dark");
  };

  const currentTitle = title || "Overview";

  const getPageIcon = () => {
    const t = currentTitle.toLowerCase();
    if (t.includes("chip") || t.includes("preset")) {
      return <Zap className="w-5 h-5 text-amber-500" />;
    }
    if (t.includes("category")) {
      return <FolderTree className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
    }
    if (t.includes("transaction") || t.includes("ledger") || t.includes("history")) {
      return <ReceiptText className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
    }
    if (t.includes("setting")) {
      return <Settings className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
    }
    return <LayoutDashboard className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
  };

  return (
    <header className="flex items-center justify-between px-4 sm:px-8 py-3.5 bg-background/80 backdrop-blur-md border-b border-border sticky top-0 z-30">
      <div className="flex items-center gap-2.5">
        <div className="p-2 rounded-xl bg-secondary/80 border border-border text-foreground">
          {getPageIcon()}
        </div>
        <div>
          <h2 className="text-base sm:text-lg font-bold text-foreground tracking-tight leading-tight">
            {currentTitle}
          </h2>
          <p className="text-[11px] sm:text-xs text-muted-foreground leading-tight">
            Expense Tracker
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onOpenAddModal}
          className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          Add Entry
        </button>

        <button
          type="button"
          onClick={toggleTheme}
          title={mounted && resolvedTheme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
          aria-label="Toggle theme"
          className="p-2 rounded-xl bg-secondary hover:bg-muted border border-border text-foreground transition cursor-pointer"
        >
          {mounted ? (
            resolvedTheme === "dark" ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700" />
            )
          ) : (
            <div className="w-4 h-4" />
          )}
        </button>
      </div>
    </header>
  );
}
