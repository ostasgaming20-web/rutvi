import Link from "next/link";
import { History, RotateCcw } from "lucide-react";
import { requireCapability } from "@/lib/admin";
import { can } from "@/lib/permissions";
import {
  CONTENT_SCOPES,
  SCOPE_LABELS,
  listVersions,
  countContentVersions,
  type ContentScope,
} from "@/lib/content";
import { restoreContent } from "@/app/admin/content-actions";
import { formatDateTime } from "@/lib/format";
import { PageHeader, Panel, Tag, EmptyState, ButtonLink } from "@/components/admin/ui";
import { ConfirmAction } from "@/components/admin/confirm-action";

export const dynamic = "force-dynamic";

export default async function AdminVersionsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const admin = await requireCapability("content.versions");
  const params = await searchParams;
  const scopeParam = typeof params.scope === "string" ? params.scope : "settings";
  const scope: ContentScope = CONTENT_SCOPES.includes(scopeParam as ContentScope) ? (scopeParam as ContentScope) : "settings";

  const [versions, counts] = await Promise.all([
    listVersions(scope, 40),
    Promise.all(CONTENT_SCOPES.map(async (item) => ({ scope: item, count: await countContentVersions(item) }))),
  ]);

  const canRestore = can(admin.role, "content.publish");

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Website studio"
        title="Version History"
        description="Every publish creates an immutable snapshot. Restore any version to roll the website back instantly."
        actions={<ButtonLink href="/admin/customisation" variant="ghost">Back to studio</ButtonLink>}
      />

      <div className="flex flex-wrap gap-1.5">
        {counts.map((item) => (
          <Link
            key={item.scope}
            href={`/admin/versions?scope=${item.scope}`}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[0.68rem] font-medium ${
              scope === item.scope
                ? "border-[#0d1f3c] bg-[#0d1f3c] text-white"
                : "border-black/10 bg-white text-[#3f4552] hover:border-black/25"
            }`}
          >
            {SCOPE_LABELS[item.scope]}
            <span className={`rounded-full px-1.5 text-[0.58rem] ${scope === item.scope ? "bg-white/15" : "bg-black/5"}`}>{item.count}</span>
          </Link>
        ))}
      </div>

      <Panel title={SCOPE_LABELS[scope]} description="Newest first">
        {versions.length === 0 ? (
          <EmptyState
            title="No versions published yet"
            description="Publish this scope from its editor to create the first snapshot."
            icon={History}
            action={<ButtonLink href={scope === "settings" ? "/admin/customisation" : `/admin/${scope === "marketing" ? "marketing" : scope}`} variant="ghost">Open editor</ButtonLink>}
          />
        ) : (
          <ol className="divide-y divide-black/5">
            {versions.map((version) => {
              const items = ((version.snapshot as { items?: unknown[] }).items ?? []).length;
              return (
                <li key={version.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 hover:bg-black/[0.015]">
                  <div className="flex min-w-0 items-start gap-3">
                    <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-[#0d1f3c]/5 text-[0.7rem] font-semibold text-[#0d1f3c]">
                      v{version.version}
                    </span>
                    <div className="min-w-0">
                      <p className="text-[0.76rem] font-medium text-[#14161a]">{version.note || `Version ${version.version}`}</p>
                      <p className="text-[0.62rem] text-[#8b919d]">
                        {formatDateTime(version.createdAt)} · {version.authorEmail || "system"} · {items} record{items === 1 ? "" : "s"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Tag tone="neutral">v{version.version}</Tag>
                    {canRestore ? (
                      <ConfirmAction
                        action={restoreContent}
                        fields={{ versionId: version.id, returnTo: `/admin/versions?scope=${scope}` }}
                        title="Restore this version?"
                        message={`This will replace the current ${SCOPE_LABELS[scope].toLowerCase()} with the snapshot from version ${version.version}, and publish it immediately. A new version will be recorded.`}
                        confirmLabel="Restore & publish"
                        className="inline-flex items-center gap-1 rounded-lg border border-black/12 px-2.5 py-1.5 text-[0.66rem] font-semibold text-[#14161a] hover:border-[#0d1f3c]/30"
                      >
                        <RotateCcw className="size-3" /> Restore
                      </ConfirmAction>
                    ) : (
                      <Tag tone="neutral">View only</Tag>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </Panel>
    </div>
  );
}
