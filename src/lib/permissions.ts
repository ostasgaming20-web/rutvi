import "server-only";

export const ROLES = ["super_admin", "admin", "editor", "sales_manager", "viewer"] as const;
export type Role = (typeof ROLES)[number];

export const ROLE_LABELS: Record<Role, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  editor: "Editor",
  sales_manager: "Sales Manager",
  viewer: "Viewer",
};

export const ROLE_DESCRIPTIONS: Record<Role, string> = {
  super_admin: "Full access to every feature, settings and publishing.",
  admin: "Manage website content, products, enquiries and media.",
  editor: "Edit website content and upload media. No security or user access.",
  sales_manager: "Customers, enquiries and quotations only.",
  viewer: "Read-only access to permitted dashboard information.",
};

export const CAPABILITIES = [
  "dashboard.view",
  "content.edit",
  "content.publish",
  "content.versions",
  "products.manage",
  "categories.manage",
  "hampers.manage",
  "enquiries.view",
  "enquiries.manage",
  "customers.manage",
  "media.manage",
  "navigation.manage",
  "seo.manage",
  "marketing.manage",
  "analytics.view",
  "three.manage",
  "users.manage",
  "settings.manage",
  "security.view",
  "backup.manage",
] as const;

export type Capability = (typeof CAPABILITIES)[number];

const ALL: Capability[] = [...CAPABILITIES];

const MATRIX: Record<Role, Capability[]> = {
  super_admin: ALL,
  admin: ALL.filter((cap) => !["users.manage", "backup.manage"].includes(cap)),
  editor: [
    "dashboard.view",
    "content.edit",
    "content.versions",
    "media.manage",
    "navigation.manage",
    "seo.manage",
    "three.manage",
    "products.manage",
    "categories.manage",
    "hampers.manage",
    "analytics.view",
  ],
  sales_manager: ["dashboard.view", "enquiries.view", "enquiries.manage", "customers.manage", "analytics.view"],
  viewer: ["dashboard.view", "analytics.view"],
};

export function normalizeRole(role: string | null | undefined): Role {
  return ROLES.includes(role as Role) ? (role as Role) : "viewer";
}

export function can(role: string | null | undefined, capability: Capability): boolean {
  return MATRIX[normalizeRole(role)].includes(capability);
}

export function capabilitiesFor(role: string | null | undefined): Capability[] {
  return MATRIX[normalizeRole(role)];
}

export class PermissionError extends Error {
  constructor(message = "You do not have permission to perform this action.") {
    super(message);
    this.name = "PermissionError";
  }
}
