import { TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { formatINR } from "@/lib/utils";

interface SummaryData {
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  incomeCount: number;
  expenseCount: number;
  totalCount: number;
}

interface SummaryCardsProps {
  summary: SummaryData;
  isLoading?: boolean;
}

export function SummaryCards({ summary, isLoading }: SummaryCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-32 bg-card border border-border rounded-2xl animate-pulse"
          />
        ))}
      </div>
    );
  }

  const isNetPositive = summary.netBalance >= 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
      {/* Total Income */}
      <div className="bg-card border border-border text-card-foreground rounded-2xl p-5 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              Total Income
            </span>
            <div className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              {formatINR(summary.totalIncome)}
            </div>
          </div>
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-600 dark:text-emerald-400">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
          <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>{summary.incomeCount} transaction{summary.incomeCount !== 1 ? "s" : ""}</span>
        </div>
      </div>

      {/* Total Expense */}
      <div className="bg-card border border-border text-card-foreground rounded-2xl p-5 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
              Total Expense
            </span>
            <div className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              {formatINR(summary.totalExpense)}
            </div>
          </div>
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-600 dark:text-rose-400">
            <TrendingDown className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
          <ArrowDownRight className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
          <span>{summary.expenseCount} transaction{summary.expenseCount !== 1 ? "s" : ""}</span>
        </div>
      </div>

      {/* Net Balance */}
      <div className="bg-card border border-border text-card-foreground rounded-2xl p-5 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <span
              className={`text-xs font-semibold uppercase tracking-wider ${
                isNetPositive ? "text-blue-600 dark:text-blue-400" : "text-amber-600 dark:text-amber-400"
              }`}
            >
              Net Balance
            </span>
            <div className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              {formatINR(summary.netBalance)}
            </div>
          </div>
          <div
            className={`p-3 rounded-xl border ${
              isNetPositive
                ? "bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400"
                : "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400"
            }`}
          >
            <Wallet className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
          <span>
            {isNetPositive ? "Savings rate: positive" : "Spending exceeded income"}
          </span>
        </div>
      </div>
    </div>
  );
}
