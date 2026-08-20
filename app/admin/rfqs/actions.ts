"use server";

import { PERMISSIONS, requirePermission } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function reviewRfq(formData: FormData) {
  const session = await requirePermission(PERMISSIONS.RFQ_APPROVE, "/admin/rfqs");
  const id = String(formData.get("id") || "");
  const decision = String(formData.get("decision") || "");
  const reviewNote = String(formData.get("reviewNote") || "").trim().slice(0, 1000) || null;

  if (!id || !["APPROVED", "REJECTED"].includes(decision)) return;

  await prisma.$executeRaw`
    UPDATE "Rfq"
    SET "status" = ${decision}::"RfqStatus",
        "approvedById" = ${session.user.id},
        "approvedAt" = NOW(),
        "reviewNote" = ${reviewNote},
        "updatedAt" = NOW()
    WHERE "id" = ${id} AND "status" IN ('SUBMITTED'::"RfqStatus", 'UNDER_REVIEW'::"RfqStatus")
  `;

  revalidatePath("/admin/rfqs");
}
