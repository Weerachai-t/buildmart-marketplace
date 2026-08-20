import Footer from "@/components/footer";
import Header from "@/components/header";
import LoginForm from "./login-form";

export default async function Login({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { callbackUrl } = await searchParams;
  const safeCallbackUrl =
    callbackUrl?.startsWith("/") && !callbackUrl.startsWith("//")
      ? callbackUrl
      : "/customer/profile";

  return (
    <>
      <Header />
      <main>
        <div className="form-card" style={{ maxWidth: 460 }}>
          <h1>เข้าสู่ระบบ</h1>
          <LoginForm callbackUrl={safeCallbackUrl} />
          <p style={{ fontSize: 11, textAlign: "center" }}>
            ยังไม่มีบัญชี? <a href="/supplier/register">สมัครสมาชิก</a>
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
