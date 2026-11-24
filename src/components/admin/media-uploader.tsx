"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Upload } from "lucide-react";
import { toast } from "sonner";

async function compressImage(file: File): Promise<File> {
  if (!file.type.startsWith("image/") || file.type === "image/gif" || file.size < 400 * 1024) return file;
  try {
    const bitmap = await createImageBitmap(file);
    const max = 2000;
    const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
    if (scale === 1) return file;
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const context = canvas.getContext("2d");
    if (!context) return file;
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", 0.86));
    if (!blob) return file;
    return new File([blob], file.name.replace(/\.\w+$/, "") + ".webp", { type: "image/webp" });
  } catch {
    return file;
  }
}

export function MediaUploader({ folder }: { folder: string }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState("");

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setBusy(true);
    let success = 0;
    for (let index = 0; index < files.length; index += 1) {
      const original = files[index];
      setProgress(`Uploading ${index + 1} of ${files.length}…`);
      const file = await compressImage(original);
      const formData = new FormData();
      formData.set("file", file);
      formData.set("folder", folder);
      try {
        const response = await fetch("/api/uploads", { method: "POST", body: formData });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.message || "Upload failed.");
        success += 1;
      } catch (error) {
        toast.error(`${original.name}: ${error instanceof Error ? error.message : "upload failed"}`);
      }
    }
    setBusy(false);
    setProgress("");
    if (success > 0) {
      toast.success(`${success} file${success === 1 ? "" : "s"} uploaded.`);
      router.refresh();
    }
  }

  return (
    <div
      onDragOver={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(event) => {
        event.preventDefault();
        setDragging(false);
        void handleFiles(event.dataTransfer.files);
      }}
      className={`rounded-xl border-2 border-dashed p-6 text-center transition-colors ${
        dragging ? "border-[#0d1f3c] bg-[#0d1f3c]/[0.03]" : "border-black/12 bg-white"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/*,video/mp4,video/webm,application/pdf,model/gltf-binary,.glb,.gltf,application/json"
        className="sr-only"
        onChange={(event) => {
          void handleFiles(event.target.files);
          event.target.value = "";
        }}
      />
      <div className="flex flex-col items-center gap-2">
        <span className="grid size-10 place-items-center rounded-full bg-[#0d1f3c]/8 text-[#0d1f3c]">
          {busy ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
        </span>
        <p className="text-[0.78rem] font-medium text-[#14161a]">
          {busy ? progress : "Drag and drop files, or browse"}
        </p>
        <p className="text-[0.62rem] text-[#8b919d]">
          Images (JPG, PNG, WebP), video (MP4, WebM), PDF, 3D models (GLB, GLTF). Images are compressed automatically.
        </p>
        <button
          type="button"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
          className="mt-1 rounded-lg bg-[#0d1f3c] px-3 py-1.5 text-[0.68rem] font-semibold text-white hover:bg-[#1b3358] disabled:opacity-60"
        >
          Choose files
        </button>
      </div>
    </div>
  );
}
