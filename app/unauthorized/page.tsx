import Footer from "@/components/footer";
import Header from "@/components/header";

export default function UnauthorizedPage() {
  return (
    <>
      <Header />
      <main>
        <div className="form-card" style={{ maxWidth: 560, textAlign: "center" }}>
          <h1>ไม่มีสิทธิ์เข้าถึง</h1>
          <p>บัญชีนี้ไม่มีสิทธิ์ใช้งานส่วนผู้ดูแลระบบ</p>
          <a className="btn orange" href="/">กลับหน้าตลาดสินค้า</a>
        </div>
      </main>
      <Footer />
    </>
  );
}
