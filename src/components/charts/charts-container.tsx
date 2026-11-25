import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  CartesianGrid,
} from "recharts";
import { formatINR, formatShortDate, formatFullDate } from "@/lib/utils";
import { Smartphone, Banknote } from "lucide-react";
import { CashFlowBarChart } from "./cash-flow-bar-chart";

interface ChartsContainerProps {
  categoryBreakdown: { category: string; total: number; count: number }[];
  dailyTrend: { date: string; income: number; expense: number }[];
  allDailyTrend?: { date: string; income: number; expense: number }[];
  methodSplit: {
    cash: { income: number; expense: number; total: number };
    upi: { income: number; expense: number; total: number };
  };
  totalIncome: number;
  totalExpense: number;
}

const DONUT_COLORS = [
  "#f59e0b",
  "#3b82f6",
  "#a855f7",
  "#f43f5e",
  "#06b6d4",
  "#10b981",
  "#6366f1",
  "#64748b",
  "#ec4899",
  "#84cc16",
];

export function ChartsContainer({
  categoryBreakdown,
  dailyTrend,
  allDailyTrend = [],
  methodSplit,
  totalIncome,
  totalExpense,
}: ChartsContainerProps) {
  const comparisonData = [
    { name: "Income", amount: totalIncome, fill: "#10b981" },
    { name: "Expense", amount: totalExpense, fill: "#f43f5e" },
  ];

  const totalSpent = methodSplit.cash.expense + methodSplit.upi.expense;
  const cashPercent = totalSpent > 0 ? Math.round((methodSplit.cash.expense / totalSpent) * 100) : 0;
  const upiPercent = totalSpent > 0 ? Math.round((methodSplit.upi.expense / totalSpent) * 100) : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="col-span-1 lg:col-span-2">
        <CashFlowBarChart allDailyTrend={allDailyTrend} />
      </div>

      {/* 1. Daily Trend Chart */}
      <div className="bg-card border border-border text-card-foreground rounded-2xl p-5 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Daily Spending Trend</h3>
            <p className="text-xs text-muted-foreground">Spending and income over time</p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Income
            </span>
            <span className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Expense
            </span>
          </div>
        </div>

        <div className="h-64 w-full">
          {dailyTrend.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
              No daily trend data available for this range
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
                <XAxis
                  dataKey="date"
                  stroke="currentColor"
                  opacity={0.6}
                  fontSize={11}
                  tickFormatter={(val) => formatShortDate(val)}
                />
                <YAxis stroke="currentColor" opacity={0.6} fontSize={11} tickFormatter={(val) => `₹${val}`} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-popover border border-border p-3 rounded-xl shadow-lg text-xs space-y-1">
                          <p className="font-semibold text-popover-foreground">{formatFullDate(label)}</p>
                          <p className="text-emerald-600 dark:text-emerald-400 font-medium">
                            Income: {formatINR((payload[0]?.value as number) || 0)}
                          </p>
                          <p className="text-rose-600 dark:text-rose-400 font-medium">
                            Expense: {formatINR((payload[1]?.value as number) || 0)}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="income"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#incomeGrad)"
                />
                <Area
                  type="monotone"
                  dataKey="expense"
                  stroke="#f43f5e"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#expenseGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* 2. Category-wise Expense Donut Chart */}
      <div className="bg-card border border-border text-card-foreground rounded-2xl p-5 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Category Breakdown</h3>
            <p className="text-xs text-muted-foreground">Where your expenses are going</p>
          </div>
          <span className="text-xs font-medium text-rose-600 dark:text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
            {formatINR(totalExpense)} total
          </span>
        </div>

        <div className="h-64 w-full flex flex-col sm:flex-row items-center justify-between gap-4">
          {categoryBreakdown.length === 0 ? (
            <div className="h-full w-full flex items-center justify-center text-xs text-muted-foreground">
              No expenses recorded for this period
            </div>
          ) : (
            <>
              <div className="h-48 sm:h-full w-full sm:w-1/2 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryBreakdown}
                      dataKey="total"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={4}
                    >
                      {categoryBreakdown.map((_entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={DONUT_COLORS[index % DONUT_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload as { category: string; total: number; count: number };
                          return (
                            <div className="bg-popover border border-border p-2.5 rounded-xl text-xs space-y-1">
                              <span className="font-semibold text-popover-foreground">
                                {data.category}
                              </span>
                              <div className="text-foreground font-bold">
                                {formatINR(data.total)}
                              </div>
                              <div className="text-muted-foreground text-[10px]">
                                {data.count} transaction{data.count !== 1 ? "s" : ""}
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="w-full sm:w-1/2 max-h-48 overflow-y-auto space-y-2 pr-1 text-xs">
                {categoryBreakdown.map((cat, idx) => {
                  const pct =
                    totalExpense > 0
                      ? Math.round((cat.total / totalExpense) * 100)
                      : 0;
                  return (
                    <div
                      key={cat.category}
                      className="flex items-center justify-between text-xs py-0.5"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{
                            backgroundColor: DONUT_COLORS[idx % DONUT_COLORS.length],
                          }}
                        />
                        <span className="text-foreground truncate">{cat.category}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-semibold text-foreground">
                          {formatINR(cat.total)}
                        </span>
                        <span className="text-[11px] text-muted-foreground w-7 text-right">
                          {pct}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* 3. Income vs Expense Comparison Bar Chart */}
      <div className="bg-card border border-border text-card-foreground rounded-2xl p-5 space-y-4 shadow-xs">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Income vs Expense</h3>
          <p className="text-xs text-muted-foreground">Direct volume comparison</p>
        </div>

        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={comparisonData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} vertical={false} />
              <XAxis dataKey="name" stroke="currentColor" opacity={0.6} fontSize={12} />
              <YAxis stroke="currentColor" opacity={0.6} fontSize={11} tickFormatter={(v) => `₹${v}`} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as { name: string; amount: number };
                    return (
                      <div className="bg-popover border border-border p-2.5 rounded-xl text-xs">
                        <span className="font-medium text-muted-foreground">{data.name}: </span>
                        <span className="font-bold text-foreground">{formatINR(data.amount)}</span>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
                {comparisonData.map((entry, index) => (
                  <Cell key={`bar-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 4. Payment Method Split (Cash vs UPI) */}
      <div className="bg-card border border-border text-card-foreground rounded-2xl p-5 space-y-4 shadow-xs flex flex-col justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Payment Method Split</h3>
          <p className="text-xs text-muted-foreground">Distribution between Cash and Online UPI</p>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="bg-secondary/60 border border-border rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between text-sky-600 dark:text-sky-400">
              <span className="text-xs font-semibold uppercase tracking-wider">UPI / Online</span>
              <Smartphone className="w-4 h-4" />
            </div>
            <div className="text-xl font-bold text-foreground">
              {formatINR(methodSplit.upi.expense)}
            </div>
            <div className="text-[11px] text-muted-foreground">
              {upiPercent}% of total expense
            </div>
          </div>

          <div className="bg-secondary/60 border border-border rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between text-amber-600 dark:text-amber-400">
              <span className="text-xs font-semibold uppercase tracking-wider">Cash</span>
              <Banknote className="w-4 h-4" />
            </div>
            <div className="text-xl font-bold text-foreground">
              {formatINR(methodSplit.cash.expense)}
            </div>
            <div className="text-[11px] text-muted-foreground">
              {cashPercent}% of total expense
            </div>
          </div>
        </div>

        <div className="space-y-1.5 pt-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>UPI: {upiPercent}%</span>
            <span>Cash: {cashPercent}%</span>
          </div>
          <div className="w-full h-3 bg-secondary rounded-full overflow-hidden flex">
            <div
              className="h-full bg-sky-500 transition-all duration-500"
              style={{ width: `${upiPercent}%` }}
              title={`UPI: ${formatINR(methodSplit.upi.expense)}`}
            />
            <div
              className="h-full bg-amber-500 transition-all duration-500"
              style={{ width: `${cashPercent}%` }}
              title={`Cash: ${formatINR(methodSplit.cash.expense)}`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
