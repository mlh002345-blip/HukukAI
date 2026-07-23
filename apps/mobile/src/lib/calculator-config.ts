export interface CalculatorFieldOption {
  label: string;
  value: string;
}

export interface CalculatorSimpleFieldConfig {
  key: string;
  label: string;
  kind: "decimal" | "select";
  placeholder?: string;
  options?: CalculatorFieldOption[];
  defaultValue?: string;
  optional?: boolean;
}

export interface CalculatorListItemFieldConfig {
  key: string;
  label: string;
  /** decimal/integer/text: metin girilir, gönderilirken tipine çevrilir.
   * nullableDecimal: boş bırakılırsa `null` gönderilir (ör. son dilimin
   * üst sınırı olmadığında). */
  kind: "decimal" | "integer" | "text" | "nullableDecimal";
  placeholder?: string;
}

export interface CalculatorListFieldConfig {
  key: string;
  label: string;
  kind: "list";
  itemFields: CalculatorListItemFieldConfig[];
  addButtonLabel: string;
  emptyItem: Record<string, string>;
}

export type CalculatorFieldConfig =
  | CalculatorSimpleFieldConfig
  | CalculatorListFieldConfig;

export interface CalculatorResultField {
  key: string;
  label: string;
  format?: "boolean";
}

export interface CalculatorConfig {
  title: string;
  endpoint: string;
  fields: CalculatorFieldConfig[];
  resultFields: CalculatorResultField[];
}

const periodListField: CalculatorListFieldConfig = {
  key: "periods",
  label: "Faiz Dönemleri",
  kind: "list",
  addButtonLabel: "+ Dönem Ekle",
  emptyItem: { annualRatePercent: "", days: "" },
  itemFields: [
    { key: "annualRatePercent", label: "Yıllık Oran (%)", kind: "decimal", placeholder: "9" },
    { key: "days", label: "Gün Sayısı", kind: "integer", placeholder: "365" },
  ],
};

const bracketListField: CalculatorListFieldConfig = {
  key: "brackets",
  label: "Kademeli Dilimler",
  kind: "list",
  addButtonLabel: "+ Dilim Ekle",
  emptyItem: { upTo: "", ratePercent: "" },
  itemFields: [
    {
      key: "upTo",
      label: "Dilim Üst Sınırı (son dilimde boş bırakın)",
      kind: "nullableDecimal",
      placeholder: "100000",
    },
    { key: "ratePercent", label: "Oran (%)", kind: "decimal", placeholder: "10" },
  ],
};

export const CALCULATOR_CONFIGS: Record<string, CalculatorConfig> = {
  "yasal-faiz": {
    title: "Yasal Faiz",
    endpoint: "/calculations/interest",
    fields: [
      { key: "principal", label: "Anapara", kind: "decimal", placeholder: "10000" },
      periodListField,
    ],
    resultFields: [
      { key: "totalInterest", label: "Toplam Faiz" },
      { key: "totalAmount", label: "Toplam Tutar" },
    ],
  },
  "icra-borcu": {
    title: "İcra Borcu",
    endpoint: "/calculations/enforcement-debt",
    fields: [
      { key: "principal", label: "Anapara", kind: "decimal", placeholder: "10000" },
      periodListField,
      {
        key: "expenses",
        label: "İcra Masrafları",
        kind: "list",
        addButtonLabel: "+ Masraf Ekle",
        emptyItem: { label: "", amount: "" },
        itemFields: [
          { key: "label", label: "Masraf Adı", kind: "text", placeholder: "Tebligat gideri" },
          { key: "amount", label: "Tutar", kind: "decimal", placeholder: "50" },
        ],
      },
    ],
    resultFields: [
      { key: "interestAmount", label: "İşlemiş Faiz" },
      { key: "expensesTotal", label: "Masraf Toplamı" },
      { key: "totalDebt", label: "Toplam Borç" },
    ],
  },
  "vekalet-ucreti": {
    title: "Vekâlet Ücreti",
    endpoint: "/calculations/attorney-fee",
    fields: [
      { key: "disputeValue", label: "Dava Değeri", kind: "decimal", placeholder: "150000" },
      {
        key: "minimumFee",
        label: "Asgari Ücret (tarifedeki maktu alt sınır)",
        kind: "decimal",
        placeholder: "5000",
        optional: true,
      },
      bracketListField,
    ],
    resultFields: [
      { key: "calculatedFee", label: "Hesaplanan Ücret" },
      { key: "appliedMinimumFee", label: "Asgari Ücret Uygulandı mı?", format: "boolean" },
    ],
  },
  "gelir-vergisi": {
    title: "Gelir Vergisi",
    endpoint: "/calculations/income-tax",
    fields: [
      { key: "taxableIncome", label: "Vergiye Tabi Gelir", kind: "decimal", placeholder: "150000" },
      bracketListField,
    ],
    resultFields: [
      { key: "totalTax", label: "Toplam Vergi" },
      { key: "effectiveRatePercent", label: "Efektif Oran (%)" },
    ],
  },
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
