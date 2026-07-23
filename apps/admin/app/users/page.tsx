"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { AdminUserSummary } from "@hukukai/types";
import { RequireAdmin } from "../../src/components/RequireAdmin";
import { useAdminAuth } from "../../src/context/admin-auth-context";
import { apiRequest } from "../../src/lib/api-client";
import { tableCellStyle, tableStyle } from "../../src/lib/table-styles";

function UsersContent() {
  const { accessToken } = useAdminAuth();
  const [users, setUsers] = useState<AdminUserSummary[] | null>(null);
  const [query, setQuery] = useState("");

  const load = (search: string) => {
    apiRequest<AdminUserSummary[]>("/admin/users", {
      accessToken,
      query: { query: search || undefined },
    }).then(setUsers);
  };

  useEffect(() => {
    load("");
  }, [accessToken]);

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: "#101828" }}>Kullanıcılar</h1>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          load(query);
        }}
        style={{ margin: "16px 0" }}
      >
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="E-posta veya isim ara"
          style={{
            padding: "8px 12px",
            borderRadius: 8,
            border: "1px solid #D0D5DD",
            fontSize: 14,
            width: 280,
          }}
        />
      </form>
      {!users ? (
        <p style={{ color: "#667085" }}>Yükleniyor…</p>
      ) : (
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={tableCellStyle}>E-posta</th>
              <th style={tableCellStyle}>Ad Soyad</th>
              <th style={tableCellStyle}>Rol</th>
              <th style={tableCellStyle}>Paket</th>
              <th style={tableCellStyle}>Durum</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td style={tableCellStyle}>
                  <Link href={`/users/${user.id}`} style={{ color: "#175CD3" }}>
                    {user.email}
                  </Link>
                </td>
                <td style={tableCellStyle}>{user.fullName}</td>
                <td style={tableCellStyle}>{user.role}</td>
                <td style={tableCellStyle}>{user.subscriptionPlan}</td>
                <td style={tableCellStyle}>{user.isActive ? "Aktif" : "Donduruldu"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default function UsersPage() {
  return (
    <RequireAdmin>
      <UsersContent />
    </RequireAdmin>
  );
}
