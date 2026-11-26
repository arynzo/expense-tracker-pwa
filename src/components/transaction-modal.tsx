import React, { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { X, Calendar, Clock, Plus, Minus, Check, Loader2, Smartphone, Banknote, Trash2, Maximize2, Minimize2 } from "lucide-react";
import { formatINR, toLocalDateKey } from "@/lib/utils";
import { CategoryIcon } from "@/components/ui/category-icon";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getCategories,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  type CategoryRecord,
} from "@/lib/storage";

export interface TransactionData {
  _id?: string;
  type: "income" | "expense";
  title: string;
  note?: string;
  amount: number;
  method: "cash" | "upi";
  category: string;
  createdAt: string;
}

function toLocalTimeValue(dateInput: string | Date): string {
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return "12:00";
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: TransactionData | null;
}

export function TransactionModal({
  isOpen,
  onClose,
  onSuccess,
  initialData,
}: TransactionModalProps) {
  if (!isOpen) return null;

  return (
    <TransactionModalContent
      key={initialData?._id ?? "new"}
      onClose={onClose}
      onSuccess={onSuccess}
      initialData={initialData}
    />
  );
}

function TransactionModalContent({
  onClose,
  onSuccess,
  initialData,
}: Omit<TransactionModalProps, "isOpen">) {
  const [dynamicCategories] = useState<CategoryRecord[]>(() => getCategories());
  const [type, setType] = useState<"income" | "expense">(() => initialData?.type ?? "expense");
  const [amount, setAmount] = useState<string>(() => (initialData ? initialData.amount.toString() : ""));
  const [title, setTitle] = useState<string>(() => initialData?.title ?? "");
  const [note, setNote] = useState<string>(() => initialData?.note ?? "");
  const [method, setMethod] = useState<"cash" | "upi">(() => initialData?.method ?? "upi");
  const [category, setCategory] = useState<string>(() => {
    if (initialData) return initialData.category;
    const firstExpense = dynamicCategories.find((c) => c.type === "expense");
    return firstExpense?.name || "Food";
  });
  const [date, setDate] = useState<string>(() =>
    initialData ? toLocalDateKey(initialData.createdAt) : toLocalDateKey(new Date())
  );
  const [time, setTime] = useState<string>(() =>
    initialData ? toLocalTimeValue(initialData.createdAt) : toLocalTimeValue(new Date())
  );
  const [isNoteExpanded, setIsNoteExpanded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const amountInputRef = useRef<HTMLInputElement>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);
  const timeInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      amountInputRef.current?.focus();
    }, 100);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      clearTimeout(timer);
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  const activeExpenseList = dynamicCategories.filter((c) => c.type === "expense");
  const activeIncomeList = dynamicCategories.filter((c) => c.type === "income");

  const categories =
    type === "income"
      ? activeIncomeList.length > 0
        ? activeIncomeList
        : [{ _id: "general-inc", name: "Other", icon: "Tag", type: "income" as const }]
      : activeExpenseList.length > 0
      ? activeExpenseList
      : [{ _id: "general-exp", name: "Other", icon: "Tag", type: "expense" as const }];

  const handleTypeChange = (newType: "income" | "expense") => {
    setType(newType);
    const targetList = newType === "income" ? activeIncomeList : activeExpenseList;
    if (!targetList.some((c) => c.name === category)) {
      setCategory(targetList[0]?.name || "Other");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error("Please enter a valid amount greater than 0");
      amountInputRef.current?.focus();
      return;
    }

    if (!title.trim()) {
      toast.error("Please enter a title");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        type,
        amount: numAmount,
        title: title.trim(),
        note: note.trim(),
        method,
        category,
        createdAt: new Date(`${date}T${time || "00:00"}`).toISOString(),
      };

      const res = initialData?._id
        ? updateTransaction(initialData._id, payload)
        : createTransaction(payload);

      if (!res.success) {
        throw new Error(res.error);
      }

      toast.success(
        initialData?._id
          ? "Transaction updated!"
          : `${formatINR(numAmount)} ${type} added!`
      );
      onSuccess();
      onClose();
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Something went wrong";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = () => {
    if (!initialData?._id) return;
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }

    setIsDeleting(true);
    try {
      const res = deleteTransaction(initialData._id);
      if (!res.success) {
        throw new Error(res.error);
      }
      toast.success("Transaction deleted");
      onSuccess();
      onClose();
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Something went wrong";
      toast.error(msg);
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs overscroll-contain touch-pan-y transition-opacity animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-card border border-border text-card-foreground rounded-t-3xl sm:rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90dvh] sm:max-h-[85vh] box-border overscroll-contain"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-border shrink-0">
          <div className="font-semibold text-base sm:text-lg">
            {initialData?._id ? "Edit Transaction" : "New Transaction"}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-4 pt-4 pb-[max(1.75rem,env(safe-area-inset-bottom))] sm:p-6 overflow-y-auto overscroll-contain touch-pan-y space-y-4 sm:space-y-5">
          <div className="grid grid-cols-2 gap-2 p-1 bg-muted/60 rounded-xl border border-border">
            <button
              type="button"
              onClick={() => handleTypeChange("expense")}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition cursor-pointer ${
                type === "expense"
                  ? "bg-rose-600 text-white shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Minus className="w-4 h-4" />
              Expense
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange("income")}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition cursor-pointer ${
                type === "income"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Plus className="w-4 h-4" />
              Income
            </button>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Amount (₹)
            </label>
            <div className="relative flex items-center w-full">
              <span className="absolute left-3.5 text-2xl font-bold text-muted-foreground pointer-events-none">₹</span>
              <input
                ref={amountInputRef}
                type="number"
                step="any"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                required
                className="w-full min-w-0 bg-background border border-input rounded-xl pl-9 pr-3 py-2.5 sm:py-3 text-2xl font-bold text-foreground placeholder:text-muted-foreground/40 focus:outline-hidden focus:border-ring focus:ring-1 focus:ring-ring transition box-border"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Title / Description
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Chai, Groceries, Salary"
              maxLength={100}
              required
              className="w-full min-w-0 bg-background border border-input rounded-xl px-3.5 py-2.5 text-base sm:text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-hidden focus:border-ring focus:ring-1 focus:ring-ring transition box-border"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Category
            </label>
            <Select value={category} onValueChange={(val) => val && setCategory(val)}>
              <SelectTrigger className="w-full h-11 sm:h-10 text-base sm:text-sm">
                <div className="flex items-center gap-2 truncate">
                  <CategoryIcon category={category} className="w-4 h-4 text-muted-foreground" />
                  <SelectValue placeholder="Select category" />
                </div>
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat, idx) => (
                  <SelectItem key={cat._id || cat.name || idx} value={cat.name}>
                    <div className="flex items-center gap-2">
                      <CategoryIcon name={cat.icon} category={cat.name} className="w-4 h-4 text-muted-foreground" />
                      <span>{cat.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Payment Method
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setMethod("upi")}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-sm font-medium transition cursor-pointer ${
                  method === "upi"
                    ? "bg-secondary text-secondary-foreground border-border font-semibold shadow-xs"
                    : "bg-background border-input text-muted-foreground hover:text-foreground"
                }`}
              >
                <Smartphone className="w-4 h-4 text-sky-500" />
                <span>UPI / Online</span>
              </button>
              <button
                type="button"
                onClick={() => setMethod("cash")}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-sm font-medium transition cursor-pointer ${
                  method === "cash"
                    ? "bg-secondary text-secondary-foreground border-border font-semibold shadow-xs"
                    : "bg-background border-input text-muted-foreground hover:text-foreground"
                }`}
              >
                <Banknote className="w-4 h-4 text-amber-500" />
                <span>Cash</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 w-full min-w-0">
            {/* Date Picker */}
            <div className="space-y-1 min-w-0">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Date
              </label>
              <div
                onClick={() => {
                  const el = dateInputRef.current;
                  if (el) {
                    el.focus();
                    try {
                      el.showPicker?.();
                    } catch {
                      // fallback for browsers without showPicker
                    }
                  }
                }}
                className="relative w-full min-w-0 cursor-pointer"
              >
                <div className="w-full flex items-center justify-between h-11 sm:h-10 px-3 py-2.5 rounded-xl border border-input bg-background text-sm text-foreground hover:border-ring transition">
                  <span className="font-normal text-foreground truncate">
                    {date ? new Date(date + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "Select date"}
                  </span>
                  <Calendar className="w-4 h-4 text-muted-foreground shrink-0 pointer-events-none" />
                </div>

                <input
                  ref={dateInputRef}
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer text-base sm:text-sm"
                />
              </div>
            </div>

            {/* Time Picker */}
            <div className="space-y-1 min-w-0">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Time
              </label>
              <div
                onClick={() => {
                  const el = timeInputRef.current;
                  if (el) {
                    el.focus();
                    try {
                      el.showPicker?.();
                    } catch {
                      // fallback for browsers without showPicker
                    }
                  }
                }}
                className="relative w-full min-w-0 cursor-pointer"
              >
                <div className="w-full flex items-center justify-between h-11 sm:h-10 px-3 py-2.5 rounded-xl border border-input bg-background text-sm text-foreground hover:border-ring transition">
                  <span className="font-normal text-foreground truncate">
                    {time
                      ? new Date(`2000-01-01T${time}`).toLocaleTimeString("en-IN", {
                          hour: "numeric",
                          minute: "2-digit",
                          hour12: true,
                        })
                      : "Select time"}
                  </span>
                  <Clock className="w-4 h-4 text-muted-foreground shrink-0 pointer-events-none" />
                </div>

                <input
                  ref={timeInputRef}
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  required
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer text-base sm:text-sm"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Note (Optional)
              </label>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-muted-foreground">{note.length}/500</span>
                <button
                  type="button"
                  onClick={() => setIsNoteExpanded((prev) => !prev)}
                  title={isNoteExpanded ? "Collapse note" : "Expand note"}
                  className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition cursor-pointer"
                >
                  {isNoteExpanded ? (
                    <Minimize2 className="w-3.5 h-3.5" />
                  ) : (
                    <Maximize2 className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add details or notes..."
              maxLength={500}
              rows={isNoteExpanded ? 6 : 2}
              className="w-full min-w-0 bg-background border border-input rounded-xl px-3.5 py-2.5 text-base sm:text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-hidden focus:border-ring focus:ring-1 focus:ring-ring transition resize-y box-border"
            />
          </div>

          <div className="pt-2 space-y-2.5">
            <button
              type="submit"
              disabled={isSubmitting || isDeleting}
              className={`w-full py-3 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 text-white shadow-xs transition cursor-pointer ${
                type === "income"
                  ? "bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700"
                  : "bg-rose-600 hover:bg-rose-500 active:bg-rose-700"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  {initialData?._id ? "Update Transaction" : `Save ${type === "income" ? "Income" : "Expense"}`}
                </>
              )}
            </button>

            {initialData?._id &&
              (showDeleteConfirm ? (
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={isDeleting}
                    className="w-full py-3 px-4 rounded-xl font-semibold text-sm flex items-center justify-center bg-secondary hover:bg-muted text-foreground border border-border transition cursor-pointer disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={isSubmitting || isDeleting}
                    className="w-full py-3 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white shadow-xs transition cursor-pointer disabled:opacity-50"
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4" /> Confirm Delete
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isSubmitting || isDeleting}
                  className="w-full py-3 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 border border-rose-500/40 text-rose-600 dark:text-rose-400 bg-transparent hover:bg-rose-500/10 active:bg-rose-500/20 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Trash2 className="w-4 h-4" /> Delete Transaction
                </button>
              ))}
          </div>
        </form>
      </div>
    </div>
  );
}
