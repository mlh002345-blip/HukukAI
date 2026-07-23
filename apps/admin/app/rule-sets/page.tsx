"use client";

import { useEffect, useState } from "react";
import type { RuleSetSummary } from "@hukukai/types";
import { RequireAdmin } from "../../src/components/RequireAdmin";
import { useAdminAuth } from "../../src/context/admin-auth-context";
import { apiRequest } from "../../src/lib/api-client";
import { tableCellStyle, tableStyle } from "../../src/lib/table-styles";
import { formButtonStyle, formInputStyle } from "../../src/lib/form-styles";

interface RuleSetFormState {
  module: string;
  ruleKey: string;
  version: string;
  validFrom: string;
  validTo: string;
  ruleDataJson: string;
  legalBasisJson: string;
}

const EMPTY_FORM: RuleSetFormState = {
  module: "DEADLINE",
  ruleKey: "",
  version: "",
  validFrom: "",
  validTo: "",
  ruleDataJson: "{}",
  legalBasisJson: "[]",
};

function RuleSetsContent() {
  const { accessToken } = useAdminAuth();
  const [ruleSets, setRuleSets] = useState<RuleSetSummary[] | null>(null);
  const [form, setForm] = useState<RuleSetFormState>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const load = () => {
    apiRequest<RuleSetSummary[]>("/admin/rule-sets", { accessToken }).then(setRuleSets);
  };

  useEffect(load, [accessToken]);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const ruleData: unknown = JSON.parse(form.ruleDataJson);
      const legalBasis: unknown = JSON.parse(form.legalBasisJson);
      await apiRequest("/admin/rule-sets", {
        method: "POST",
        accessToken,
        body: {
          module: form.module,
          ruleKey: form.ruleKey,
          version: form.version,
          validFrom: form.validFrom,
          validTo: form.validTo || undefined,
          ruleData,
          legalBasis,
        },
      });
      setForm(EMPTY_FORM);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kural seti oluşturulamadı.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onPublish = async (id: string) => {
    await apiRequest(`/admin/rule-sets/${id}/publish`, { method: "POST", accessToken });
    load();
  };

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: "#101828" }}>Kural Setleri</h1>
      <p style={{ fontSize: 13, color: "#667085" }}>
        Yeni kural sürümleri taslak olarak oluşturulur; yayınlanmadan önce
        mevzuat kaynağıyla doğrulanmalıdır.
      </p>

      <form
        onSubmit={onSubmit}
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(200px, 1fr))",
          gap: 8,
          margin: "16px 0",
          border: "1px solid #EAECF0",
          borderRadius: 12,
          padding: 16,
        }}
      >
        <input
          value={form.module}
          onChange={(event) => setForm({ ...form, module: event.target.value })}
          placeholder="Modül (ör. DEADLINE)"
          required
          style={formInputStyle}
        />
        <input
          value={form.ruleKey}
          onChange={(event) => setForm({ ...form, ruleKey: event.target.value })}
          placeholder="Kural anahtarı"
          required
          style={formInputStyle}
        />
        <input
          value={form.version}
          onChange={(event) => setForm({ ...form, version: event.target.value })}
          placeholder="Sürüm (ör. 1.0.0)"
          required
          style={formInputStyle}
        />
        <input
          type="date"
          value={form.validFrom}
          onChange={(event) => setForm({ ...form, validFrom: event.target.value })}
          required
          style={formInputStyle}
        />
        <input
          type="date"
          value={form.validTo}
          onChange={(event) => setForm({ ...form, validTo: event.target.value })}
          placeholder="Geçerlilik bitişi (opsiyonel)"
          style={formInputStyle}
        />
        <textarea
          value={form.ruleDataJson}
          onChange={(event) => setForm({ ...form, ruleDataJson: event.target.value })}
          placeholder="Kural verisi (JSON)"
          rows={3}
          style={{ ...formInputStyle, gridColumn: "1 / -1", fontFamily: "monospace" }}
        />
        <textarea
          value={form.legalBasisJson}
          onChange={(event) => setForm({ ...form, legalBasisJson: event.target.value })}
          placeholder='Mevzuat dayanağı (JSON dizisi, ör. [{"law":"HMK","article":"92"}])'
          rows={2}
          style={{ ...formInputStyle, gridColumn: "1 / -1", fontFamily: "monospace" }}
        />
        {error ? (
          <p style={{ color: "#B42318", fontSize: 12, gridColumn: "1 / -1" }}>{error}</p>
        ) : null}
        <button
          type="submit"
          disabled={isSubmitting}
          style={{ ...formButtonStyle, gridColumn: "1 / -1" }}
        >
          Taslak Oluştur
        </button>
      </form>

      {!ruleSets ? (
        <p style={{ color: "#667085" }}>Yükleniyor…</p>
      ) : (
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={tableCellStyle}>Modül</th>
              <th style={tableCellStyle}>Kural</th>
              <th style={tableCellStyle}>Sürüm</th>
              <th style={tableCellStyle}>Geçerlilik</th>
              <th style={tableCellStyle}>Durum</th>
              <th style={tableCellStyle} />
            </tr>
          </thead>
          <tbody>
            {ruleSets.map((ruleSet) => (
              <tr key={ruleSet.id}>
                <td style={tableCellStyle}>{ruleSet.module}</td>
                <td style={tableCellStyle}>{ruleSet.ruleKey}</td>
                <td style={tableCellStyle}>{ruleSet.version}</td>
                <td style={tableCellStyle}>
                  {ruleSet.validFrom} — {ruleSet.validTo ?? "süresiz"}
                </td>
                <td style={tableCellStyle}>
                  {ruleSet.isPublished ? "Yayında" : "Taslak"}
                </td>
                <td style={tableCellStyle}>
                  {!ruleSet.isPublished ? (
                    <button onClick={() => onPublish(ruleSet.id)} style={formButtonStyle}>
                      Yayınla
                    </button>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default function RuleSetsPage() {
  return (
    <RequireAdmin>
      <RuleSetsContent />
    </RequireAdmin>
  );
}
