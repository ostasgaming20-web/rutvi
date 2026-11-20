import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin";
import { saveUpload } from "@/lib/uploads";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const admin = await requireAdminApi();
  if (!admin) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ message: "Choose a file to upload." }, { status: 400 });
  }
  if (file.size > 8 * 1024 * 1024) {
    return NextResponse.json({ message: "Images must be 8 MB or smaller." }, { status: 400 });
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ message: "Only JPG, PNG or WebP images are allowed." }, { status: 400 });
  }

  try {
    const result = await saveUpload(file);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Upload failed." },
      { status: 400 },
    );
  }
}
