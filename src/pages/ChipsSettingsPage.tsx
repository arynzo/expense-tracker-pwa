import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import {
  ArrowLeft,
  Plus,
  Minus,
  Trash2,
  Edit2,
  Zap,
  Check,
  X,
  Loader2,
  AlertTriangle,
  Banknote,
  Smartphone,
  Tag,
} from "lucide-react";
import { AppLayoutWrapper } from "@/components/app-layout-wrapper";
import { CategoryIcon } from "@/components/ui/category-icon";
import { type PresetItem } from "@/components/quick-presets";
import { AVAILABLE_ICONS, isIconUrl, isLucideIconName } from "@/lib/constants";
import {
  normalizeIconInput,
  cacheIconUrl,
  uncacheIconUrlIfUnused,
} from "@/lib/icon-cache";
import { formatINR } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getCategories,
  getPresets,
  createPreset,
  updatePreset,
  deletePreset,
  type CategoryRecord,
} from "@/lib/storage";

type IconSourceType = "Default Icons" | "Icon Link" | "Emoji";

function detectIconSource(icon: string): IconSourceType {
  if (isIconUrl(icon)) return "Icon Link";
  if (isLucideIconName(icon)) return "Default Icons";
  return icon.trim() ? "Emoji" : "Default Icons";
}

export default function ChipsSettingsPage() {
  const [presets, setPresets] = useState<PresetItem[]>(() => getPresets());
  const isLoadingPresets = false;
  const [dynamicCategories] = useState<CategoryRecord[]>(() => getCategories());

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPreset, setEditingPreset] = useState<PresetItem | null>(null);
  const [presetType, setPresetType] = useState<"income" | "expense">("expense");
  const [presetLabel, setPresetLabel] = useState("");
  const [presetAmount, setPresetAmount] = useState("");
  const [presetMethod, setPresetMethod] = useState<"cash" | "upi">("cash");
  const [presetCategory, setPresetCategory] = useState("Food");
  const [iconSource, setIconSource] = useState<IconSourceType>("Default Icons");
  const [presetIcon, setPresetIcon] = useState("Coins");
  const [isSavingPreset, setIsSavingPreset] = useState(false);

  const [deletingPreset, setDeletingPreset] = useState<PresetItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredCategories = dynamicCategories.filter((c) => c.type === presetType);
  const categoryList =
    filteredCategories.length > 0
      ? filteredCategories
      : [{ _id: "fallback", name: "Other", icon: "Tag", type: presetType, color: "", isDefault: true }];

  const loadPresets = useCallback(() => {
    try {
      setPresets(getPresets());
    } catch (err) {
      console.error("Failed to load presets:", err);
      toast.error("Failed to load presets");
    }
  }, []);

  useEffect(() => {
    if (isModalOpen || deletingPreset) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [isModalOpen, deletingPreset]);

  const handleOpenNewPreset = () => {
    setEditingPreset(null);
    setPresetType("expense");
    setPresetLabel("");
    setPresetAmount("");
    setPresetMethod("cash");
    const firstExp = dynamicCategories.find((c) => c.type === "expense");
    setPresetCategory(firstExp?.name || "Food");
    setIconSource("Default Icons");
    setPresetIcon("Coins");
    setIsModalOpen(true);
  };

  const handleOpenEditPreset = (p: PresetItem) => {
    const iconVal = p.icon || "Coins";
    setEditingPreset(p);
    setPresetType(p.type || "expense");
    setPresetLabel(p.label);
    setPresetAmount(p.amount.toString());
    setPresetMethod(p.method);
    setPresetCategory(p.category);
    setIconSource(detectIconSource(iconVal));
    setPresetIcon(iconVal);
    setIsModalOpen(true);
  };

  const handleIconSourceChange = (nextSource: IconSourceType) => {
    setIconSource(nextSource);
    if (nextSource === "Default Icons") {
      if (!isLucideIconName(presetIcon)) {
        setPresetIcon("Coins");
      }
    } else if (nextSource === "Icon Link") {
      if (!isIconUrl(presetIcon)) {
        setPresetIcon("");
      }
    } else {
      if (isLucideIconName(presetIcon) || isIconUrl(presetIcon)) {
        setPresetIcon("");
      }
    }
  };

  const handlePresetTypeChange = (nextType: "income" | "expense") => {
    setPresetType(nextType);
    const matching = dynamicCategories.filter((c) => c.type === nextType);
    if (!matching.some((c) => c.name === presetCategory)) {
      setPresetCategory(matching[0]?.name || "Other");
    }
  };

  const handleSavePreset = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(presetAmount);
    if (!presetLabel.trim() || isNaN(numAmount) || numAmount <= 0) {
      toast.error("Please provide a valid label and amount > 0");
      return;
    }

    const trimmedIcon =
      iconSource === "Icon Link"
        ? normalizeIconInput(presetIcon)
        : presetIcon.trim();
    if (iconSource === "Icon Link" && !isIconUrl(trimmedIcon)) {
      toast.error("Please enter a valid icon URL, data:image/svg+xml, or <svg> code");
      return;
    }
    if (iconSource === "Emoji" && !trimmedIcon) {
      toast.error("Please enter an emoji");
      return;
    }

    setIsSavingPreset(true);
    try {
      const oldIcon = editingPreset?.icon;
      const payload = {
        label: presetLabel.trim(),
        amount: numAmount,
        type: presetType,
        method: presetMethod,
        category: presetCategory,
        icon: trimmedIcon || "Coins",
      };

      const res = editingPreset
        ? updatePreset(editingPreset._id, payload)
        : createPreset(payload);

      if (!res.success) {
        throw new Error(res.error);
      }

      if (iconSource === "Icon Link") {
        void cacheIconUrl(payload.icon);
      }
      if (oldIcon && oldIcon !== payload.icon) {
        void uncacheIconUrlIfUnused(oldIcon);
      }

      toast.success(editingPreset ? "Preset updated!" : "Preset created!");
      setIsModalOpen(false);
      loadPresets();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error saving preset";
      toast.error(msg);
    } finally {
      setIsSavingPreset(false);
    }
  };

  const handleDeletePreset = () => {
    if (!deletingPreset?._id) return;
    setIsDeleting(true);
    try {
      const deletedIcon = deletingPreset.icon;
      const res = deletePreset(deletingPreset._id);
      if (!res.success) {
        throw new Error(res.error);
      }
      void uncacheIconUrlIfUnused(deletedIcon);
      toast.success("Preset removed");
      setDeletingPreset(null);
      loadPresets();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error deleting preset";
      toast.error(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AppLayoutWrapper pageTitle="Quick-Add Presets">
      {() => (
        <div className="max-w-4xl space-y-6">
          <div className="flex items-center justify-between">
            <Link
              to="/settings"
              className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Settings
            </Link>

            <button
              type="button"
              onClick={handleOpenNewPreset}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Preset
            </button>
          </div>

          <div className="bg-card border border-border text-card-foreground rounded-2xl p-5 sm:p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Configured Presets ({presets.length})
              </h3>
            </div>

            {isLoadingPresets ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="h-20 bg-muted/60 rounded-xl animate-pulse"
                  />
                ))}
              </div>
            ) : presets.length === 0 ? (
              <div className="text-center py-12 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-muted/80 flex items-center justify-center text-muted-foreground mx-auto">
                  <Zap className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-semibold text-foreground">
                  No presets created yet
                </h4>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  Create your first shortcut preset to log frequent transactions
                  in 1 single tap.
                </p>
                <button
                  type="button"
                  onClick={handleOpenNewPreset}
                  className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Create First Preset
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {presets.map((p) => (
                  <div
                    key={p._id}
                    className="flex items-center justify-between p-3.5 rounded-xl bg-background border border-border hover:border-input transition group shadow-2xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2.5 rounded-xl bg-secondary border border-border text-foreground shrink-0">
                        <CategoryIcon name={p.icon} className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-semibold text-foreground truncate">
                          {p.label}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span
                            className={`font-bold ${
                              p.type === "income"
                                ? "text-emerald-600 dark:text-emerald-400"
                                : "text-rose-600 dark:text-rose-400"
                            }`}
                          >
                            {p.type === "income" ? "+" : "-"}
                            {formatINR(p.amount)}
                          </span>
                          <span>•</span>
                          <span className="uppercase text-[10px] px-1 rounded-sm bg-secondary font-mono font-medium">
                            {p.method}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition shrink-0">
                      <button
                        type="button"
                        onClick={() => handleOpenEditPreset(p)}
                        title="Edit preset"
                        className="p-1.5 rounded-lg bg-secondary hover:bg-muted text-foreground transition cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingPreset(p)}
                        title="Delete preset"
                        className="p-1.5 rounded-lg bg-secondary hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-xs overscroll-contain touch-pan-y animate-in fade-in duration-150">
              <div
                className="w-full max-w-md bg-card border border-border text-card-foreground rounded-t-3xl sm:rounded-2xl px-6 pt-6 pb-[max(1.75rem,env(safe-area-inset-bottom))] sm:p-6 shadow-xl space-y-5 overscroll-contain max-h-[90dvh] sm:max-h-[85vh] overflow-y-auto box-border"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <h3 className="font-bold text-base text-foreground">
                    {editingPreset ? "Edit Preset" : "New Preset"}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="p-1 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleSavePreset} className="space-y-4">
                  <div className="grid grid-cols-2 gap-2 p-1 bg-muted/60 rounded-xl border border-border">
                    <button
                      type="button"
                      onClick={() => handlePresetTypeChange("expense")}
                      className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                        presetType === "expense"
                          ? "bg-rose-600 text-white shadow-xs"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Minus className="w-3.5 h-3.5" />
                      Expense
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePresetTypeChange("income")}
                      className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                        presetType === "income"
                          ? "bg-emerald-600 text-white shadow-xs"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Income
                    </button>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Preset Label
                    </label>
                    <input
                      type="text"
                      value={presetLabel}
                      onChange={(e) => setPresetLabel(e.target.value)}
                      placeholder="e.g. Chai, Auto, Lunch, Petrol"
                      required
                      maxLength={30}
                      className="w-full bg-background border border-input rounded-xl px-3.5 py-2.5 text-base sm:text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-hidden focus:border-ring"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Default Amount (₹)
                    </label>
                    <input
                      type="number"
                      step="any"
                      inputMode="decimal"
                      value={presetAmount}
                      onChange={(e) => setPresetAmount(e.target.value)}
                      placeholder="e.g. 20"
                      required
                      className="w-full bg-background border border-input rounded-xl px-3.5 py-2.5 text-base sm:text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-hidden focus:border-ring"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Payment Method
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setPresetMethod("cash")}
                        className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl border text-sm font-medium cursor-pointer ${
                          presetMethod === "cash"
                            ? "bg-secondary text-secondary-foreground border-border font-semibold shadow-xs"
                            : "bg-background border-input text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <Banknote className="w-3.5 h-3.5" /> Cash
                      </button>
                      <button
                        type="button"
                        onClick={() => setPresetMethod("upi")}
                        className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl border text-sm font-medium cursor-pointer ${
                          presetMethod === "upi"
                            ? "bg-secondary text-secondary-foreground border-border font-semibold shadow-xs"
                            : "bg-background border-input text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <Smartphone className="w-3.5 h-3.5" /> UPI
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Category
                    </label>
                    <Select
                      value={presetCategory}
                      onValueChange={(val) => val && setPresetCategory(val)}
                    >
                      <SelectTrigger className="w-full h-11 sm:h-10 text-base sm:text-sm">
                        <div className="flex items-center gap-2 truncate">
                          <CategoryIcon
                            category={presetCategory}
                            className="w-4 h-4 text-muted-foreground"
                          />
                          <SelectValue placeholder="Select category" />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        {categoryList.map((c, idx) => (
                          <SelectItem
                            key={c._id || c.name || idx}
                            value={c.name}
                          >
                            <div className="flex items-center gap-2">
                              <CategoryIcon
                                name={c.icon}
                                category={c.name}
                                className="w-4 h-4 text-muted-foreground"
                              />
                              <span>{c.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Icon Type
                    </label>
                    <Select
                      value={iconSource}
                      onValueChange={(val) => {
                        if (val) handleIconSourceChange(val as IconSourceType);
                      }}
                    >
                      <SelectTrigger className="w-full h-10 rounded-xl bg-background border-input text-sm font-medium">
                        <SelectValue placeholder="Select icon type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Default Icons">Default Icons</SelectItem>
                        <SelectItem value="Icon Link">Icon Link</SelectItem>
                        <SelectItem value="Emoji">Emoji</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {iconSource === "Default Icons" && (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Select Icon
                        </label>
                        <span className="text-[11px] text-muted-foreground">
                          Selected: <b className="text-foreground">{presetIcon}</b>
                        </span>
                      </div>
                      <div className="grid grid-cols-7 gap-2 max-h-36 overflow-y-auto p-1.5 bg-background rounded-xl border border-input overscroll-contain">
                        {AVAILABLE_ICONS.map((icon) => (
                          <button
                            key={icon}
                            type="button"
                            onClick={() => setPresetIcon(icon)}
                            title={icon}
                            className={`p-2 rounded-lg flex items-center justify-center transition cursor-pointer ${
                              presetIcon === icon
                                ? "bg-primary text-primary-foreground font-bold shadow-xs"
                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            }`}
                          >
                            <CategoryIcon name={icon} className="w-4 h-4" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {iconSource === "Icon Link" && (
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Icon URL or SVG Data URI
                      </label>
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-background border border-input flex items-center justify-center shrink-0 overflow-hidden">
                          {isIconUrl(presetIcon) ? (
                            <CategoryIcon name={presetIcon} className="w-6 h-6" />
                          ) : (
                            <Tag className="w-4 h-4 text-muted-foreground" />
                          )}
                        </div>
                        <input
                          type="text"
                          inputMode="url"
                          value={presetIcon}
                          onChange={(e) => setPresetIcon(e.target.value)}
                          placeholder="https://..., data:image/svg+xml,..., or <svg>..."
                          required
                          className="w-full bg-background border border-input rounded-xl px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-hidden focus:border-ring"
                        />
                      </div>
                    </div>
                  )}

                  {iconSource === "Emoji" && (
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Type or Paste Emoji
                      </label>
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-background border border-input flex items-center justify-center shrink-0 text-lg">
                          {presetIcon.trim() ? (
                            <CategoryIcon name={presetIcon} className="w-5 h-5" />
                          ) : (
                            <span className="text-muted-foreground text-xs">?</span>
                          )}
                        </div>
                        <input
                          type="text"
                          value={presetIcon}
                          onChange={(e) => setPresetIcon(e.target.value)}
                          placeholder="e.g. ☕ 🚗 💰 🛒"
                          required
                          maxLength={12}
                          className="w-full bg-background border border-input rounded-xl px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-hidden focus:border-ring"
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-2 pt-3">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2.5 rounded-xl bg-secondary hover:bg-muted text-xs font-semibold text-foreground transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSavingPreset}
                      className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-xs font-semibold text-white flex items-center gap-1.5 shadow-xs transition cursor-pointer disabled:opacity-50"
                    >
                      {isSavingPreset ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />{" "}
                          Saving...
                        </>
                      ) : (
                        <>
                          <Check className="w-3.5 h-3.5" /> Save Preset
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {deletingPreset && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs overscroll-contain animate-in fade-in duration-150">
              <div className="w-full max-w-sm bg-card border border-border text-card-foreground rounded-2xl p-6 shadow-xl space-y-4">
                <div className="flex items-center gap-3 text-destructive">
                  <div className="p-2.5 rounded-xl bg-destructive/10 border border-destructive/20">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-base text-foreground">
                    Delete Preset?
                  </h3>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">
                  Are you sure you want to delete &ldquo;
                  <b>{deletingPreset.label}</b>&rdquo; (
                  {formatINR(deletingPreset.amount)})?
                </p>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setDeletingPreset(null)}
                    disabled={isDeleting}
                    className="px-4 py-2 rounded-xl bg-secondary hover:bg-muted text-xs font-semibold text-foreground transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleDeletePreset}
                    disabled={isDeleting}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-semibold text-white flex items-center gap-1.5 shadow-xs transition disabled:opacity-50 cursor-pointer"
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />{" "}
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </AppLayoutWrapper>
  );
}
