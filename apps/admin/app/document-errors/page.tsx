"use client";

import { useEffect, useState } from "react";
import type { DocumentErrorSummary } from "@hukukai/types";
import { RequireAdmin } from "../../src/components/RequireAdmin";
import { useAdminAuth } from "../../src/context/admin-auth-context";
import { apiRequest } from "../../src/lib/api-client";
import { tableCellStyle, tableStyle } from "../../src/lib/table-styles";

function DocumentErrorsContent() {
  const { accessToken } = useAdminAuth();
  const [errors, setErrors] = useState<DocumentErrorSummary[] | null>(null);

  useEffect(() => {
    apiRequest<DocumentErrorSummary[]>("/admin/document-errors", { accessToken }).then(
      setErrors,
    );
  }, [accessToken]);

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: "#101828" }}>
        Belge Analiz Hataları
      </h1>
      {!errors ? (
        <p style={{ color: "#667085" }}>Yükleniyor…</p>
      ) : errors.length === 0 ? (
        <p style={{ color: "#667085" }}>Başarısız analiz bulunmuyor.</p>
      ) : (
        <table style={{ ...tableStyle, marginTop: 16 }}>
          <thead>
            <tr>
              <th style={tableCellStyle}>Belge</th>
              <th style={tableCellStyle}>Kullanıcı</th>
              <th style={tableCellStyle}>Hata Kodu</th>
              <th style={tableCellStyle}>Hata Mesajı</th>
              <th style={tableCellStyle}>Tarih</th>
            </tr>
          </thead>
          <tbody>
            {errors.map((error) => (
              <tr key={error.id}>
                <td style={tableCellStyle}>{error.originalName}</td>
                <td style={tableCellStyle}>{error.userEmail}</td>
                <td style={tableCellStyle}>{error.errorCode ?? "-"}</td>
                <td style={tableCellStyle}>{error.errorMessage ?? "-"}</td>
                <td style={tableCellStyle}>
                  {new Date(error.createdAt).toLocaleString("tr-TR")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default function DocumentErrorsPage() {
  return (
    <RequireAdmin>
      <DocumentErrorsContent />
    </RequireAdmin>
  );
}
