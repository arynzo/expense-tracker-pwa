import { useState, useMemo } from "react";
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  X,
} from "lucide-react";
import { AppLayoutWrapper } from "@/components/app-layout-wrapper";
import { CategoryIcon } from "@/components/ui/category-icon";
import { formatINR, formatDateLabel, formatTimeLabel } from "@/lib/utils";
import { type TransactionData } from "@/components/transaction-modal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getCategories,
  getTransactions,
} from "@/lib/storage";

function TransactionsContent({
  openEditModal,
  openAddModal,
  refreshKey,
}: {
  openEditModal: (t: TransactionData) => void;
  openAddModal: () => void;
  refreshKey: number;
}) {
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedMethod, setSelectedMethod] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [page, setPage] = useState(1);

  const dynamicCategories = useMemo(() => {
    void refreshKey;
    return getCategories();
  }, [refreshKey]);

  const txResult = useMemo(() => {
    void refreshKey;
    return getTransactions({
      page,
      limit: 20,
      search: search.trim() || undefined,
      type: selectedType !== "all" ? selectedType : undefined,
      method: selectedMethod !== "all" ? selectedMethod : undefined,
      category: selectedCategory !== "all" ? selectedCategory : undefined,
    });
  }, [page, search, selectedType, selectedMethod, selectedCategory, refreshKey]);

  const transactions = txResult.data;
  const totalPages = txResult.pagination.totalPages || 1;
  const isLoading = false;

  const groupedTransactions: Record<string, TransactionData[]> = {};
  transactions.forEach((t) => {
    const label = formatDateLabel(t.date);
    if (!groupedTransactions[label]) {
      groupedTransactions[label] = [];
    }
    groupedTransactions[label].push(t);
  });

  return (
    <div className="space-y-5">
      <div className="bg-card border border-border text-card-foreground rounded-2xl p-4 sm:p-5 space-y-3.5 shadow-xs">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search records by title, keywords..."
              className="w-full bg-background border border-input rounded-xl pl-10 pr-10 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-hidden focus:border-ring focus:ring-1 focus:ring-ring transition"
            />
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setPage(1);
                }}
                className="absolute right-3.5 top-2.5 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => setIsFilterOpen((prev) => !prev)}
            title={isFilterOpen ? "Hide Filters" : "Show Filters"}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-xl border text-xs font-semibold transition cursor-pointer shrink-0 ${
              isFilterOpen || selectedType !== "all" || selectedMethod !== "all" || selectedCategory !== "all"
                ? "bg-primary text-primary-foreground border-primary shadow-xs"
                : "bg-background border-input text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline">Filters</span>
            {(selectedType !== "all" || selectedMethod !== "all" || selectedCategory !== "all") && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
            )}
          </button>
        </div>

        {isFilterOpen && (
          <div className="pt-3 border-t border-border space-y-3 animate-in fade-in slide-in-from-top-1 duration-150">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                Filter by criteria
              </span>
              {(selectedType !== "all" || selectedMethod !== "all" || selectedCategory !== "all") && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedType("all");
                    setSelectedMethod("all");
                    setSelectedCategory("all");
                    setPage(1);
                  }}
                  className="flex items-center gap-1 text-xs font-semibold text-rose-500 hover:text-rose-600 transition cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" /> Reset Filters
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Transaction Type
                </label>
                <div className="grid grid-cols-3 gap-1 bg-background p-1 rounded-xl border border-input h-10">
                  {[
                    { id: "all", label: "All" },
                    { id: "expense", label: "Expense" },
                    { id: "income", label: "Income" },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        setSelectedType(t.id);
                        setPage(1);
                      }}
                      className={`flex items-center justify-center rounded-lg text-xs font-semibold transition cursor-pointer ${
                        selectedType === t.id
                          ? t.id === "income"
                            ? "bg-emerald-600 text-white shadow-2xs"
                            : t.id === "expense"
                            ? "bg-rose-600 text-white shadow-2xs"
                            : "bg-secondary text-secondary-foreground shadow-2xs"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Payment Method
                </label>
                <div className="grid grid-cols-3 gap-1 bg-background p-1 rounded-xl border border-input h-10">
                  {[
                    { id: "all", label: "All" },
                    { id: "upi", label: "UPI" },
                    { id: "cash", label: "Cash" },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => {
                        setSelectedMethod(m.id);
                        setPage(1);
                      }}
                      className={`flex items-center justify-center rounded-lg text-xs font-semibold transition cursor-pointer ${
                        selectedMethod === m.id
                          ? "bg-secondary text-secondary-foreground shadow-2xs"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5 sm:col-span-2 lg:col-span-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Category
                </label>
                <Select
                  value={selectedCategory}
                  onValueChange={(val) => {
                    if (val) {
                      setSelectedCategory(val);
                      setPage(1);
                    }
                  }}
                >
                  <SelectTrigger className="w-full h-10 rounded-xl bg-background border-input text-xs font-medium">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    {dynamicCategories.map((c, idx) => (
                      <SelectItem key={c._id || c.name || idx} value={c.name}>
                        <div className="flex items-center gap-2">
                          <CategoryIcon name={c.icon} category={c.name} className="w-3.5 h-3.5 text-muted-foreground" />
                          <span className="capitalize">{c.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-24 bg-card border border-border rounded-2xl animate-pulse"
            />
          ))}
        </div>
      ) : transactions.length === 0 ? (
        <div className="bg-card border border-border text-card-foreground rounded-2xl p-12 text-center space-y-3">
          <Filter className="w-10 h-10 text-muted-foreground mx-auto" />
          <h3 className="text-base font-semibold text-foreground">
            No matching transactions found
          </h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Try adjusting your search keywords or filters, or add a new transaction.
          </p>
          <button
            type="button"
            onClick={openAddModal}
            className="mt-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            Add Transaction
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedTransactions).map(([dateLabel, items]) => (
            <div key={dateLabel} className="space-y-2">
              <div className="sticky top-16 z-20 bg-background/90 backdrop-blur-xs py-1 px-1">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  {dateLabel}
                </span>
              </div>

              <div className="space-y-2.5">
                {items.map((t) => {
                  const isIncome = t.type === "income";

                  return (
                    <div
                      key={t._id}
                      onClick={() => openEditModal(t)}
                      className="p-3.5 sm:p-4 rounded-2xl transition bg-card border border-border hover:border-input hover:bg-muted/30 cursor-pointer shadow-xs active:scale-[0.99]"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`p-2.5 rounded-xl border shrink-0 ${
                              isIncome
                                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                                : "bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400"
                            }`}
                          >
                            <CategoryIcon category={t.category} className="w-5 h-5" />
                          </div>
                          <div className="min-w-0 space-y-1">
                            <h4 className="text-sm font-semibold text-foreground truncate">
                              {t.title}
                            </h4>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span className="capitalize">{t.category}</span>
                              <span>•</span>
                              <span>{formatTimeLabel(t.date)}</span>
                              <span>•</span>
                              <span className="uppercase text-[10px] px-1.5 py-0.2 rounded-sm bg-secondary text-muted-foreground font-mono font-medium">
                                {t.method}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div
                            className={`text-base font-bold font-mono ${
                              isIncome
                                ? "text-emerald-600 dark:text-emerald-400"
                                : "text-rose-600 dark:text-rose-400"
                            }`}
                          >
                            {isIncome ? "+" : "-"}
                            {formatINR(t.amount)}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            disabled={page <= 1 || isLoading}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="flex items-center gap-1 px-3.5 py-2 rounded-xl bg-card border border-border text-xs font-semibold text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>
          <span className="text-xs font-medium text-muted-foreground">
            Page <b className="text-foreground">{page}</b> of {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages || isLoading}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="flex items-center gap-1 px-3.5 py-2 rounded-xl bg-card border border-border text-xs font-semibold text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

export default function TransactionsPage() {
  return (
    <AppLayoutWrapper pageTitle="Transactions">
      {({ openEditModal, openAddModal, refreshKey }) => (
        <TransactionsContent
          openEditModal={openEditModal}
          openAddModal={openAddModal}
          refreshKey={refreshKey}
        />
      )}
    </AppLayoutWrapper>
  );
}
