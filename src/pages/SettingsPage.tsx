import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useTheme } from "next-themes";
import {
  Zap,
  Download,
  Copy,
  Upload,
  Moon,
  Sun,
  Laptop,
  Loader2,
  FileSpreadsheet,
  FolderTree,
  ChevronRight,
  X,
  Check,
} from "lucide-react";
import { AppLayoutWrapper } from "@/components/app-layout-wrapper";
import { useMounted } from "@/hooks/use-mounted";
import {
  downloadTransactionsCSV,
  copyTransactionsCSV,
  importTransactionsFromCSV,
} from "@/lib/storage";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const mounted = useMounted();

  const [isExporting, setIsExporting] = useState(false);
  const [isCopying, setIsCopying] = useState(false);

  // Import CSV Modal state
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [csvInput, setCsvInput] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportCSV = () => {
    setIsExporting(true);
    try {
      const count = downloadTransactionsCSV();
      toast.success(`CSV exported (${count} transaction${count !== 1 ? "s" : ""})!`);
    } catch {
      toast.error("Failed to download CSV");
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyCSV = async () => {
    setIsCopying(true);
    try {
      const count = await copyTransactionsCSV();
      toast.success(`Copied CSV to clipboard (${count} transaction${count !== 1 ? "s" : ""})!`);
    } catch {
      toast.error("Failed to copy CSV to clipboard");
    } finally {
      setIsCopying(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setCsvInput(reader.result);
      }
    };
    reader.onerror = () => {
      toast.error("Failed to read CSV file");
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleImportCSV = (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvInput.trim()) {
      toast.error("Please paste CSV data or choose a CSV file");
      return;
    }

    setIsImporting(true);
    try {
      const res = importTransactionsFromCSV(csvInput);
      if (!res.success) {
        toast.error(res.error || "Failed to import CSV");
        return;
      }

      const parts: string[] = [];
      if (res.imported > 0) parts.push(`${res.imported} imported`);
      if (res.skipped > 0) parts.push(`${res.skipped} duplicate${res.skipped !== 1 ? "s" : ""} skipped`);
      if (res.failed > 0) parts.push(`${res.failed} invalid row${res.failed !== 1 ? "s" : ""} ignored`);

      toast.success(`CSV Import complete: ${parts.join(", ")}`);
      setCsvInput("");
      setIsImportOpen(false);
    } catch {
      toast.error("Failed to import CSV");
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <AppLayoutWrapper pageTitle="App Settings">
      {() => (
        <div className="max-w-4xl space-y-6">
          {/* Navigation Cards Section */}
          <div className="space-y-3">
            {/* 1. Quick-Add Preset Chips Card */}
            <Link
              to="/settings/chips"
              className="block bg-card border border-border text-card-foreground rounded-2xl p-5 sm:p-6 hover:border-input hover:bg-muted/30 transition shadow-xs group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-foreground group-hover:text-primary transition">
                      Quick-Add Preset Chips
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Configure 1-tap shortcut chips, default amounts, payment methods, and icons
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition transform group-hover:translate-x-0.5" />
              </div>
            </Link>

            {/* 2. Manage Categories Card */}
            <Link
              to="/settings/categories"
              className="block bg-card border border-border text-card-foreground rounded-2xl p-5 sm:p-6 hover:border-input hover:bg-muted/30 transition shadow-xs group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                    <FolderTree className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-foreground group-hover:text-primary transition">
                      Category Management
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Customize your Income & Expense categories, add new tags, and edit icons
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition transform group-hover:translate-x-0.5" />
              </div>
            </Link>
          </div>

          {/* 3. Appearance / Theme */}
          <div className="bg-card border border-border text-card-foreground rounded-2xl p-5 sm:p-6 space-y-4 shadow-xs">
            <div>
              <h3 className="text-base font-bold text-foreground">Theme & Appearance</h3>
              <p className="text-xs text-muted-foreground">Customize the look and feel</p>
            </div>

            <div className="grid grid-cols-3 gap-3 max-w-sm">
              <button
                type="button"
                onClick={() => setTheme("dark")}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                  mounted && theme === "dark"
                    ? "bg-primary text-primary-foreground border-primary font-semibold shadow-xs"
                    : "bg-background border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <Moon className="w-4 h-4" /> Dark
              </button>

              <button
                type="button"
                onClick={() => setTheme("light")}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                  mounted && theme === "light"
                    ? "bg-primary text-primary-foreground border-primary font-semibold shadow-xs"
                    : "bg-background border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <Sun className="w-4 h-4" /> Light
              </button>

              <button
                type="button"
                onClick={() => setTheme("system")}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                  mounted && theme === "system"
                    ? "bg-primary text-primary-foreground border-primary font-semibold shadow-xs"
                    : "bg-background border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <Laptop className="w-4 h-4" /> System
              </button>
            </div>
          </div>

          {/* 4. Data Backup, Export & Import */}
          <div className="bg-card border border-border text-card-foreground rounded-2xl p-5 sm:p-6 space-y-4 shadow-xs">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <div>
                <h3 className="text-base font-bold text-foreground">Data Backup &amp; Restore</h3>
                <p className="text-xs text-muted-foreground">
                  Export your transactions as CSV, copy to clipboard, or paste/import CSV backup into localStorage
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleExportCSV}
                disabled={isExporting}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-secondary hover:bg-muted border border-border text-foreground text-xs font-semibold transition shadow-xs cursor-pointer disabled:opacity-50"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-600 dark:text-emerald-400" /> Exporting...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Export Transactions (CSV)
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleCopyCSV}
                disabled={isCopying}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-secondary hover:bg-muted border border-border text-foreground text-xs font-semibold transition shadow-xs cursor-pointer disabled:opacity-50"
              >
                {isCopying ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-sky-600 dark:text-sky-400" /> Copying...
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-sky-600 dark:text-sky-400" /> Copy CSV to Clipboard
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setIsImportOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition shadow-xs cursor-pointer"
              >
                <Upload className="w-4 h-4" /> Import CSV Backup
              </button>
            </div>
          </div>

          {/* Import CSV Modal */}
          {isImportOpen && (
            <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
              <div
                className="w-full max-w-lg bg-card border border-border text-card-foreground rounded-t-3xl sm:rounded-2xl p-6 shadow-xl space-y-4 max-h-[90dvh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <div className="flex items-center gap-2">
                    <Upload className="w-4 h-4 text-emerald-500" />
                    <h3 className="font-bold text-base text-foreground">Import CSV Backup</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsImportOpen(false)}
                    className="p-1 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleImportCSV} className="space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Paste CSV Data
                      </label>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                      >
                        Or choose .csv file
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".csv,text/csv"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                    </div>
                    <textarea
                      value={csvInput}
                      onChange={(e) => setCsvInput(e.target.value)}
                      rows={7}
                      placeholder={'"Date","Type","Title","Category","Amount (INR)","Payment Method","Note","ID"\n"2026-11-25","EXPENSE","Chai","Food","10","CASH","Quick added",""'}
                      className="w-full bg-background border border-input rounded-xl p-3 text-xs font-mono text-foreground placeholder:text-muted-foreground/50 focus:outline-hidden focus:border-ring focus:ring-1 focus:ring-ring resize-y"
                    />
                    <p className="text-[11px] text-muted-foreground">
                      Duplicate IDs are automatically skipped so your existing records stay safe.
                    </p>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsImportOpen(false)}
                      className="px-4 py-2 rounded-xl bg-secondary hover:bg-muted text-xs font-semibold text-foreground transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isImporting || !csvInput.trim()}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white flex items-center gap-1.5 shadow-xs transition disabled:opacity-50 cursor-pointer"
                    >
                      {isImporting ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Importing...
                        </>
                      ) : (
                        <>
                          <Check className="w-3.5 h-3.5" /> Import Data
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </AppLayoutWrapper>
  );
}
