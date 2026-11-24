import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin";
import { saveUpload } from "@/lib/uploads";
import { db } from "@/lib/db";
import { mediaAssets } from "@/lib/db/schema";
import { logAudit } from "@/lib/audit";
import { can } from "@/lib/permissions";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const admin = await requireAdminApi();
  if (!admin) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  if (!can(admin.role, "media.manage")) {
    return NextResponse.json({ message: "You do not have permission to upload media." }, { status: 403 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ message: "Choose a file to upload." }, { status: 400 });
  }

  const folderRaw = formData.get("folder");
  const folder = typeof folderRaw === "string" && /^[a-z0-9-]{1,40}$/.test(folderRaw) ? folderRaw : "general";

  try {
    const result = await saveUpload(file, { folder });

    const [asset] = await db
      .insert(mediaAssets)
      .values({
        fileName: result.fileName,
        originalName: result.originalName,
        mimeType: result.mimeType,
        kind: result.kind,
        sizeBytes: result.sizeBytes,
        url: result.url,
        folder: result.folder,
        uploadedBy: admin.session.user.email,
      })
      .returning();

    await logAudit({
      actorEmail: admin.session.user.email,
      action: "media.upload",
      entity: "media_asset",
      entityId: asset.id,
      meta: { fileName: result.originalName, kind: result.kind, sizeBytes: result.sizeBytes },
    });

    return NextResponse.json({ ...result, id: asset.id });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Upload failed." },
      { status: 400 },
    );
  }
}
