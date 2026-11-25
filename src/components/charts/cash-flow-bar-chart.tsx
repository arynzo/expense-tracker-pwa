import { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import { formatINR, formatShortDate, formatFullDate, toLocalDateKey } from "@/lib/utils";
import { BarChart3 } from "lucide-react";

export type BarInterval = "day" | "week" | "month" | "year";

interface DailyTrendItem {
  date: string;
  income: number;
  expense: number;
}

interface CashFlowBarChartProps {
  allDailyTrend: DailyTrendItem[];
}

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const FULL_MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function CashFlowBarChart({ allDailyTrend }: CashFlowBarChartProps) {
  const [interval, setInterval] = useState<BarInterval>(() => {
    try {
      const saved = localStorage.getItem("expense_tracker_barchart_interval") as BarInterval | null;
      if (saved && ["day", "week", "month", "year"].includes(saved)) {
        return saved;
      }
    } catch {
      // ignore
    }
    return "week";
  });
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  const handleIntervalChange = (newInterval: BarInterval) => {
    setInterval(newInterval);
    try {
      localStorage.setItem("expense_tracker_barchart_interval", newInterval);
    } catch {
      // ignore
    }
  };

  const availableYears = useMemo(() => {
    const years = new Set<number>();
    years.add(new Date().getFullYear());
    allDailyTrend.forEach((item) => {
      if (item.date) {
        const y = parseInt(item.date.split("-")[0], 10);
        if (!isNaN(y)) years.add(y);
      }
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [allDailyTrend]);

  const chartData = useMemo(() => {
    const trendMap = new Map<string, { income: number; expense: number }>();
    allDailyTrend.forEach((item) => {
      trendMap.set(item.date, {
        income: item.income || 0,
        expense: item.expense || 0,
      });
    });

    if (interval === "week") {
      const now = new Date();
      const result = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(now.getDate() - i);
        const dateStr = toLocalDateKey(d);
        const label = formatShortDate(dateStr);
        const tooltipLabel = formatFullDate(dateStr);

        const entry = trendMap.get(dateStr) || { income: 0, expense: 0 };
        result.push({
          label,
          tooltipLabel,
          fullDate: dateStr,
          income: entry.income,
          expense: entry.expense,
        });
      }
      return result;
    }

    if (interval === "month") {
      const year = selectedYear;
      const monthTotals = Array.from({ length: 12 }, (_, i) => ({
        label: MONTH_NAMES[i],
        tooltipLabel: `${FULL_MONTH_NAMES[i]} ${year}`,
        monthIndex: i + 1,
        income: 0,
        expense: 0,
      }));

      allDailyTrend.forEach((item) => {
        if (!item.date) return;
        const [yStr, mStr] = item.date.split("-");
        const y = parseInt(yStr, 10);
        const m = parseInt(mStr, 10);
        if (y === year && m >= 1 && m <= 12) {
          monthTotals[m - 1].income += item.income || 0;
          monthTotals[m - 1].expense += item.expense || 0;
        }
      });

      return monthTotals;
    }

    if (interval === "year") {
      const yearTotals = new Map<number, { income: number; expense: number }>();
      availableYears.forEach((y) => yearTotals.set(y, { income: 0, expense: 0 }));

      allDailyTrend.forEach((item) => {
        if (!item.date) return;
        const y = parseInt(item.date.split("-")[0], 10);
        if (!isNaN(y)) {
          if (!yearTotals.has(y)) {
            yearTotals.set(y, { income: 0, expense: 0 });
          }
          const rec = yearTotals.get(y)!;
          rec.income += item.income || 0;
          rec.expense += item.expense || 0;
        }
      });

      return Array.from(yearTotals.entries())
        .sort(([a], [b]) => a - b)
        .map(([year, values]) => ({
          label: year.toString(),
          tooltipLabel: `Year ${year}`,
          income: values.income,
          expense: values.expense,
        }));
    }

    if (allDailyTrend.length === 0) {
      return [];
    }

    return allDailyTrend.map((item) => ({
      label: formatShortDate(item.date),
      tooltipLabel: formatFullDate(item.date),
      fullDate: item.date,
      income: item.income || 0,
      expense: item.expense || 0,
    }));
  }, [allDailyTrend, interval, selectedYear, availableYears]);

  return (
    <div className="bg-card border border-border text-card-foreground rounded-2xl p-5 space-y-4 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              Cash Flow Analytics
            </h3>
            <p className="text-xs text-muted-foreground">
              {interval === "week" && "Last 7 days daily breakdown"}
              {interval === "month" && `12 months overview (${selectedYear})`}
              {interval === "year" && "Yearly totals comparison"}
              {interval === "day" && "All recorded daily transactions"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          {interval === "month" && availableYears.length > 1 && (
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
              className="bg-background border border-input text-xs font-semibold text-foreground rounded-xl px-2.5 py-1.5 focus:outline-hidden"
            >
              {availableYears.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          )}

          <div className="flex items-center bg-secondary/80 p-1 rounded-xl border border-border text-xs">
            {(
              [
                { id: "day", label: "Day" },
                { id: "week", label: "Week" },
                { id: "month", label: "Month" },
                { id: "year", label: "Year" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleIntervalChange(tab.id)}
                className={`px-3 py-1 rounded-lg font-semibold transition cursor-pointer ${
                  interval === tab.id
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="h-72 w-full pt-2">
        {chartData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
            No transaction records found for this interval
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="currentColor"
                opacity={0.1}
                vertical={false}
              />
              <XAxis
                dataKey="label"
                stroke="currentColor"
                opacity={0.7}
                fontSize={11}
                tickLine={false}
              />
              <YAxis
                stroke="currentColor"
                opacity={0.7}
                fontSize={11}
                tickLine={false}
                tickFormatter={(v) =>
                  `₹${v >= 1000 ? `${Math.round(v / 1000)}k` : v}`
                }
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const inc =
                      (payload.find((p) => p.dataKey === "income")?.value as number) || 0;
                    const exp =
                      (payload.find((p) => p.dataKey === "expense")?.value as number) || 0;
                    const item = payload[0]?.payload as { tooltipLabel?: string } | undefined;
                    const displayTitle = item?.tooltipLabel || String(label ?? "");
                    return (
                      <div className="bg-popover border border-border p-3 rounded-xl shadow-lg text-xs space-y-1.5 min-w-[140px]">
                        <p className="font-bold text-popover-foreground border-b border-border pb-1">
                          {displayTitle}
                        </p>
                        <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                          <span>Income:</span>
                          <span>+{formatINR(inc)}</span>
                        </div>
                        <div className="flex items-center justify-between text-rose-600 dark:text-rose-400 font-semibold">
                          <span>Expense:</span>
                          <span>-{formatINR(exp)}</span>
                        </div>
                        <div className="flex items-center justify-between text-muted-foreground pt-1 border-t border-border font-medium text-[11px]">
                          <span>Balance:</span>
                          <span
                            className={
                              inc - exp >= 0
                                ? "text-emerald-600 dark:text-emerald-400 font-bold"
                                : "text-rose-600 dark:text-rose-400 font-bold"
                            }
                          >
                            {inc - exp >= 0 ? "+" : ""}
                            {formatINR(inc - exp)}
                          </span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend
                verticalAlign="top"
                align="right"
                iconType="circle"
                wrapperStyle={{ paddingBottom: 12, fontSize: 12 }}
              />
              <Bar
                dataKey="income"
                name="Income"
                fill="#10b981"
                radius={[6, 6, 0, 0]}
                maxBarSize={40}
              />
              <Bar
                dataKey="expense"
                name="Expense"
                fill="#f43f5e"
                radius={[6, 6, 0, 0]}
                maxBarSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
