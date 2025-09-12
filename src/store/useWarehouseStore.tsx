import { create } from "zustand";

export interface WarehouseItem {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  unit: string;
  category: string;
  updatedAt: string;
}

interface WarehouseStore {
  items: WarehouseItem[];
  addItem: (item: WarehouseItem) => void;
  updateItem: (id: string, updated: Partial<WarehouseItem>) => void;
  deleteItem: (id: string) => void;
}

export const useWarehouseStore = create<WarehouseStore>((set) => ({
  items: [
    {
      id: "1",
      name: "Plastik qopqoq",
      sku: "PK-001",
      quantity: 1200,
      unit: "dona",
      category: "Qadoqlash",
      updatedAt: "2025-09-07",
    },
    {
      id: "2",
      name: "Shisha butilka",
      sku: "SB-002",
      quantity: 540,
      unit: "dona",
      category: "Idish",
      updatedAt: "2025-09-05",
    },
  ],
  addItem: (item) =>
    set((state) => ({ items: [...state.items, item] })),
  updateItem: (id, updated) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id ? { ...item, ...updated } : item
      ),
    })),
  deleteItem: (id) =>
    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
    })),
}));
