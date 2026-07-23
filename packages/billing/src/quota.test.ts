import { describe, expect, it } from "vitest";
import {
  evaluateActiveDeadlineLimit,
  evaluateAnalysisQuota,
  evaluatePageLimit,
  periodKeyForDate,
} from "./quota";

describe("periodKeyForDate", () => {
  it("UTC tabanlı YYYY-MM anahtarı döner", () => {
    expect(periodKeyForDate(new Date("2026-07-23T23:59:59.000Z"))).toBe(
      "2026-07",
    );
    expect(periodKeyForDate(new Date("2026-01-01T00:00:00.000Z"))).toBe(
      "2026-01",
    );
  });
});

describe("evaluateAnalysisQuota", () => {
  it("kota dolmadıysa plan kotasından izin verir", () => {
    const decision = evaluateAnalysisQuota({
      plan: "FREE",
      monthlyAnalysesUsed: 1,
      oneTimeCreditsRemaining: 0,
    });
    expect(decision).toEqual({ allowed: true, source: "PLAN_QUOTA" });
  });

  it("kota dolduysa ve kredi varsa krediden izin verir", () => {
    const decision = evaluateAnalysisQuota({
      plan: "FREE",
      monthlyAnalysesUsed: 2,
      oneTimeCreditsRemaining: 3,
    });
    expect(decision).toEqual({ allowed: true, source: "ONE_TIME_CREDIT" });
  });

  it("kota dolduysa ve kredi yoksa reddeder", () => {
    const decision = evaluateAnalysisQuota({
      plan: "FREE",
      monthlyAnalysesUsed: 2,
      oneTimeCreditsRemaining: 0,
    });
    expect(decision.allowed).toBe(false);
    expect(decision.reason).toContain("kotanız");
  });

  it("PRO planında daha yüksek kota altında izin verir", () => {
    const decision = evaluateAnalysisQuota({
      plan: "PRO",
      monthlyAnalysesUsed: 99,
      oneTimeCreditsRemaining: 0,
    });
    expect(decision).toEqual({ allowed: true, source: "PLAN_QUOTA" });
  });

  it("PRO planında da kota dolunca kredisiz reddeder", () => {
    const decision = evaluateAnalysisQuota({
      plan: "PRO",
      monthlyAnalysesUsed: 100,
      oneTimeCreditsRemaining: 0,
    });
    expect(decision.allowed).toBe(false);
  });
});

describe("evaluatePageLimit", () => {
  it("sayfa sayısı sınır içindeyse izin verir", () => {
    expect(evaluatePageLimit("FREE", 10)).toEqual({ allowed: true, limit: 10 });
  });

  it("sayfa sayısı sınırı aşarsa reddeder", () => {
    const decision = evaluatePageLimit("FREE", 11);
    expect(decision.allowed).toBe(false);
    expect(decision.limit).toBe(10);
    expect(decision.reason).toContain("sayfa");
  });
});

describe("evaluateActiveDeadlineLimit", () => {
  it("sınır altındaysa izin verir", () => {
    expect(evaluateActiveDeadlineLimit("FREE", 2)).toEqual({
      allowed: true,
      limit: 3,
    });
  });

  it("sınıra ulaşıldıysa reddeder", () => {
    const decision = evaluateActiveDeadlineLimit("FREE", 3);
    expect(decision.allowed).toBe(false);
    expect(decision.reason).toContain("sınırınıza");
  });

  it("PRO planında sınırsız olduğu için her zaman izin verir", () => {
    expect(evaluateActiveDeadlineLimit("PRO", 10000)).toEqual({
      allowed: true,
      limit: null,
    });
  });
});
