import { auth } from "@/auth";
import Footer from "@/components/footer";
import Header from "@/components/header";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import "./profile.css";

const roleLabels: Record<string, string> = {
  SUPER_ADMIN: "ผู้ดูแลระบบสูงสุด",
  CATEGORY_MANAGER: "ผู้จัดการหมวดหมู่",
  SALES_ADMIN: "ผู้ดูแลฝ่ายขาย",
  SUPPLIER: "ซัพพลายเออร์",
  CUSTOMER: "ลูกค้า",
  LOGISTICS_PARTNER: "พาร์ตเนอร์ขนส่ง",
};

export default async function CustomerProfilePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/customer/profile");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      email: true,
      phone: true,
      image: true,
      status: true,
      createdAt: true,
      roles: { select: { role: { select: { code: true } } } },
      _count: { select: { orders: true, addresses: true } },
    },
  });

  if (!user) {
    redirect("/login?callbackUrl=/customer/profile");
  }

  const initials = (user.name || user.email).trim().charAt(0).toUpperCase();
  const roles = user.roles.map(({ role }) => roleLabels[role.code] ?? role.code);

  return (
    <>
      <Header />
      <main className="container section profile-page">
        <div className="profile-heading">
          <div>
            <span className="eyebrow">MY BUILDMART ACCOUNT</span>
            <h1>Profile ของฉัน</h1>
            <p>ข้อมูลบัญชีและภาพรวมการใช้งานของคุณ</p>
          </div>
          <a className="btn" href="/customer/dashboard">ไปที่ Customer Dashboard</a>
        </div>

        <div className="profile-layout">
          <aside className="panel profile-summary">
            {user.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img className="profile-avatar" src={user.image} alt={user.name || "Profile"} />
            ) : (
              <div className="profile-avatar profile-initials">{initials}</div>
            )}
            <h2>{user.name || "สมาชิก BuildMart"}</h2>
            <p>{user.email}</p>
            <span className="status">บัญชีใช้งานได้</span>
          </aside>

          <section className="panel profile-details">
            <div className="profile-section-head">
              <div>
                <small>ข้อมูลส่วนตัว</small>
                <h2>รายละเอียดบัญชี</h2>
              </div>
              <span>สมัครเมื่อ {new Intl.DateTimeFormat("th-TH", { dateStyle: "medium" }).format(user.createdAt)}</span>
            </div>

            <dl className="profile-fields">
              <div><dt>ชื่อ-นามสกุล</dt><dd>{user.name || "ยังไม่ได้ระบุ"}</dd></div>
              <div><dt>อีเมล</dt><dd>{user.email}</dd></div>
              <div><dt>เบอร์โทรศัพท์</dt><dd>{user.phone || "ยังไม่ได้ระบุ"}</dd></div>
              <div><dt>สิทธิ์การใช้งาน</dt><dd>{roles.length ? roles.join(", ") : "สมาชิก"}</dd></div>
            </dl>

            <div className="profile-stats">
              <article><span>คำสั่งซื้อทั้งหมด</span><strong>{user._count.orders}</strong></article>
              <article><span>ที่อยู่จัดส่ง</span><strong>{user._count.addresses}</strong></article>
              <article><span>สถานะบัญชี</span><strong>{user.status === "ACTIVE" ? "Active" : user.status}</strong></article>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
