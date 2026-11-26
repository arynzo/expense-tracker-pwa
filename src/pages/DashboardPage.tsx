import { useState, useMemo, useCallback } from "react";
import { AppLayoutWrapper } from "@/components/app-layout-wrapper";
import { QuickPresets } from "@/components/quick-presets";
import { SummaryCards } from "@/components/summary-cards";
import { PeriodFilter } from "@/components/period-filter";
import { ChartsContainer } from "@/components/charts/charts-container";
import { RecentTransactions } from "@/components/recent-transactions";
import { type TransactionData } from "@/components/transaction-modal";
import { getDashboardSummary } from "@/lib/storage";
import { toLocalDateKey } from "@/lib/utils";

function DashboardContent({
  openEditModal,
  triggerRefresh,
  refreshKey,
}: {
  openEditModal: (t: TransactionData) => void;
  triggerRefresh: () => void;
  refreshKey: number;
}) {
  const [dateRange, setDateRange] = useState<{ from?: string; to?: string }>(() => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    return {
      from: toLocalDateKey(firstDay),
      to: toLocalDateKey(now),
    };
  });

  const data = useMemo(() => {
    void refreshKey;
    return getDashboardSummary(dateRange.from, dateRange.to);
  }, [dateRange, refreshKey]);

  const handlePeriodChange = useCallback((from?: string, to?: string) => {
    setDateRange({ from, to });
  }, []);

  return (
    <div className="space-y-6">
      <QuickPresets
        onTransactionAdded={() => {
          triggerRefresh();
        }}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
          Financial Summary
        </h2>
        <PeriodFilter onPeriodChange={handlePeriodChange} />
      </div>

      <SummaryCards summary={data.summary} isLoading={false} />

      <ChartsContainer
        categoryBreakdown={data.categoryBreakdown}
        incomeCategoryBreakdown={data.incomeCategoryBreakdown}
        dailyTrend={data.dailyTrend}
        allDailyTrend={data.allDailyTrend}
        methodSplit={data.methodSplit}
        totalIncome={data.summary.totalIncome}
        totalExpense={data.summary.totalExpense}
      />

      <RecentTransactions
        transactions={data.recentTransactions}
        onSelectTransaction={openEditModal}
        isLoading={false}
      />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <AppLayoutWrapper pageTitle="Overview">
      {({ openEditModal, triggerRefresh, refreshKey }) => (
        <DashboardContent
          openEditModal={openEditModal}
          triggerRefresh={triggerRefresh}
          refreshKey={refreshKey}
        />
      )}
    </AppLayoutWrapper>
  );
}
