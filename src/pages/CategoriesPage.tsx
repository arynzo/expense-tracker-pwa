import React, { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Edit2,
  Tag,
  Check,
  X,
  Loader2,
  AlertTriangle,
  FolderOpen,
} from "lucide-react";
import { AppLayoutWrapper } from "@/components/app-layout-wrapper";
import { CategoryIcon } from "@/components/ui/category-icon";
import { AVAILABLE_ICONS, isIconUrl, isLucideIconName } from "@/lib/constants";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  type CategoryRecord,
} from "@/lib/storage";

export type CategoryData = CategoryRecord;
type IconSourceType = "Default Icons" | "Icon Link" | "Emoji";

function detectIconSource(icon: string): IconSourceType {
  if (isIconUrl(icon)) return "Icon Link";
  if (isLucideIconName(icon)) return "Default Icons";
  return icon.trim() ? "Emoji" : "Default Icons";
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryData[]>(() => getCategories());
  const [activeTab, setActiveTab] = useState<"expense" | "income">("expense");
  const isLoading = false;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryData | null>(null);
  const [categoryName, setCategoryName] = useState("");
  const [iconSource, setIconSource] = useState<IconSourceType>("Default Icons");
  const [categoryIcon, setCategoryIcon] = useState("Tag");
  const [isSaving, setIsSaving] = useState(false);

  const [deletingCategory, setDeletingCategory] = useState<CategoryData | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadCategories = useCallback(() => {
    try {
      setCategories(getCategories());
    } catch (err) {
      console.error("Failed to load categories:", err);
      toast.error("Failed to load categories");
    }
  }, []);

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setCategoryName("");
    setIconSource("Default Icons");
    setCategoryIcon("Tag");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: CategoryData) => {
    const iconVal = c.icon || "Tag";
    setEditingCategory(c);
    setCategoryName(c.name);
    setIconSource(detectIconSource(iconVal));
    setCategoryIcon(iconVal);
    setIsModalOpen(true);
  };

  const handleIconSourceChange = (nextSource: IconSourceType) => {
    setIconSource(nextSource);
    if (nextSource === "Default Icons") {
      if (!isLucideIconName(categoryIcon)) {
        setCategoryIcon("Tag");
      }
    } else if (nextSource === "Icon Link") {
      if (!isIconUrl(categoryIcon)) {
        setCategoryIcon("");
      }
    } else {
      if (isLucideIconName(categoryIcon) || isIconUrl(categoryIcon)) {
        setCategoryIcon("");
      }
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim()) {
      toast.error("Please enter a category name");
      return;
    }
    const trimmedIcon = categoryIcon.trim();
    if (iconSource === "Icon Link" && !isIconUrl(trimmedIcon)) {
      toast.error("Please enter a valid icon URL (https://...)");
      return;
    }
    if (iconSource === "Emoji" && !trimmedIcon) {
      toast.error("Please enter an emoji");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        name: categoryName.trim(),
        type: activeTab,
        icon: trimmedIcon || "Tag",
      };

      const res = editingCategory
        ? updateCategory(editingCategory._id, payload)
        : createCategory(payload);

      if (!res.success) {
        throw new Error(res.error);
      }

      toast.success(editingCategory ? "Category updated!" : "Category created!");
      setIsModalOpen(false);
      loadCategories();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error saving";
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    if (!deletingCategory?._id) return;
    setIsDeleting(true);
    try {
      const res = deleteCategory(deletingCategory._id);
      if (!res.success) {
        throw new Error(res.error);
      }
      toast.success("Category removed");
      setDeletingCategory(null);
      loadCategories();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error deleting";
      toast.error(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredCategories = categories.filter((c) => c.type === activeTab);
  const expenseCount = categories.filter((c) => c.type === "expense").length;
  const incomeCount = categories.filter((c) => c.type === "income").length;

  return (
    <AppLayoutWrapper pageTitle="Category Management">
      {() => (
        <div className="max-w-4xl space-y-6">
          <div className="flex items-center justify-between">
            <Link
              to="/settings"
              className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition bg-card border border-border px-3 py-1.5 rounded-xl shadow-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Settings
            </Link>

            <button
              type="button"
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              New {activeTab === "income" ? "Income" : "Expense"} Category
            </button>
          </div>

          <div className="bg-card border border-border text-card-foreground rounded-2xl p-5 sm:p-6 space-y-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <FolderOpen className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <h3 className="text-base font-bold text-foreground">
                    Categories
                  </h3>
                </div>
                <p className="text-xs text-muted-foreground">
                  Create, customize, and manage categories for both expenses and incomes
                </p>
              </div>

              <div className="flex items-center rounded-xl bg-muted/60 p-1 border border-border">
                <button
                  type="button"
                  onClick={() => setActiveTab("expense")}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    activeTab === "expense"
                      ? "bg-rose-600 text-white shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span>Expense</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/20 text-white font-mono">
                    {expenseCount}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("income")}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    activeTab === "income"
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span>Income</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/20 text-white font-mono">
                    {incomeCount}
                  </span>
                </button>
              </div>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-16 bg-muted rounded-xl animate-pulse" />
                ))}
              </div>
            ) : filteredCategories.length === 0 ? (
              <div className="text-center py-12 space-y-3">
                <Tag className="w-10 h-10 text-muted-foreground mx-auto" />
                <h4 className="text-sm font-semibold text-foreground">
                  No {activeTab} categories found
                </h4>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  Click &ldquo;New {activeTab === "income" ? "Income" : "Expense"} Category&rdquo; to add your custom category.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredCategories.map((cat) => (
                  <div
                    key={cat._id}
                    className="flex items-center justify-between p-3.5 rounded-xl bg-background border border-border hover:border-input transition group shadow-2xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`p-2.5 rounded-xl border shrink-0 ${
                          cat.type === "income"
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                            : "bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400"
                        }`}
                      >
                        <CategoryIcon name={cat.icon} category={cat.name} className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-semibold text-foreground truncate">
                          {cat.name}
                        </h4>
                        <span className="text-[10px] text-muted-foreground capitalize">
                          {cat.type}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 opacity-80 sm:opacity-0 sm:group-hover:opacity-100 transition">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(cat)}
                        title="Edit category"
                        className="p-1.5 rounded-lg bg-secondary hover:bg-muted text-foreground transition cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingCategory(cat)}
                        title="Delete category"
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
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
              <div className="w-full max-w-md bg-card border border-border text-card-foreground rounded-2xl p-6 shadow-xl space-y-5">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <h3 className="font-bold text-base text-foreground">
                    {editingCategory ? "Edit Category" : `New ${activeTab === "income" ? "Income" : "Expense"} Category`}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="p-1 rounded-full text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleSave} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Category Name
                    </label>
                    <input
                      type="text"
                      value={categoryName}
                      onChange={(e) => setCategoryName(e.target.value)}
                      placeholder="e.g. Fuel, Subscriptions, Salary"
                      required
                      maxLength={50}
                      className="w-full bg-background border border-input rounded-xl px-3.5 py-2.5 text-sm text-foreground focus:outline-hidden focus:border-ring"
                    />
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
                          Selected: <b className="text-foreground">{categoryIcon}</b>
                        </span>
                      </div>
                      <div className="grid grid-cols-7 gap-2 max-h-40 overflow-y-auto p-1.5 bg-background rounded-xl border border-input">
                        {AVAILABLE_ICONS.map((icon) => (
                          <button
                            key={icon}
                            type="button"
                            onClick={() => setCategoryIcon(icon)}
                            title={icon}
                            className={`p-2 rounded-lg flex items-center justify-center transition cursor-pointer ${
                              categoryIcon === icon
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
                        Icon Image URL
                      </label>
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-background border border-input flex items-center justify-center shrink-0 overflow-hidden">
                          {isIconUrl(categoryIcon) ? (
                            <CategoryIcon name={categoryIcon} className="w-6 h-6" />
                          ) : (
                            <Tag className="w-4 h-4 text-muted-foreground" />
                          )}
                        </div>
                        <input
                          type="url"
                          value={categoryIcon}
                          onChange={(e) => setCategoryIcon(e.target.value)}
                          placeholder="https://example.com/icon.png"
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
                          {categoryIcon.trim() ? (
                            <CategoryIcon name={categoryIcon} className="w-5 h-5" />
                          ) : (
                            <span className="text-muted-foreground text-xs">?</span>
                          )}
                        </div>
                        <input
                          type="text"
                          value={categoryIcon}
                          onChange={(e) => setCategoryIcon(e.target.value)}
                          placeholder="e.g. 🍕 🚗 💰 🛒"
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
                      className="px-4 py-2 rounded-xl bg-secondary hover:bg-muted text-xs font-semibold text-foreground transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white flex items-center gap-1.5 shadow-xs transition disabled:opacity-50 cursor-pointer"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...
                        </>
                      ) : (
                        <>
                          <Check className="w-3.5 h-3.5" /> Save Category
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {deletingCategory && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
              <div className="w-full max-w-sm bg-card border border-border text-card-foreground rounded-2xl p-6 shadow-xl space-y-4">
                <div className="flex items-center gap-3 text-destructive">
                  <div className="p-2.5 rounded-xl bg-destructive/10 border border-destructive/20">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-base text-foreground">Delete Category?</h3>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">
                  Are you sure you want to delete category &ldquo;<b>{deletingCategory.name}</b>&rdquo;? Existing transactions with this category will remain unchanged.
                </p>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setDeletingCategory(null)}
                    disabled={isDeleting}
                    className="px-4 py-2 rounded-xl bg-secondary hover:bg-muted text-xs font-semibold text-foreground transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-semibold text-white flex items-center gap-1.5 shadow-xs transition disabled:opacity-50 cursor-pointer"
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Deleting...
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
