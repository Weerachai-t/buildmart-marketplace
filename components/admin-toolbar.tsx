export default function AdminToolbar() {
  return (
    <nav className="admin-toolbar" aria-label="เมนูผู้ดูแลระบบ">
      <a href="/admin/dashboard">ภาพรวม</a>
      <a href="/admin/dashboard#products">จัดการสินค้า</a>
      <a href="/admin/rfqs">คำขอใบเสนอราคา</a>
      <a href="/admin/permissions">จัดการสิทธิ์</a>
      <a href="/">กลับหน้าร้าน</a>
    </nav>
  );
}
