import { SetMetadata } from "@nestjs/common";

export const IS_PUBLIC_KEY = "isPublic";

/**
 * Bu route'u global JwtAuthGuard'dan muaf tutar.
 * Misafir kullanım (Bölüm 4.1) destekleyen uçlarda kullanılır.
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
