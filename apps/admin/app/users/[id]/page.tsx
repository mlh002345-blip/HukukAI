"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import type { AdminUserDetail } from "@hukukai/types";
import { RequireAdmin } from "../../../src/components/RequireAdmin";
import { useAdminAuth } from "../../../src/context/admin-auth-context";
import { apiRequest } from "../../../src/lib/api-client";

function UserDetailContent() {
  const { accessToken } = useAdminAuth();
  const params = useParams<{ id: string }>();
  const [user, setUser] = useState<AdminUserDetail | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const load = () => {
    apiRequest<AdminUserDetail>(`/admin/users/${params.id}`, { accessToken }).then(
      setUser,
    );
  };

  useEffect(load, [accessToken, params.id]);

  const onToggleActive = async () => {
    if (!user) return;
    setIsSubmitting(true);
    try {
      const path = user.isActive
        ? `/admin/users/${user.id}/freeze`
        : `/admin/users/${user.id}/unfreeze`;
      const updated = await apiRequest<AdminUserDetail>(path, {
        method: "POST",
        accessToken,
      });
      setUser(updated);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) return <p style={{ color: "#667085" }}>Yükleniyor…</p>;

  const rows: Array<[string, string | number]> = [
    ["E-posta", user.email],
    ["Ad Soyad", user.fullName],
    ["Rol", user.role],
    ["Paket", user.subscriptionPlan],
    ["Durum", user.isActive ? "Aktif" : "Donduruldu"],
    ["Kayıt Tarihi", new Date(user.createdAt).toLocaleDateString("tr-TR")],
    ["Belge Sayısı", user.documentCount],
    ["Süre Sayısı", user.deadlineCount],
    ["Hesaplama Sayısı", user.calculationCount],
  ];

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: "#101828" }}>{user.fullName}</h1>
      <div
        style={{
          marginTop: 16,
          border: "1px solid #EAECF0",
          borderRadius: 12,
          padding: 16,
          display: "flex",
          flexDirection: "column",
          gap: 8,
          maxWidth: 480,
        }}
      >
        {rows.map(([label, value]) => (
          <div key={label} style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "#667085", fontSize: 13 }}>{label}</span>
            <span style={{ fontWeight: 600, fontSize: 13, color: "#101828" }}>
              {value}
            </span>
          </div>
        ))}
      </div>
      <button
        onClick={onToggleActive}
        disabled={isSubmitting}
        style={{
          marginTop: 16,
          padding: "10px 16px",
          borderRadius: 8,
          border: "1px solid " + (user.isActive ? "#B42318" : "#175CD3"),
          background: "#FFFFFF",
          color: user.isActive ? "#B42318" : "#175CD3",
          fontWeight: 700,
          fontSize: 13,
          cursor: "pointer",
        }}
      >
        {user.isActive ? "Hesabı Dondur" : "Hesabı Aktifleştir"}
      </button>
    </div>
  );
}

export default function UserDetailPage() {
  return (
    <RequireAdmin>
      <UserDetailContent />
    </RequireAdmin>
  );
}
