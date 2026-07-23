export const FOLDER_TYPES = [
  "LEGAL",
  "ENFORCEMENT",
  "TAX",
  "SGK",
  "RENT",
  "EXECUTION",
  "TRAFFIC_FINE",
  "OTHER",
] as const;
export type FolderType = (typeof FOLDER_TYPES)[number];

export interface FolderSummary {
  id: string;
  title: string;
  folderType: FolderType;
  clientName: string | null;
  referenceNumber: string | null;
  notes: string | null;
  documentCount: number;
  createdAt: string;
  updatedAt: string;
}
