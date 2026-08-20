import { auth } from "@/auth";
import Footer from "@/components/footer";
import Header from "@/components/header";
import { redirect } from "next/navigation";
import { createRfq } from "./actions";

export default async function Quotation({ searchParams }: { searchParams: Promise<{ submitted?: string; error?: string }> }) {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/quotation");
  const { submitted, error } = await searchParams;

  return <><Header/><main><div className="form-card"><span className="eyebrow" style={{color:"#0b4ea2"}}>REQUEST FOR QUOTATION</span><h1>ขอใบเสนอราคางานโครงการ</h1><p>ส่งรายการวัสดุหรือ BOQ เพื่อให้ทีมงานตรวจสอบและอนุมัติก่อนส่งต่อให้ซัพพลายเออร์</p>{submitted ? <p className="status" role="status">ส่งคำขอ {submitted} สำเร็จแล้ว · อยู่ระหว่างรอตรวจสอบ</p> : null}{error ? <p role="alert" style={{color:"#b42318"}}>กรุณาตรวจสอบข้อมูลให้ครบถ้วนและลองอีกครั้ง</p> : null}<form className="form-grid" action={createRfq} encType="multipart/form-data"><label>ชื่อโครงการ<input name="projectName" required minLength={2}/></label><label>ประเภทลูกค้า<select name="customerType" defaultValue="CONTRACTOR"><option value="CONTRACTOR">ผู้รับเหมา</option><option value="HOMEOWNER">เจ้าของบ้าน</option><option value="CONSTRUCTION_COMPANY">บริษัทก่อสร้าง</option><option value="DEVELOPER">ผู้พัฒนาโครงการ</option></select></label><label>จังหวัดหน้างาน<input name="province" required/></label><label>วันที่ต้องการจัดส่ง<input name="deliveryDate" type="date"/></label><label style={{gridColumn:"1/-1"}}>รายละเอียดวัสดุ<textarea name="description" rows={5} required minLength={10}/></label><label style={{gridColumn:"1/-1"}}>แนบชื่อไฟล์ BOQ<input name="boq" type="file" accept=".pdf,.xlsx,.xls"/><small>Phase 1 บันทึกชื่อไฟล์เพื่ออ้างอิง การจัดเก็บไฟล์จริงจะเชื่อม Object Storage ในขั้นถัดไป</small></label><button className="btn orange" type="submit">ส่งคำขอใบเสนอราคา</button></form></div></main><Footer/></>;
}
