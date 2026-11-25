import Link from "next/link";
import { Activity, Download, Eye, MousePointerClick, ShoppingBag, Users } from "lucide-react";
import { requireCapability } from "@/lib/admin";
import { getAnalytics } from "@/lib/analytics";
import { getVisitorSeries } from "@/lib/analytics";
import { PageHeader, Panel, StatCard, Tag, EmptyState, Th, Td, TableWrap, ButtonLink } from "@/components/admin/ui";
import { AreaTrend, Donut } from "@/components/admin/charts";

export const dynamic = "force-dynamic";

const RANGES = [
  { days: 7, label: "7 days" },
  { days: 30, label: "30 days" },
  { days: 90, label: "90 days" },
];

export default async function AdminAnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireCapability("analytics.view");
  const params = await searchParams;
  const days = [7, 30, 90].includes(Number(params.days)) ? Number(params.days) : 30;

  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - days + 1);
  from.setHours(0, 0, 0, 0);

  const [analytics, spark] = await Promise.all([getAnalytics({ from, to }), getVisitorSeries(Math.min(days, 30))]);

  const sourceData = analytics.sources.map((row) => ({ name: row.source, visitors: Number(row.visitors) }));
  const deviceData = analytics.devices.map((row) => ({ name: row.device, visitors: Number(row.visitors) }));
  const hasData = analytics.events > 0;

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Command centre"
        title="Analytics & Reports"
        description="First-party, cookie-light analytics collected on this website. No third-party trackers are used."
        actions={
          <>
            <ButtonLink href={`/api/analytics/export?days=${days}`} variant="ghost" target="_blank">
              <Download className="size-3.5" /> Export report
            </ButtonLink>
            <div className="inline-flex items-center gap-0.5 rounded-lg border border-black/10 bg-white p-0.5">
              {RANGES.map((range) => (
                <Link
                  key={range.days}
                  href={`/admin/analytics?days=${range.days}`}
                  className={`rounded-md px-2.5 py-1.5 text-[0.66rem] font-semibold ${
                    days === range.days ? "bg-[#0d1f3c] text-white" : "text-[#6b7280] hover:bg-black/5"
                  }`}
                >
                  {range.label}
                </Link>
              ))}
            </div>
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Unique visitors" value={analytics.visitors} icon={Users} tone="blue" />
        <StatCard label="Page views" value={analytics.pageViews} icon={Eye} tone="neutral" />
        <StatCard label="Product views" value={analytics.productViews} icon={ShoppingBag} tone="gold" />
        <StatCard label="Enquiries" value={analytics.enquiries} icon={MousePointerClick} tone="green" />
        <StatCard label="Conversion rate" value={`${analytics.conversionRate}%`} note="Enquiries ÷ visitors" icon={Activity} tone="blue" />
      </div>

      {!hasData ? (
        <Panel>
          <EmptyState
            title="No analytics data yet"
            description="Once visitors browse the live website, first-party page and product views will appear here. Admin pages and API routes are never tracked."
            icon={Activity}
          />
        </Panel>
      ) : (
        <>
          <Panel title="Traffic trend" description="Visitors, page views and product views" actions={<Tag tone="blue">{RANGES.find((range) => range.days === days)?.label}</Tag>}>
            <div className="p-3">
              <AreaTrend
                data={analytics.series as unknown as Record<string, unknown>[]}
                series={[
                  { key: "visitors", label: "Visitors", color: "#0d1f3c" },
                  { key: "views", label: "Page views", color: "#c3a068" },
                  { key: "productViews", label: "Product views", color: "#4f6b8f" },
                ]}
                height={280}
              />
            </div>
          </Panel>

          <div className="grid gap-4 lg:grid-cols-2">
            <Panel title="Traffic sources" description="Where visitors come from">
              <div className="p-3">
                <Donut data={sourceData} nameKey="name" valueKey="visitors" />
              </div>
            </Panel>
            <Panel title="Devices" description="Desktop, tablet and mobile split">
              <div className="p-3">
                <Donut data={deviceData} nameKey="name" valueKey="visitors" />
              </div>
            </Panel>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Panel title="Top pages" description="Most viewed paths">
              <TableWrap>
                <table className="w-full">
                  <thead><tr><Th>Path</Th><Th className="text-right">Views</Th></tr></thead>
                  <tbody>
                    {analytics.topPages.map((row) => (
                      <tr key={row.path} className="hover:bg-black/[0.015]">
                        <Td><span className="font-mono text-[0.68rem]">{row.path}</span></Td>
                        <Td className="text-right font-medium">{Number(row.views)}</Td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </TableWrap>
            </Panel>

            <Panel title="Top products" description="Most viewed catalogue items">
              <TableWrap>
                <table className="w-full">
                  <thead><tr><Th>Product</Th><Th className="text-right">Views</Th></tr></thead>
                  <tbody>
                    {analytics.topProducts.map((row) => (
                      <tr key={String(row.productId)} className="hover:bg-black/[0.015]">
                        <Td>
                          {row.slug ? (
                            <Link href={`/products/${row.slug}`} target="_blank" className="text-[0.72rem] font-medium text-[#14161a] hover:text-[#0d1f3c]">
                              {row.name ?? `Product #${row.productId}`}
                            </Link>
                          ) : (
                            <span className="text-[0.72rem] text-[#8b919d]">Removed product</span>
                          )}
                        </Td>
                        <Td className="text-right font-medium">{Number(row.views)}</Td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </TableWrap>
            </Panel>
          </div>

          <Panel title="Recent visitor sparkline" description="Last 30 days">
            <div className="flex items-end gap-2 p-4">
              <div className="flex-1">
                <AreaTrend
                  data={spark as unknown as Record<string, unknown>[]}
                  series={[{ key: "visitors", label: "Visitors", color: "#0d1f3c" }]}
                  height={90}
                />
              </div>
            </div>
          </Panel>
        </>
      )}
    </div>
  );
}
