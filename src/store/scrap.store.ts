import { create } from "zustand";
import {
    ScrapService,
    type Scrap,
    type ScrapFilters,
    type RealTimeScrapData,
    type ScrapStatistics
} from "@/services/scrap.service";

interface ScrapState {
    // Asosiy ma'lumotlar
    scraps: Scrap[];
    totalCount: number;

    // Real-time ma'lumotlar
    realTimeData: RealTimeScrapData | null;
    statistics: ScrapStatistics | null;

    // UI holat
    loading: boolean;
    error: string | null;

    // Asosiy metodlar
    fetchScraps: (filters?: ScrapFilters) => Promise<void>;
    getScrapById: (id: string) => Promise<Scrap | null>;

    // Yangi metodlar - dokumentatsiyaga muvofiq
    getRealTimeScrap: () => Promise<void>;
    getScrapStatistics: () => Promise<void>;
    getProductionScraps: (stepExecutionId: string) => Promise<Scrap[]>;
    createScrap: (scrapData: Partial<Scrap>) => Promise<boolean>;
    updateScrap: (id: string, scrapData: Partial<Scrap>) => Promise<boolean>;

    // Utility metodlar
    clearError: () => void;
    refreshData: () => Promise<void>;
}

export const useScrapStore = create<ScrapState>((set, get) => ({
    // Boshlang'ich holat
    scraps: [],
    totalCount: 0,
    realTimeData: null,
    statistics: null,
    loading: false,
    error: null,

    // Asosiy metodlar
    fetchScraps: async (filters?: ScrapFilters) => {
        set({ loading: true, error: null });
        try {
            console.log("Fetching scraps with filters:", filters);
            const response = await ScrapService.getScraps(filters);
            console.log("Scraps received:", response);
            set({
                scraps: response.results || [],
                totalCount: response.count || 0,
                loading: false,
            });
        } catch (error) {
            console.error("Error fetching scraps:", error);
            set({
                error: "Brak ma'lumotlarini olishda xatolik",
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
            set({ error: "Brak detallarini olishda xatolik" });
            return null;
        }
    },

    // Yangi metodlar - dokumentatsiyaga muvofiq
    getRealTimeScrap: async () => {
        set({ loading: true, error: null });
        try {
            const realTimeData = await ScrapService.getRealTimeScrap();
            set({ realTimeData, loading: false });
        } catch (error) {
            console.error("Error fetching real-time scrap data:", error);
            set({
                error: "Real-time brak ma'lumotlarini olishda xatolik",
                loading: false,
            });
        }
    },

    getScrapStatistics: async () => {
        set({ loading: true, error: null });
        try {
            const statistics = await ScrapService.getScrapStatistics();
            set({ statistics, loading: false });
        } catch (error) {
            console.error("Error fetching scrap statistics:", error);
            set({
                error: "Brak statistikasini olishda xatolik",
                loading: false,
            });
        }
    },

    getProductionScraps: async (stepExecutionId: string) => {
        try {
            const scraps = await ScrapService.getProductionScraps(stepExecutionId);
            return scraps;
        } catch (error) {
            console.error("Error fetching production scraps:", error);
            set({ error: "Ishlab chiqarish braklarini olishda xatolik" });
            return [];
        }
    },

    createScrap: async (scrapData: Partial<Scrap>) => {
        set({ loading: true, error: null });
        try {
            await ScrapService.createScrap(scrapData);
            set({ loading: false });
            return true;
        } catch (error) {
            console.error("Error creating scrap:", error);
            set({
                error: "Brak yaratishda xatolik",
                loading: false,
            });
            return false;
        }
    },

    updateScrap: async (id: string, scrapData: Partial<Scrap>) => {
        set({ loading: true, error: null });
        try {
            await ScrapService.updateScrap(id, scrapData);
            set({ loading: false });
            return true;
        } catch (error) {
            console.error("Error updating scrap:", error);
            set({
                error: "Brak yangilashda xatolik",
                loading: false,
            });
            return false;
        }
    },

    // Utility metodlar
    clearError: () => set({ error: null }),

    refreshData: async () => {
        const { fetchScraps, getRealTimeScrap, getScrapStatistics } = get();
        await Promise.all([
            fetchScraps(),
            getRealTimeScrap(),
            getScrapStatistics()
        ]);
    },
}));
