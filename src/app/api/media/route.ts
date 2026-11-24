import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { mediaAssets } from "@/lib/db/schema";
import { requireAdminApi } from "@/lib/admin";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const admin = await requireAdminApi();
  if (!admin) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const kind = searchParams.get("kind");

  const query = db.select().from(mediaAssets);
  const rows = kind && ["image", "video", "model", "animation", "document"].includes(kind)
    ? await query.where(eq(mediaAssets.kind, kind)).orderBy(desc(mediaAssets.id)).limit(200)
    : await query.orderBy(desc(mediaAssets.id)).limit(200);

  return NextResponse.json({ assets: rows });
}
