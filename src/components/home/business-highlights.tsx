import { Boxes, Brush, ShieldCheck, Truck } from "lucide-react";

const items = [
  {
    icon: Boxes,
    title: "Premium Corporate Gifts",
    text: "A curated catalogue of pieces chosen for quality, finish and lasting recall.",
    number: "01",
  },
  {
    icon: Brush,
    title: "Custom Branding",
    text: "Printing, engraving, embossing and foil, applied with precision to your identity.",
    number: "02",
  },
  {
    icon: ShieldCheck,
    title: "Bulk Order Solutions",
    text: "Flexible quantities from 10 to 10,000, with consistent quality across every unit.",
    number: "03",
  },
  {
    icon: Truck,
    title: "Delivery Across India",
    text: "Careful packing, tracked dispatch and delivery to every major city.",
    number: "04",
  },
];

export function BusinessHighlights() {
  return (
    <section className="border-y border-ink/7 bg-[#fffdf9]">
      <div className="container-lux grid divide-y divide-ink/7 sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
        {items.map((item, index) => (
          <div
            key={item.title}
            className={`group relative px-1 py-8 sm:px-6 lg:px-7 ${index > 1 ? "sm:border-t sm:border-ink/7 lg:border-t-0" : ""}`}
            data-reveal
          >
            <div className="flex items-start justify-between">
              <item.icon className="size-6 text-gold" strokeWidth={1.4} />
              <span className="text-[0.6rem] font-medium tracking-[0.18em] text-ink/25">{item.number}</span>
            </div>
            <h3 className="mt-5 text-[0.95rem] font-semibold text-ink">{item.title}</h3>
            <p className="mt-2 text-xs leading-relaxed text-ink/52">{item.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
