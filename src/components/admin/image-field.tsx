"use client";

import { useState } from "react";
import Image from "next/image";
import { ImagePlus, Loader2, Plus, Trash2 } from "lucide-react";

export function ImageField({ initial = [] }: { initial?: string[] }) {
  const [urls, setUrls] = useState<string[]>(initial.length > 0 ? initial : [""]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  function update(index: number, value: string) {
    setUrls((current) => current.map((url, i) => (i === index ? value : url)));
  }

  async function upload(file: File) {
    setUploading(true);
    setError("");
    const formData = new FormData();
    formData.set("file", file);
    try {
      const response = await fetch("/api/uploads", { method: "POST", body: formData });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message || "Upload failed.");
      setUrls((current) => {
        const cleaned = current.filter((url) => url.trim());
        return [...cleaned, payload.url, ""];
      });
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <input type="hidden" name="images" value={urls.filter((url) => url.trim()).join("\n")} />
      <div className="space-y-2">
        {urls.map((url, index) => (
          <div key={index} className="flex items-center gap-2">
            <div className="relative size-12 shrink-0 overflow-hidden rounded-lg border border-ink/10 bg-cream">
              {url ? (
                <Image src={url} alt="" fill sizes="48px" className="object-cover" unoptimized />
              ) : (
                <div className="grid size-full place-items-center text-stone">
                  <ImagePlus className="size-4" />
                </div>
              )}
            </div>
            <input
              value={url}
              onChange={(event) => update(index, event.target.value)}
              placeholder="https://… or upload an image"
              className="field !min-h-10 text-xs"
              aria-label={`Image URL ${index + 1}`}
            />
            <button
              type="button"
              onClick={() => setUrls((current) => (current.length === 1 ? [""] : current.filter((_, i) => i !== index)))}
              aria-label="Remove image"
              className="grid size-9 shrink-0 place-items-center rounded-lg border border-ink/10 text-stone hover:border-red-300 hover:text-red-600"
            >
              <Trash2 className="size-3.5" />
            </button>
          </div>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setUrls((current) => [...current, ""])}
          className="inline-flex items-center gap-1.5 rounded-full border border-ink/12 px-3 py-1.5 text-[0.62rem] text-ink/60 hover:border-navy"
        >
          <Plus className="size-3" /> Add URL
        </button>
        <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-ink/12 px-3 py-1.5 text-[0.62rem] text-ink/60 hover:border-navy">
          {uploading ? <Loader2 className="size-3 animate-spin" /> : <ImagePlus className="size-3" />}
          {uploading ? "Uploading…" : "Upload image"}
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="sr-only"
            disabled={uploading}
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void upload(file);
              event.target.value = "";
            }}
          />
        </label>
        <span className="text-[0.6rem] text-stone">First image is used as the card thumbnail.</span>
      </div>
      {error && <p className="mt-2 text-xs text-red-700">{error}</p>}
    </div>
  );
}
