import AdminToolbar from "@/components/admin-toolbar";
import { hasPermission, PERMISSIONS, requirePermission } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { reviewRfq } from "./actions";

type RfqRow = {
  id: string; rfqNumber: string; projectName: string; customerType: string; province: string;
  description: string; boqFileName: string | null; status: string; reviewNote: string | null;
  createdAt: Date; customerName: string | null; customerEmail: string;
};

const statusLabels: Record<string, string> = {
  SUBMITTED: "รอตรวจสอบ", UNDER_REVIEW: "กำลังตรวจสอบ", APPROVED: "อนุมัติแล้ว",
  REJECTED: "ไม่อนุมัติ", QUOTING: "กำลังเสนอราคา", CANCELLED: "ยกเลิก",
};

export default async function RfqApprovalPage() {
  const session = await requirePermission(PERMISSIONS.RFQ_VIEW, "/admin/rfqs");
  const canApprove = await hasPermission(session.user.id, session.user.roles, PERMISSIONS.RFQ_APPROVE);
  const rfqs = await prisma.$queryRaw<RfqRow[]>`
    SELECT r."id", r."rfqNumber", r."projectName", r."customerType", r."province",
      r."description", r."boqFileName", r."status"::text AS "status", r."reviewNote",
      r."createdAt", u."name" AS "customerName", u."email" AS "customerEmail"
    FROM "Rfq" r
    INNER JOIN "User" u ON u."id" = r."customerId"
    ORDER BY CASE r."status"::text WHEN 'SUBMITTED' THEN 1 WHEN 'UNDER_REVIEW' THEN 2 ELSE 3 END,
      r."createdAt" DESC
  `;

  return (
    <main className="admin-page"><div className="container"><AdminToolbar/><header className="admin-page-head"><div><span className="eyebrow">RFQ APPROVAL</span><h1>จัดการคำขออนุมัติใบเสนอราคา</h1><p>ตรวจสอบรายละเอียดคำขอ ก่อนอนุมัติส่งต่อให้ซัพพลายเออร์เสนอราคา</p></div><span className="status">ทั้งหมด {rfqs.length} รายการ</span></header><section className="panel rfq-table-wrap"><table className="table"><thead><tr><th>เลขที่คำขอ</th><th>โครงการ/ลูกค้า</th><th>รายละเอียด</th><th>สถานะ</th><th>การอนุมัติ</th></tr></thead><tbody>{rfqs.length ? rfqs.map((rfq) => { const pending = ["SUBMITTED", "UNDER_REVIEW"].includes(rfq.status); return <tr key={rfq.id}><td><strong>{rfq.rfqNumber}</strong><br/><small>{new Intl.DateTimeFormat("th-TH", {dateStyle:"medium"}).format(rfq.createdAt)}</small></td><td><strong>{rfq.projectName}</strong><br/><small>{rfq.customerName || rfq.customerEmail}<br/>{rfq.province} · {rfq.customerType}</small></td><td>{rfq.description}<br/>{rfq.boqFileName ? <small>BOQ: {rfq.boqFileName}</small> : null}</td><td><span className={`status ${rfq.status === "REJECTED" ? "rejected" : pending ? "review" : ""}`}>{statusLabels[rfq.status] || rfq.status}</span>{rfq.reviewNote ? <><br/><small>{rfq.reviewNote}</small></> : null}</td><td>{pending && canApprove ? <form className="rfq-actions" action={reviewRfq}><input type="hidden" name="id" value={rfq.id}/><textarea name="reviewNote" placeholder="หมายเหตุการพิจารณา"/><div className="rfq-action-buttons"><button className="btn approve" name="decision" value="APPROVED">อนุมัติ</button><button className="btn reject" name="decision" value="REJECTED">ไม่อนุมัติ</button></div></form> : <small>{canApprove ? "ดำเนินการแล้ว" : "มีสิทธิ์ดูเท่านั้น"}</small>}</td></tr>; }) : <tr><td colSpan={5} style={{textAlign:"center",padding:30}}>ยังไม่มีคำขอใบเสนอราคา</td></tr>}</tbody></table></section></div></main>
  );
}
