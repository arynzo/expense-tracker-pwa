import {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  DEFAULT_PRESETS,
} from "@/lib/constants";
import {
  transactionSchema,
  quickPresetSchema,
  categorySchema,
} from "@/lib/validations";
import { toLocalDateKey } from "@/lib/utils";

const KEYS = {
  TRANSACTIONS: "expense_tracker_transactions",
  CATEGORIES: "expense_tracker_categories",
  CATEGORIES_INIT: "expense_tracker_categories_initialized",
  PRESETS: "expense_tracker_presets",
  PRESETS_INIT: "expense_tracker_presets_initialized",
} as const;

export interface TransactionRecord {
  _id: string;
  type: "income" | "expense";
  title: string;
  note: string;
  amount: number;
  method: "cash" | "upi";
  category: string;
  createdAt: string;
}

export interface CategoryRecord {
  _id: string;
  name: string;
  type: "income" | "expense";
  icon: string;
  color: string;
  isDefault: boolean;
}

export interface PresetRecord {
  _id: string;
  label: string;
  amount: number;
  type: "income" | "expense";
  method: "cash" | "upi";
  category: string;
  icon: string;
  order: number;
}

export interface TransactionQueryParams {
  page?: number;
  limit?: number;
  type?: string;
  method?: string;
  category?: string;
  search?: string;
  from?: string;
  to?: string;
}

export interface DashboardSummaryData {
  summary: {
    totalIncome: number;
    totalExpense: number;
    netBalance: number;
    periodBalance: number;
    incomeCount: number;
    expenseCount: number;
    totalCount: number;
  };
  methodSplit: {
    cash: { income: number; expense: number; total: number };
    upi: { income: number; expense: number; total: number };
  };
  categoryBreakdown: { category: string; total: number; count: number }[];
  incomeCategoryBreakdown: { category: string; total: number; count: number }[];
  dailyTrend: { date: string; income: number; expense: number }[];
  allDailyTrend: { date: string; income: number; expense: number }[];
  recentTransactions: TransactionRecord[];
}

function generateId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

let txCache: TransactionRecord[] | null = null;
let catCache: CategoryRecord[] | null = null;
let presetCache: PresetRecord[] | null = null;

function writeJSON<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
  if (key === KEYS.TRANSACTIONS) txCache = null;
  else if (key === KEYS.CATEGORIES) catCache = null;
  else if (key === KEYS.PRESETS) presetCache = null;
}

// ==================== TRANSACTIONS CRUD ====================

function readAllTransactionsRaw(): TransactionRecord[] {
  if (txCache !== null) return txCache;
  const list = readJSON<Array<TransactionRecord & { date?: string }>>(KEYS.TRANSACTIONS, []);
  if (!Array.isArray(list)) {
    txCache = [];
    return txCache;
  }
  txCache = list.map((item) => ({
    _id: item._id,
    type: item.type,
    title: item.title,
    note: item.note || "",
    amount: item.amount,
    method: item.method,
    category: item.category || "Other",
    createdAt: item.createdAt || item.date || new Date().toISOString(),
  }));
  return txCache;
}

function sortTransactionsDesc(list: TransactionRecord[]): TransactionRecord[] {
  return [...list].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getTransactions(params: TransactionQueryParams = {}) {
  const page = Math.max(1, params.page ?? 1);
  const limit = Math.min(100, Math.max(1, params.limit ?? 20));
  const skip = (page - 1) * limit;

  let items = sortTransactionsDesc(readAllTransactionsRaw());

  if (params.type && (params.type === "income" || params.type === "expense")) {
    items = items.filter((t) => t.type === params.type);
  }

  if (params.method && (params.method === "cash" || params.method === "upi")) {
    items = items.filter((t) => t.method === params.method);
  }

  if (params.category && params.category !== "All" && params.category !== "all") {
    items = items.filter((t) => t.category === params.category);
  }

  if (params.from || params.to) {
    items = items.filter((t) => {
      const key = toLocalDateKey(t.createdAt);
      if (params.from && key < params.from) return false;
      if (params.to && key > params.to) return false;
      return true;
    });
  }

  if (params.search && params.search.trim()) {
    const q = params.search.trim().toLowerCase();
    items = items.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        (t.note && t.note.toLowerCase().includes(q)) ||
        t.category.toLowerCase().includes(q)
    );
  }

  const total = items.length;
  const paginated = items.slice(skip, skip + limit);

  return {
    success: true as const,
    data: paginated,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export function createTransaction(input: unknown) {
  const result = transactionSchema.safeParse(input);
  if (!result.success) {
    const firstError = result.error.issues?.[0]?.message || "Invalid input";
    return { success: false as const, error: firstError };
  }

  const { type, title, note, amount, method, category, createdAt } = result.data;
  const nowIso = new Date().toISOString();

  const record: TransactionRecord = {
    _id: generateId(),
    type,
    title,
    note: note || "",
    amount,
    method,
    category: category || "Other",
    createdAt: createdAt ? new Date(createdAt).toISOString() : nowIso,
  };

  const list = readAllTransactionsRaw();
  list.push(record);
  writeJSON(KEYS.TRANSACTIONS, list);

  return {
    success: true as const,
    message: `${type === "income" ? "Income" : "Expense"} added successfully`,
    data: record,
  };
}

export function updateTransaction(id: string, input: unknown) {
  const result = transactionSchema.partial().safeParse(input);
  if (!result.success) {
    const firstError = result.error.issues?.[0]?.message || "Invalid input";
    return { success: false as const, error: firstError };
  }

  const list = readAllTransactionsRaw();
  const idx = list.findIndex((t) => t._id === id);
  if (idx === -1) {
    return { success: false as const, error: "Transaction not found" };
  }

  const existing = list[idx];
  const data = result.data;

  const updated: TransactionRecord = {
    ...existing,
    ...(data.type !== undefined ? { type: data.type } : {}),
    ...(data.title !== undefined ? { title: data.title } : {}),
    ...(data.note !== undefined ? { note: data.note } : {}),
    ...(data.amount !== undefined ? { amount: data.amount } : {}),
    ...(data.method !== undefined ? { method: data.method } : {}),
    ...(data.category !== undefined ? { category: data.category } : {}),
    ...(data.createdAt !== undefined ? { createdAt: new Date(data.createdAt).toISOString() } : {}),
  };

  list[idx] = updated;
  writeJSON(KEYS.TRANSACTIONS, list);

  return {
    success: true as const,
    message: "Transaction updated successfully",
    data: updated,
  };
}

export function deleteTransaction(id: string) {
  const list = readAllTransactionsRaw();
  const next = list.filter((t) => t._id !== id);
  if (next.length === list.length) {
    return { success: false as const, error: "Transaction not found" };
  }
  writeJSON(KEYS.TRANSACTIONS, next);
  return { success: true as const, message: "Transaction deleted successfully" };
}

export function getDashboardSummary(from?: string, to?: string): DashboardSummaryData {
  const all = sortTransactionsDesc(readAllTransactionsRaw());

  const periodItems = all.filter((t) => {
    const key = toLocalDateKey(t.createdAt);
    if (from && key < from) return false;
    if (to && key > to) return false;
    return true;
  });

  let totalIncome = 0;
  let totalExpense = 0;
  let incomeCount = 0;
  let expenseCount = 0;

  const methodSplit = {
    cash: { income: 0, expense: 0, total: 0 },
    upi: { income: 0, expense: 0, total: 0 },
  };

  const categoryMap = new Map<string, { total: number; count: number }>();
  const incomeCategoryMap = new Map<string, { total: number; count: number }>();
  const trendMap = new Map<string, { date: string; income: number; expense: number }>();

  for (const t of periodItems) {
    if (t.type === "income") {
      totalIncome += t.amount;
      incomeCount += 1;

      const incCatEntry = incomeCategoryMap.get(t.category) || { total: 0, count: 0 };
      incCatEntry.total += t.amount;
      incCatEntry.count += 1;
      incomeCategoryMap.set(t.category, incCatEntry);
    } else {
      totalExpense += t.amount;
      expenseCount += 1;

      const catEntry = categoryMap.get(t.category) || { total: 0, count: 0 };
      catEntry.total += t.amount;
      catEntry.count += 1;
      categoryMap.set(t.category, catEntry);
    }

    if (methodSplit[t.method]) {
      methodSplit[t.method][t.type] += t.amount;
      methodSplit[t.method].total += t.amount;
    }

    const dateKey = toLocalDateKey(t.createdAt);
    const trendEntry = trendMap.get(dateKey) || { date: dateKey, income: 0, expense: 0 };
    trendEntry[t.type] += t.amount;
    trendMap.set(dateKey, trendEntry);
  }

  let allTimeIncome = 0;
  let allTimeExpense = 0;
  const allTrendMap = new Map<string, { date: string; income: number; expense: number }>();

  for (const t of all) {
    if (t.type === "income") allTimeIncome += t.amount;
    else allTimeExpense += t.amount;

    const dateKey = toLocalDateKey(t.createdAt);
    const trendEntry = allTrendMap.get(dateKey) || { date: dateKey, income: 0, expense: 0 };
    trendEntry[t.type] += t.amount;
    allTrendMap.set(dateKey, trendEntry);
  }

  const categoryBreakdown = Array.from(categoryMap.entries())
    .map(([category, stats]) => ({
      category,
      total: stats.total,
      count: stats.count,
    }))
    .sort((a, b) => b.total - a.total);

  const incomeCategoryBreakdown = Array.from(incomeCategoryMap.entries())
    .map(([category, stats]) => ({
      category,
      total: stats.total,
      count: stats.count,
    }))
    .sort((a, b) => b.total - a.total);

  const dailyTrend = Array.from(trendMap.values()).sort((a, b) =>
    a.date.localeCompare(b.date)
  );

  const allDailyTrend = Array.from(allTrendMap.values()).sort((a, b) =>
    a.date.localeCompare(b.date)
  );

  const todayKey = toLocalDateKey(new Date());
  const recentTransactions = all
    .filter((t) => toLocalDateKey(t.createdAt) === todayKey)
    .slice(0, 5);

  return {
    summary: {
      totalIncome,
      totalExpense,
      netBalance: allTimeIncome - allTimeExpense,
      periodBalance: totalIncome - totalExpense,
      incomeCount,
      expenseCount,
      totalCount: incomeCount + expenseCount,
    },
    methodSplit,
    categoryBreakdown,
    incomeCategoryBreakdown,
    dailyTrend,
    allDailyTrend,
    recentTransactions,
  };
}

// ==================== CATEGORIES CRUD ====================

function ensureCategoriesInitialized(): CategoryRecord[] {
  if (catCache !== null) return catCache;
  let list = readJSON<CategoryRecord[]>(KEYS.CATEGORIES, []);
  const initialized = localStorage.getItem(KEYS.CATEGORIES_INIT);

  if (!initialized) {
    if (!Array.isArray(list) || list.length === 0) {
      list = [
        ...EXPENSE_CATEGORIES.map((c) => ({
          _id: generateId(),
          name: c.name,
          type: "expense" as const,
          icon: c.icon,
          color: c.color,
          isDefault: true,
        })),
        ...INCOME_CATEGORIES.map((c) => ({
          _id: generateId(),
          name: c.name,
          type: "income" as const,
          icon: c.icon,
          color: c.color,
          isDefault: true,
        })),
      ];
      writeJSON(KEYS.CATEGORIES, list);
    }
    localStorage.setItem(KEYS.CATEGORIES_INIT, "true");
  }

  catCache = Array.isArray(list) ? list : [];
  return catCache;
}

export function getCategories(type?: "income" | "expense"): CategoryRecord[] {
  const list = ensureCategoriesInitialized();
  if (type === "income" || type === "expense") {
    return list.filter((c) => c.type === type);
  }
  return list;
}

export function createCategory(input: unknown) {
  const result = categorySchema.safeParse(input);
  if (!result.success) {
    const firstError = result.error.issues?.[0]?.message || "Invalid input";
    return { success: false as const, error: firstError };
  }

  const { name, type, icon, color } = result.data;
  const list = ensureCategoriesInitialized();

  const duplicate = list.find(
    (c) => c.type === type && c.name.toLowerCase() === name.toLowerCase()
  );
  if (duplicate) {
    return {
      success: false as const,
      error: `Category "${name}" already exists for ${type}`,
    };
  }

  const newCat: CategoryRecord = {
    _id: generateId(),
    name,
    type,
    icon: icon || "Tag",
    color: color || "",
    isDefault: false,
  };

  list.push(newCat);
  writeJSON(KEYS.CATEGORIES, list);

  return {
    success: true as const,
    message: "Category added successfully",
    data: newCat,
  };
}

export function updateCategory(id: string, input: unknown) {
  const result = categorySchema.partial().safeParse(input);
  if (!result.success) {
    const firstError = result.error.issues?.[0]?.message || "Invalid input";
    return { success: false as const, error: firstError };
  }

  const list = ensureCategoriesInitialized();
  const idx = list.findIndex((c) => c._id === id);
  if (idx === -1) {
    return { success: false as const, error: "Category not found" };
  }

  const existing = list[idx];
  const nextName = result.data.name ?? existing.name;
  const nextType = result.data.type ?? existing.type;

  const duplicate = list.find(
    (c) =>
      c._id !== id &&
      c.type === nextType &&
      c.name.toLowerCase() === nextName.toLowerCase()
  );
  if (duplicate) {
    return {
      success: false as const,
      error: `Category "${nextName}" already exists for ${nextType}`,
    };
  }

  const updated: CategoryRecord = {
    ...existing,
    name: nextName,
    type: nextType,
    icon: result.data.icon ?? existing.icon,
    color: result.data.color ?? existing.color,
  };

  list[idx] = updated;
  writeJSON(KEYS.CATEGORIES, list);

  return {
    success: true as const,
    message: "Category updated successfully",
    data: updated,
  };
}

export function deleteCategory(id: string) {
  const list = ensureCategoriesInitialized();
  const next = list.filter((c) => c._id !== id);
  if (next.length === list.length) {
    return { success: false as const, error: "Category not found" };
  }
  writeJSON(KEYS.CATEGORIES, next);
  return { success: true as const, message: "Category deleted successfully" };
}

// ==================== PRESET CHIPS CRUD ====================

function ensurePresetsInitialized(): PresetRecord[] {
  if (presetCache !== null) return presetCache;
  let list = readJSON<PresetRecord[]>(KEYS.PRESETS, []);
  const initialized = localStorage.getItem(KEYS.PRESETS_INIT);

  if (!initialized) {
    if (!Array.isArray(list) || list.length === 0) {
      list = DEFAULT_PRESETS.map((p) => ({
        _id: generateId(),
        label: p.label,
        amount: p.amount,
        type: p.type,
        method: p.method,
        category: p.category,
        icon: p.icon,
        order: p.order,
      }));
      writeJSON(KEYS.PRESETS, list);
    }
    localStorage.setItem(KEYS.PRESETS_INIT, "true");
  }

  presetCache = Array.isArray(list) ? list : [];
  return presetCache;
}

export function getPresets(): PresetRecord[] {
  const list = ensurePresetsInitialized();
  return [...list].sort((a, b) => a.order - b.order);
}

export function createPreset(input: unknown) {
  const result = quickPresetSchema.safeParse(input);
  if (!result.success) {
    const firstError = result.error.issues?.[0]?.message || "Invalid input";
    return { success: false as const, error: firstError };
  }

  const list = ensurePresetsInitialized();
  const preset: PresetRecord = {
    _id: generateId(),
    label: result.data.label,
    amount: result.data.amount,
    type: result.data.type,
    method: result.data.method,
    category: result.data.category,
    icon: result.data.icon,
    order: result.data.order !== undefined && result.data.order !== 0 ? result.data.order : list.length + 1,
  };

  list.push(preset);
  writeJSON(KEYS.PRESETS, list);

  return {
    success: true as const,
    message: "Quick preset created successfully",
    data: preset,
  };
}

export function updatePreset(id: string, input: unknown) {
  const result = quickPresetSchema.partial().safeParse(input);
  if (!result.success) {
    const firstError = result.error.issues?.[0]?.message || "Invalid input";
    return { success: false as const, error: firstError };
  }

  const list = ensurePresetsInitialized();
  const idx = list.findIndex((p) => p._id === id);
  if (idx === -1) {
    return { success: false as const, error: "Preset not found" };
  }

  const existing = list[idx];
  const updated: PresetRecord = {
    ...existing,
    ...result.data,
  };

  list[idx] = updated;
  writeJSON(KEYS.PRESETS, list);

  return {
    success: true as const,
    message: "Quick preset updated successfully",
    data: updated,
  };
}

export function deletePreset(id: string) {
  const list = ensurePresetsInitialized();
  const next = list.filter((p) => p._id !== id);
  if (next.length === list.length) {
    return { success: false as const, error: "Preset not found" };
  }
  writeJSON(KEYS.PRESETS, next);
  return { success: true as const, message: "Preset deleted successfully" };
}

// ==================== CSV EXPORT ====================

function escapeCSV(field: unknown): string {
  if (field === null || field === undefined) return '""';
  const stringVal = String(field);
  return `"${stringVal.replace(/"/g, '""')}"`;
}

export function generateTransactionsCSV(): string {
  const transactions = sortTransactionsDesc(readAllTransactionsRaw());

  const headers = [
    "Date",
    "Type",
    "Title",
    "Category",
    "Amount (INR)",
    "Payment Method",
    "Note",
    "ID",
  ];

  const rows = transactions.map((t) => [
    toLocalDateKey(t.createdAt),
    t.type.toUpperCase(),
    t.title,
    t.category || "Other",
    t.amount.toString(),
    t.method.toUpperCase(),
    t.note || "",
    t._id,
  ]);

  return [
    headers.map(escapeCSV).join(","),
    ...rows.map((row) => row.map(escapeCSV).join(",")),
  ].join("\n");
}

export function downloadTransactionsCSV(): number {
  const transactions = readAllTransactionsRaw();
  const csvContent = generateTransactionsCSV();
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `hisab_backup_${toLocalDateKey(new Date())}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
  return transactions.length;
}

export async function copyTransactionsCSV(): Promise<number> {
  const transactions = readAllTransactionsRaw();
  const csvContent = generateTransactionsCSV();
  await navigator.clipboard.writeText(csvContent);
  return transactions.length;
}

// ==================== CSV IMPORT ====================

function parseCSVRows(text: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = "";
  let inQuotes = false;

  const cleanText = text.replace(/^\uFEFF/, "").trim();
  if (!cleanText) return rows;

  for (let i = 0; i < cleanText.length; i++) {
    const char = cleanText[i];
    const nextChar = cleanText[i + 1];

    if (inQuotes) {
      if (char === '"' && nextChar === '"') {
        currentField += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        currentField += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ",") {
        currentRow.push(currentField);
        currentField = "";
      } else if (char === "\r" && nextChar === "\n") {
        currentRow.push(currentField);
        rows.push(currentRow);
        currentRow = [];
        currentField = "";
        i++;
      } else if (char === "\n" || char === "\r") {
        currentRow.push(currentField);
        rows.push(currentRow);
        currentRow = [];
        currentField = "";
      } else {
        currentField += char;
      }
    }
  }

  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField);
    rows.push(currentRow);
  }

  return rows.filter((r) => r.some((cell) => cell.trim() !== ""));
}

export interface CSVImportResult {
  success: boolean;
  imported: number;
  skipped: number;
  failed: number;
  error?: string;
}

export function importTransactionsFromCSV(csvText: string): CSVImportResult {
  const rows = parseCSVRows(csvText);
  if (rows.length === 0) {
    return {
      success: false,
      imported: 0,
      skipped: 0,
      failed: 0,
      error: "CSV text is empty",
    };
  }

  // Detect header row
  const firstRowLower = rows[0].map((c) => c.trim().toLowerCase());
  const hasHeader =
    firstRowLower.some((h) => h.includes("date")) &&
    firstRowLower.some((h) => h.includes("title") || h.includes("amount"));

  const colIdx = {
    date: 0,
    type: 1,
    title: 2,
    category: 3,
    amount: 4,
    method: 5,
    note: 6,
    id: 7,
  };

  if (hasHeader) {
    const findCol = (keywords: string[], fallback: number) => {
      const idx = firstRowLower.findIndex((h) =>
        keywords.some((k) => h === k || h.includes(k))
      );
      return idx !== -1 ? idx : fallback;
    };
    colIdx.date = findCol(["date"], 0);
    colIdx.type = findCol(["type"], 1);
    colIdx.title = findCol(["title", "description", "name"], 2);
    colIdx.category = findCol(["category"], 3);
    colIdx.amount = findCol(["amount"], 4);
    colIdx.method = findCol(["payment method", "method"], 5);
    colIdx.note = findCol(["note"], 6);
    colIdx.id = findCol(["id"], 7);
  }

  const dataRows = hasHeader ? rows.slice(1) : rows;
  if (dataRows.length === 0) {
    return {
      success: false,
      imported: 0,
      skipped: 0,
      failed: 0,
      error: "No transaction rows found in CSV",
    };
  }

  const existing = readAllTransactionsRaw();
  const existingIds = new Set(existing.map((t) => t._id));
  const categories = ensureCategoriesInitialized();

  let imported = 0;
  let skipped = 0;
  let failed = 0;
  const nowIso = new Date().toISOString();

  for (const row of dataRows) {
    const rawId = row[colIdx.id]?.trim() || "";
    if (rawId && existingIds.has(rawId)) {
      skipped++;
      continue;
    }

    const rawType = (row[colIdx.type] || "expense").trim().toLowerCase();
    const type: "income" | "expense" = rawType === "income" ? "income" : "expense";

    const title = (row[colIdx.title] || "").trim();
    const rawAmount = (row[colIdx.amount] || "").replace(/[₹,\s]/g, "");
    const amount = parseFloat(rawAmount);

    if (!title || isNaN(amount) || amount <= 0) {
      failed++;
      continue;
    }

    const rawMethod = (row[colIdx.method] || "upi").trim().toLowerCase();
    const method: "cash" | "upi" = rawMethod === "cash" ? "cash" : "upi";

    const category = (row[colIdx.category] || "Other").trim() || "Other";
    const note = (row[colIdx.note] || "").trim();
    const rawDate = (row[colIdx.date] || "").trim();

    let parsedDate = nowIso;
    if (rawDate) {
      const candidate = /^\d{4}-\d{2}-\d{2}$/.test(rawDate)
        ? new Date(rawDate + "T12:00:00")
        : new Date(rawDate);
      if (!isNaN(candidate.getTime())) {
        parsedDate = candidate.toISOString();
      }
    }

    const id = rawId || generateId();
    existing.push({
      _id: id,
      type,
      title: title.slice(0, 100),
      note: note.slice(0, 500),
      amount,
      method,
      category,
      createdAt: parsedDate,
    });
    existingIds.add(id);

    // Ensure imported category exists in categories list
    const catExists = categories.some(
      (c) => c.type === type && c.name.toLowerCase() === category.toLowerCase()
    );
    if (!catExists) {
      categories.push({
        _id: generateId(),
        name: category,
        type,
        icon: "Tag",
        color: "",
        isDefault: false,
      });
    }

    imported++;
  }

  if (imported > 0) {
    writeJSON(KEYS.TRANSACTIONS, existing);
    writeJSON(KEYS.CATEGORIES, categories);
  }

  return {
    success: imported > 0 || skipped > 0,
    imported,
    skipped,
    failed,
    ...(imported === 0 && skipped === 0
      ? { error: "Could not parse any valid transactions from CSV" }
      : {}),
  };
}

// ==================== CLEAR DATA HELPERS ====================

export function clearAllTransactions(): void {
  writeJSON(KEYS.TRANSACTIONS, []);
}

export function clearCategoriesByType(type: "income" | "expense"): void {
  const list = ensureCategoriesInitialized();
  const next = list.filter((c) => c.type !== type);
  writeJSON(KEYS.CATEGORIES, next);
  localStorage.setItem(KEYS.CATEGORIES_INIT, "true");
}

export function clearAllPresets(): void {
  writeJSON(KEYS.PRESETS, []);
  localStorage.setItem(KEYS.PRESETS_INIT, "true");
}
