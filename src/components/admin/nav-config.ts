import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Boxes,
  ClipboardList,
  FolderTree,
  Gift,
  Home,
  Image as ImageIcon,
  LayoutDashboard,
  Lock,
  Megaphone,
  Menu,
  MousePointerClick,
  Package,
  Palette,
  Search,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react";
import type { Capability } from "@/lib/permissions";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  capability: Capability;
  badge?: "new";
};

export type NavGroup = { title: string; items: NavItem[] };

export const adminNav: NavGroup[] = [
  {
    title: "Command centre",
    items: [
      { href: "/admin", label: "Overview", icon: LayoutDashboard, capability: "dashboard.view" },
      { href: "/admin/analytics", label: "Analytics & Reports", icon: BarChart3, capability: "analytics.view" },
    ],
  },
  {
    title: "Website studio",
    items: [
      { href: "/admin/customisation", label: "Website Customisation", icon: Palette, capability: "content.edit" },
      { href: "/admin/editor", label: "Live Website Editor", icon: MousePointerClick, capability: "content.edit", badge: "new" },
      { href: "/admin/3d-studio", label: "3D Experience Studio", icon: Boxes, capability: "three.manage", badge: "new" },
      { href: "/admin/homepage", label: "Homepage Management", icon: Home, capability: "content.edit" },
      { href: "/admin/navigation", label: "Navigation & Menus", icon: Menu, capability: "navigation.manage" },
      { href: "/admin/seo", label: "SEO Management", icon: Search, capability: "seo.manage" },
      { href: "/admin/marketing", label: "Marketing & Promotions", icon: Megaphone, capability: "marketing.manage" },
    ],
  },
  {
    title: "Catalogue",
    items: [
      { href: "/admin/products", label: "Product Management", icon: Package, capability: "products.manage" },
      { href: "/admin/categories", label: "Categories & Collections", icon: FolderTree, capability: "categories.manage" },
      { href: "/admin/hampers", label: "Gift Hampers", icon: Gift, capability: "hampers.manage" },
      { href: "/admin/media", label: "Media Library", icon: ImageIcon, capability: "media.manage" },
    ],
  },
  {
    title: "Customer desk",
    items: [
      { href: "/admin/enquiries", label: "Orders & Enquiries", icon: ClipboardList, capability: "enquiries.view" },
      { href: "/admin/customers", label: "Customer Management", icon: Users, capability: "customers.manage" },
    ],
  },
  {
    title: "Administration",
    items: [
      { href: "/admin/users", label: "Users & Roles", icon: ShieldCheck, capability: "users.manage" },
      { href: "/admin/settings", label: "Website Settings", icon: Settings, capability: "settings.manage" },
      { href: "/admin/security", label: "Security & Activity", icon: Lock, capability: "security.view" },
    ],
  },
];
