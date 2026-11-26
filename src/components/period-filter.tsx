import { useState, useEffect } from "react";
import { toLocalDateKey } from "@/lib/utils";

export type PeriodType = "today" | "week" | "month" | "last_month" | "year" | "custom" | "all";

interface PeriodFilterProps {
  onPeriodChange: (from?: string, to?: string, label?: string) => void;
}

const computePeriodDates = (period: PeriodType, cFrom?: string, cTo?: string) => {
  const now = new Date();
  if (period === "today") {
    const todayStr = toLocalDateKey(now);
    return { from: todayStr, to: todayStr, label: "Today" };
  } else if (period === "week") {
    const first = now.getDate() - (now.getDay() === 0 ? 6 : now.getDay() - 1);
    const monday = new Date(now);
    monday.setDate(first);
    return {
      from: toLocalDateKey(monday),
      to: toLocalDateKey(now),
      label: "This Week",
    };
  } else if (period === "month") {
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    return {
      from: toLocalDateKey(firstDay),
      to: toLocalDateKey(now),
      label: "This Month",
    };
  } else if (period === "last_month") {
    const firstDay = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth(), 0);
    return {
      from: toLocalDateKey(firstDay),
      to: toLocalDateKey(lastDay),
      label: "Last Month",
    };
  } else if (period === "year") {
    const firstDay = new Date(now.getFullYear(), 0, 1);
    return {
      from: toLocalDateKey(firstDay),
      to: toLocalDateKey(now),
      label: "This Year",
    };
  } else if (period === "all") {
    return { from: undefined, to: undefined, label: "All Time" };
  } else if (period === "custom" && cFrom && cTo) {
    return { from: cFrom, to: cTo, label: `${cFrom} to ${cTo}` };
  }
  return { from: undefined, to: undefined, label: "" };
};

export function PeriodFilter({ onPeriodChange }: PeriodFilterProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>(() => {
    try {
      const saved = localStorage.getItem("expense_tracker_period_range") as PeriodType | null;
      if (saved && ["today", "week", "month", "last_month", "year", "all", "custom"].includes(saved)) {
        return saved;
      }
    } catch {
      // ignore
    }
    return "month";
  });
  const [showCustom, setShowCustom] = useState<boolean>(() => selectedPeriod === "custom");
  const [customFrom, setCustomFrom] = useState<string>(() => {
    try {
      return localStorage.getItem("expense_tracker_custom_from") || "";
    } catch {
      return "";
    }
  });
  const [customTo, setCustomTo] = useState<string>(() => {
    try {
      return localStorage.getItem("expense_tracker_custom_to") || "";
    } catch {
      return "";
    }
  });

  useEffect(() => {
    if (selectedPeriod === "custom") {
      if (customFrom && customTo) {
        const res = computePeriodDates("custom", customFrom, customTo);
        onPeriodChange(res.from, res.to, res.label);
      }
    } else {
      const res = computePeriodDates(selectedPeriod);
      onPeriodChange(res.from, res.to, res.label);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelect = (period: PeriodType) => {
    setSelectedPeriod(period);
    try {
      localStorage.setItem("expense_tracker_period_range", period);
    } catch {
      // ignore
    }

    if (period === "custom") {
      setShowCustom(true);
    } else {
      setShowCustom(false);
      const res = computePeriodDates(period);
      onPeriodChange(res.from, res.to, res.label);
    }
  };

  const handleApplyCustom = () => {
    if (customFrom && customTo) {
      try {
        localStorage.setItem("expense_tracker_custom_from", customFrom);
        localStorage.setItem("expense_tracker_custom_to", customTo);
      } catch {
        // ignore
      }
      onPeriodChange(customFrom, customTo, `${customFrom} to ${customTo}`);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
        {[
          { id: "today", label: "Today" },
          { id: "week", label: "This Week" },
          { id: "month", label: "This Month" },
          { id: "last_month", label: "Last Month" },
          { id: "year", label: "This Year" },
          { id: "all", label: "All Time" },
          { id: "custom", label: "Custom" },
        ].map((item) => {
          const isActive = selectedPeriod === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleSelect(item.id as PeriodType)}
              className={`px-3 py-1.5 rounded-xl font-medium transition shrink-0 cursor-pointer touch-manipulation ${
                isActive
                  ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                  : "bg-card text-muted-foreground hover:text-foreground hover:bg-muted border border-border"
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {showCustom && (
        <div className="p-3 bg-card border border-border rounded-xl flex flex-wrap items-center gap-3 animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground font-medium">From:</span>
            <input
              type="date"
              value={customFrom}
              onChange={(e) => setCustomFrom(e.target.value)}
              className="bg-background border border-input text-xs text-foreground rounded-lg px-2.5 py-1.5 focus:outline-hidden focus:border-ring"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground font-medium">To:</span>
            <input
              type="date"
              value={customTo}
              onChange={(e) => setCustomTo(e.target.value)}
              className="bg-background border border-input text-xs text-foreground rounded-lg px-2.5 py-1.5 focus:outline-hidden focus:border-ring"
            />
          </div>
          <button
            type="button"
            onClick={handleApplyCustom}
            disabled={!customFrom || !customTo}
            className="px-3 py-1.5 bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground rounded-lg text-xs font-semibold transition cursor-pointer"
          >
            Apply
          </button>
        </div>
      )}
    </div>
  );
}
