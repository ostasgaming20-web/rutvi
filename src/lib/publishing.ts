import "server-only";

import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  contentVersions,
  homepageSections,
  navigationMenus,
  promoCampaigns,
  seoMetadata,
  websiteSettings,
} from "@/lib/db/schema";
import { logAudit } from "@/lib/audit";
import type { ContentScope } from "@/lib/content";

const TABLES = {
  homepage: { table: homepageSections, name: "homepage_sections" },
  navigation: { table: navigationMenus, name: "navigation_menus" },
  seo: { table: seoMetadata, name: "seo_metadata" },
  marketing: { table: promoCampaigns, name: "promo_campaigns" },
} as const;

type TableScope = keyof typeof TABLES;

function toPlain<T>(rows: T[]): Record<string, unknown>[] {
  return JSON.parse(JSON.stringify(rows)) as Record<string, unknown>[];
}

async function nextVersion(scope: ContentScope) {
  const [row] = await db
    .select({ max: sql<number>`coalesce(max(${contentVersions.version}), 0)::int` })
    .from(contentVersions)
    .where(eq(contentVersions.scope, scope));
  return Number(row?.max ?? 0) + 1;
}

async function resetSequence(tableName: string) {
  await db.execute(
    sql.raw(
      `select setval(pg_get_serial_sequence('"${tableName}"', 'id'), coalesce((select max(id) from "${tableName}"), 1))`,
    ),
  );
}

export async function publishScope(
  scope: ContentScope,
  actorEmail: string,
  note?: string,
): Promise<number> {
  const version = await nextVersion(scope);

  if (scope === "settings") {
    const rows = await db.select().from(websiteSettings);
    const now = new Date();

    for (const row of rows) {
      if (row.draftValue) {
        await db
          .update(websiteSettings)
          .set({
            value: row.draftValue,
            draftValue: null,
            publishedAt: now,
            publishedBy: actorEmail,
            updatedAt: now,
          })
          .where(eq(websiteSettings.key, row.key));
      }
    }

    const fresh = await db.select().from(websiteSettings);
    await db.insert(contentVersions).values({
      scope,
      version,
      snapshot: { items: toPlain(fresh) },
      note: note ?? null,
      authorEmail: actorEmail,
    });
  } else {
    const entry = TABLES[scope as TableScope];
    const rows = await db.select().from(entry.table);
    await db.insert(contentVersions).values({
      scope,
      version,
      snapshot: { items: toPlain(rows) },
      note: note ?? null,
      authorEmail: actorEmail,
    });
  }

  await logAudit({
    actorEmail,
    action: `publish.${scope}`,
    entity: "content_version",
    entityId: version,
    meta: { scope, note: note ?? null },
  });

  return version;
}

export async function restoreVersion(versionId: number, actorEmail: string) {
  const [version] = await db
    .select()
    .from(contentVersions)
    .where(eq(contentVersions.id, versionId))
    .limit(1);
  if (!version) throw new Error("Version not found.");

  const scope = version.scope as ContentScope;
  const items = (version.snapshot as { items?: Record<string, unknown>[] }).items ?? [];

  if (scope === "settings") {
    for (const item of items) {
      const key = String(item.key ?? "");
      if (!key) continue;
      const value = (item.value ?? {}) as Record<string, unknown>;
      await db
        .insert(websiteSettings)
        .values({ key, value, draftValue: value, updatedAt: new Date() })
        .onConflictDoUpdate({
          target: websiteSettings.key,
          set: { value, draftValue: value, updatedAt: new Date() },
        });
    }
  } else {
    const entry = TABLES[scope as TableScope];
    if (!entry) throw new Error("Unknown content scope.");

    await db.transaction(async (tx) => {
      await tx.delete(entry.table);
      if (items.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await tx.insert(entry.table).values(items as any);
      }
    });
    await resetSequence(entry.name);
  }

  const newVersion = await publishScope(scope, actorEmail, `Restored from version ${version.version}`);

  await logAudit({
    actorEmail,
    action: `restore.${scope}`,
    entity: "content_version",
    entityId: versionId,
    meta: { restoredFrom: version.version, newVersion },
  });

  return newVersion;
}
