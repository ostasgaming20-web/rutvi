import { desc, eq, isNotNull } from "drizzle-orm";
import { Boxes, Info } from "lucide-react";
import { db } from "@/lib/db";
import { websiteSettings } from "@/lib/db/schema";
import { requireCapability } from "@/lib/admin";
import { can } from "@/lib/permissions";
import { getDraftSettings } from "@/lib/settings";
import { publishContent, discardDraft, setPreviewMode } from "@/app/admin/content-actions";
import { PageHeader, Panel, Tag, ButtonLink } from "@/components/admin/ui";
import { DraftBar } from "@/components/admin/draft-bar";
import { ThreeStudio } from "@/components/admin/three-studio";

export const dynamic = "force-dynamic";

export default async function AdminThreeStudioPage() {
  const admin = await requireCapability("three.manage");
  const [settings, draftRows, publishedRows] = await Promise.all([
    getDraftSettings(),
    db.select({ key: websiteSettings.key }).from(websiteSettings).where(isNotNull(websiteSettings.draftValue)),
    db
      .select({ publishedAt: websiteSettings.publishedAt, publishedBy: websiteSettings.publishedBy })
      .from(websiteSettings)
      .where(eq(websiteSettings.key, "three"))
      .limit(1),
  ]);

  const hasDraft = draftRows.some((row) => row.key === "three");
  const lastPublished = publishedRows[0];
  const publishable = can(admin.role, "content.publish");

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Website studio"
        title="3D Experience Studio"
        description="Tune the interactive gift-box experience — materials, camera, motion and the unwrap moment. Changes preview live and stage as drafts."
        actions={<ButtonLink href="/admin/customisation" variant="ghost">Brand &amp; copy</ButtonLink>}
      />

      <DraftBar
        scope="settings"
        returnTo="/admin/3d-studio"
        hasDraft={hasDraft}
        publishedAt={lastPublished?.publishedAt ? new Date(lastPublished.publishedAt).toLocaleString("en-IN") : null}
        publishedBy={lastPublished?.publishedBy ?? null}
        canPublish={publishable}
        publishAction={publishContent}
        discardAction={discardDraft}
        previewAction={setPreviewMode}
      />

      <ThreeStudio settings={settings.three} />

      <Panel title="About the 3D experience" actions={<Tag tone="gold"><Boxes className="size-2.5" /> three.js</Tag>}>
        <div className="flex items-start gap-3 p-4">
          <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-[#c3a068]/15 text-[#8a6a33]">
            <Info className="size-4" />
          </span>
          <p className="text-[0.72rem] leading-relaxed text-[#6b7280]">
            The public gift-box experience is a procedurally modelled three.js scene. Material colours and camera values
            here drive the published configuration. A GLB model URL can be supplied to replace the procedural box when an
            artist delivers a bespoke model — upload it in the Media Library first.
          </p>
        </div>
      </Panel>
    </div>
  );
}
