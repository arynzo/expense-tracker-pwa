import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { CategoryIcon } from "@/components/ui/category-icon";
import { formatINR, formatDateLabel, formatTimeLabel } from "@/lib/utils";
import type { TransactionData } from "./transaction-modal";

interface RecentTransactionsProps {
  transactions: TransactionData[];
  onSelectTransaction: (t: TransactionData) => void;
  isLoading?: boolean;
}

export function RecentTransactions({
  transactions,
  onSelectTransaction,
  isLoading,
}: RecentTransactionsProps) {
  if (isLoading) {
    return (
      <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
        <div className="h-6 w-36 bg-muted rounded-md animate-pulse" />
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-14 bg-muted/60 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border text-card-foreground rounded-2xl p-5 space-y-4 shadow-xs">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Recent Transactions</h3>
          <p className="text-[11px] text-muted-foreground">Latest entries (Max 5)</p>
        </div>
        <Link
          to="/transactions"
          className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 transition"
        >
          View All <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {transactions.length === 0 ? (
        <div className="py-10 text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-muted mx-auto flex items-center justify-center text-muted-foreground">
            ₹
          </div>
          <p className="text-sm text-foreground font-medium">No transactions recorded today</p>
          <p className="text-xs text-muted-foreground">
            Use the 1-tap chips or the + button below to log your transactions for today.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {transactions.map((t) => {
            const isIncome = t.type === "income";
            return (
              <div
                key={t._id}
                onClick={() => onSelectTransaction(t)}
                className="group flex items-center justify-between py-3 px-2 rounded-xl hover:bg-muted/50 cursor-pointer transition"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`p-2.5 rounded-xl border shrink-0 ${
                      isIncome
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                        : "bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400"
                    }`}
                  >
                    <CategoryIcon category={t.category} className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 space-y-0.5">
                    <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition">
                      {t.title}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{formatDateLabel(t.createdAt)}</span>
                      <span>•</span>
                      <span>{formatTimeLabel(t.createdAt)}</span>
                      <span>•</span>
                      <span className="uppercase text-[10px] px-1 rounded-sm bg-secondary text-muted-foreground font-mono">
                        {t.method}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0 pl-3">
                  <div
                    className={`text-sm font-bold font-mono ${
                      isIncome
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-rose-600 dark:text-rose-400"
                    }`}
                  >
                    {isIncome ? "+" : "-"}
                    {formatINR(t.amount)}
                  </div>
                  <span className="text-[11px] text-muted-foreground capitalize">
                    {t.category}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
