"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import { z } from "zod";

const rfqSchema = z.object({
  projectName: z.string().trim().min(2).max(160),
  customerType: z.enum(["CONTRACTOR", "HOMEOWNER", "CONSTRUCTION_COMPANY", "DEVELOPER"]),
  province: z.string().trim().min(2).max(100),
  deliveryDate: z.string().optional(),
  description: z.string().trim().min(10).max(5000),
});

export async function createRfq(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/quotation");

  const parsed = rfqSchema.safeParse({
    projectName: formData.get("projectName"),
    customerType: formData.get("customerType"),
    province: formData.get("province"),
    deliveryDate: formData.get("deliveryDate") || undefined,
    description: formData.get("description"),
  });

  if (!parsed.success) redirect("/quotation?error=invalid");

  const boq = formData.get("boq");
  const boqFileName = boq instanceof File && boq.size > 0 ? boq.name.slice(0, 255) : null;
  const rfqNumber = `RFQ-${Date.now()}`;
  const deliveryDate = parsed.data.deliveryDate ? new Date(`${parsed.data.deliveryDate}T00:00:00.000Z`) : null;

  await prisma.$executeRaw`
    INSERT INTO "Rfq" (
      "id", "rfqNumber", "customerId", "projectName", "customerType", "province",
      "deliveryDate", "description", "boqFileName", "status", "createdAt", "updatedAt"
    ) VALUES (
      ${randomUUID()}, ${rfqNumber}, ${session.user.id}, ${parsed.data.projectName},
      ${parsed.data.customerType}, ${parsed.data.province}, ${deliveryDate},
      ${parsed.data.description}, ${boqFileName}, 'SUBMITTED'::"RfqStatus", NOW(), NOW()
    )
  `;

  redirect(`/quotation?submitted=${encodeURIComponent(rfqNumber)}`);
}
