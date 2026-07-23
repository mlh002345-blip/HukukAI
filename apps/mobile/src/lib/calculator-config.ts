export interface CalculatorFieldOption {
  label: string;
  value: string;
}

export interface CalculatorFieldConfig {
  key: string;
  label: string;
  kind: "decimal" | "select";
  placeholder?: string;
  options?: CalculatorFieldOption[];
  defaultValue?: string;
}

export interface CalculatorResultField {
  key: string;
  label: string;
}

export interface CalculatorConfig {
  title: string;
  endpoint: string;
  fields: CalculatorFieldConfig[];
  resultFields: CalculatorResultField[];
}

/**
 * Faz 6 kapsam notu: yalnızca tekil (sabit) alanlı hesaplayıcılar burada
 * yapılandırılmıştır. Dinamik liste gerektiren araçlar (yasal faiz —
 * çok dönemli, icra borcu — masraf kalemleri, vekâlet ücreti/gelir
 * vergisi — kademeli dilimler) için ayrı, dilim/liste düzenleyicili bir
 * form ekranı ileriki bir iterasyonda eklenecektir.
 */
export const CALCULATOR_CONFIGS: Record<string, CalculatorConfig> = {
  "kira-artisi": {
    title: "Kira Artışı",
    endpoint: "/calculations/rent-increase",
    fields: [
      { key: "currentRent", label: "Mevcut Kira", kind: "decimal", placeholder: "10000" },
      {
        key: "increaseRatePercent",
        label: "Artış Oranı (%)",
        kind: "decimal",
        placeholder: "25",
      },
    ],
    resultFields: [
      { key: "increaseAmount", label: "Artış Tutarı" },
      { key: "newRent", label: "Yeni Kira" },
    ],
  },
  "harc-on-hesabi": {
    title: "Harç Ön Hesabı",
    endpoint: "/calculations/court-fee",
    fields: [
      { key: "disputeValue", label: "Dava Değeri", kind: "decimal", placeholder: "100000" },
      {
        key: "proportionalRatePerMille",
        label: "Nispi Harç Oranı (binde)",
        kind: "decimal",
        placeholder: "68.31",
      },
      {
        key: "fixedApplicationFee",
        label: "Maktu Başvurma Harcı",
        kind: "decimal",
        placeholder: "500",
      },
    ],
    resultFields: [
      { key: "proportionalFee", label: "Nispi Harç" },
      { key: "fixedApplicationFee", label: "Maktu Harç" },
      { key: "totalFee", label: "Toplam Harç" },
    ],
  },
  "serbest-meslek-makbuzu": {
    title: "Serbest Meslek Makbuzu",
    endpoint: "/calculations/self-employment-receipt",
    fields: [
      { key: "grossAmount", label: "Brüt Tutar", kind: "decimal", placeholder: "10000" },
      {
        key: "withholdingTaxRatePercent",
        label: "Stopaj Oranı (%)",
        kind: "decimal",
        placeholder: "20",
      },
      { key: "vatRatePercent", label: "KDV Oranı (%)", kind: "decimal", placeholder: "20" },
    ],
    resultFields: [
      { key: "withholdingTaxAmount", label: "Stopaj Tutarı" },
      { key: "vatAmount", label: "KDV Tutarı" },
      { key: "netAmount", label: "Net Tutar" },
      { key: "totalCollected", label: "Tahsil Edilecek Toplam" },
    ],
  },
  "kdv-hesapla": {
    title: "KDV Hesapla",
    endpoint: "/calculations/vat",
    fields: [
      { key: "amount", label: "Tutar", kind: "decimal", placeholder: "1000" },
      { key: "vatRatePercent", label: "KDV Oranı (%)", kind: "decimal", placeholder: "20" },
      {
        key: "mode",
        label: "Hesaplama Yönü",
        kind: "select",
        defaultValue: "ADD_VAT",
        options: [
          { label: "KDV Hariç Tutara Ekle", value: "ADD_VAT" },
          { label: "KDV Dahil Tutardan Ayrıştır", value: "EXTRACT_VAT" },
        ],
      },
    ],
    resultFields: [
      { key: "baseAmount", label: "KDV Hariç Tutar" },
      { key: "vatAmount", label: "KDV Tutarı" },
      { key: "totalAmount", label: "KDV Dahil Tutar" },
    ],
  },
  "sgk-isveren-maliyeti": {
    title: "SGK İşveren Maliyeti",
    endpoint: "/calculations/sgk",
    fields: [
      { key: "grossSalary", label: "Brüt Maaş", kind: "decimal", placeholder: "20000" },
      {
        key: "sgkEmployerRatePercent",
        label: "SGK İşveren Oranı (%)",
        kind: "decimal",
        placeholder: "20.5",
      },
      {
        key: "unemploymentEmployerRatePercent",
        label: "İşsizlik Sigortası İşveren Oranı (%)",
        kind: "decimal",
        placeholder: "2",
      },
    ],
    resultFields: [
      { key: "sgkEmployerAmount", label: "SGK İşveren Payı" },
      { key: "unemploymentEmployerAmount", label: "İşsizlik Sigortası Payı" },
      { key: "totalEmployerCost", label: "Toplam İşveren Maliyeti" },
    ],
  },
};
