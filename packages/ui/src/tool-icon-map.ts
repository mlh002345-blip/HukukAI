/**
 * `ToolDefinition.icon` alanı, Material Symbols eklenmeden önceki
 * (seed verisindeki) genel ikon adlarını taşır. Bu, o adları geçerli
 * Material Symbols Outlined ligature adlarına çevirir.
 */
const TOOL_ICON_MAP: Record<string, string> = {
  gavel: "gavel",
  car: "directions_car",
  percent: "percent",
  receipt: "receipt_long",
  "percent-circle": "percent",
  banknote: "payments",
  "calendar-clock": "event",
  home: "home",
  scale: "balance",
  coins: "account_balance",
  calculator: "calculate",
  briefcase: "work",
  "file-search": "search",
};

const DEFAULT_TOOL_ICON = "build_circle";

export function resolveToolIconName(icon: string): string {
  return TOOL_ICON_MAP[icon] ?? DEFAULT_TOOL_ICON;
}
