export function formatINR(paise: number | null | undefined) {
  if (paise === null || paise === undefined) return "Price on request";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(paise / 100);
}

export function formatDate(value: Date | string | null | undefined) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function formatDateTime(value: Date | string | null | undefined) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export const ENQUIRY_STATUSES = [
  "new",
  "contacted",
  "quotation_sent",
  "in_progress",
  "completed",
  "cancelled",
] as const;

export type EnquiryStatus = (typeof ENQUIRY_STATUSES)[number];

export const ENQUIRY_STATUS_LABELS: Record<string, string> = {
  new: "New",
  contacted: "Contacted",
  quotation_sent: "Quotation sent",
  in_progress: "In progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const QUOTATION_STATUSES = ["draft", "sent", "accepted", "declined"] as const;

export const QUOTATION_STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  sent: "Sent",
  accepted: "Accepted",
  declined: "Declined",
};

export function statusTone(status: string) {
  switch (status) {
    case "new":
      return "bg-[#0d1f3c]/8 text-[#0d1f3c] border-[#0d1f3c]/15";
    case "contacted":
      return "bg-[#c3a068]/15 text-[#7a5c28] border-[#c3a068]/30";
    case "quotation_sent":
    case "sent":
      return "bg-[#c3a068]/15 text-[#7a5c28] border-[#c3a068]/30";
    case "in_progress":
      return "bg-[#1b3358]/10 text-[#1b3358] border-[#1b3358]/20";
    case "completed":
    case "accepted":
      return "bg-emerald-50 text-emerald-800 border-emerald-200";
    case "cancelled":
    case "declined":
      return "bg-red-50 text-red-800 border-red-200";
    default:
      return "bg-stone-100 text-stone-700 border-stone-200";
  }
}
