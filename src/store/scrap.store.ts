import { create } from "zustand";
import { ScrapService, type Scrap, type ScrapResponse } from "@/services/scrap.service";

interface ScrapState {
    scraps: Scrap[];
    loading: boolean;
    error: string | null;
    totalCount: number;
    fetchScraps: () => Promise<void>;
    getScrapById: (id: string) => Promise<Scrap | null>;
    clearError: () => void;
}

export const useScrapStore = create<ScrapState>((set) => ({
    scraps: [],
    loading: false,
    error: null,
    totalCount: 0,

    fetchScraps: async () => {
        set({ loading: true, error: null });
        try {
            const response: ScrapResponse = await ScrapService.getScraps();
            set({
                scraps: response.results,
                totalCount: response.count,
                loading: false,
            });
        } catch (error) {
            console.error("Error fetching scraps:", error);
            set({
                error: "Failed to fetch scraps",
                loading: false,
            });
        }
    },

    getScrapById: async (id: string) => {
        try {
            const scrap = await ScrapService.getScrapById(id);
            return scrap;
        } catch (error) {
            console.error("Error fetching scrap by ID:", error);
            set({ error: "Failed to fetch scrap details" });
            return null;
        }
    },

    clearError: () => set({ error: null }),
}));
