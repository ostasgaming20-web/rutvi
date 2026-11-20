import { z } from "zod";

export const enquirySchema = z.object({
  name: z.string().trim().min(2, "Please enter your full name.").max(100),
  company: z.string().trim().max(120).optional().nullable(),
  email: z.string().trim().toLowerCase().email("Enter a valid email address.").max(160),
  phone: z
    .string()
    .trim()
    .min(7, "Enter a valid phone number.")
    .max(24)
    .regex(/^[+\d][\d\s\-()]{5,22}$/, "Enter a valid phone number."),
  productId: z.coerce.number().int().positive().optional().nullable(),
  productName: z.string().trim().max(160).optional().nullable(),
  quantity: z.coerce.number().int().min(1).max(1000000).optional().nullable(),
  budget: z.string().trim().max(60).optional().nullable(),
  message: z.string().trim().max(2000).optional().nullable(),
  customization: z.string().max(4000).optional().nullable(),
  type: z.enum(["quote", "contact", "customizer"]).default("quote"),
  sourcePage: z.string().trim().max(200).optional().nullable(),
  website: z.string().max(0).optional().nullable(),
});

export type EnquiryInput = z.infer<typeof enquirySchema>;

export function sanitize(value: string | null | undefined) {
  if (!value) return null;
  return value
    .replace(/<[^>]*>/g, "")
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .trim()
    .slice(0, 2000);
}

export function budgetToPaise(budget: string | null | undefined) {
  if (!budget) return null;
  const digits = budget.replace(/[^\d]/g, "");
  if (!digits) return null;
  const rupees = Number(digits);
  if (!Number.isFinite(rupees) || rupees <= 0) return null;
  return rupees * 100;
}

export function parseCustomization(value: string | null | undefined): Record<string, unknown> {
  if (!value) return {};
  try {
    const parsed = JSON.parse(value);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
    return {};
  } catch {
    return {};
  }
}
