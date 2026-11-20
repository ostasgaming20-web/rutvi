import "server-only";

import { getSettings } from "@/lib/settings";

type EnquiryEmail = {
  reference: string;
  name: string;
  company?: string | null;
  email: string;
  phone: string;
  productName?: string | null;
  quantity?: number | null;
  budget?: number | null;
  message?: string | null;
  customization?: Record<string, unknown>;
  type: string;
};

function enquiryHtml(data: EnquiryEmail) {
  const rows = [
    ["Reference", data.reference],
    ["Name", data.name],
    ["Company", data.company || "—"],
    ["Email", data.email],
    ["Phone", data.phone],
    ["Product", data.productName || "—"],
    ["Quantity", data.quantity ? String(data.quantity) : "—"],
    ["Budget per gift", data.budget ? `₹${(data.budget / 100).toLocaleString("en-IN")}` : "—"],
    ["Type", data.type],
    ["Instructions", data.message || "—"],
  ];
  return `<div style="font-family:Georgia,serif;max-width:620px;margin:0 auto;color:#14130f">
    <h2 style="font-weight:500">New ${data.type} enquiry</h2>
    <p style="color:#6d685e">A new request has been submitted on rutvienterprise.com.</p>
    <table style="width:100%;border-collapse:collapse;margin-top:24px">
      ${rows
        .map(
          ([label, value]) =>
            `<tr><td style="padding:10px 0;border-bottom:1px solid #e7ddcc;color:#6d685e;width:34%">${label}</td><td style="padding:10px 0;border-bottom:1px solid #e7ddcc">${String(value)}</td></tr>`,
        )
        .join("")}
    </table>
    <pre style="margin-top:24px;background:#f8f5ef;padding:16px;border-radius:8px;font-size:12px;white-space:pre-wrap">${JSON.stringify(
      data.customization ?? {},
      null,
      2,
    )}</pre>
    <p style="margin-top:24px"><a href="https://rutvigifts.lovable.app" style="color:#0d1f3c">Open the admin dashboard</a></p>
  </div>`;
}

export async function sendEnquiryNotifications(data: EnquiryEmail) {
  const settings = await getSettings();
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || "RUTVI ENTERPRISE <sales.rutvi@gmail.com>";

  if (!apiKey) {
    console.info(
      `[email] RESEND_API_KEY not configured — enquiry ${data.reference} saved. Notification to ${settings.contact.email} skipped.`,
    );
    return { sent: false };
  }

  const adminHtml = enquiryHtml(data);
  const customerHtml = `<div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;color:#14130f">
    <h2 style="font-weight:500">Thank you, ${data.name}.</h2>
    <p style="color:#6d685e;line-height:1.7">We have received your enquiry (${data.reference}) and our gifting team will respond within one business day with options and pricing.</p>
    <p style="color:#6d685e;line-height:1.7">If it is urgent, call us on ${settings.contact.phone} or reply to this email.</p>
    <p style="margin-top:28px;font-size:12px;letter-spacing:.16em;text-transform:uppercase;color:#9a7a45">RUTVI ENTERPRISE</p>
  </div>`;

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [settings.contact.email],
        reply_to: data.email,
        subject: `New ${data.type} enquiry — ${data.reference}`,
        html: adminHtml,
      }),
    });
    if (!response.ok) throw new Error(await response.text());

    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [data.email],
        subject: `We have received your enquiry — ${data.reference}`,
        html: customerHtml,
      }),
    });
    return { sent: true };
  } catch (error) {
    console.error("[email] send failed", error);
    return { sent: false };
  }
}
