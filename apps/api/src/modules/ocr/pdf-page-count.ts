/**
 * PDF sayfa sayısının hızlı, en iyi çaba (best-effort) tahmini. Tam bir
 * PDF ayrıştırıcı değildir: sıkıştırılmamış (FlateDecode kullanmayan)
 * nesne akışlarında `/Type /Page` sözlük girdilerini sayar. Sıkıştırılmış
 * içerikte bu desen bulunamayabilir; bu durumda güvenli varsayılan
 * olarak 1 döner.
 */
export function estimatePdfPageCount(buffer: Buffer): number {
  const content = buffer.toString("latin1");
  const matches = content.match(/\/Type\s*\/Page(?!s)/g);
  return matches && matches.length > 0 ? matches.length : 1;
}
