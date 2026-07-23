"use client";

import { useEffect, useState } from "react";
import type { AuditLogEntry } from "@hukukai/types";
import { RequireAdmin } from "../../src/components/RequireAdmin";
import { useAdminAuth } from "../../src/context/admin-auth-context";
import { apiRequest } from "../../src/lib/api-client";
import { tableCellStyle, tableStyle } from "../../src/lib/table-styles";

function AuditLogsContent() {
  const { accessToken } = useAdminAuth();
  const [logs, setLogs] = useState<AuditLogEntry[] | null>(null);

  useEffect(() => {
    apiRequest<AuditLogEntry[]>("/admin/audit-logs", { accessToken }).then(setLogs);
  }, [accessToken]);

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: "#101828" }}>Audit Log</h1>
      {!logs ? (
        <p style={{ color: "#667085" }}>Yükleniyor…</p>
      ) : logs.length === 0 ? (
        <p style={{ color: "#667085" }}>Henüz bir işlem kaydı yok.</p>
      ) : (
        <table style={{ ...tableStyle, marginTop: 16 }}>
          <thead>
            <tr>
              <th style={tableCellStyle}>Tarih</th>
              <th style={tableCellStyle}>İşlem</th>
              <th style={tableCellStyle}>Varlık</th>
              <th style={tableCellStyle}>Kullanıcı</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id}>
                <td style={tableCellStyle}>{new Date(log.createdAt).toLocaleString("tr-TR")}</td>
                <td style={tableCellStyle}>{log.action}</td>
                <td style={tableCellStyle}>
                  {log.entityType}
                  {log.entityId ? ` (${log.entityId})` : ""}
                </td>
                <td style={tableCellStyle}>{log.userId ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default function AuditLogsPage() {
  return (
    <RequireAdmin>
      <AuditLogsContent />
    </RequireAdmin>
  );
}
