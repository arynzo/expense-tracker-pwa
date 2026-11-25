import { z } from "zod";

export const transactionSchema = z.object({
  type: z.enum(["income", "expense"]),
  title: z
    .string()
    .min(1, "Title cannot be empty")
    .max(100, "Title cannot exceed 100 characters")
    .trim(),
  note: z.string().max(500, "Note cannot exceed 500 characters").optional().default(""),
  amount: z.coerce
    .number()
    .positive("Amount must be greater than 0"),
  method: z.enum(["cash", "upi"]),
  category: z.string().trim().default("Other"),
  createdAt: z.string().or(z.date()).optional(),
});

export const quickPresetSchema = z.object({
  label: z
    .string()
    .min(1, "Label cannot be empty")
    .max(30, "Label cannot exceed 30 characters")
    .trim(),
  amount: z.coerce
    .number()
    .positive("Amount must be greater than 0"),
  type: z.enum(["income", "expense"]).default("expense"),
  method: z.enum(["cash", "upi"]).default("cash"),
  category: z.string().trim().default("Other"),
  icon: z.string().default("Coins"),
  order: z.number().optional().default(0),
});

export const categorySchema = z.object({
  name: z.string().min(1, "Name cannot be empty").max(50, "Name too long").trim(),
  type: z.enum(["income", "expense"]),
  icon: z.string().default("Tag"),
  color: z.string().optional().default(""),
});

export type TransactionInput = z.infer<typeof transactionSchema>;
export type QuickPresetInput = z.infer<typeof quickPresetSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
