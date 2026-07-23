/**
 * Kullanıcı rolü bir erişim duvarı DEĞİLDİR.
 * Rol yalnızca sıralama, öneri ve dil tonunu etkiler.
 * Bkz: Nihai Ürün Kodlama Dokümanı v2.0, Bölüm 5.
 */
export const USER_ROLES = [
  "CITIZEN",
  "LAWYER",
  "ACCOUNTANT",
  "ADMIN",
] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const SUBSCRIPTION_PLANS = [
  "FREE",
  "INDIVIDUAL",
  "PRO",
  "OFFICE",
  "ENTERPRISE",
] as const;
export type SubscriptionPlan = (typeof SUBSCRIPTION_PLANS)[number];

export interface AuthenticatedUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  subscriptionPlan: SubscriptionPlan;
  isGuest: boolean;
}

export interface PublicUserProfile {
  id: string;
  email: string;
  fullName: string;
  phone?: string | null;
  role: UserRole;
  subscriptionPlan: SubscriptionPlan;
  createdAt: string;
}
