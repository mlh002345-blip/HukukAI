import { describe, expect, it } from "vitest";
import { searchTools, sortToolsForRole } from "./keyword-search";
import { TOOL_CATALOG_SEED } from "./tool-catalog.seed";

describe("searchTools — Faz 2 kabul kriterleri (Bölüm 25)", () => {
  it('"Kaç yıl yatar?" araması infaz aracını getirir', () => {
    const results = searchTools(TOOL_CATALOG_SEED, "Kaç yıl yatar?");
    expect(results.length).toBeGreaterThan(0);
    expect(results[0]?.tool.slug).toBe("infaz-on-hesabi");
  });

  it('"Radar cezasına itiraz" araması trafik cezası süre aracını getirir', () => {
    const results = searchTools(TOOL_CATALOG_SEED, "Radar cezasına itiraz");
    expect(results.length).toBeGreaterThan(0);
    expect(results[0]?.tool.slug).toBe("trafik-cezasi-itiraz-suresi");
  });

  it('"SMM" araması serbest meslek makbuzunu getirir', () => {
    const results = searchTools(TOOL_CATALOG_SEED, "SMM");
    expect(results.length).toBeGreaterThan(0);
    expect(results[0]?.tool.slug).toBe("serbest-meslek-makbuzu");
  });

  it("Türkçe karakter duyarsız arama çalışır (İTİRAZ / itiraz / İtiraz)", () => {
    const a = searchTools(TOOL_CATALOG_SEED, "İTİRAZ SÜRESİ");
    const b = searchTools(TOOL_CATALOG_SEED, "itiraz suresi");
    expect(a.length).toBeGreaterThan(0);
    expect(b.length).toBeGreaterThan(0);
    expect(a[0]?.tool.id).toBe(b[0]?.tool.id);
  });

  it("cezaevinden ne zaman çıkar sorgusu infaz aracını getirir", () => {
    const results = searchTools(
      TOOL_CATALOG_SEED,
      "cezaevinden ne zaman çıkar",
    );
    expect(results[0]?.tool.slug).toBe("infaz-on-hesabi");
  });

  it("boş sorgu boş sonuç döner", () => {
    expect(searchTools(TOOL_CATALOG_SEED, "")).toEqual([]);
    expect(searchTools(TOOL_CATALOG_SEED, "   ")).toEqual([]);
  });

  it("pasif (isActive=false) araçlar sonuçlarda görünmez", () => {
    const inactiveCatalog = TOOL_CATALOG_SEED.map((tool) =>
      tool.slug === "infaz-on-hesabi" ? { ...tool, isActive: false } : tool,
    );
    const results = searchTools(inactiveCatalog, "infaz");
    expect(results.find((r) => r.tool.slug === "infaz-on-hesabi")).toBeUndefined();
  });

  it("kategori filtresi sadece o kategorideki araçları döner", () => {
    const results = searchTools(TOOL_CATALOG_SEED, "hesapla", {
      category: "Vergi",
    });
    for (const result of results) {
      expect(result.tool.categories).toContain("Vergi");
    }
  });
});

describe("sortToolsForRole — rol hiçbir aracı gizlemez (Bölüm 5.1)", () => {
  it("tüm roller için araç sayısı aynı kalır (hiçbir araç gizlenmez)", () => {
    const citizenSorted = sortToolsForRole(TOOL_CATALOG_SEED, "CITIZEN");
    const lawyerSorted = sortToolsForRole(TOOL_CATALOG_SEED, "LAWYER");
    const accountantSorted = sortToolsForRole(TOOL_CATALOG_SEED, "ACCOUNTANT");

    expect(citizenSorted).toHaveLength(TOOL_CATALOG_SEED.length);
    expect(lawyerSorted).toHaveLength(TOOL_CATALOG_SEED.length);
    expect(accountantSorted).toHaveLength(TOOL_CATALOG_SEED.length);
  });

  it("mali müşavir rolünde infaz aracı listede bulunur (erişim kısıtı yok)", () => {
    const sorted = sortToolsForRole(TOOL_CATALOG_SEED, "ACCOUNTANT");
    expect(sorted.some((t) => t.slug === "infaz-on-hesabi")).toBe(true);
  });

  it("vatandaş rolünde SMM aracı listede bulunur", () => {
    const sorted = sortToolsForRole(TOOL_CATALOG_SEED, "CITIZEN");
    expect(sorted.some((t) => t.slug === "serbest-meslek-makbuzu")).toBe(
      true,
    );
  });

  it("avukat rolünde KDV aracı listede bulunur (profesyonel araç gizlenmez)", () => {
    const sorted = sortToolsForRole(TOOL_CATALOG_SEED, "LAWYER");
    expect(sorted.some((t) => t.slug === "kdv-hesapla")).toBe(true);
  });

  it("rol sıralaması sortPriorityByRole değerine göre değişir", () => {
    const lawyerSorted = sortToolsForRole(TOOL_CATALOG_SEED, "LAWYER");
    const accountantSorted = sortToolsForRole(TOOL_CATALOG_SEED, "ACCOUNTANT");
    // İcra borcu avukat için öncelikli (1), muhasebeci için değil (15)
    const lawyerIndex = lawyerSorted.findIndex((t) => t.slug === "icra-borcu");
    const accountantIndex = accountantSorted.findIndex(
      (t) => t.slug === "icra-borcu",
    );
    expect(lawyerIndex).toBeLessThan(accountantIndex);
  });

  it("bir araç birden fazla kategoriye ait olabilir", () => {
    const tool = TOOL_CATALOG_SEED.find(
      (t) => t.slug === "trafik-cezasi-itiraz-suresi",
    );
    expect(tool?.categories.length).toBeGreaterThan(1);
  });
});
