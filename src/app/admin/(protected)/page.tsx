import Link from "next/link";
import {
  and,
  count,
  desc,
  eq,
  gte,
  sql,
} from "drizzle-orm";
import {
  ArrowUpRight,
  BadgeHelp,
  Boxes,
  ClipboardList,
  Eye,
  FolderTree,
  Package,
  Plus,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import { db } from "@/lib/db";
import {
  auditLogs,
  categories,
  customers,
  enquiries,
  products,
  testimonials,
} from "@/lib/db/schema";
import { requireAdmin } from "@/lib/admin";
import { can } from "@/lib/permissions";
import { getAnalytics } from "@/lib/analytics";
import { getPublishedSettings } from "@/lib/settings";
import { formatDate, formatINR, ENQUIRY_STATUS_LABELS } from "@/lib/format";
import { PageHeader, Panel, StatCard, Tag, EmptyState, ButtonLink } from "@/components/admin/ui";
import { AreaTrend, Donut } from "@/components/admin/charts";

export const dynamic = "force-dynamic";

function relativeTime(date: Date) {
  const diff = Date.now() - new Date(date).getTime();
  const minutes = Math.round(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

const ACTION_LABELS: Record<string, string> = {
  "product.create": "created a product",
  "product.update": "updated a product",
  "product.delete": "deleted a product",
  "product.archive": "archived a product",
  "product.bulk.activate": "bulk-activated products",
  "enquiry.update": "updated an enquiry",
  "enquiry.note": "added an enquiry note",
  "publish.settings": "published website settings",
  "publish.homepage": "published the homepage",
  "publish.navigation": "published navigation",
  "publish.seo": "published SEO",
  "publish.marketing": "published campaigns",
  "user.create": "added a team member",
  "media.upload": "uploaded media",
  "category.create": "created a category",
};

export default async function AdminOverviewPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const admin = await requireAdmin();
  const params = await searchParams;
  const denied = typeof params.denied === "string" ? params.denied : "";

  const now = new Date();
  const from30 = new Date(now);
  from30.setDate(from30.getDate() - 29);
  from30.setHours(0, 0, 0, 0);
  const from7 = new Date(now);
  from7.setDate(from7.getDate() - 6);
  from7.setHours(0, 0, 0, 0);

  const [
    productTotal,
    productActive,
    productFeatured,
    categoryTotal,
    enquiryTotal,
    enquiryNew,
    enquiryPending,
    customerTotal,
    testimonialTotal,
    recentEnquiries,
    recentProducts,
    mostViewed,
    activity,
    analytics,
    settings,
    statusBreakdown,
  ] = await Promise.all([
    db.select({ value: count() }).from(products).where(eq(products.isArchived, false)),
    db.select({ value: count() }).from(products).where(and(eq(products.isActive, true), eq(products.isArchived, false))),
    db.select({ value: count() }).from(products).where(eq(products.isFeatured, true)),
    db.select({ value: count() }).from(categories).where(eq(categories.isActive, true)),
    db.select({ value: count() }).from(enquiries),
    db.select({ value: count() }).from(enquiries).where(eq(enquiries.status, "new")),
    db
      .select({ value: count() })
      .from(enquiries)
      .where(sql`${enquiries.status} in ('new','contacted','quotation_sent','negotiation','in_progress')`),
    db.select({ value: count() }).from(customers),
    db.select({ value: count() }).from(testimonials).where(eq(testimonials.isPublished, true)),
    db
      .select({
        id: enquiries.id,
        status: enquiries.status,
        productName: enquiries.productName,
        quantity: enquiries.quantity,
        createdAt: enquiries.createdAt,
        name: customers.name,
        company: customers.company,
      })
      .from(enquiries)
      .innerJoin(customers, eq(enquiries.customerId, customers.id))
      .orderBy(desc(enquiries.createdAt))
      .limit(6),
    db
      .select({
        id: products.id,
        name: products.name,
        slug: products.slug,
        pricePaise: products.pricePaise,
        createdAt: products.createdAt,
        categoryName: categories.name,
      })
      .from(products)
      .innerJoin(categories, eq(products.categoryId, categories.id))
      .where(eq(products.isArchived, false))
      .orderBy(desc(products.createdAt))
      .limit(5),
    db
      .select({
        id: products.id,
        name: products.name,
        slug: products.slug,
        viewCount: products.viewCount,
        pricePaise: products.pricePaise,
      })
      .from(products)
      .where(eq(products.isArchived, false))
      .orderBy(desc(products.viewCount))
      .limit(5),
    db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(8),
    getAnalytics({ from: from30, to: now }),
    getPublishedSettings(),
    db
      .select({ status: enquiries.status, value: count() })
      .from(enquiries)
      .groupBy(enquiries.status),
  ]);

  const last7 = analytics.series.slice(-7);
  const enquiriesLast7 = await db
    .select({
      day: sql<string>`to_char(date_trunc('day', ${enquiries.createdAt}), 'YYYY-MM-DD')`,
      value: sql<number>`count(*)::int`,
    })
    .from(enquiries)
    .where(gte(enquiries.createdAt, from7))
    .groupBy(sql`date_trunc('day', ${enquiries.createdAt})`)
    .orderBy(sql`date_trunc('day', ${enquiries.createdAt})`);

  const enquiryByDay = new Map(enquiriesLast7.map((row) => [row.day, Number(row.value)]));
  const chartData = last7.map((row) => ({
    day: row.day,
    visitors: Number(row.visitors),
    pageViews: Number(row.views),
    enquiries: enquiryByDay.get(row.day) ?? 0,
  }));

  const statusData = statusBreakdown.map((row) => ({
    name: ENQUIRY_STATUS_LABELS[row.status] ?? row.status,
    value: Number(row.value),
  }));

  const stats = [
    {
      label: "Website visitors",
      value: analytics.visitors.toLocaleString("en-IN"),
      note: "last 30 days",
      icon: Users,
      href: "/admin/analytics",
      tone: "blue" as const,
    },
    {
      label: "Total enquiries",
      value: Number(enquiryTotal[0].value).toLocaleString("en-IN"),
      note: `${Number(enquiryNew[0].value)} new`,
      icon: BadgeHelp,
      href: "/admin/enquiries",
      tone: "gold" as const,
    },
    {
      label: "Products",
      value: Number(productTotal[0].value),
      note: `${Number(productActive[0].value)} active`,
      icon: Package,
      href: "/admin/products",
      tone: "neutral" as const,
    },
    {
      label: "Categories",
      value: Number(categoryTotal[0].value),
      note: `${Number(productFeatured[0].value)} featured products`,
      icon: FolderTree,
      href: "/admin/categories",
      tone: "neutral" as const,
    },
    {
      label: "Pending enquiries",
      value: Number(enquiryPending[0].value),
      note: "need follow-up",
      icon: ClipboardList,
      href: "/admin/enquiries?status=new",
      tone: "gold" as const,
    },
    {
      label: "Customers",
      value: Number(customerTotal[0].value),
      note: "in the CRM",
      icon: Users,
      href: "/admin/customers",
      tone: "blue" as const,
    },
    {
      label: "Page views",
      value: analytics.pageViews.toLocaleString("en-IN"),
      note: `${analytics.productViews} product views`,
      icon: Eye,
      href: "/admin/analytics",
      tone: "neutral" as const,
    },
    {
      label: "Conversion rate",
      value: `${analytics.conversionRate}%`,
      note: "visitors → enquiries",
      icon: TrendingUp,
      href: "/admin/analytics",
      tone: "green" as const,
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Command centre"
        title="Overview"
        description={`Welcome back, ${admin.session.user.name.split(" ")[0]}. Here is how ${settings.branding.siteName || "RUTVI ENTERPRISE"} is performing.`}
        actions={
          <>
            <ButtonLink href="/admin/products/new" variant="ghost">
              <Plus className="size-3.5" /> New product
            </ButtonLink>
            <ButtonLink href="/admin/customisation" variant="primary">
              <Sparkles className="size-3.5" /> Customise site
            </ButtonLink>
          </>
        }
      />

      {denied && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-[0.75rem] text-amber-900">
          Your role does not have access to that area.
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.55fr_1fr]">
        <Panel
          title="Visitor analytics"
          description="Unique visitors, page views and enquiries — last 7 days"
          actions={
            <Link href="/admin/analytics" className="text-[0.65rem] font-semibold text-[#0d1f3c] hover:underline">
              Full report →
            </Link>
          }
          padded
        >
          {chartData.length === 0 ? (
            <EmptyState
              title="No analytics yet"
              description="Visitor data appears here once people browse the live website. The tracking beacon is already wired in."
              icon={TrendingUp}
            />
          ) : (
            <AreaTrend
              data={chartData}
              series={[
                { key: "visitors", label: "Visitors", color: "#0d1f3c" },
                { key: "pageViews", label: "Page views", color: "#c3a068" },
                { key: "enquiries", label: "Enquiries", color: "#1b3358" },
              ]}
              height={260}
            />
          )}
        </Panel>

        <div className="space-y-4">
          <Panel title="Enquiry pipeline" description="All time" padded>
            {statusData.length === 0 ? (
              <EmptyState title="No enquiries yet" description="New website enquiries will appear here." icon={BadgeHelp} />
            ) : (
              <Donut data={statusData} nameKey="name" valueKey="value" height={220} />
            )}
          </Panel>

          <Panel title="Quick actions">
            <div className="grid grid-cols-2 gap-2 p-3">
              {[
                { href: "/admin/products/new", label: "Add product", icon: Plus },
                { href: "/admin/enquiries?status=new", label: "New enquiries", icon: BadgeHelp },
                { href: "/admin/hampers/new", label: "New hamper", icon: Boxes },
                { href: "/admin/media", label: "Media library", icon: Eye },
              ].map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className="flex flex-col gap-1.5 rounded-lg border border-black/7 bg-white p-3 transition-colors hover:border-[#0d1f3c]/30 hover:bg-[#0d1f3c]/[0.02]"
                >
                  <action.icon className="size-4 text-[#0d1f3c]" />
                  <span className="text-[0.68rem] font-medium text-[#14161a]">{action.label}</span>
                </Link>
              ))}
            </div>
          </Panel>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel
          title="Recent enquiries"
          description="Latest requests from the website"
          className="lg:col-span-2"
          actions={
            <Link href="/admin/enquiries" className="text-[0.65rem] font-semibold text-[#0d1f3c] hover:underline">
              View all
            </Link>
          }
        >
          {recentEnquiries.length === 0 ? (
            <EmptyState
              title="No enquiries yet"
              description="When a customer submits the quote form, their request appears here instantly."
              icon={BadgeHelp}
            />
          ) : (
            <ul className="divide-y divide-black/5">
              {recentEnquiries.map((enquiry) => (
                <li key={enquiry.id}>
                  <Link href={`/admin/enquiries/${enquiry.id}`} className="flex items-center justify-between gap-3 px-4 py-2.5 hover:bg-black/[0.02]">
                    <div className="min-w-0">
                      <p className="truncate text-[0.78rem] font-medium text-[#14161a]">
                        {enquiry.name}
                        {enquiry.company && <span className="font-normal text-[#8b919d]"> · {enquiry.company}</span>}
                      </p>
                      <p className="truncate text-[0.65rem] text-[#8b919d]">
                        {enquiry.productName || "General enquiry"}
                        {enquiry.quantity ? ` · ${enquiry.quantity} pcs` : ""}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className="hidden text-[0.62rem] text-[#8b919d] sm:block">{relativeTime(enquiry.createdAt)}</span>
                      <Tag tone={enquiry.status === "new" ? "blue" : "neutral"}>
                        {ENQUIRY_STATUS_LABELS[enquiry.status] ?? enquiry.status}
                      </Tag>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Recent activity" description="Who changed what">
          {activity.length === 0 ? (
            <EmptyState title="No activity yet" description="Actions taken in the dashboard are logged here." />
          ) : (
            <ul className="divide-y divide-black/5">
              {activity.map((entry) => (
                <li key={entry.id} className="flex gap-2.5 px-4 py-2.5">
                  <span className="mt-1 size-1.5 shrink-0 rounded-full bg-[#c3a068]" />
                  <div className="min-w-0">
                    <p className="text-[0.7rem] leading-snug text-[#3f4552]">
                      <span className="font-medium text-[#14161a]">{entry.actorEmail?.split("@")[0] ?? "system"}</span>{" "}
                      {ACTION_LABELS[entry.action] ?? entry.action}
                    </p>
                    <p className="text-[0.6rem] text-[#8b919d]">{relativeTime(entry.createdAt)}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel
          title="Recently added products"
          actions={
            <Link href="/admin/products" className="text-[0.65rem] font-semibold text-[#0d1f3c] hover:underline">
              All products
            </Link>
          }
        >
          {recentProducts.length === 0 ? (
            <EmptyState title="No products yet" action={<ButtonLink href="/admin/products/new">Add product</ButtonLink>} />
          ) : (
            <ul className="divide-y divide-black/5">
              {recentProducts.map((product) => (
                <li key={product.id}>
                  <Link href={`/admin/products/${product.id}`} className="flex items-center justify-between gap-3 px-4 py-2.5 hover:bg-black/[0.02]">
                    <div className="min-w-0">
                      <p className="truncate text-[0.78rem] font-medium text-[#14161a]">{product.name}</p>
                      <p className="text-[0.62rem] text-[#8b919d]">
                        {product.categoryName} · {formatDate(product.createdAt)}
                      </p>
                    </div>
                    <span className="shrink-0 text-[0.72rem] font-medium text-[#0d1f3c]">{formatINR(product.pricePaise)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel
          title="Most viewed products"
          description="From live product view tracking"
          actions={
            <Link href="/admin/analytics" className="text-[0.65rem] font-semibold text-[#0d1f3c] hover:underline">
              Analytics
            </Link>
          }
        >
          {mostViewed.every((product) => product.viewCount === 0) ? (
            <EmptyState
              title="No product views yet"
              description="Product view counts start as visitors browse the catalogue."
              icon={Eye}
            />
          ) : (
            <ul className="divide-y divide-black/5">
              {mostViewed.map((product) => (
                <li key={product.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-[0.78rem] font-medium text-[#14161a]">{product.name}</p>
                    <p className="text-[0.62rem] text-[#8b919d]">{formatINR(product.pricePaise)}</p>
                  </div>
                  <Tag tone="gold">
                    <Eye className="size-2.5" /> {product.viewCount}
                  </Tag>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      {can(admin.role, "content.publish") && (
        <Panel title="Website health" description="Published state of each content area">
          <div className="grid gap-2 p-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Branding & settings", scope: "settings" },
              { label: "Homepage sections", scope: "homepage" },
              { label: "Navigation", scope: "navigation" },
              { label: "SEO", scope: "seo" },
            ].map((item) => (
              <Link
                key={item.scope}
                href={`/admin/versions?scope=${item.scope}`}
                className="flex items-center justify-between gap-2 rounded-lg border border-black/7 px-3 py-2.5 hover:border-[#0d1f3c]/30"
              >
                <span className="text-[0.7rem] text-[#3f4552]">{item.label}</span>
                <ArrowUpRight className="size-3.5 text-black/25" />
              </Link>
            ))}
          </div>
        </Panel>
      )}
    </div>
  );
}
