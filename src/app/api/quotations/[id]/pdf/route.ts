import { NextResponse } from "next/server";
import { asc, eq } from "drizzle-orm";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { db } from "@/lib/db";
import { customers, enquiries, quotationItems, quotationRequests } from "@/lib/db/schema";
import { requireAdminApi } from "@/lib/admin";
import { getSettings } from "@/lib/settings";

export const runtime = "nodejs";

const NAVY = rgb(0.05, 0.12, 0.24);
const GOLD = rgb(0.76, 0.63, 0.41);
const INK = rgb(0.12, 0.12, 0.13);
const STONE = rgb(0.45, 0.42, 0.38);
const LINE = rgb(0.85, 0.83, 0.79);

function money(paise: number) {
  return `Rs. ${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(Math.round(paise / 100))}`;
}

function date(value: Date | string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(
    new Date(value),
  );
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await requireAdminApi();
  if (!admin) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const quotationId = Number(id);
  if (!Number.isFinite(quotationId)) {
    return NextResponse.json({ message: "Invalid quotation." }, { status: 400 });
  }

  const [row] = await db
    .select({
      quotation: quotationRequests,
      enquiryId: enquiries.id,
      customerName: customers.name,
      company: customers.company,
      email: customers.email,
      phone: customers.phone,
      city: customers.city,
    })
    .from(quotationRequests)
    .innerJoin(enquiries, eq(quotationRequests.enquiryId, enquiries.id))
    .innerJoin(customers, eq(enquiries.customerId, customers.id))
    .where(eq(quotationRequests.id, quotationId))
    .limit(1);

  if (!row) {
    return NextResponse.json({ message: "Quotation not found." }, { status: 404 });
  }

  const items = await db
    .select()
    .from(quotationItems)
    .where(eq(quotationItems.quotationId, quotationId))
    .orderBy(asc(quotationItems.id));

  const { contact } = await getSettings();
  const { quotation } = row;

  const pdf = await PDFDocument.create();
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const italic = await pdf.embedFont(StandardFonts.HelveticaOblique);

  const pageWidth = 595.28;
  const pageHeight = 841.89;
  const margin = 48;
  const contentWidth = pageWidth - margin * 2;

  let page = pdf.addPage([pageWidth, pageHeight]);
  let y = pageHeight;

  const text = (
    value: string,
    x: number,
    yPos: number,
    options: { size?: number; font?: typeof regular; color?: typeof INK } = {},
  ) => {
    page.drawText(value, {
      x,
      y: yPos,
      size: options.size ?? 10,
      font: options.font ?? regular,
      color: options.color ?? INK,
    });
  };

  const rightText = (
    value: string,
    xRight: number,
    yPos: number,
    options: { size?: number; font?: typeof regular; color?: typeof INK } = {},
  ) => {
    const size = options.size ?? 10;
    const font = options.font ?? regular;
    const width = font.widthOfTextAtSize(value, size);
    text(value, xRight - width, yPos, { size, font, color: options.color });
  };

  const wrap = (value: string, maxWidth: number, size: number, font = regular) => {
    const words = value.split(/\s+/);
    const lines: string[] = [];
    let current = "";
    for (const word of words) {
      const candidate = current ? `${current} ${word}` : word;
      if (font.widthOfTextAtSize(candidate, size) > maxWidth && current) {
        lines.push(current);
        current = word;
      } else {
        current = candidate;
      }
    }
    if (current) lines.push(current);
    return lines;
  };

  const drawLetterhead = () => {
    page.drawRectangle({ x: 0, y: pageHeight - 118, width: pageWidth, height: 118, color: NAVY });
    page.drawRectangle({ x: 0, y: pageHeight - 122, width: pageWidth, height: 4, color: GOLD });

    text("RUTVI ENTERPRISE", margin, pageHeight - 54, { size: 20, font: bold, color: rgb(1, 1, 1) });
    text("CORPORATE GIFTING  ·  CUSTOMIZED MERCHANDISE  ·  PREMIUM HAMPERS", margin, pageHeight - 72, {
      size: 6.6,
      color: rgb(0.78, 0.72, 0.6),
    });
    rightText("QUOTATION", pageWidth - margin, pageHeight - 52, { size: 15, font: bold, color: rgb(1, 1, 1) });
    rightText(quotation.quoteNumber, pageWidth - margin, pageHeight - 70, { size: 10, font: bold, color: GOLD });

    for (const [lineIndex, line] of wrap(contact.address, contentWidth, 7.4).slice(0, 2).entries()) {
      text(line, margin, pageHeight - 91 - lineIndex * 9, { size: 7.4, color: rgb(0.82, 0.82, 0.84) });
    }
    text(`Phone: ${contact.phone}   ·   Email: ${contact.email}`, margin, pageHeight - 103, {
      size: 7.4,
      color: rgb(0.82, 0.82, 0.84),
    });
    rightText(contact.hours, pageWidth - margin, pageHeight - 103, {
      size: 7.4,
      color: rgb(0.72, 0.72, 0.75),
    });

    y = pageHeight - 150;
  };

  const drawFooter = (pageNumber: number) => {
    page.drawLine({
      start: { x: margin, y: 58 },
      end: { x: pageWidth - margin, y: 58 },
      thickness: 0.6,
      color: LINE,
    });
    text("Thank you for considering RUTVI ENTERPRISE.", margin, 44, { size: 8, color: STONE });
    rightText(`Page ${pageNumber}`, pageWidth - margin, 44, { size: 8, color: STONE });
  };

  drawLetterhead();

  text("PREPARED FOR", margin, y, { size: 7, font: bold, color: GOLD });
  text("QUOTATION DETAILS", pageWidth / 2 + 20, y, { size: 7, font: bold, color: GOLD });

  y -= 16;
  text(row.customerName, margin, y, { size: 12, font: bold });
  rightText(`Date issued: ${date(quotation.createdAt)}`, pageWidth - margin, y, { size: 9, color: STONE });

  y -= 14;
  text(row.company || "Individual buyer", margin, y, { size: 9, color: STONE });
  rightText(`Valid until: ${date(quotation.validUntil)}`, pageWidth - margin, y, { size: 9, color: STONE });

  y -= 13;
  text(`${row.email}  ·  ${row.phone}`, margin, y, { size: 9, color: STONE });
  rightText(`Status: ${quotation.status}`, pageWidth - margin, y, { size: 9, color: STONE });

  if (row.city) {
    y -= 12;
    text(row.city, margin, y, { size: 9, color: STONE });
  }

  y -= 32;

  const columns = { description: margin + 10, qty: margin + contentWidth - 150, unit: margin + contentWidth - 95, total: pageWidth - margin - 8 };

  const drawTableHeader = () => {
    page.drawRectangle({ x: margin, y: y - 8, width: contentWidth, height: 24, color: rgb(0.96, 0.94, 0.9) });
    text("DESCRIPTION", columns.description, y, { size: 7.4, font: bold, color: STONE });
    rightText("QTY", columns.qty + 26, y, { size: 7.4, font: bold, color: STONE });
    rightText("UNIT PRICE", columns.unit + 54, y, { size: 7.4, font: bold, color: STONE });
    rightText("AMOUNT", columns.total, y, { size: 7.4, font: bold, color: STONE });
    y -= 26;
  };

  drawTableHeader();

  let pageNumber = 1;
  let index = 0;

  for (const item of items) {
    const descriptionLines = wrap(item.description, contentWidth - 200, 9.4);
    const rowHeight = Math.max(22, descriptionLines.length * 12 + 10);

    if (y - rowHeight < 150) {
      drawFooter(pageNumber);
      page = pdf.addPage([pageWidth, pageHeight]);
      pageNumber += 1;
      y = pageHeight - 70;
      drawTableHeader();
    }

    descriptionLines.forEach((line, lineIndex) => {
      text(line, columns.description, y - lineIndex * 12, { size: 9.4 });
    });
    rightText(String(item.quantity), columns.qty + 26, y, { size: 9.4 });
    rightText(money(item.unitPricePaise), columns.unit + 54, y, { size: 9.4 });
    rightText(money(item.totalPaise), columns.total, y, { size: 9.4 });

    y -= rowHeight;
    page.drawLine({ start: { x: margin, y: y + 6 }, end: { x: pageWidth - margin, y: y + 6 }, thickness: 0.5, color: LINE });
    index += 1;
  }

  if (index === 0) {
    text("No line items added yet.", columns.description, y, { size: 9.4, color: STONE });
    y -= 24;
  }

  y -= 14;

  const totalX = pageWidth - margin - 220;
  const drawTotalRow = (label: string, value: string, strong = false) => {
    text(label, totalX, y, { size: 9, color: STONE });
    rightText(value, pageWidth - margin, y, { size: strong ? 12 : 9.5, font: strong ? bold : regular });
    y -= strong ? 22 : 16;
  };

  drawTotalRow("Subtotal", money(quotation.subtotalPaise));
  if (quotation.taxPaise > 0) drawTotalRow("Tax / GST", money(quotation.taxPaise));
  if (quotation.deliveryPaise > 0) drawTotalRow("Delivery", money(quotation.deliveryPaise));

  page.drawLine({ start: { x: totalX, y: y + 8 }, end: { x: pageWidth - margin, y: y + 8 }, thickness: 0.6, color: LINE });
  y -= 8;
  drawTotalRow("TOTAL PAYABLE", money(quotation.totalPaise), true);

  y -= 18;
  if (quotation.notes) {
    text("NOTES", margin, y, { size: 7, font: bold, color: GOLD });
    y -= 14;
    for (const line of wrap(quotation.notes, contentWidth, 9)) {
      text(line, margin, y, { size: 9, color: STONE });
      y -= 12;
    }
  }

  y -= 8;
  text("TERMS", margin, y, { size: 7, font: bold, color: GOLD });
  y -= 14;
  const terms = [
    "This quotation is an estimate and does not confirm an order. Production begins only after written approval.",
    "Prices are exclusive of GST unless stated, and may vary with quantity, artwork and delivery location.",
    "Lead time is confirmed after artwork approval and receipt of advance payment.",
    "Customised and branded products are non-returnable once production has started.",
  ];
  for (const term of terms) {
    for (const line of wrap(`•  ${term}`, contentWidth, 8.4)) {
      text(line, margin, y, { size: 8.4, color: STONE });
      y -= 11;
    }
  }

  y -= 10;
  text("For RUTVI ENTERPRISE", margin, y, { size: 9, font: bold });
  y -= 26;
  text("Authorised Signatory", margin, y, { size: 8.4, color: STONE, font: italic });
  rightText(`Enquiry reference #${row.enquiryId}`, pageWidth - margin, y, { size: 8, color: STONE });

  drawFooter(pageNumber);

  const bytes = await pdf.save();
  return new NextResponse(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${quotation.quoteNumber}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
