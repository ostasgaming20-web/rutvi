import "server-only";

import { headers } from "next/headers";
import { db } from "@/lib/db";
import { auditLogs } from "@/lib/db/schema";

type AuditInput = {
  actorEmail: string | null | undefined;
  action: string;
  entity?: string;
  entityId?: string | number | null;
  meta?: Record<string, unknown>;
};

export async function logAudit({ actorEmail, action, entity, entityId, meta = {} }: AuditInput) {
  try {
    let ip: string | null = null;
    let userAgent: string | null = null;
    try {
      const requestHeaders = await headers();
      ip = requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ?? requestHeaders.get("x-real-ip");
      userAgent = requestHeaders.get("user-agent")?.slice(0, 300) ?? null;
    } catch {
      /* headers unavailable outside a request */
    }

    await db.insert(auditLogs).values({
      actorEmail: actorEmail ?? null,
      action,
      entity: entity ?? null,
      entityId: entityId === null || entityId === undefined ? null : String(entityId),
      meta,
      ip,
      userAgent,
    });
  } catch (error) {
    console.error("[audit] failed to record", action, error);
  }
}
