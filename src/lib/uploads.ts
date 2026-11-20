import "server-only";

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

const allowedTypes: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "application/pdf": "pdf",
};

export async function saveUpload(file: File) {
  const extension = allowedTypes[file.type];
  if (!extension) {
    throw new Error("Please upload a JPG, PNG, WebP or PDF file.");
  }
  if (file.size > 5 * 1024 * 1024) {
    throw new Error("Files must be 5 MB or smaller.");
  }

  const bytes = await file.arrayBuffer();
  const signature = new Uint8Array(bytes.slice(0, 4));
  const isPng = signature[0] === 0x89 && signature[1] === 0x50 && signature[2] === 0x4e && signature[3] === 0x47;
  const isJpeg = signature[0] === 0xff && signature[1] === 0xd8;
  const isWebp = new TextDecoder().decode(bytes.slice(8, 12)) === "WEBP";
  const isPdf = new TextDecoder().decode(bytes.slice(0, 4)) === "%PDF";

  if ((extension === "png" && !isPng) || (extension === "jpg" && !isJpeg) || (extension === "webp" && !isWebp) || (extension === "pdf" && !isPdf)) {
    throw new Error("The file contents do not match its type.");
  }

  const directory = path.join(process.cwd(), "public", "uploads");
  await mkdir(directory, { recursive: true });
  const safeName = `${randomUUID()}.${extension}`;
  await writeFile(path.join(directory, safeName), Buffer.from(bytes));

  return {
    fileName: file.name.slice(0, 200),
    mimeType: file.type,
    sizeBytes: file.size,
    url: `/uploads/${safeName}`,
  };
}
