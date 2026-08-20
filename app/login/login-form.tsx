"use client";

import { signIn } from "next-auth/react";
import { FormEvent, useState } from "react";

export default function LoginForm({ callbackUrl }: { callbackUrl: string }) {
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setPending(true);

    const form = new FormData(event.currentTarget);
    const result = await signIn("credentials", {
      email: form.get("email"),
      password: form.get("password"),
      redirect: false,
    });

    if (result?.error) {
      setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง หรือบัญชียังไม่พร้อมใช้งาน");
      setPending(false);
      return;
    }

    window.location.assign(callbackUrl);
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "grid", gap: 15 }}>
      <label>
        อีเมล
        <input name="email" type="email" autoComplete="email" required />
      </label>
      <label>
        รหัสผ่าน
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          minLength={8}
          required
        />
      </label>
      {error ? <p role="alert" style={{ color: "#b42318" }}>{error}</p> : null}
      <button disabled={pending} className="btn orange" type="submit">
        {pending ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
      </button>
      <button
        type="button"
        className="btn"
        style={{ background: "white", color: "#333", border: "1px solid #dfe5eb" }}
        onClick={() => signIn("google", { redirectTo: callbackUrl })}
      >
        G&nbsp; เข้าสู่ระบบด้วย Google
      </button>
    </form>
  );
}
