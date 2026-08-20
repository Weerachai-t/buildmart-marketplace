type Kind = "customer" | "supplier" | "admin";

const config = {
  customer: {
    title: "Customer Dashboard",
    nav: [["ภาพรวม", "/customer/dashboard"], ["Profile", "/customer/profile"], ["คำสั่งซื้อของฉัน", "#orders"], ["ใบเสนอราคา", "/quotation"], ["สินค้าที่บันทึก", "#saved"], ["ที่อยู่", "#addresses"], ["ประวัติการชำระเงิน", "#payments"]],
    kpis: [["คำสั่งซื้อ", "8"], ["กำลังจัดส่ง", "2"], ["ใบเสนอราคา", "3"], ["ยอดซื้อสะสม", "฿128,450"]],
  },
  supplier: {
    title: "Supplier Dashboard",
    nav: [["ภาพรวม", "/supplier/dashboard"], ["สินค้า", "#products"], ["คลังสินค้า", "#inventory"], ["คำสั่งซื้อ", "#orders"], ["ลูกค้า", "#customers"], ["รายงาน", "#reports"], ["ตั้งค่าร้านค้า", "#settings"]],
    kpis: [["ยอดขายเดือนนี้", "฿485,200"], ["คำสั่งซื้อใหม่", "28"], ["สินค้า Active", "126"], ["สินค้าใกล้หมด", "7"]],
  },
  admin: {
    title: "Admin Dashboard",
    nav: [["Overview", "/admin/dashboard"], ["คำขอใบเสนอราคา", "/admin/rfqs"], ["จัดการสิทธิ์", "/admin/permissions"], ["Orders", "#orders"], ["Suppliers", "#suppliers"], ["Products", "#products"], ["Categories", "#categories"], ["Customers", "#customers"], ["System Settings", "#settings"]],
    kpis: [["GMV เดือนนี้", "฿4.82M"], ["คำสั่งซื้อ", "1,284"], ["Supplier Active", "92"], ["ลูกค้าทั้งหมด", "8,460"]],
  },
} satisfies Record<Kind, { title: string; nav: string[][]; kpis: string[][] }>;

export default function Dashboard({ kind }: { kind: Kind }) {
  const current = config[kind];
  return <main className="dashboard-shell"><aside className="sidebar"><a className="logo" href="/"><i>B</i><span>BUILDMART<small>{kind.toUpperCase()}</small></span></a><nav>{current.nav.map(([label, href], index) => <a className={index === 0 ? "active" : ""} href={href} key={label}>{label}</a>)}</nav></aside><section className="dash-main"><header className="dash-head"><div><small>BUILDMART MANAGEMENT</small><h1>{current.title}</h1></div><a className="btn" href="/">กลับหน้าร้าน</a></header><div className="kpi-grid">{current.kpis.map(([label, value]) => <article className="kpi" key={label}><span>{label}</span><strong>{value}</strong><small>อัปเดตล่าสุดวันนี้</small></article>)}</div><section><h2>{kind === "supplier" ? "คำสั่งซื้อใหม่" : kind === "admin" ? "ธุรกรรมล่าสุด" : "คำสั่งซื้อล่าสุด"}</h2><table className="table"><thead><tr><th>เลขที่</th><th>รายการ/ลูกค้า</th><th>ยอดรวม</th><th>สถานะ</th><th>วันที่</th></tr></thead><tbody>{[["BM-260801", "ปูนซีเมนต์และเหล็ก", "฿24,850", "ยืนยันแล้ว", "20 ส.ค. 2026"], ["BM-260802", "วัสดุงานหลังคา", "฿18,290", "กำลังจัดส่ง", "20 ส.ค. 2026"], ["BM-260803", "สีและกระเบื้อง", "฿9,450", "รอชำระเงิน", "19 ส.ค. 2026"]].map((row) => <tr key={row[0]}>{row.map((value, index) => <td key={index}>{index === 3 ? <span className="status">{value}</span> : value}</td>)}</tr>)}</tbody></table></section></section></main>;
}
