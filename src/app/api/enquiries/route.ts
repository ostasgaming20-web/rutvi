import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { customers, enquiries, products, uploadedFiles } from "@/lib/db/schema";
import { enquirySchema, budgetToPaise, parseCustomization, sanitize } from "@/lib/validation";
import { rateLimit } from "@/lib/rate-limit";
import { saveUpload } from "@/lib/uploads";
import { sendEnquiryNotifications } from "@/lib/email";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "anonymous";
  const limit = rateLimit(`enquiry:${ip}`);
  if (!limit.ok) {
    return NextResponse.json(
      { message: "Too many enquiries from this connection. Please try again in a few minutes." },
      { status: 429 },
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ message: "Invalid form submission." }, { status: 400 });
  }

  const raw = {
    name: formData.get("name"),
    company: formData.get("company"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    productId: formData.get("productId") || undefined,
    productName: formData.get("productName"),
    quantity: formData.get("quantity") || undefined,
    budget: formData.get("budget"),
    message: formData.get("message"),
    customization: formData.get("customization"),
    type: formData.get("type") || "quote",
    sourcePage: formData.get("sourcePage"),
    website: formData.get("website"),
  };

  const parsed = enquirySchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return NextResponse.json(
      { message: "Please check the highlighted fields.", fieldErrors },
      { status: 422 },
    );
  }

  const input = parsed.data;
  const reference = `RE-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

  if (input.website) {
    return NextResponse.json({ ok: true, reference });
  }

  let productId: number | null = null;
  let productName: string | null = sanitize(input.productName);
  if (input.productId) {
    const [product] = await db
      .select({ id: products.id, name: products.name })
      .from(products)
      .where(eq(products.id, input.productId))
      .limit(1);
    if (product) {
      productId = product.id;
      productName = product.name;
    }
  }

  const file = formData.get("logo");
  let upload: Awaited<ReturnType<typeof saveUpload>> | null = null;
  if (file instanceof File && file.size > 0) {
    try {
      upload = await saveUpload(file);
    } catch (error) {
      return NextResponse.json(
        { message: error instanceof Error ? error.message : "The file could not be uploaded.", fieldErrors: { logo: "Upload failed." } },
        { status: 422 },
      );
    }
  }

  try {
    const [customer] = await db
      .insert(customers)
      .values({
        name: sanitize(input.name) ?? input.name,
        company: sanitize(input.company),
        email: input.email,
        phone: sanitize(input.phone) ?? input.phone,
      })
      .onConflictDoUpdate({
        target: customers.email,
        set: {
          name: sanitize(input.name) ?? input.name,
          company: sanitize(input.company),
          phone: sanitize(input.phone) ?? input.phone,
        },
      })
      .returning({ id: customers.id });

    const customization = {
      ...parseCustomization(input.customization),
      budget: input.budget ?? null,
      hasArtwork: Boolean(upload),
    };

    const [enquiry] = await db
      .insert(enquiries)
      .values({
        customerId: customer.id,
        type: input.type,
        status: "new",
        productId,
        productName,
        quantity: input.quantity ?? null,
        budgetPaise: budgetToPaise(input.budget),
        customization,
        message: sanitize(input.message),
        sourcePage: sanitize(input.sourcePage),
      })
      .returning({ id: enquiries.id });

    if (upload) {
      await db.insert(uploadedFiles).values({
        enquiryId: enquiry.id,
        fileName: upload.fileName,
        mimeType: upload.mimeType,
        sizeBytes: upload.sizeBytes,
        url: upload.url,
      });
    }

    const finalReference = `RE-${new Date().getFullYear()}-${String(enquiry.id).padStart(4, "0")}`;

    await sendEnquiryNotifications({
      reference: finalReference,
      name: input.name,
      company: input.company,
      email: input.email,
      phone: input.phone,
      productName,
      quantity: input.quantity ?? null,
      budget: budgetToPaise(input.budget),
      message: input.message,
      customization,
      type: input.type,
    });

    return NextResponse.json({ ok: true, reference: finalReference, id: enquiry.id });
  } catch (error) {
    console.error("[enquiries] failed to save", error);
    return NextResponse.json(
      { message: "We could not save your enquiry. Please call us on +91 98699 94699." },
      { status: 500 },
    );
  }
}
