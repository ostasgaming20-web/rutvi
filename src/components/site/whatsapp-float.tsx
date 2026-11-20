import { MessageCircle } from "lucide-react";
import { buildWhatsAppUrl, generalEnquiryMessage } from "@/lib/whatsapp";

export function WhatsAppFloat({ phone }: { phone: string }) {
  return (
    <a
      href={buildWhatsAppUrl(phone, generalEnquiryMessage())}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat with RUTVI ENTERPRISE on WhatsApp"
      className="group fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 rounded-full bg-[#0f3d2e] py-3 pl-3 pr-4 text-ivory shadow-[0_18px_40px_-18px_rgba(15,61,46,0.8)] transition-transform hover:-translate-y-0.5 md:bottom-7 md:right-7"
    >
      <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-[#0f3d2e]/30" style={{ animationDuration: "3s" }} />
      <MessageCircle className="size-5" />
      <span className="hidden text-[0.7rem] font-semibold tracking-[0.1em] uppercase sm:inline">WhatsApp</span>
    </a>
  );
}
