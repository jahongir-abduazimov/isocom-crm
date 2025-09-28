import { create } from "zustand";
import {
    RecyclingService,
    type Recycling,
    type RecyclingResponse,
    type RecyclingBatch,
    type CurrentTotals,
    type DrobilkaProcess,
    type StartDrobilkaRequest,
    type CompleteDrobilkaRequest,
    type CompleteRecyclingRequest
} from "@/services/recycling.service";

interface RecyclingState {
    // Legacy recycling data (eski tizim uchun saqlanadi)
    recyclings: Recycling[];
    totalCount: number;

    // Yangi qayta ishlash tizimi
    currentBatch: RecyclingBatch | null;
    recyclingBatches: RecyclingBatch[];
    currentTotals: CurrentTotals | null;

    // Drobilka jarayonlari
    drobilkaProcesses: DrobilkaProcess[];
    activeDrobilkaProcesses: DrobilkaProcess[];

    // UI holat
    loading: boolean;
    error: string | null;

    // Legacy metodlar
    fetchRecyclings: () => Promise<void>;
    getRecyclingById: (id: string) => Promise<Recycling | null>;

    // Yangi qayta ishlash metodlari - dokumentatsiyaga muvofiq
    startRecyclingBatch: () => Promise<boolean>;
    getCurrentTotals: () => Promise<void>;
    completeRecyclingBatch: (batchId: string, data: CompleteRecyclingRequest) => Promise<boolean>;
    fetchRecyclingBatches: () => Promise<void>;
    getRecyclingBatchById: (id: string) => Promise<RecyclingBatch | null>;

    // Drobilka metodlari
    startDrobilka: (data: StartDrobilkaRequest) => Promise<boolean>;
    completeDrobilka: (id: string, data: CompleteDrobilkaRequest) => Promise<boolean>;
    fetchDrobilkaProcesses: () => Promise<void>;
    getDrobilkaProcessById: (id: string) => Promise<DrobilkaProcess | null>;
    deleteDrobilkaProcess: (id: string) => Promise<boolean>;
    getActiveDrobilkaProcesses: () => DrobilkaProcess[];

    // Utility metodlar
    clearError: () => void;
    refreshData: () => Promise<void>;
}

export const useRecyclingStore = create<RecyclingState>((set, get) => ({
    // Boshlang'ich holat
    recyclings: [],
    totalCount: 0,
    currentBatch: null,
    recyclingBatches: [],
    currentTotals: null,
    drobilkaProcesses: [],
    activeDrobilkaProcesses: [],
    loading: false,
    error: null,

    // Legacy metodlar (eski tizim uchun saqlanadi)
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
                error: "Qayta ishlash ma'lumotlarini olishda xatolik",
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
            set({ error: "Qayta ishlash detallarini olishda xatolik" });
            return null;
        }
    },

    // Yangi qayta ishlash metodlari - dokumentatsiyaga muvofiq
    startRecyclingBatch: async () => {
        set({ loading: true, error: null });
        try {
            const batch = await RecyclingService.startRecyclingBatch();
            set({ currentBatch: batch, loading: false });
            return true;
        } catch (error) {
            console.error("Error starting recycling batch:", error);
            set({
                error: "Qayta ishlash partiyasini boshlashda xatolik",
                loading: false,
            });
            return false;
        }
    },

    getCurrentTotals: async () => {
        set({ loading: true, error: null });
        try {
            const totals = await RecyclingService.getCurrentTotals();
            set({ currentTotals: totals, loading: false });
        } catch (error) {
            console.error("Error fetching current totals:", error);
            set({
                error: "Joriy miqdorlarni olishda xatolik",
                loading: false,
            });
        }
    },

    completeRecyclingBatch: async (batchId: string, data: CompleteRecyclingRequest) => {
        set({ loading: true, error: null });
        try {
            const batch = await RecyclingService.completeRecyclingBatch(batchId, data);
            set({ currentBatch: batch, loading: false });
            return true;
        } catch (error) {
            console.error("Error completing recycling batch:", error);
            set({
                error: "Qayta ishlash partiyasini yakunlashda xatolik",
                loading: false,
            });
            return false;
        }
    },

    fetchRecyclingBatches: async () => {
        set({ loading: true, error: null });
        try {
            const batches = await RecyclingService.getRecyclingBatches();
            // Faol partiyani topish (status IN_PROGRESS bo'lgan)
            const activeBatch = batches.find(batch => batch.status === "IN_PROGRESS");
            set({
                recyclingBatches: batches,
                currentBatch: activeBatch || null,
                loading: false
            });
        } catch (error) {
            console.error("Error fetching recycling batches:", error);
            set({
                error: "Qayta ishlash partiyalarini olishda xatolik",
                loading: false,
            });
        }
    },

    getRecyclingBatchById: async (id: string) => {
        try {
            const batch = await RecyclingService.getRecyclingBatchById(id);
            return batch;
        } catch (error) {
            console.error("Error fetching recycling batch by ID:", error);
            set({ error: "Qayta ishlash partiya detallarini olishda xatolik" });
            return null;
        }
    },

    // Drobilka metodlari
    startDrobilka: async (data: StartDrobilkaRequest) => {
        set({ loading: true, error: null });
        try {
            const process = await RecyclingService.startDrobilka(data);
            set((state) => {
                const updatedProcesses = [...state.drobilkaProcesses, process];
                const activeProcesses = updatedProcesses.filter(p => !p.completed_at);
                return {
                    drobilkaProcesses: updatedProcesses,
                    activeDrobilkaProcesses: activeProcesses,
                    loading: false,
                };
            });
            return true;
        } catch (error) {
            console.error("Error starting drobilka:", error);
            set({
                error: "Drobilka jarayonini boshlashda xatolik",
                loading: false,
            });
            return false;
        }
    },

    completeDrobilka: async (id: string, data: CompleteDrobilkaRequest) => {
        set({ loading: true, error: null });
        try {
            const process = await RecyclingService.completeDrobilka(id, data);
            set((state) => {
                const updatedProcesses = state.drobilkaProcesses.map(p =>
                    p.id === id ? process : p
                );
                const activeProcesses = updatedProcesses.filter(p => !p.completed_at);
                return {
                    drobilkaProcesses: updatedProcesses,
                    activeDrobilkaProcesses: activeProcesses,
                    loading: false,
                };
            });
            return true;
        } catch (error) {
            console.error("Error completing drobilka:", error);
            set({
                error: "Drobilka jarayonini yakunlashda xatolik",
                loading: false,
            });
            return false;
        }
    },

    fetchDrobilkaProcesses: async () => {
        set({ loading: true, error: null });
        try {
            const response = await RecyclingService.getDrobilkaProcesses();
            // Ensure we have an array
            const processes = Array.isArray(response) ? response : [];
            const activeProcesses = processes.filter(p => !p.completed_at);
            set({
                drobilkaProcesses: processes,
                activeDrobilkaProcesses: activeProcesses,
                loading: false
            });
        } catch (error) {
            console.error("Error fetching drobilka processes:", error);
            set({
                error: "Drobilka jarayonlarini olishda xatolik",
                loading: false,
            });
        }
    },

    getDrobilkaProcessById: async (id: string) => {
        try {
            const process = await RecyclingService.getDrobilkaProcessById(id);
            return process;
        } catch (error) {
            console.error("Error fetching drobilka process by ID:", error);
            set({ error: "Drobilka jarayon detallarini olishda xatolik" });
            return null;
        }
    },

    deleteDrobilkaProcess: async (id: string) => {
        set({ loading: true, error: null });
        try {
            await RecyclingService.deleteDrobilkaProcess(id);
            set((state) => {
                const updatedProcesses = state.drobilkaProcesses.filter(p => p.id !== id);
                const activeProcesses = updatedProcesses.filter(p => !p.completed_at);
                return {
                    drobilkaProcesses: updatedProcesses,
                    activeDrobilkaProcesses: activeProcesses,
                    loading: false,
                };
            });
            return true;
        } catch (error) {
            console.error("Error deleting drobilka process:", error);
            set({
                error: "Drobilka jarayonini o'chirishda xatolik",
                loading: false,
            });
            return false;
        }
    },

    getActiveDrobilkaProcesses: () => {
        const { drobilkaProcesses } = get();
        return drobilkaProcesses.filter(p => !p.completed_at);
    },

    // Utility metodlar
    clearError: () => set({ error: null }),

    refreshData: async () => {
        const { getCurrentTotals, fetchDrobilkaProcesses, fetchRecyclingBatches } = get();
        await Promise.all([
            getCurrentTotals(),
            fetchDrobilkaProcesses(),
            fetchRecyclingBatches()
        ]);
    },
}));
