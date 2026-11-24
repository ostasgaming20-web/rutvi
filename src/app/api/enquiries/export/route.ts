import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { customers, enquiries } from "@/lib/db/schema";
import { requireAdminApi } from "@/lib/admin";
import { can } from "@/lib/permissions";

export const runtime = "nodejs";

function escapeCsv(value: unknown) {
  const string = value === null || value === undefined ? "" : String(value);
  return `"${string.replace(/"/g, '""').replace(/\r?\n/g, " ")}"`;
}

export async function GET() {
  const admin = await requireAdminApi();
  if (!admin) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  if (!can(admin.role, "enquiries.view")) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const rows = await db
    .select({
      id: enquiries.id,
      status: enquiries.status,
      priority: enquiries.priority,
      type: enquiries.type,
      productName: enquiries.productName,
      quantity: enquiries.quantity,
      budgetPaise: enquiries.budgetPaise,
      message: enquiries.message,
      sourcePage: enquiries.sourcePage,
      createdAt: enquiries.createdAt,
      name: customers.name,
      company: customers.company,
      email: customers.email,
      phone: customers.phone,
      city: customers.city,
    })
    .from(enquiries)
    .innerJoin(customers, eq(enquiries.customerId, customers.id))
    .orderBy(desc(enquiries.createdAt));

  const header = [
    "Reference",
    "Date",
    "Status",
    "Priority",
    "Type",
    "Customer",
    "Company",
    "Email",
    "Phone",
    "City",
    "Product",
    "Quantity",
    "Budget (INR)",
    "Message",
    "Source page",
  ];

  const lines = [
    header.join(","),
    ...rows.map((row) =>
      [
        `RE-${row.id}`,
        row.createdAt?.toISOString() ?? "",
        row.status,
        row.priority,
        row.type,
        row.name,
        row.company,
        row.email,
        row.phone,
        row.city,
        row.productName,
        row.quantity,
        row.budgetPaise ? (row.budgetPaise / 100).toFixed(0) : "",
        row.message,
        row.sourcePage,
      ]
        .map(escapeCsv)
        .join(","),
    ),
  ];

  const filename = `rutvi-enquiries-${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse(lines.join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
