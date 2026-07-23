"use client";

import { useEffect, useState } from "react";
import type { AdminDashboardSummary } from "@hukukai/types";
import { RequireAdmin } from "../src/components/RequireAdmin";
import { useAdminAuth } from "../src/context/admin-auth-context";
import { apiRequest } from "../src/lib/api-client";

function DashboardContent() {
  const { accessToken } = useAdminAuth();
  const [summary, setSummary] = useState<AdminDashboardSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiRequest<AdminDashboardSummary>("/admin/dashboard", { accessToken })
      .then(setSummary)
      .catch((err) => setError(err instanceof Error ? err.message : "Yüklenemedi."));
  }, [accessToken]);

  if (error) return <p style={{ color: "#B42318" }}>{error}</p>;
  if (!summary) return <p style={{ color: "#667085" }}>Yükleniyor…</p>;

  const cards = [
    { label: "Toplam Kullanıcı", value: summary.totalUsers },
    { label: "Aktif Kullanıcı", value: summary.activeUsers },
    { label: "Başarısız Belge Analizi", value: summary.failedDocumentsCount },
    { label: "Yayınlanmamış Kural Seti", value: summary.unpublishedRuleSetsCount },
    { label: "Bu Ayki AI Maliyeti (USD)", value: summary.monthlyAiCostUsd },
  ];

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: "#101828" }}>Yönetim Paneli</h1>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: 16,
          marginTop: 16,
        }}
      >
        {cards.map((card) => (
          <div
            key={card.label}
            style={{
              border: "1px solid #EAECF0",
              borderRadius: 12,
              padding: 16,
            }}
          >
            <p style={{ fontSize: 12, color: "#667085", margin: 0 }}>{card.label}</p>
            <p style={{ fontSize: 24, fontWeight: 700, color: "#101828", margin: "4px 0 0" }}>
              {card.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminHomePage() {
  return (
    <RequireAdmin>
      <DashboardContent />
    </RequireAdmin>
  );
}
