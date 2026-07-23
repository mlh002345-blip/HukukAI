import { SetMetadata } from "@nestjs/common";
import type { UserRole } from "@hukukai/types";

export const ROLES_KEY = "roles";

/**
 * Belirli uçları belirli rollerle sınırlar (ör. Yönetim Paneli — Bölüm 5.5).
 * NOT: bu, tüketici uygulamasındaki "rol bir erişim duvarı değildir"
 * kuralından (araç görünürlüğü) ayrıdır — burada API erişim denetimi
 * yapılır, araç görünürlüğü etkilenmez.
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
