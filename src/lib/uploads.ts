import "server-only";

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

export type MediaKind = "image" | "video" | "model" | "animation" | "document";

type TypeSpec = { kind: MediaKind; ext: string; maxBytes: number; magic: (bytes: Uint8Array) => boolean };

const startsWith = (bytes: Uint8Array, text: string) =>
  new TextDecoder().decode(bytes.slice(0, text.length)) === text;

const specs: Record<string, TypeSpec> = {
  "image/jpeg": { kind: "image", ext: "jpg", maxBytes: 8 * 1024 * 1024, magic: (b) => b[0] === 0xff && b[1] === 0xd8 },
  "image/png": {
    kind: "image",
    ext: "png",
    maxBytes: 8 * 1024 * 1024,
    magic: (b) => b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47,
  },
  "image/webp": { kind: "image", ext: "webp", maxBytes: 8 * 1024 * 1024, magic: (b) => startsWith(b.slice(8), "WEBP") },
  "application/pdf": { kind: "document", ext: "pdf", maxBytes: 8 * 1024 * 1024, magic: (b) => startsWith(b, "%PDF") },
  "video/mp4": {
    kind: "video",
    ext: "mp4",
    maxBytes: 60 * 1024 * 1024,
    magic: (b) => new TextDecoder().decode(b.slice(4, 8)) === "ftyp",
  },
  "video/webm": {
    kind: "video",
    ext: "webm",
    maxBytes: 60 * 1024 * 1024,
    magic: (b) => b[0] === 0x1a && b[1] === 0x45 && b[2] === 0xdf && b[3] === 0xa3,
  },
  "model/gltf-binary": { kind: "model", ext: "glb", maxBytes: 30 * 1024 * 1024, magic: (b) => startsWith(b, "glTF") },
  "model/gltf+json": { kind: "model", ext: "gltf", maxBytes: 15 * 1024 * 1024, magic: (b) => startsWith(b, "{") },
  "application/json": { kind: "animation", ext: "json", maxBytes: 10 * 1024 * 1024, magic: (b) => startsWith(b, "{") },
};

const FOLDER_PATTERN = /^[a-z0-9-]{1,40}$/;

export function isAllowedMime(mime: string) {
  return Boolean(specs[mime]);
}

export async function saveUpload(file: File, options: { folder?: string; kindHint?: MediaKind } = {}) {
  const spec = specs[file.type];
  if (!spec) {
    throw new Error("Unsupported file type. Upload JPG, PNG, WebP, PDF, MP4, WebM, GLB, GLTF or JSON.");
  }
  if (file.size === 0) throw new Error("The file is empty.");
  if (file.size > spec.maxBytes) {
    throw new Error(`This file exceeds the ${Math.round(spec.maxBytes / (1024 * 1024))} MB limit.`);
  }

  const bytes = await file.arrayBuffer();
  const view = new Uint8Array(bytes);

  if (!spec.magic(view)) {
    throw new Error("The file contents do not match its declared type.");
  }

  const folder = options.folder && FOLDER_PATTERN.test(options.folder) ? options.folder : "general";
  const directory = path.join(process.cwd(), "public", "uploads", folder);
  await mkdir(directory, { recursive: true });

  const safeName = `${randomUUID()}.${spec.ext}`;
  await writeFile(path.join(directory, safeName), Buffer.from(bytes));

  return {
    fileName: safeName,
    originalName: file.name.slice(0, 200),
    mimeType: file.type,
    kind: options.kindHint ?? spec.kind,
    sizeBytes: file.size,
    url: `/uploads/${folder}/${safeName}`,
    folder,
  };
}
