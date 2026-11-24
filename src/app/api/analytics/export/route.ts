import { NextResponse } from "next/server";
import { gte, lte, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { analyticsEvents } from "@/lib/db/schema";
import { requireAdminApi } from "@/lib/admin";
import { can } from "@/lib/permissions";
import { getAnalytics } from "@/lib/analytics";

export const runtime = "nodejs";

function escapeCsv(value: unknown) {
  const string = value === null || value === undefined ? "" : String(value);
  return `"${string.replace(/"/g, '""').replace(/\r?\n/g, " ")}"`;
}

export async function GET(request: Request) {
  const admin = await requireAdminApi();
  if (!admin) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  if (!can(admin.role, "analytics.view")) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const days = Math.min(365, Math.max(1, Number(searchParams.get("days")) || 30));
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - days + 1);
  from.setHours(0, 0, 0, 0);

  const [analytics, raw] = await Promise.all([
    getAnalytics({ from, to }),
    db
      .select()
      .from(analyticsEvents)
      .where(and(gte(analyticsEvents.createdAt, from), lte(analyticsEvents.createdAt, to)))
      .orderBy(analyticsEvents.createdAt),
  ]);

  const lines: string[] = [];
  lines.push("RUTVI ENTERPRISE — Analytics report");
  lines.push(`Range,${from.toISOString().slice(0, 10)} to ${to.toISOString().slice(0, 10)}`);
  lines.push("");
  lines.push("Summary");
  lines.push("Metric,Value");
  lines.push(`Unique visitors,${analytics.visitors}`);
  lines.push(`Page views,${analytics.pageViews}`);
  lines.push(`Product views,${analytics.productViews}`);
  lines.push(`Enquiries,${analytics.enquiries}`);
  lines.push(`Conversion rate (%),${analytics.conversionRate}`);
  lines.push("");
  lines.push("Daily trend");
  lines.push("Date,Visitors,Page views,Product views");
  for (const row of analytics.series) {
    lines.push([row.day, row.visitors, row.views, row.productViews].map(escapeCsv).join(","));
  }
  lines.push("");
  lines.push("Top pages");
  lines.push("Path,Views");
  for (const row of analytics.topPages) lines.push([row.path, row.views].map(escapeCsv).join(","));
  lines.push("");
  lines.push("Top products");
  lines.push("Product,Views");
  for (const row of analytics.topProducts) lines.push([row.name ?? "Unknown", row.views].map(escapeCsv).join(","));
  lines.push("");
  lines.push("Traffic sources");
  lines.push("Source,Visitors");
  for (const row of analytics.sources) lines.push([row.source, row.visitors].map(escapeCsv).join(","));
  lines.push("");
  lines.push("Devices");
  lines.push("Device,Visitors");
  for (const row of analytics.devices) lines.push([row.device, row.visitors].map(escapeCsv).join(","));
  lines.push("");
  lines.push(`Raw events exported: ${raw.length}`);

  return new NextResponse(lines.join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="rutvi-analytics-${days}d.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
