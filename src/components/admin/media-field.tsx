"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, Images, Loader2, Upload, X } from "lucide-react";

type Asset = { id: number; url: string; originalName: string; kind: string };

export function MediaField({
  name,
  label,
  defaultValue = "",
  folder = "general",
  accept = "image/*",
  hint,
  preview = "wide",
  allowLibrary = true,
}: {
  name: string;
  label: string;
  defaultValue?: string | null;
  folder?: string;
  accept?: string;
  hint?: string;
  preview?: "wide" | "square";
  allowLibrary?: boolean;
}) {
  const [value, setValue] = useState(defaultValue ?? "");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loadingAssets, setLoadingAssets] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function upload(file: File) {
    setUploading(true);
    setError("");
    const formData = new FormData();
    formData.set("file", file);
    formData.set("folder", folder);
    try {
      const response = await fetch("/api/uploads", { method: "POST", body: formData });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message || "Upload failed.");
      setValue(payload.url);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  useEffect(() => {
    if (!libraryOpen) return;
    setLoadingAssets(true);
    fetch("/api/media?kind=image")
      .then((response) => response.json())
      .then((payload) => setAssets(payload.assets ?? []))
      .catch(() => setError("Could not load the media library."))
      .finally(() => setLoadingAssets(false));
  }, [libraryOpen]);

  const isImage = value && /\.(jpe?g|png|webp|gif|svg)(\?|$)/i.test(value);

  return (
    <div>
      <input type="hidden" name={name} value={value} />
      <span className="mb-1 block text-[0.6rem] font-semibold uppercase tracking-[0.1em] text-[#6b7280]">{label}</span>
      <div className="flex items-start gap-3">
        <div
          className={`relative shrink-0 overflow-hidden rounded-lg border border-black/10 bg-black/4 ${
            preview === "square" ? "size-16" : "h-16 w-24"
          }`}
        >
          {isImage ? (
            <Image src={value} alt="" fill sizes="96px" className="object-cover" unoptimized />
          ) : (
            <div className="grid size-full place-items-center text-black/25">
              <ImagePlus className="size-5" />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <input
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder="https://… or upload"
            aria-label={label}
            className="w-full rounded-lg border border-black/10 bg-white px-2.5 py-1.5 text-[0.72rem] outline-none focus:border-[#0d1f3c]"
          />
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center gap-1 rounded-md border border-black/12 bg-white px-2 py-1 text-[0.6rem] font-medium text-[#3f4552] hover:border-black/25"
            >
              {uploading ? <Loader2 className="size-3 animate-spin" /> : <Upload className="size-3" />}
              {uploading ? "Uploading…" : "Upload"}
            </button>
            {allowLibrary && (
              <button
                type="button"
                onClick={() => setLibraryOpen(true)}
                className="inline-flex items-center gap-1 rounded-md border border-black/12 bg-white px-2 py-1 text-[0.6rem] font-medium text-[#3f4552] hover:border-black/25"
              >
                <Images className="size-3" /> Library
              </button>
            )}
            {value && (
              <button
                type="button"
                onClick={() => setValue("")}
                className="inline-flex items-center gap-1 rounded-md border border-black/12 bg-white px-2 py-1 text-[0.6rem] font-medium text-[#3f4552] hover:border-red-300 hover:text-red-600"
              >
                <X className="size-3" /> Clear
              </button>
            )}
          </div>
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void upload(file);
              event.target.value = "";
            }}
          />
        </div>
      </div>
      {hint && <p className="mt-1 text-[0.62rem] text-[#8b919d]">{hint}</p>}
      {error && <p className="mt-1 text-[0.65rem] text-red-600">{error}</p>}

      {libraryOpen && (
        <div className="fixed inset-0 z-[95] grid place-items-center bg-black/50 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
          <div className="flex max-h-[80vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-black/8 px-4 py-3">
              <div>
                <h3 className="text-[0.85rem] font-semibold">Media library</h3>
                <p className="text-[0.65rem] text-[#8b919d]">Choose an image for {label.toLowerCase()}.</p>
              </div>
              <button type="button" onClick={() => setLibraryOpen(false)} aria-label="Close" className="grid size-8 place-items-center rounded-full hover:bg-black/5">
                <X className="size-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {loadingAssets ? (
                <div className="grid place-items-center py-16 text-[#8b919d]">
                  <Loader2 className="size-5 animate-spin" />
                </div>
              ) : assets.length === 0 ? (
                <p className="py-16 text-center text-[0.75rem] text-[#8b919d]">No images uploaded yet.</p>
              ) : (
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
                  {assets.map((asset) => (
                    <button
                      key={asset.id}
                      type="button"
                      onClick={() => {
                        setValue(asset.url);
                        setLibraryOpen(false);
                      }}
                      className="group relative aspect-square overflow-hidden rounded-lg border border-black/8 hover:border-[#0d1f3c]"
                      title={asset.originalName}
                    >
                      <Image src={asset.url} alt={asset.originalName} fill sizes="120px" className="object-cover transition-transform group-hover:scale-105" unoptimized />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
