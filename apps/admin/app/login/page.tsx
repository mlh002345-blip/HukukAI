"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "../../src/context/admin-auth-context";

export default function AdminLoginPage() {
  const router = useRouter();
  const { login } = useAdminAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login(email, password);
      router.replace("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Giriş yapılamadı.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <form
        onSubmit={onSubmit}
        style={{
          width: 320,
          display: "flex",
          flexDirection: "column",
          gap: 12,
          border: "1px solid #EAECF0",
          borderRadius: 16,
          padding: 24,
        }}
      >
        <h1 style={{ fontSize: 20, fontWeight: 700, color: "#101828", margin: 0 }}>
          HukukAI Yönetim Paneli
        </h1>
        <label style={{ fontSize: 13, color: "#344054" }}>
          E-posta
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            style={inputStyle}
          />
        </label>
        <label style={{ fontSize: 13, color: "#344054" }}>
          Parola
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            style={inputStyle}
          />
        </label>
        {error ? <p style={{ color: "#B42318", fontSize: 12 }}>{error}</p> : null}
        <button type="submit" disabled={isSubmitting} style={buttonStyle}>
          {isSubmitting ? "Giriş yapılıyor…" : "Giriş Yap"}
        </button>
      </form>
    </main>
  );
}

const inputStyle: React.CSSProperties = {
  display: "block",
  width: "100%",
  marginTop: 4,
  padding: "10px 12px",
  borderRadius: 8,
  border: "1px solid #D0D5DD",
  fontSize: 14,
  boxSizing: "border-box",
};

const buttonStyle: React.CSSProperties = {
  marginTop: 8,
  padding: "12px",
  borderRadius: 8,
  border: "none",
  background: "#175CD3",
  color: "#FFFFFF",
  fontWeight: 700,
  fontSize: 14,
  cursor: "pointer",
};
