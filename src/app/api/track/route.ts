import { NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { classifySource, deviceFromUserAgent, trackEvent, type EventType } from "@/lib/analytics";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

const ALLOWED: EventType[] = ["page_view", "product_view", "enquiry"];

export async function POST(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "anonymous";
  const limit = rateLimit(`track:${ip}`, 120, 60 * 1000);
  if (!limit.ok) return NextResponse.json({ ok: false }, { status: 429 });

  let payload: Record<string, unknown>;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const type = String(payload.type ?? "");
  if (!ALLOWED.includes(type as EventType)) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const path = typeof payload.path === "string" ? payload.path : null;
  if (path && (path.startsWith("/admin") || path.startsWith("/api"))) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  const productId = Number(payload.productId);
  const hasProduct = Number.isFinite(productId) && productId > 0;
  const referrer = typeof payload.referrer === "string" ? payload.referrer : request.headers.get("referer");
  const sessionId = typeof payload.sessionId === "string" ? payload.sessionId : null;

  try {
    await trackEvent({
      type: type as EventType,
      path,
      productId: hasProduct ? productId : null,
      referrer,
      source: classifySource(referrer, typeof payload.utmSource === "string" ? payload.utmSource : null),
      device: deviceFromUserAgent(request.headers.get("user-agent")),
      sessionId,
    });

    if (type === "product_view" && hasProduct) {
      await db
        .update(products)
        .set({ viewCount: sql`${products.viewCount} + 1` })
        .where(eq(products.id, productId));
    }
  } catch (error) {
    console.error("[track] failed", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
