"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { LegislationChangeSummary } from "@hukukai/types";
import { RequireAdmin } from "../../src/components/RequireAdmin";
import { useAdminAuth } from "../../src/context/admin-auth-context";
import { apiRequest } from "../../src/lib/api-client";
import { tableCellStyle, tableStyle } from "../../src/lib/table-styles";
import { statusBadgeStyle } from "../../src/lib/status-badge";

function LegislationContent() {
  const { accessToken } = useAdminAuth();
  const [changes, setChanges] = useState<LegislationChangeSummary[] | null>(null);

  useEffect(() => {
    apiRequest<LegislationChangeSummary[]>("/admin/legislation-changes", {
      accessToken,
    }).then(setChanges);
  }, [accessToken]);

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: "#101828" }}>Mevzuat İzleme</h1>
      <p style={{ fontSize: 13, color: "#667085" }}>
        Otonom Mevzuat Sistemi'nin tespit ettiği değişiklikler. "İnceleme
        Bekliyor" durumundaki değişikliklerde ilgili kural otomatik olarak
        kısıtlanmıştır (fail-closed) — onaylanana ya da reddedilene kadar
        kesin sonuç üretilmez.
      </p>

      {!changes ? (
        <p style={{ color: "#667085" }}>Yükleniyor…</p>
      ) : changes.length === 0 ? (
        <p style={{ color: "#667085" }}>Henüz tespit edilmiş bir mevzuat değişikliği yok.</p>
      ) : (
        <table style={{ ...tableStyle, marginTop: 16 }}>
          <thead>
            <tr>
              <th style={tableCellStyle}>Kaynak</th>
              <th style={tableCellStyle}>Belge</th>
              <th style={tableCellStyle}>Değişiklik Türü</th>
              <th style={tableCellStyle}>Risk</th>
              <th style={tableCellStyle}>Durum</th>
              <th style={tableCellStyle}>Yürürlük Tarihi</th>
              <th style={tableCellStyle} />
            </tr>
          </thead>
          <tbody>
            {changes.map((change) => (
              <tr key={change.id}>
                <td style={tableCellStyle}>{change.document.source.name}</td>
                <td style={tableCellStyle}>{change.document.title}</td>
                <td style={tableCellStyle}>{change.changeType}</td>
                <td style={tableCellStyle}>
                  {change.impactAssessment?.riskLevel ?? "-"}
                </td>
                <td style={tableCellStyle}>
                  <span style={statusBadgeStyle(change.status)}>{change.status}</span>
                </td>
                <td style={tableCellStyle}>
                  {new Date(change.effectiveDate).toLocaleDateString("tr-TR")}
                </td>
                <td style={tableCellStyle}>
                  <Link href={`/legislation/${change.id}`} style={{ color: "#175CD3", fontSize: 13 }}>
                    Detay
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default function LegislationPage() {
  return (
    <RequireAdmin>
      <LegislationContent />
    </RequireAdmin>
  );
}
