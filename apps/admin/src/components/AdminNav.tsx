"use client";

import Link from "next/link";
import { useAdminAuth } from "../context/admin-auth-context";

const NAV_ITEMS = [
  { href: "/", label: "Panel" },
  { href: "/users", label: "Kullanıcılar" },
  { href: "/document-errors", label: "Belge Hataları" },
  { href: "/rule-sets", label: "Kural Setleri" },
  { href: "/legislation", label: "Mevzuat İzleme" },
  { href: "/holidays", label: "Resmi Tatiller" },
  { href: "/ai-usage", label: "AI Maliyeti" },
  { href: "/audit-logs", label: "Audit Log" },
];

export function AdminNav() {
  const { user, logout } = useAdminAuth();

  return (
    <nav
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 24px",
        borderBottom: "1px solid #EAECF0",
      }}
    >
      <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
        <strong style={{ color: "#175CD3" }}>HukukAI Admin</strong>
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            style={{ fontSize: 13, color: "#344054", textDecoration: "none" }}
          >
            {item.label}
          </Link>
        ))}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ fontSize: 12, color: "#667085" }}>{user?.email}</span>
        <button
          onClick={logout}
          style={{
            fontSize: 12,
            border: "1px solid #D0D5DD",
            borderRadius: 8,
            padding: "6px 10px",
            background: "#FFFFFF",
            cursor: "pointer",
          }}
        >
          Çıkış Yap
        </button>
      </div>
    </nav>
  );
}
