/**
 * Türkçe'ye özgü büyük/küçük harf dönüşümü standart JS toLowerCase()
 * ile hatalı çalışır (İ -> i̇, I -> ı gibi sorunlar). Arama motoru bu
 * yüzden kendi normalizasyon fonksiyonunu kullanır.
 */
const TURKISH_UPPER_TO_LOWER: Record<string, string> = {
  İ: "i",
  I: "ı",
  Ş: "ş",
  Ğ: "ğ",
  Ü: "ü",
  Ö: "ö",
  Ç: "ç",
};

const DIACRITIC_FOLD: Record<string, string> = {
  ı: "i",
  ş: "s",
  ğ: "g",
  ü: "u",
  ö: "o",
  ç: "c",
};

export function turkishLowercase(input: string): string {
  let result = "";
  for (const char of input) {
    result += TURKISH_UPPER_TO_LOWER[char] ?? char.toLowerCase();
  }
  return result;
}

/**
 * Aksan/diyakritik farklarını yok sayan "gevşek" normalizasyon.
 * Örn: "İtiraz", "itiraz", "İTİRAZ" hepsi "itiraz" olur.
 * "Şikayet" ve "sikayet" de eşleşir (kullanıcılar Türkçe klavye
 * kullanmayabilir).
 */
export function foldForSearch(input: string): string {
  const lowered = turkishLowercase(input.trim());
  let folded = "";
  for (const char of lowered) {
    folded += DIACRITIC_FOLD[char] ?? char;
  }
  return folded;
}

export function tokenize(input: string): string[] {
  return foldForSearch(input)
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length > 0);
}
