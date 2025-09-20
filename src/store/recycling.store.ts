import { create } from "zustand";
import { RecyclingService, type Recycling, type RecyclingResponse } from "@/services/recycling.service";

interface RecyclingState {
    recyclings: Recycling[];
    loading: boolean;
    error: string | null;
    totalCount: number;
    fetchRecyclings: () => Promise<void>;
    getRecyclingById: (id: string) => Promise<Recycling | null>;
    clearError: () => void;
}

export const useRecyclingStore = create<RecyclingState>((set) => ({
    recyclings: [],
    loading: false,
    error: null,
    totalCount: 0,

    fetchRecyclings: async () => {
        set({ loading: true, error: null });
        try {
            const response: RecyclingResponse = await RecyclingService.getRecyclings();
            set({
                recyclings: response.results,
                totalCount: response.count,
                loading: false,
            });
        } catch (error) {
            console.error("Error fetching recyclings:", error);
            set({
                error: "Failed to fetch recyclings",
                loading: false,
            });
        }
    },

    getRecyclingById: async (id: string) => {
        try {
            const recycling = await RecyclingService.getRecyclingById(id);
            return recycling;
        } catch (error) {
            console.error("Error fetching recycling by ID:", error);
            set({ error: "Failed to fetch recycling details" });
            return null;
        }
    },

    clearError: () => set({ error: null }),
}));
