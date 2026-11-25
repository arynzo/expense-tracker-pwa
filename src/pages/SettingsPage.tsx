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
  FolderOpen,
  ChevronRight,
  X,
  Check,
  Trash2,
  AlertTriangle,
  Palette,
  ExternalLink,
} from "lucide-react";
import { AppLayoutWrapper } from "@/components/app-layout-wrapper";
import { useMounted } from "@/hooks/use-mounted";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import {
  THEME_PRESETS,
  HEADING_WEIGHT_OPTIONS,
  BODY_WEIGHT_OPTIONS,
  applyThemePreset,
  applyTypographyWeights,
  getSavedThemePreset,
  getSavedCustomThemeCss,
  getSavedHeadingWeight,
  getSavedBodyWeight,
} from "@/lib/themes";
import {
  downloadTransactionsCSV,
  copyTransactionsCSV,
  importTransactionsFromCSV,
  clearAllTransactions,
  clearCategoriesByType,
  clearAllPresets,
} from "@/lib/storage";

type ClearActionType =
  | "transactions"
  | "income_categories"
  | "expense_categories"
  | "presets";

const CLEAR_ACTION_META: Record<
  ClearActionType,
  { label: string; title: string; description: string }
> = {
  transactions: {
    label: "Clear Transactions",
    title: "Clear All Transactions?",
    description: "This will permanently delete all your saved income and expense records from this device.",
  },
  income_categories: {
    label: "Clear Income Categories",
    title: "Clear All Income Categories?",
    description: "This will remove all income categories. Existing transactions will keep their category name.",
  },
  expense_categories: {
    label: "Clear Expense Categories",
    title: "Clear All Expense Categories?",
    description: "This will remove all expense categories. Existing transactions will keep their category name.",
  },
  presets: {
    label: "Clear Presets",
    title: "Clear All Presets?",
    description: "This will remove all 1-tap quick-add presets from your dashboard.",
  },
};

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

  // Clear Data Confirmation state
  const [confirmClear, setConfirmClear] = useState<ClearActionType | null>(null);

  // Theme Preset & Font Weight state
  const [themePreset, setThemePreset] = useState<string>(() => getSavedThemePreset());
  const [customThemeCss, setCustomThemeCss] = useState<string>(() => getSavedCustomThemeCss());
  const [headingWeight, setHeadingWeight] = useState<string>(() => getSavedHeadingWeight());
  const [bodyWeight, setBodyWeight] = useState<string>(() => getSavedBodyWeight());

  const handleHeadingWeightChange = (val: string) => {
    setHeadingWeight(val);
    applyTypographyWeights(val, bodyWeight);
    const opt = HEADING_WEIGHT_OPTIONS.find((o) => o.value === val);
    toast.success(`Title font weight: ${opt?.label || val}`);
  };

  const handleBodyWeightChange = (val: string) => {
    setBodyWeight(val);
    applyTypographyWeights(headingWeight, val);
    const opt = BODY_WEIGHT_OPTIONS.find((o) => o.value === val);
    toast.success(`Body font weight: ${opt?.label || val}`);
  };

  const handleThemePresetChange = (val: string) => {
    setThemePreset(val);
    if (val === "custom") {
      if (customThemeCss.trim()) {
        const ok = applyThemePreset("custom", customThemeCss);
        if (ok) toast.success("Custom Shadcn theme applied!");
      }
      return;
    }
    applyThemePreset(val);
    const presetObj = THEME_PRESETS.find((p) => p.id === val);
    toast.success(`Theme changed to ${presetObj?.name || val}`);
  };

  const handleApplyCustomCss = () => {
    if (!customThemeCss.trim()) {
      toast.error("Please paste Shadcn CSS variables first");
      return;
    }
    const ok = applyThemePreset("custom", customThemeCss);
    if (!ok) {
      toast.error("No valid CSS variables found (expected --background, --card, etc.)");
      return;
    }
    toast.success("Custom Shadcn theme applied!");
  };

  const handleConfirmClear = () => {
    if (!confirmClear) return;
    try {
      if (confirmClear === "transactions") {
        clearAllTransactions();
        toast.success("All transactions cleared");
      } else if (confirmClear === "income_categories") {
        clearCategoriesByType("income");
        toast.success("All income categories cleared");
      } else if (confirmClear === "expense_categories") {
        clearCategoriesByType("expense");
        toast.success("All expense categories cleared");
      } else if (confirmClear === "presets") {
        clearAllPresets();
        toast.success("All preset chips cleared");
      }
      setConfirmClear(null);
    } catch {
      toast.error("Failed to clear data");
    }
  };

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
                      Quick-Add Presets
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Configure 1-tap shortcut presets, default amounts, payment methods, and icons
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
                    <FolderOpen className="w-5 h-5" />
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

            {/* Theme Preset Selector */}
            <div className="pt-3 border-t border-border space-y-3">
              <div>
                <h4 className="text-sm font-semibold text-foreground">Theme Preset</h4>
                <p className="text-[11px] text-muted-foreground">
                  Switch card colors, border radius, and typography across the app
                </p>
              </div>

              <div className="max-w-sm">
                <Select
                  value={themePreset}
                  onValueChange={(val) => {
                    if (val) handleThemePresetChange(val);
                  }}
                >
                  <SelectTrigger className="w-full h-10 rounded-xl bg-background border-input text-sm font-medium">
                    {(() => {
                      const activePreset = THEME_PRESETS.find((p) => p.id === themePreset);
                      if (activePreset) {
                        return (
                          <div className="flex items-center gap-2.5 truncate">
                            <span className="flex items-center -space-x-1 shrink-0">
                              {activePreset.preview.map((color, idx) => (
                                <span
                                  key={idx}
                                  className="w-3 h-3 rounded-full border border-border"
                                  style={{ backgroundColor: color }}
                                />
                              ))}
                            </span>
                            <span className="truncate">{activePreset.name}</span>
                          </div>
                        );
                      }
                      return (
                        <div className="flex items-center gap-2 truncate">
                          <Palette className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                          <span className="truncate">Custom Shadcn CSS</span>
                        </div>
                      );
                    })()}
                  </SelectTrigger>
                  <SelectContent>
                    {THEME_PRESETS.map((preset) => (
                      <SelectItem key={preset.id} value={preset.id}>
                        <div className="flex items-center gap-2.5">
                          <span className="flex items-center -space-x-1 shrink-0">
                            {preset.preview.map((color, idx) => (
                              <span
                                key={idx}
                                className="w-3 h-3 rounded-full border border-border"
                                style={{ backgroundColor: color }}
                              />
                            ))}
                          </span>
                          <span>{preset.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                    <SelectItem value="custom">
                      <div className="flex items-center gap-2">
                        <Palette className="w-3.5 h-3.5 text-muted-foreground" />
                        <span>Custom Shadcn CSS</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {themePreset === "custom" && (
                <div className="space-y-2.5 pt-1 animate-in fade-in duration-150">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Paste Shadcn Theme CSS (:root / .dark variables)
                    </label>
                    <a
                      href="https://ui.shadcn.com/create"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-secondary hover:bg-muted border border-border text-xs font-semibold text-foreground transition"
                    >
                      <span>Create Theme on Shadcn</span>
                      <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                    </a>
                  </div>
                  <textarea
                    value={customThemeCss}
                    onChange={(e) => setCustomThemeCss(e.target.value)}
                    rows={5}
                    placeholder={`:root {\n  --background: 0 0% 100%;\n  --card: 0 0% 100%;\n  --primary: 142.1 76.2% 36.3%;\n  --radius: 0.75rem;\n}\n.dark {\n  --background: 20 14.3% 4.1%;\n  --card: 20 14.3% 6%;\n}`}
                    className="w-full bg-background border border-input rounded-xl p-3 text-xs font-mono text-foreground placeholder:text-muted-foreground/50 focus:outline-hidden focus:border-ring focus:ring-1 focus:ring-ring resize-y"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleApplyCustomCss}
                      className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold shadow-xs hover:opacity-90 transition cursor-pointer flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" /> Apply Custom Theme
                    </button>
                    <button
                      type="button"
                      onClick={() => handleThemePresetChange("default")}
                      className="px-3.5 py-2 rounded-xl bg-secondary hover:bg-muted text-xs font-semibold text-foreground transition cursor-pointer"
                    >
                      Reset to Default
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Font Weight Selectors */}
            <div className="pt-3 border-t border-border grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Title Font Weight */}
              <div className="space-y-2">
                <div>
                  <h4 className="text-sm font-semibold text-foreground">Title Font Weight</h4>
                  <p className="text-[11px] text-muted-foreground">
                    Adjust thickness of page &amp; card headings
                  </p>
                </div>
                <Select
                  value={headingWeight}
                  onValueChange={(val) => {
                    if (val) handleHeadingWeightChange(val);
                  }}
                >
                  <SelectTrigger className="w-full h-10 rounded-xl bg-background border-input text-sm">
                    <span style={{ fontWeight: Number(headingWeight) }}>
                      {HEADING_WEIGHT_OPTIONS.find((o) => o.value === headingWeight)?.label || "Semibold"}
                    </span>
                  </SelectTrigger>
                  <SelectContent>
                    {HEADING_WEIGHT_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        <span style={{ fontWeight: Number(opt.value) }}>
                          {opt.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Body Font Weight */}
              <div className="space-y-2">
                <div>
                  <h4 className="text-sm font-semibold text-foreground">Body Font Weight</h4>
                  <p className="text-[11px] text-muted-foreground">
                    Adjust thickness of general text &amp; labels
                  </p>
                </div>
                <Select
                  value={bodyWeight}
                  onValueChange={(val) => {
                    if (val) handleBodyWeightChange(val);
                  }}
                >
                  <SelectTrigger className="w-full h-10 rounded-xl bg-background border-input text-sm">
                    <span style={{ fontWeight: Number(bodyWeight) }}>
                      {BODY_WEIGHT_OPTIONS.find((o) => o.value === bodyWeight)?.label || "Normal"}
                    </span>
                  </SelectTrigger>
                  <SelectContent>
                    {BODY_WEIGHT_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        <span style={{ fontWeight: Number(opt.value) }}>
                          {opt.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* 4. Data Backup, Export & Import */}
          <div className="bg-card border border-border text-card-foreground rounded-2xl p-5 sm:p-6 space-y-4 shadow-xs">
            <div>
              <h3 className="text-base font-bold text-foreground">Data Backup &amp; Restore</h3>
              <p className="text-xs text-muted-foreground">
                Export your transactions as CSV, copy to clipboard, or paste/import CSV backup into localStorage
              </p>
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

          {/* 5. Clear Data */}
          <div className="bg-card border border-border text-card-foreground rounded-2xl p-5 sm:p-6 space-y-4 shadow-xs">
            <div>
              <h3 className="text-base font-bold text-foreground">Clear Data</h3>
              <p className="text-xs text-muted-foreground">
                Permanently remove stored data from localStorage on this device
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {(Object.keys(CLEAR_ACTION_META) as ClearActionType[]).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setConfirmClear(key)}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-destructive/10 hover:bg-destructive/20 border border-destructive/30 text-destructive text-xs font-semibold transition shadow-xs cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  {CLEAR_ACTION_META[key].label}
                </button>
              ))}
            </div>
          </div>

          {/* Clear Data Confirmation Modal */}
          {confirmClear && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
              <div className="w-full max-w-sm bg-card border border-border text-card-foreground rounded-2xl p-6 shadow-xl space-y-4">
                <div className="flex items-center gap-3 text-destructive">
                  <div className="p-2.5 rounded-xl bg-destructive/10 border border-destructive/20">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-base text-foreground">
                    {CLEAR_ACTION_META[confirmClear].title}
                  </h3>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">
                  {CLEAR_ACTION_META[confirmClear].description}
                </p>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setConfirmClear(null)}
                    className="px-4 py-2 rounded-xl bg-secondary hover:bg-muted text-xs font-semibold text-foreground transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmClear}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-semibold text-white flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Confirm Clear
                  </button>
                </div>
              </div>
            </div>
          )}

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
