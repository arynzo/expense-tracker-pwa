export interface CategoryItem {
  id: string;
  name: string;
  icon: string;
  type: "income" | "expense";
  color: string;
}

export const EXPENSE_CATEGORIES: CategoryItem[] = [
  { id: "Food", name: "Food", icon: "Utensils", type: "expense", color: "text-amber-500 bg-amber-500/10" },
  { id: "Travel", name: "Travel", icon: "Bus", type: "expense", color: "text-blue-500 bg-blue-500/10" },
  { id: "Shopping", name: "Shopping", icon: "ShoppingBag", type: "expense", color: "text-purple-500 bg-purple-500/10" },
  { id: "Bills", name: "Bills", icon: "Receipt", type: "expense", color: "text-rose-500 bg-rose-500/10" },
  { id: "Recharge", name: "Recharge", icon: "Smartphone", type: "expense", color: "text-cyan-500 bg-cyan-500/10" },
  { id: "Health", name: "Health", icon: "HeartPulse", type: "expense", color: "text-emerald-500 bg-emerald-500/10" },
  { id: "Entertainment", name: "Entertainment", icon: "Clapperboard", type: "expense", color: "text-indigo-500 bg-indigo-500/10" },
  { id: "Other", name: "Other", icon: "CircleEllipsis", type: "expense", color: "text-slate-500 bg-slate-500/10" },
];

export const INCOME_CATEGORIES: CategoryItem[] = [
  { id: "Salary", name: "Salary", icon: "Briefcase", type: "income", color: "text-emerald-500 bg-emerald-500/10" },
  { id: "Freelance", name: "Freelance", icon: "Laptop", type: "income", color: "text-sky-500 bg-sky-500/10" },
  { id: "Gift", name: "Gift", icon: "Gift", type: "income", color: "text-pink-500 bg-pink-500/10" },
  { id: "Other", name: "Other", icon: "CircleDollarSign", type: "income", color: "text-teal-500 bg-teal-500/10" },
];

export const ALL_CATEGORIES = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];

export const DEFAULT_PRESETS = [
  { label: "Chai", amount: 10, type: "expense" as const, category: "Food", method: "cash" as const, icon: "Coffee", order: 1 },
  { label: "Snacks", amount: 50, type: "expense" as const, category: "Food", method: "upi" as const, icon: "Utensils", order: 2 },
  { label: "Bus", amount: 20, type: "expense" as const, category: "Travel", method: "cash" as const, icon: "Bus", order: 3 },
  { label: "Auto / Cab", amount: 100, type: "expense" as const, category: "Travel", method: "upi" as const, icon: "Car", order: 4 },
  { label: "Groceries", amount: 250, type: "expense" as const, category: "Food", method: "upi" as const, icon: "ShoppingBag", order: 5 },
  { label: "Recharge", amount: 299, type: "expense" as const, category: "Recharge", method: "upi" as const, icon: "Smartphone", order: 6 },
];

export const PAYMENT_METHODS = [
  { id: "upi", label: "UPI", icon: "Smartphone" },
  { id: "cash", label: "Cash", icon: "Banknote" },
] as const;

export const AVAILABLE_ICONS = [
  "Utensils",
  "Coffee",
  "Pizza",
  "Bus",
  "Car",
  "Train",
  "Plane",
  "Bike",
  "Fuel",
  "ShoppingBag",
  "Shirt",
  "Receipt",
  "Smartphone",
  "Wifi",
  "Zap",
  "Droplets",
  "Home",
  "HeartPulse",
  "Stethoscope",
  "Clapperboard",
  "Film",
  "Music",
  "Gamepad2",
  "Dumbbell",
  "Book",
  "GraduationCap",
  "Briefcase",
  "Laptop",
  "Gift",
  "CircleDollarSign",
  "Coins",
  "Wallet",
  "PiggyBank",
  "Landmark",
  "CreditCard",
  "TrendingUp",
  "Award",
  "Wrench",
  "PawPrint",
  "Baby",
  "Sparkles",
  "Tag",
];

const EXTRA_BUILT_IN_ICONS = new Set(["CircleEllipsis", "Banknote", "TrendingDown"]);

export function isIconUrl(val?: string): boolean {
  if (!val) return false;
  const trimmed = val.trim();
  return /^(https?:\/\/|data:image\/|\/|<svg[\s>]|url\()/i.test(trimmed);
}

export function isLucideIconName(val?: string): boolean {
  if (!val) return false;
  const trimmed = val.trim();
  return AVAILABLE_ICONS.includes(trimmed) || EXTRA_BUILT_IN_ICONS.has(trimmed);
}
