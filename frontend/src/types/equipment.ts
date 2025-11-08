export interface Equipment {
  id: string;
  name: string;
  manuals: string[];
  images: string[];
}

export type EquipmentFileType = "manual" | "image";
