/** "GG.AA.YYYY" girdisini "YYYY-AA-GG" ISO biçimine çevirir. */
export function parseTurkishDate(value: string): string | null {
  const match = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/.exec(value.trim());
  if (!match) return null;
  const day = match[1] ?? "";
  const month = match[2] ?? "";
  const year = match[3] ?? "";
  const iso = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  const parsed = new Date(`${iso}T00:00:00.000Z`);
  return Number.isNaN(parsed.getTime()) ? null : iso;
}
