import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Step type translations to Uzbek
export const STEP_TYPE_TRANSLATIONS: Record<string, string> = {
  "EXTRUSION": "Ekstruziya",
  "DEGASSING": "Gaz chiqarish",
  "LAMINATION": "Laminatsiya",
  "BRONZING": "Bronzalash",
  "DUPLICATION": "Duplikatsiya",
  "PACKAGING": "Qadoqlash",
  "QUALITY_CONTROL": "Sifat nazorati",
  "WAREHOUSE_TRANSFER": "Ombor ko'chirish",
  "CUSTOMER_DELIVERY": "Mijozga yetkazish",
};

export function translateStepType(stepType: string): string {
  return STEP_TYPE_TRANSLATIONS[stepType] || stepType;
}