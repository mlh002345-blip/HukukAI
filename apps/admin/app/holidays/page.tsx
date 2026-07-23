"use client";

import { useEffect, useState } from "react";
import type { HolidaySummary } from "@hukukai/types";
import { RequireAdmin } from "../../src/components/RequireAdmin";
import { useAdminAuth } from "../../src/context/admin-auth-context";
import { apiRequest } from "../../src/lib/api-client";
import { tableCellStyle, tableStyle } from "../../src/lib/table-styles";
import { formButtonStyle, formInputStyle } from "../../src/lib/form-styles";

function HolidaysContent() {
  const { accessToken } = useAdminAuth();
  const [holidays, setHolidays] = useState<HolidaySummary[] | null>(null);
  const [date, setDate] = useState("");
  const [name, setName] = useState("");
  const [isHalfDay, setIsHalfDay] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    apiRequest<HolidaySummary[]>("/admin/holidays", { accessToken }).then(setHolidays);
  };

  useEffect(load, [accessToken]);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    try {
      await apiRequest("/admin/holidays", {
        method: "POST",
        accessToken,
        body: { date, name, isHalfDay },
      });
      setDate("");
      setName("");
      setIsHalfDay(false);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Eklenemedi.");
    }
  };

  const onDelete = async (id: string) => {
    await apiRequest(`/admin/holidays/${id}`, { method: "DELETE", accessToken });
    load();
  };

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: "#101828" }}>Resmi Tatiller</h1>

      <form
        onSubmit={onSubmit}
        style={{ display: "flex", gap: 8, alignItems: "center", margin: "16px 0", flexWrap: "wrap" }}
      >
        <input
          type="date"
          value={date}
          onChange={(event) => setDate(event.target.value)}
          required
          style={formInputStyle}
        />
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Tatil adı"
          required
          style={formInputStyle}
        />
        <label style={{ fontSize: 13, color: "#344054" }}>
          <input
            type="checkbox"
            checked={isHalfDay}
            onChange={(event) => setIsHalfDay(event.target.checked)}
          />{" "}
          Yarım gün
        </label>
        <button type="submit" style={formButtonStyle}>Ekle</button>
      </form>
      {error ? <p style={{ color: "#B42318", fontSize: 12 }}>{error}</p> : null}

      {!holidays ? (
        <p style={{ color: "#667085" }}>Yükleniyor…</p>
      ) : (
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={tableCellStyle}>Tarih</th>
              <th style={tableCellStyle}>Ad</th>
              <th style={tableCellStyle}>Yarım Gün</th>
              <th style={tableCellStyle} />
            </tr>
          </thead>
          <tbody>
            {holidays.map((holiday) => (
              <tr key={holiday.id}>
                <td style={tableCellStyle}>{holiday.date}</td>
                <td style={tableCellStyle}>{holiday.name}</td>
                <td style={tableCellStyle}>{holiday.isHalfDay ? "Evet" : "Hayır"}</td>
                <td style={tableCellStyle}>
                  <button
                    onClick={() => onDelete(holiday.id)}
                    style={{ ...formButtonStyle, background: "#FFFFFF", color: "#B42318", border: "1px solid #FDA29B" }}
                  >
                    Sil
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default function HolidaysPage() {
  return (
    <RequireAdmin>
      <HolidaysContent />
    </RequireAdmin>
  );
}
