"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import type { LegislationChangeDetail } from "@hukukai/types";
import { RequireAdmin } from "../../../src/components/RequireAdmin";
import { useAdminAuth } from "../../../src/context/admin-auth-context";
import { apiRequest } from "../../../src/lib/api-client";
import { formButtonStyle } from "../../../src/lib/form-styles";
import { statusBadgeStyle } from "../../../src/lib/status-badge";

const jsonBlockStyle = {
  background: "#F9FAFB",
  border: "1px solid #EAECF0",
  borderRadius: 8,
  padding: 12,
  fontSize: 12,
  fontFamily: "monospace",
  whiteSpace: "pre-wrap" as const,
  overflowX: "auto" as const,
};

function LegislationDetailContent() {
  const { accessToken } = useAdminAuth();
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [change, setChange] = useState<LegislationChangeDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const load = () => {
    apiRequest<LegislationChangeDetail>(`/admin/legislation-changes/${params.id}`, {
      accessToken,
    }).then(setChange);
  };

  useEffect(load, [accessToken, params.id]);

  const onDecision = async (action: "approve" | "reject") => {
    setError(null);
    setIsSubmitting(true);
    try {
      await apiRequest(`/admin/legislation-changes/${params.id}/${action}`, {
        method: "POST",
        accessToken,
      });
      load();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "İşlem tamamlanamadı.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!change) {
    return <p style={{ color: "#667085" }}>Yükleniyor…</p>;
  }

  const candidate = change.ruleSets[0];
  const canDecide = change.status === "HOLD_FOR_REVIEW";

  return (
    <div>
      <button
        onClick={() => router.push("/legislation")}
        style={{ ...formButtonStyle, background: "#FFFFFF", color: "#344054", border: "1px solid #D0D5DD" }}
      >
        ← Listeye Dön
      </button>

      <h1 style={{ fontSize: 22, fontWeight: 700, color: "#101828", marginTop: 12 }}>
        {change.affectedLegislation}
      </h1>
      <p style={{ fontSize: 13, color: "#667085" }}>
        {change.document.source.name} · {change.document.title}
      </p>
      <div style={{ display: "flex", gap: 8, alignItems: "center", margin: "8px 0" }}>
        <span style={statusBadgeStyle(change.status)}>{change.status}</span>
        <span style={{ fontSize: 13, color: "#667085" }}>{change.changeType}</span>
      </div>

      <section style={{ marginTop: 16 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: "#101828" }}>Etki Analizi</h2>
        {!change.impactAssessment ? (
          <p style={{ color: "#667085", fontSize: 13 }}>Henüz üretilmedi.</p>
        ) : (
          <ul style={{ fontSize: 13, color: "#344054", lineHeight: 1.8 }}>
            <li>Risk seviyesi: <strong>{change.impactAssessment.riskLevel}</strong></li>
            <li>Geçmişe etki: {change.impactAssessment.historicalImpact ? "Evet" : "Hayır"}</li>
            <li>İleriye etki: {change.impactAssessment.prospectiveImpact ? "Evet" : "Hayır"}</li>
            <li>Geriye dönük düzeltme gerektirir: {change.impactAssessment.requiresMigration ? "Evet" : "Hayır"}</li>
          </ul>
        )}
      </section>

      <section style={{ marginTop: 16 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: "#101828" }}>Aday Kural</h2>
        {!candidate ? (
          <p style={{ color: "#667085", fontSize: 13 }}>Henüz bir kural taslağı üretilmedi.</p>
        ) : (
          <>
            <p style={{ fontSize: 13, color: "#344054" }}>
              {candidate.module} · {candidate.ruleKey} · sürüm {candidate.version} ·{" "}
              <span style={statusBadgeStyle(candidate.status)}>{candidate.status}</span>
              {candidate.confidenceScore ? ` · güven: ${candidate.confidenceScore}` : ""}
            </p>

            <h3 style={{ fontSize: 14, fontWeight: 600, marginTop: 12 }}>
              Doğrulama Katmanları (5+1)
            </h3>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "8px 0" }}>
              {candidate.verificationResults.map((result) => (
                <span
                  key={result.id}
                  style={statusBadgeStyle(result.passed ? "VERIFIED" : "FAILED")}
                  title={JSON.stringify(result.details)}
                >
                  {result.layer}: {result.passed ? "Geçti" : "Kaldı"}
                </span>
              ))}
            </div>

            <h3 style={{ fontSize: 14, fontWeight: 600, marginTop: 12 }}>
              Kural Verisi (aday sürüm)
            </h3>
            <pre style={jsonBlockStyle}>{JSON.stringify(candidate.ruleData, null, 2)}</pre>

            <h3 style={{ fontSize: 14, fontWeight: 600, marginTop: 12 }}>Mevzuat Dayanağı</h3>
            <pre style={jsonBlockStyle}>{JSON.stringify(candidate.legalBasis, null, 2)}</pre>
          </>
        )}
      </section>

      {error ? <p style={{ color: "#B42318", fontSize: 12 }}>{error}</p> : null}

      {canDecide ? (
        <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
          <button
            onClick={() => onDecision("approve")}
            disabled={isSubmitting}
            style={formButtonStyle}
          >
            Onayla ve Yayınla
          </button>
          <button
            onClick={() => onDecision("reject")}
            disabled={isSubmitting}
            style={{ ...formButtonStyle, background: "#B42318" }}
          >
            Reddet
          </button>
        </div>
      ) : null}
    </div>
  );
}

export default function LegislationDetailPage() {
  return (
    <RequireAdmin>
      <LegislationDetailContent />
    </RequireAdmin>
  );
}
