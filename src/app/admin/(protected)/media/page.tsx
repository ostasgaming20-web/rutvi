import { and, count, desc, eq, ilike, sql } from "drizzle-orm";
import { Image as ImageIcon } from "lucide-react";
import { db } from "@/lib/db";
import { mediaAssets } from "@/lib/db/schema";
import { requireCapability } from "@/lib/admin";
import { PageHeader, Panel, EmptyState, Tag, StatCard } from "@/components/admin/ui";
import { MediaUploader } from "@/components/admin/media-uploader";
import { MediaGrid } from "@/components/admin/media-grid";
import Link from "next/link";

export const dynamic = "force-dynamic";

const KINDS = [
  { value: "", label: "All files" },
  { value: "image", label: "Images" },
  { value: "video", label: "Videos" },
  { value: "model", label: "3D models" },
  { value: "animation", label: "Animations" },
  { value: "document", label: "Documents" },
];

export default async function MediaPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireCapability("media.manage");
  const params = await searchParams;
  const kind = typeof params.kind === "string" ? params.kind : "";
  const q = typeof params.q === "string" ? params.q : "";
  const folder = typeof params.folder === "string" ? params.folder : "";

  const conditions = [];
  if (kind) conditions.push(eq(mediaAssets.kind, kind));
  if (folder) conditions.push(eq(mediaAssets.folder, folder));
  if (q) conditions.push(ilike(mediaAssets.originalName, `%${q}%`));

  const [rows, totalRow, imageRow, sizeRow, folderRows] = await Promise.all([
    db
      .select()
      .from(mediaAssets)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(mediaAssets.id))
      .limit(120),
    db.select({ value: count() }).from(mediaAssets),
    db.select({ value: count() }).from(mediaAssets).where(eq(mediaAssets.kind, "image")),
    db.select({ value: sql<number>`coalesce(sum(${mediaAssets.sizeBytes}), 0)::bigint` }).from(mediaAssets),
    db.select({ folder: mediaAssets.folder }).from(mediaAssets).groupBy(mediaAssets.folder).orderBy(mediaAssets.folder),
  ]);

  const totalBytes = Number(sizeRow[0].value);

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Assets"
        title="Media Library"
        description="One home for product photography, banners, logos, videos, 3D models and animations."
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Total assets" value={Number(totalRow[0].value)} icon={ImageIcon} />
        <StatCard label="Images" value={Number(imageRow[0].value)} tone="gold" />
        <StatCard label="Storage used" value={`${(totalBytes / (1024 * 1024)).toFixed(1)} MB`} tone="neutral" />
      </div>

      <Panel title="Upload" description="Drag files here or browse" padded>
        <MediaUploader folder={folder || "general"} />
      </Panel>

      <Panel
        title="Assets"
        description={`${rows.length} shown`}
        actions={
          <form method="get" className="flex flex-wrap items-center gap-1.5">
            <input name="q" defaultValue={q} placeholder="Search…" className="w-32 rounded-md border border-black/10 px-2 py-1 text-[0.66rem] outline-none" />
            <select name="kind" defaultValue={kind} className="rounded-md border border-black/10 px-2 py-1 text-[0.66rem] outline-none">
              {KINDS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            <button type="submit" className="rounded-md bg-[#0d1f3c] px-2 py-1 text-[0.64rem] font-semibold text-white">Filter</button>
          </form>
        }
      >
        {folderRows.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 border-b border-black/6 px-3 py-2">
            <span className="text-[0.6rem] uppercase tracking-[0.1em] text-[#8b919d]">Folders:</span>
            <Link href="/admin/media" className={`rounded-full border px-2 py-0.5 text-[0.6rem] ${!folder ? "border-[#0d1f3c] bg-[#0d1f3c] text-white" : "border-black/10 text-[#6b7280] hover:border-black/25"}`}>
              All
            </Link>
            {folderRows.map((row) => (
              <Link
                key={row.folder}
                href={`/admin/media?folder=${row.folder}`}
                className={`rounded-full border px-2 py-0.5 text-[0.6rem] ${folder === row.folder ? "border-[#0d1f3c] bg-[#0d1f3c] text-white" : "border-black/10 text-[#6b7280] hover:border-black/25"}`}
              >
                {row.folder}
              </Link>
            ))}
          </div>
        )}

        {rows.length === 0 ? (
          <EmptyState title="No media yet" description="Upload your first image or asset using the drop zone above." icon={ImageIcon} />
        ) : (
          <MediaGrid
            assets={rows.map((row) => ({
              id: row.id,
              url: row.url,
              originalName: row.originalName,
              kind: row.kind,
              folder: row.folder,
              sizeBytes: row.sizeBytes,
              alt: row.alt,
              createdAt: row.createdAt.toISOString(),
            }))}
          />
        )}
      </Panel>

      <Panel title="Upload rules">
        <div className="flex flex-wrap gap-2 p-3">
          {[
            "JPG / PNG / WebP — 8 MB",
            "MP4 / WebM — 60 MB",
            "GLB — 30 MB · GLTF — 15 MB",
            "PDF — 8 MB",
          ].map((rule) => (
            <Tag key={rule} tone="neutral">{rule}</Tag>
          ))}
        </div>
      </Panel>
    </div>
  );
}
