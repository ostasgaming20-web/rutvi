import "server-only";

import { and, count, desc, eq, gte, lte, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { analyticsEvents, enquiries, products } from "@/lib/db/schema";

export type EventType = "page_view" | "product_view" | "enquiry";

export function classifySource(referrer: string | null | undefined, utmSource?: string | null) {
  if (utmSource) return utmSource.slice(0, 40).toLowerCase();
  if (!referrer) return "direct";
  let host = "";
  try {
    host = new URL(referrer).hostname.replace(/^www\./, "");
  } catch {
    return "referral";
  }
  if (/google|bing|duckduckgo|yahoo/.test(host)) return "search";
  if (/instagram|facebook|linkedin|twitter|x\.com|youtube|whatsapp|wa\.me/.test(host)) return "social";
  if (/mail|outlook|gmail/.test(host)) return "email";
  return "referral";
}

export function deviceFromUserAgent(userAgent: string | null | undefined) {
  if (!userAgent) return "desktop";
  if (/ipad|tablet|playbook|silk/i.test(userAgent)) return "tablet";
  if (/mobile|iphone|android/i.test(userAgent)) return "mobile";
  return "desktop";
}

export async function trackEvent(input: {
  type: EventType;
  path?: string | null;
  productId?: number | null;
  referrer?: string | null;
  source?: string | null;
  device?: string | null;
  sessionId?: string | null;
}) {
  await db.insert(analyticsEvents).values({
    type: input.type,
    path: input.path?.slice(0, 300) ?? null,
    productId: input.productId ?? null,
    referrer: input.referrer?.slice(0, 300) ?? null,
    source: (input.source ?? classifySource(input.referrer)).slice(0, 40),
    device: (input.device ?? "desktop").slice(0, 20),
    sessionId: input.sessionId?.slice(0, 60) ?? null,
  });
}

export type Range = { from: Date; to: Date };

export async function getAnalytics(range: Range) {
  const window = and(gte(analyticsEvents.createdAt, range.from), lte(analyticsEvents.createdAt, range.to));

  const [totalsRow] = await db
    .select({
      visitors: sql<number>`count(distinct ${analyticsEvents.sessionId})::int`,
      pageViews: sql<number>`count(*) filter (where ${analyticsEvents.type} = 'page_view')::int`,
      productViews: sql<number>`count(*) filter (where ${analyticsEvents.type} = 'product_view')::int`,
      events: sql<number>`count(*)::int`,
    })
    .from(analyticsEvents)
    .where(window);

  const [enquiryRow] = await db
    .select({ total: count() })
    .from(enquiries)
    .where(and(gte(enquiries.createdAt, range.from), lte(enquiries.createdAt, range.to)));

  const series = await db
    .select({
      day: sql<string>`to_char(date_trunc('day', ${analyticsEvents.createdAt}), 'YYYY-MM-DD')`,
      visitors: sql<number>`count(distinct ${analyticsEvents.sessionId})::int`,
      views: sql<number>`count(*) filter (where ${analyticsEvents.type} = 'page_view')::int`,
      productViews: sql<number>`count(*) filter (where ${analyticsEvents.type} = 'product_view')::int`,
    })
    .from(analyticsEvents)
    .where(window)
    .groupBy(sql`date_trunc('day', ${analyticsEvents.createdAt})`)
    .orderBy(sql`date_trunc('day', ${analyticsEvents.createdAt})`);

  const topPages = await db
    .select({ path: analyticsEvents.path, views: sql<number>`count(*)::int` })
    .from(analyticsEvents)
    .where(and(window, eq(analyticsEvents.type, "page_view")))
    .groupBy(analyticsEvents.path)
    .orderBy(desc(sql`count(*)`))
    .limit(8);

  const topProducts = await db
    .select({
      productId: analyticsEvents.productId,
      name: products.name,
      slug: products.slug,
      views: sql<number>`count(*)::int`,
    })
    .from(analyticsEvents)
    .leftJoin(products, eq(analyticsEvents.productId, products.id))
    .where(and(window, eq(analyticsEvents.type, "product_view")))
    .groupBy(analyticsEvents.productId, products.name, products.slug)
    .orderBy(desc(sql`count(*)`))
    .limit(8);

  const sources = await db
    .select({ source: analyticsEvents.source, visitors: sql<number>`count(distinct ${analyticsEvents.sessionId})::int` })
    .from(analyticsEvents)
    .where(window)
    .groupBy(analyticsEvents.source)
    .orderBy(desc(sql`count(distinct ${analyticsEvents.sessionId})`))
    .limit(6);

  const devices = await db
    .select({ device: analyticsEvents.device, visitors: sql<number>`count(distinct ${analyticsEvents.sessionId})::int` })
    .from(analyticsEvents)
    .where(window)
    .groupBy(analyticsEvents.device)
    .orderBy(desc(sql`count(distinct ${analyticsEvents.sessionId})`));

  const enquiryTotal = Number(enquiryRow?.total ?? 0);
  const visitors = Number(totalsRow?.visitors ?? 0);

  return {
    visitors,
    pageViews: Number(totalsRow?.pageViews ?? 0),
    productViews: Number(totalsRow?.productViews ?? 0),
    events: Number(totalsRow?.events ?? 0),
    enquiries: enquiryTotal,
    conversionRate: visitors > 0 ? Math.round((enquiryTotal / visitors) * 10000) / 100 : 0,
    series,
    topPages,
    topProducts,
    sources,
    devices,
  };
}

export type AnalyticsSnapshot = Awaited<ReturnType<typeof getAnalytics>>;

export async function getVisitorSeries(days: number) {
  const from = new Date();
  from.setDate(from.getDate() - days + 1);
  from.setHours(0, 0, 0, 0);
  const rows = await db
    .select({
      day: sql<string>`to_char(date_trunc('day', ${analyticsEvents.createdAt}), 'YYYY-MM-DD')`,
      visitors: sql<number>`count(distinct ${analyticsEvents.sessionId})::int`,
      views: sql<number>`count(*) filter (where ${analyticsEvents.type} = 'page_view')::int`,
    })
    .from(analyticsEvents)
    .where(gte(analyticsEvents.createdAt, from))
    .groupBy(sql`date_trunc('day', ${analyticsEvents.createdAt})`)
    .orderBy(sql`date_trunc('day', ${analyticsEvents.createdAt})`);
  return rows;
}
