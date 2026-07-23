import type { UserRole } from "./user";

/**
 * Bir araç tek bir klasöre/kategoriye bağlı değildir; birden fazla
 * kategori ve kullanıcı grubuna ait olabilir. Rol, aracı GİZLEMEZ,
 * yalnızca sıralamayı etkiler (sortPriorityByRole).
 */
export type ToolAudience = "Vatandaş" | "Avukat" | "Mali Müşavir";

export type ToolCategory =
  | "Belge Analizi"
  | "İcra"
  | "Mahkeme Süreleri"
  | "İnfaz"
  | "Vergi"
  | "SGK"
  | "Kira"
  | "Trafik Cezaları"
  | "Vekâlet ve Harç"
  | "Faiz ve Borç"
  | "Belge Oluşturma";

export interface ToolRolePriority {
  citizen?: number;
  lawyer?: number;
  accountant?: number;
}

export interface ToolDefinition {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  categories: ToolCategory[];
  audiences: ToolAudience[];
  keywords: string[];
  synonyms: string[];
  icon: string;
  route: string;
  isActive: boolean;
  isBeta: boolean;
  requiresSubscription: boolean;
  sortPriorityByRole: ToolRolePriority;
}

export function roleToAudience(role: UserRole): ToolAudience | null {
  switch (role) {
    case "CITIZEN":
      return "Vatandaş";
    case "LAWYER":
      return "Avukat";
    case "ACCOUNTANT":
      return "Mali Müşavir";
    default:
      return null;
  }
}

export function rolePriorityKey(
  role: UserRole,
): keyof ToolRolePriority | null {
  switch (role) {
    case "CITIZEN":
      return "citizen";
    case "LAWYER":
      return "lawyer";
    case "ACCOUNTANT":
      return "accountant";
    default:
      return null;
  }
}
