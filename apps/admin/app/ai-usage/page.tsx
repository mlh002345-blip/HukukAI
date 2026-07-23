"use client";

import { useEffect, useState } from "react";
import type { AiUsageSummary } from "@hukukai/types";
import { RequireAdmin } from "../../src/components/RequireAdmin";
import { useAdminAuth } from "../../src/context/admin-auth-context";
import { apiRequest } from "../../src/lib/api-client";
import { tableCellStyle, tableStyle } from "../../src/lib/table-styles";

function AiUsageContent() {
  const { accessToken } = useAdminAuth();
  const [usage, setUsage] = useState<AiUsageSummary[] | null>(null);

  useEffect(() => {
    apiRequest<AiUsageSummary[]>("/admin/ai-usage", { accessToken }).then(setUsage);
  }, [accessToken]);

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: "#101828" }}>AI Maliyet Takibi</h1>
      {!usage ? (
        <p style={{ color: "#667085" }}>Yükleniyor…</p>
      ) : (
        <table style={{ ...tableStyle, marginTop: 16 }}>
          <thead>
            <tr>
              <th style={tableCellStyle}>Sağlayıcı</th>
              <th style={tableCellStyle}>Model</th>
              <th style={tableCellStyle}>Analiz Sayısı</th>
              <th style={tableCellStyle}>Girdi Token</th>
              <th style={tableCellStyle}>Çıktı Token</th>
              <th style={tableCellStyle}>Toplam Maliyet (USD)</th>
            </tr>
          </thead>
          <tbody>
            {usage.map((row) => (
              <tr key={`${row.provider}-${row.model}`}>
                <td style={tableCellStyle}>{row.provider}</td>
                <td style={tableCellStyle}>{row.model}</td>
                <td style={tableCellStyle}>{row.analysisCount}</td>
                <td style={tableCellStyle}>{row.totalInputTokens}</td>
                <td style={tableCellStyle}>{row.totalOutputTokens}</td>
                <td style={tableCellStyle}>{row.totalEstimatedCostUsd}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default function AiUsagePage() {
  return (
    <RequireAdmin>
      <AiUsageContent />
    </RequireAdmin>
  );
}
