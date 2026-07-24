const MIN_EMBEDDED_TEXT_LENGTH = 20;

/**
 * PDF'ten çıkarılan metnin, taranmış (görüntü tabanlı) bir sayfa
 * yerine gerçek bir metin katmanına ait olup olmadığını kaba bir
 * uzunluk eşiğiyle belirler. e-Devlet/kurumsal belgeler (icra ödeme
 * emri, trafik cezası vb.) genellikle dijital üretildiği için metin
 * katmanına sahiptir; taranmış sayfalarda ise `pdf-parse` ya boş ya
 * da anlamsız derecede kısa bir metin döner.
 */
export function hasSufficientEmbeddedText(text: string): boolean {
  return text.trim().length >= MIN_EMBEDDED_TEXT_LENGTH;
}
