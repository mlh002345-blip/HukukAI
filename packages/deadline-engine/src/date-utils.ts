/**
 * UTC tabanlı, saat dilimine duyarsız tarih aritmetiği. Süre hesabı
 * hukuki bir sonuç ürettiği için sunucunun çalıştığı saat dilimine göre
 * farklı sonuç vermemelidir; bu yüzden yerel `Date` alıcıları/ayarlayıcıları
 * (`getDate`/`setDate` vb.) yerine bilerek UTC eşdeğerleri kullanılır.
 */
const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function parseIsoDate(iso: string): Date {
  const date = new Date(`${iso}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Geçersiz tarih: ${iso}`);
  }
  return date;
}

export function formatIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function addUtcDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * MS_PER_DAY);
}

/**
 * Ay taşması durumunda (ör. 31 Ocak + 1 ay → Şubat'ın son günü) ayın son
 * gününe sabitler. HMK m.92/2 ile uyumludur: "...o ayda o gün yoksa,
 * ayın son günü mehil sayılır."
 */
export function addUtcMonths(date: Date, months: number): Date {
  const result = new Date(date.getTime());
  const targetDay = result.getUTCDate();
  result.setUTCMonth(result.getUTCMonth() + months);
  if (result.getUTCDate() !== targetDay) {
    result.setUTCDate(0);
  }
  return result;
}

export function addUtcYears(date: Date, years: number): Date {
  return addUtcMonths(date, years * 12);
}

export function isWeekend(date: Date): boolean {
  const day = date.getUTCDay();
  return day === 0 || day === 6;
}

export function diffInCalendarDays(a: Date, b: Date): number {
  return Math.round((a.getTime() - b.getTime()) / MS_PER_DAY);
}
