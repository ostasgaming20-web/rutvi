import { requireAdmin } from "@/lib/admin";
import { capabilitiesFor, ROLE_LABELS } from "@/lib/permissions";
import { adminNav } from "@/components/admin/nav-config";
import { getPublishedSettings } from "@/lib/settings";
import { AdminShell } from "@/components/admin/admin-shell";

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  const { session, role } = await requireAdmin();
  const capabilities = capabilitiesFor(role);
  const settings = await getPublishedSettings();

  const allowed = adminNav
    .flatMap((group) => group.items)
    .filter((item) => capabilities.includes(item.capability))
    .map((item) => item.href);

  return (
    <AdminShell
      email={session.user.email}
      roleLabel={ROLE_LABELS[role]}
      allowed={allowed}
      siteName={settings.branding.siteName || "RUTVI ENTERPRISE"}
    >
      {children}
    </AdminShell>
  );
}
