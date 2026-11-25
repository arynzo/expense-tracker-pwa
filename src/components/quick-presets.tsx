import { useState } from "react";
import { toast } from "sonner";
import { Zap, Loader2 } from "lucide-react";
import { CategoryIcon } from "@/components/ui/category-icon";
import { formatINR } from "@/lib/utils";
import {
  getPresets,
  createTransaction,
  deleteTransaction,
  type PresetRecord,
} from "@/lib/storage";

export type PresetItem = PresetRecord;

interface QuickPresetsProps {
  onTransactionAdded: () => void;
}

export function QuickPresets({ onTransactionAdded }: QuickPresetsProps) {
  const [presets] = useState<PresetItem[]>(() => {
    try {
      return getPresets();
    } catch (err) {
      console.error("Failed to load presets:", err);
      return [];
    }
  });
  const [activeAddingId, setActiveAddingId] = useState<string | null>(null);

  const handleQuickAdd = (preset: PresetItem) => {
    setActiveAddingId(preset._id);
    try {
      const result = createTransaction({
        type: preset.type,
        title: preset.label,
        amount: preset.amount,
        method: preset.method,
        category: preset.category,
        note: "Quick added via chip",
        createdAt: new Date().toISOString(),
      });

      if (!result.success) {
        throw new Error(result.error);
      }

      const createdId = result.data._id;
      onTransactionAdded();

      toast.success(
        <div className="flex items-center justify-between w-full gap-3">
          <span>
            Added <b>{preset.label}</b> ({formatINR(preset.amount)})
          </span>
          <button
            type="button"
            onClick={() => {
              const del = deleteTransaction(createdId);
              if (del.success) {
                toast.info(`Undid "${preset.label}"`);
                onTransactionAdded();
              } else {
                toast.error("Failed to undo");
              }
            }}
            className="px-2.5 py-1 text-xs font-bold rounded-md bg-secondary hover:bg-muted text-foreground border border-border transition cursor-pointer"
          >
            Undo
          </button>
        </div>,
        { duration: 4500 }
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to add";
      toast.error(msg);
    } finally {
      setActiveAddingId(null);
    }
  };

  if (presets.length === 0) return null;

  return (
    <div className="bg-card border border-border rounded-2xl p-4 sm:p-5 shadow-xs space-y-2">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
        <span>1-Tap Quick Add</span>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-0.5 no-scrollbar scroll-smooth">
        {presets.map((preset) => {
          const isAdding = activeAddingId === preset._id;
          return (
            <button
              key={preset._id}
              type="button"
              onClick={() => handleQuickAdd(preset)}
              disabled={isAdding}
              title={`Add ${preset.label} ${formatINR(preset.amount)} via ${preset.method.toUpperCase()}`}
              className="group relative flex items-center gap-2 px-3.5 py-2 rounded-full bg-card hover:bg-secondary border border-border text-card-foreground transition active:scale-95 shrink-0 shadow-xs disabled:opacity-60 cursor-pointer"
            >
              {isAdding ? (
                <Loader2 className="w-4 h-4 animate-spin text-emerald-600 dark:text-emerald-400" />
              ) : (
                <div className="p-1 rounded-full bg-secondary group-hover:bg-muted transition text-muted-foreground">
                  <CategoryIcon name={preset.icon} className="w-3.5 h-3.5" />
                </div>
              )}
              <span className="text-xs font-medium">{preset.label}</span>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                ₹{preset.amount}
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-sm bg-secondary text-muted-foreground uppercase tracking-wider font-mono">
                {preset.method}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
