import { create } from "zustand";
import type { Warehouse } from "@/services/warehouse.service";

interface WarehousesState {
    warehouses: Warehouse[];
    loading: boolean;
    error: string | null;
    fetchWarehouses: () => Promise<void>;
    addWarehouse: (warehouse: Warehouse) => void;
    updateWarehouse: (id: string, warehouse: Partial<Warehouse>) => void;
    removeWarehouse: (id: string) => void;
}

export const useWarehousesStore = create<WarehousesState>((set) => ({
    warehouses: [],
    loading: false,
    error: null,

    fetchWarehouses: async () => {
        set({ loading: true, error: null });
        try {
            const request = (await import("@/components/config")).default;
            const res = await request.get("/warehouses/");
            set({ warehouses: res.data.results, loading: false });
        } catch (err: any) {
            let message = "Unknown error";
            if (err?.response?.data?.detail) message = err.response.data.detail;
            else if (err instanceof Error) message = err.message;
            set({ error: message, loading: false });
        }
    },

    addWarehouse: (warehouse) =>
        set((state) => ({ warehouses: [...state.warehouses, warehouse] })),

    updateWarehouse: (id, updatedWarehouse) =>
        set((state) => ({
            warehouses: state.warehouses.map((warehouse) =>
                warehouse.id === id ? { ...warehouse, ...updatedWarehouse } : warehouse
            ),
        })),

    removeWarehouse: (id) =>
        set((state) => ({
            warehouses: state.warehouses.filter((warehouse) => warehouse.id !== id),
        })),
}));
