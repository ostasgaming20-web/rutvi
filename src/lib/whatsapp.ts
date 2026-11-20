export function buildWhatsAppUrl(phone: string, message: string) {
  const digits = phone.replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export function productEnquiryMessage(input: {
  productName: string;
  quantity?: number | null;
  customization?: string | null;
}) {
  const lines = [
    `Hello RUTVI ENTERPRISE, I would like a quotation for:`,
    `• Product: ${input.productName}`,
  ];
  if (input.quantity) lines.push(`• Quantity: ${input.quantity}`);
  if (input.customization) lines.push(`• Customization: ${input.customization}`);
  lines.push("", "Please share pricing and lead time.");
  return lines.join("\n");
}

export function generalEnquiryMessage() {
  return "Hello RUTVI ENTERPRISE, I would like to discuss a corporate gifting requirement.";
}
