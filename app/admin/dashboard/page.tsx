import AdminToolbar from "@/components/admin-toolbar";
import { hasPermission, PERMISSIONS, requirePermission } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { createProduct, setProductVisibility, updateProduct } from "./actions";

const statusLabels: Record<string, string> = {
  DRAFT: "ฉบับร่าง", PENDING_APPROVAL: "รออนุมัติ", ACTIVE: "แสดงหน้าร้าน",
  INACTIVE: "ซ่อนจากหน้าร้าน", REJECTED: "ไม่อนุมัติ",
};

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const session = await requirePermission(PERMISSIONS.ADMIN_DASHBOARD_VIEW, "/admin/dashboard");
  const [canViewProducts, canManageProducts] = await Promise.all([
    hasPermission(session.user.id, session.user.roles, PERMISSIONS.PRODUCT_VIEW),
    hasPermission(session.user.id, session.user.roles, PERMISSIONS.PRODUCT_MANAGE),
  ]);

  const [products, categories, brands, suppliers, productCount, activeCount] = canViewProducts
    ? await Promise.all([
        prisma.product.findMany({ include: { category: true, brand: true, supplier: true, images: { orderBy: { sortOrder: "asc" }, take: 1 } }, orderBy: { updatedAt: "desc" } }),
        prisma.category.findMany({ orderBy: { name: "asc" } }),
        prisma.brand.findMany({ orderBy: { name: "asc" } }),
        prisma.supplier.findMany({ where: { status: "APPROVED" }, orderBy: { companyName: "asc" } }),
        prisma.product.count(),
        prisma.product.count({ where: { status: "ACTIVE" } }),
      ])
    : [[], [], [], [], 0, 0] as const;

  return (
    <main className="admin-page">
      <div className="container">
        <AdminToolbar />
        <header className="admin-page-head">
          <div><span className="eyebrow">BUILDMART MANAGEMENT</span><h1>Admin Dashboard</h1><p>จัดการข้อมูลส่วนกลางและควบคุมรายการที่แสดงบนหน้าร้าน</p></div>
          <a className="btn" href="/">เปิดหน้าร้าน</a>
        </header>

        <div className="kpi-grid admin-kpis">
          <article className="kpi"><span>สินค้าทั้งหมด</span><strong>{productCount}</strong><small>ข้อมูลจาก PostgreSQL</small></article>
          <article className="kpi"><span>แสดงบนหน้าร้าน</span><strong>{activeCount}</strong><small>สถานะ ACTIVE</small></article>
          <article className="kpi"><span>ซ่อน/รอตรวจสอบ</span><strong>{productCount-activeCount}</strong><small>ไม่แสดงต่อผู้ใช้งาน</small></article>
          <article className="kpi"><span>สิทธิ์ของบัญชี</span><strong>{canManageProducts ? "จัดการ" : canViewProducts ? "ดู" : "ไม่มี"}</strong><small>PRODUCT permission</small></article>
        </div>

        <section id="products" className="admin-product-section">
          <header className="admin-page-head"><div><span className="eyebrow">PRODUCT MANAGEMENT</span><h2>จัดการสินค้า</h2><p>สินค้าที่มีสถานะ “แสดงหน้าร้าน” จะปรากฏต่อผู้ใช้งานทันที</p></div><a className="btn orange" href="/products">ดูหน้าสินค้า</a></header>

          {!canViewProducts ? <div className="panel admin-empty">บัญชีนี้ไม่มีสิทธิ์ดูข้อมูลสินค้า</div> : null}

          {canViewProducts && canManageProducts ? (
            <form className="panel admin-product-form" action={createProduct}>
              <div className="form-title"><div><h3>เพิ่มสินค้าใหม่</h3><small>กรอกข้อมูลหลักและเลือกสถานะ ACTIVE เพื่อเผยแพร่ทันที</small></div><button className="btn" type="submit">บันทึกสินค้า</button></div>
              <div className="admin-form-grid">
                <label>ชื่อสินค้า<input name="name" required minLength={2}/></label>
                <label>Slug ภาษาอังกฤษ<input name="slug" required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" placeholder="portland-cement-50kg"/></label>
                <label>SKU<input name="sku" required/></label>
                <label>ราคา<input name="basePrice" required type="number" min="0" step="0.01"/></label>
                <label>หน่วย<input name="unit" required placeholder="ถุง / กล่อง / ชิ้น"/></label>
                <label>ขั้นต่ำ<input name="minOrderQty" required type="number" min="0.01" step="0.01" defaultValue="1"/></label>
                <label>หมวดหมู่<select name="categoryId" required defaultValue=""><option value="" disabled>เลือกหมวดหมู่</option>{categories.map((item)=><option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
                <label>แบรนด์<select name="brandId" defaultValue=""><option value="">ไม่ระบุแบรนด์</option>{brands.map((item)=><option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
                <label>ผู้จำหน่าย<select name="supplierId" required defaultValue=""><option value="" disabled>เลือกผู้จำหน่าย</option>{suppliers.map((item)=><option key={item.id} value={item.id}>{item.companyName}</option>)}</select></label>
                <label>สถานะ<select name="status" defaultValue="ACTIVE"><option value="ACTIVE">แสดงหน้าร้าน</option><option value="INACTIVE">ซ่อนจากหน้าร้าน</option><option value="DRAFT">ฉบับร่าง</option></select></label>
                <label className="wide">รูปสินค้า (URL หรือสัญลักษณ์)<input name="imageUrl" placeholder="https://... หรือ ▦"/></label>
                <label className="wide">รายละเอียด<textarea name="description" rows={3}/></label>
              </div>
            </form>
          ) : null}

          {canViewProducts ? <div className="admin-product-list">
            {products.map((product) => (
              <details className="panel admin-product-item" key={product.id}>
                <summary>
                  <span className="admin-product-thumb">{product.images[0]?.url || "▦"}</span>
                  <span><strong>{product.name}</strong><small>{product.sku} · {product.category.name} · {product.supplier.companyName}</small></span>
                  <span className={`status ${product.status === "ACTIVE" ? "" : "review"}`}>{statusLabels[product.status]}</span>
                  <b>฿{Number(product.basePrice).toLocaleString("th-TH")}/{product.unit}</b>
                </summary>
                <div className="admin-product-editor">
                  {canManageProducts ? <>
                    <form className="admin-form-grid" action={updateProduct}>
                      <input type="hidden" name="id" value={product.id}/>
                      <label>ชื่อสินค้า<input name="name" required defaultValue={product.name}/></label>
                      <label>Slug<input name="slug" required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" defaultValue={product.slug}/></label>
                      <label>SKU<input name="sku" required defaultValue={product.sku}/></label>
                      <label>ราคา<input name="basePrice" required type="number" min="0" step="0.01" defaultValue={Number(product.basePrice)}/></label>
                      <label>หน่วย<input name="unit" required defaultValue={product.unit}/></label>
                      <label>ขั้นต่ำ<input name="minOrderQty" required type="number" min="0.01" step="0.01" defaultValue={Number(product.minOrderQty)}/></label>
                      <label>หมวดหมู่<select name="categoryId" defaultValue={product.categoryId}>{categories.map((item)=><option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
                      <label>แบรนด์<select name="brandId" defaultValue={product.brandId || ""}><option value="">ไม่ระบุแบรนด์</option>{brands.map((item)=><option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
                      <label>ผู้จำหน่าย<select name="supplierId" defaultValue={product.supplierId}>{suppliers.map((item)=><option key={item.id} value={item.id}>{item.companyName}</option>)}</select></label>
                      <label>สถานะ<select name="status" defaultValue={product.status}>{Object.entries(statusLabels).map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label>
                      <label className="wide">รูปสินค้า (URL หรือสัญลักษณ์)<input name="imageUrl" defaultValue={product.images[0]?.url || ""}/></label>
                      <label className="wide">รายละเอียด<textarea name="description" rows={3} defaultValue={product.description || ""}/></label>
                      <div className="wide editor-actions"><button className="btn" type="submit">บันทึกการแก้ไข</button></div>
                    </form>
                    <form className="visibility-form" action={setProductVisibility}>
                      <input type="hidden" name="id" value={product.id}/>
                      <input type="hidden" name="status" value={product.status === "ACTIVE" ? "INACTIVE" : "ACTIVE"}/>
                      <button type="submit">{product.status === "ACTIVE" ? "ซ่อนสินค้าจากหน้าร้าน" : "เผยแพร่สินค้าบนหน้าร้าน"}</button>
                    </form>
                  </> : <p>บัญชีนี้มีสิทธิ์ดูข้อมูลเท่านั้น</p>}
                </div>
              </details>
            ))}
            {!products.length ? <div className="panel admin-empty">ยังไม่มีสินค้าในฐานข้อมูล</div> : null}
          </div> : null}
        </section>
      </div>
    </main>
  );
}
