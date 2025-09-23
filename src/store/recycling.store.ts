import { create } from "zustand";
import {
    RecyclingService,
    type Recycling,
    type RecyclingResponse,
    type RecyclingBatch,
    type CurrentTotals,
    type DrobilkaProcess,
    type StartDrobilkaRequest,
    type CompleteDrobilkaRequest
} from "@/services/recycling.service";

interface RecyclingState {
    // Legacy recycling data
    recyclings: Recycling[];
    totalCount: number;

    // New batch management
    currentBatch: RecyclingBatch | null;
    currentTotals: CurrentTotals | null;

    // Drobilka processes
    drobilkaProcesses: DrobilkaProcess[];

    // UI state
    loading: boolean;
    error: string | null;

    // Legacy methods
    fetchRecyclings: () => Promise<void>;
    getRecyclingById: (id: string) => Promise<Recycling | null>;

    // New batch management methods
    startRecyclingBatch: () => Promise<boolean>;
    getCurrentTotals: () => Promise<void>;
    completeRecyclingBatch: (batchId: string) => Promise<boolean>;

    // Drobilka methods
    startDrobilka: (data: StartDrobilkaRequest) => Promise<boolean>;
    completeDrobilka: (id: string, data: CompleteDrobilkaRequest) => Promise<boolean>;
    fetchDrobilkaProcesses: () => Promise<void>;
    getDrobilkaProcessById: (id: string) => Promise<DrobilkaProcess | null>;

    // Utility methods
    clearError: () => void;
}

export const useRecyclingStore = create<RecyclingState>((set) => ({
    // Initial state
    recyclings: [],
    totalCount: 0,
    currentBatch: null,
    currentTotals: null,
    drobilkaProcesses: [],
    loading: false,
    error: null,

    // Legacy methods
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

    // New batch management methods
    startRecyclingBatch: async () => {
        set({ loading: true, error: null });
        try {
            const batch = await RecyclingService.startRecyclingBatch();
            set({ currentBatch: batch, loading: false });
            return true;
        } catch (error) {
            console.error("Error starting recycling batch:", error);
            set({
                error: "Failed to start recycling batch",
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
                error: "Failed to fetch current totals",
                loading: false,
            });
        }
    },

    completeRecyclingBatch: async (batchId: string) => {
        set({ loading: true, error: null });
        try {
            const batch = await RecyclingService.completeRecyclingBatch(batchId);
            set({ currentBatch: batch, loading: false });
            return true;
        } catch (error) {
            console.error("Error completing recycling batch:", error);
            set({
                error: "Failed to complete recycling batch",
                loading: false,
            });
            return false;
        }
    },

    // Drobilka methods
    startDrobilka: async (data: StartDrobilkaRequest) => {
        set({ loading: true, error: null });
        try {
            const process = await RecyclingService.startDrobilka(data);
            set((state) => ({
                drobilkaProcesses: [...state.drobilkaProcesses, process],
                loading: false,
            }));
            return true;
        } catch (error) {
            console.error("Error starting drobilka:", error);
            set({
                error: "Failed to start drobilka process",
                loading: false,
            });
            return false;
        }
    },

    completeDrobilka: async (id: string, data: CompleteDrobilkaRequest) => {
        set({ loading: true, error: null });
        try {
            const process = await RecyclingService.completeDrobilka(id, data);
            set((state) => ({
                drobilkaProcesses: state.drobilkaProcesses.map(p =>
                    p.id === id ? process : p
                ),
                loading: false,
            }));
            return true;
        } catch (error) {
            console.error("Error completing drobilka:", error);
            set({
                error: "Failed to complete drobilka process",
                loading: false,
            });
            return false;
        }
    },

    fetchDrobilkaProcesses: async () => {
        set({ loading: true, error: null });
        try {
            const processes = await RecyclingService.getDrobilkaProcesses();
            set({ drobilkaProcesses: processes, loading: false });
        } catch (error) {
            console.error("Error fetching drobilka processes:", error);
            set({
                error: "Failed to fetch drobilka processes",
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
            set({ error: "Failed to fetch drobilka process details" });
            return null;
        }
    },

    // Utility methods
    clearError: () => set({ error: null }),
}));
