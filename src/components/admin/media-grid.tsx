"use client";

import { useState } from "react";
import Image from "next/image";
import { Check, Copy, FileText, Film, Pencil, Trash2, X } from "lucide-react";
import { renameMedia, deleteMedia } from "@/app/admin/catalogue-actions";

type Asset = {
  id: number;
  url: string;
  originalName: string;
  kind: string;
  folder: string;
  sizeBytes: number;
  alt: string | null;
  createdAt: string;
};

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function MediaGrid({ assets }: { assets: Asset[] }) {
  const [editing, setEditing] = useState<Asset | null>(null);
  const [copied, setCopied] = useState<number | null>(null);

  async function copy(asset: Asset) {
    try {
      await navigator.clipboard.writeText(asset.url);
      setCopied(asset.id);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      /* clipboard may be blocked */
    }
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-2 p-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
        {assets.map((asset) => (
          <div key={asset.id} className="group overflow-hidden rounded-lg border border-black/8 bg-white">
            <div className="relative aspect-square bg-black/4">
              {asset.kind === "image" ? (
                <Image src={asset.url} alt={asset.alt ?? asset.originalName} fill sizes="200px" className="object-cover" unoptimized />
              ) : (
                <div className="grid size-full place-items-center text-black/25">
                  {asset.kind === "video" ? <Film className="size-6" /> : <FileText className="size-6" />}
                </div>
              )}
              <div className="absolute inset-0 flex items-center justify-center gap-1 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                <button type="button" onClick={() => copy(asset)} aria-label="Copy URL" className="grid size-7 place-items-center rounded-md bg-white/90 text-[#14161a] hover:bg-white">
                  {copied === asset.id ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
                </button>
                <button type="button" onClick={() => setEditing(asset)} aria-label="Rename" className="grid size-7 place-items-center rounded-md bg-white/90 text-[#14161a] hover:bg-white">
                  <Pencil className="size-3.5" />
                </button>
                <form action={deleteMedia}>
                  <input type="hidden" name="id" value={asset.id} />
                  <button type="submit" aria-label="Delete" className="grid size-7 place-items-center rounded-md bg-white/90 text-red-600 hover:bg-white" onClick={(event) => {
                    if (!window.confirm(`Delete ${asset.originalName}? This cannot be undone.`)) event.preventDefault();
                  }}>
                    <Trash2 className="size-3.5" />
                  </button>
                </form>
              </div>
            </div>
            <div className="p-2">
              <p className="truncate text-[0.66rem] font-medium text-[#14161a]" title={asset.originalName}>{asset.originalName}</p>
              <p className="text-[0.58rem] text-[#8b919d]">{formatSize(asset.sizeBytes)} · {asset.folder}</p>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 z-[95] grid place-items-center bg-black/50 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
          <div className="w-full max-w-sm rounded-xl bg-white p-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-[0.9rem] font-semibold">Edit asset</h3>
              <button type="button" onClick={() => setEditing(null)} aria-label="Close" className="grid size-7 place-items-center rounded-full hover:bg-black/5">
                <X className="size-4" />
              </button>
            </div>
            <form
              action={async (formData) => {
                await renameMedia(formData);
                setEditing(null);
              }}
              className="mt-3 space-y-3"
            >
              <input type="hidden" name="id" value={editing.id} />
              <label className="block">
                <span className="mb-1 block text-[0.6rem] font-semibold uppercase tracking-[0.1em] text-[#6b7280]">File name</span>
                <input name="originalName" defaultValue={editing.originalName} className="w-full rounded-lg border border-black/10 px-3 py-2 text-[0.78rem] outline-none focus:border-[#0d1f3c]" />
              </label>
              <label className="block">
                <span className="mb-1 block text-[0.6rem] font-semibold uppercase tracking-[0.1em] text-[#6b7280]">Folder</span>
                <input name="folder" defaultValue={editing.folder} className="w-full rounded-lg border border-black/10 px-3 py-2 text-[0.78rem] outline-none focus:border-[#0d1f3c]" />
              </label>
              <label className="block">
                <span className="mb-1 block text-[0.6rem] font-semibold uppercase tracking-[0.1em] text-[#6b7280]">Alt text</span>
                <input name="alt" defaultValue={editing.alt ?? ""} className="w-full rounded-lg border border-black/10 px-3 py-2 text-[0.78rem] outline-none focus:border-[#0d1f3c]" />
              </label>
              <div className="flex justify-end gap-2 pt-1">
                <button type="button" onClick={() => setEditing(null)} className="rounded-lg border border-black/12 px-3 py-2 text-[0.7rem] font-semibold hover:border-black/25">Cancel</button>
                <button type="submit" className="rounded-lg bg-[#0d1f3c] px-3 py-2 text-[0.7rem] font-semibold text-white hover:bg-[#1b3358]">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
