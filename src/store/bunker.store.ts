import { create } from 'zustand';
import { bunkerService } from '@/services/bunker.service';
import type { Bunker, BunkerStatus, ShiftStatus, FillBunkerRequest, StartShiftRequest, EndShiftRequest } from '@/services/bunker.service';

interface BunkerState {
    // State
    bunkers: Bunker[];
    currentBunker: Bunker | null;
    bunkerStatus: BunkerStatus | null;
    shiftStatus: ShiftStatus | null;
    materials: any[];
    operators: any[];

    // Loading states
    bunkersLoading: boolean;
    statusLoading: boolean;
    shiftLoading: boolean;
    materialsLoading: boolean;
    operatorsLoading: boolean;
    fillLoading: boolean;

    // Error states
    bunkersError: string | null;
    statusError: string | null;
    shiftError: string | null;
    materialsError: string | null;
    operatorsError: string | null;
    fillError: string | null;

    // Actions
    fetchBunkers: () => Promise<void>;
    fetchBunkerStatus: (bunkerId: string) => Promise<void>;
    fetchShiftStatus: (bunkerId: string) => Promise<void>;
    fetchMaterials: () => Promise<void>;
    fetchOperators: () => Promise<void>;
    fillBunker: (bunkerId: string, request: FillBunkerRequest) => Promise<void>;
    startShift: (bunkerId: string, request: StartShiftRequest) => Promise<void>;
    endShift: (bunkerId: string, request: EndShiftRequest) => Promise<void>;
    setCurrentBunker: (bunker: Bunker | null) => void;
    clearErrors: () => void;
    reset: () => void;
}

export const useBunkerStore = create<BunkerState>((set, get) => ({
    // Initial state
    bunkers: [],
    currentBunker: null,
    bunkerStatus: null,
    shiftStatus: null,
    materials: [],
    operators: [],

    bunkersLoading: false,
    statusLoading: false,
    shiftLoading: false,
    materialsLoading: false,
    operatorsLoading: false,
    fillLoading: false,

    bunkersError: null,
    statusError: null,
    shiftError: null,
    materialsError: null,
    operatorsError: null,
    fillError: null,

    // Actions
    fetchBunkers: async () => {
        set({ bunkersLoading: true, bunkersError: null });
        try {
            const bunkers = await bunkerService.fetchBunkers();
            set({ bunkers, bunkersLoading: false });
        } catch (error) {
            set({
                bunkersError: error instanceof Error ? error.message : 'Failed to fetch bunkers',
                bunkersLoading: false
            });
        }
    },

    fetchBunkerStatus: async (bunkerId: string) => {
        set({ statusLoading: true, statusError: null });
        try {
            const bunkerStatus = await bunkerService.fetchBunkerStatus(bunkerId);
            set({ bunkerStatus, statusLoading: false });
        } catch (error) {
            set({
                statusError: error instanceof Error ? error.message : 'Failed to fetch bunker status',
                statusLoading: false
            });
        }
    },

    fetchShiftStatus: async (bunkerId: string) => {
        set({ shiftLoading: true, shiftError: null });
        try {
            const shiftStatus = await bunkerService.fetchShiftStatus(bunkerId);
            set({ shiftStatus, shiftLoading: false });
        } catch (error) {
            set({
                shiftError: error instanceof Error ? error.message : 'Failed to fetch shift status',
                shiftLoading: false
            });
        }
    },

    fetchMaterials: async () => {
        set({ materialsLoading: true, materialsError: null });
        try {
            const materials = await bunkerService.fetchMaterials();
            set({ materials, materialsLoading: false });
        } catch (error) {
            set({
                materialsError: error instanceof Error ? error.message : 'Failed to fetch materials',
                materialsLoading: false
            });
        }
    },

    fetchOperators: async () => {
        set({ operatorsLoading: true, operatorsError: null });
        try {
            const operators = await bunkerService.fetchOperators();
            set({ operators, operatorsLoading: false });
        } catch (error) {
            set({
                operatorsError: error instanceof Error ? error.message : 'Failed to fetch operators',
                operatorsLoading: false
            });
        }
    },

    fillBunker: async (bunkerId: string, request: FillBunkerRequest) => {
        set({ fillLoading: true, fillError: null });
        try {
            await bunkerService.fillBunker(bunkerId, request);
            // Refresh bunkers list after filling
            await get().fetchBunkers();
            set({ fillLoading: false });
        } catch (error) {
            set({
                fillError: error instanceof Error ? error.message : 'Failed to fill bunker',
                fillLoading: false
            });
        }
    },

    startShift: async (bunkerId: string, request: StartShiftRequest) => {
        set({ shiftLoading: true, shiftError: null });
        try {
            await bunkerService.startShift(bunkerId, request);
            // Refresh shift status after starting
            await get().fetchShiftStatus(bunkerId);
            set({ shiftLoading: false });
        } catch (error) {
            set({
                shiftError: error instanceof Error ? error.message : 'Failed to start shift',
                shiftLoading: false
            });
        }
    },

    endShift: async (bunkerId: string, request: EndShiftRequest) => {
        set({ shiftLoading: true, shiftError: null });
        try {
            await bunkerService.endShift(bunkerId, request);
            // Refresh shift status after ending
            await get().fetchShiftStatus(bunkerId);
            set({ shiftLoading: false });
        } catch (error) {
            set({
                shiftError: error instanceof Error ? error.message : 'Failed to end shift',
                shiftLoading: false
            });
        }
    },

    setCurrentBunker: (bunker: Bunker | null) => {
        set({ currentBunker: bunker });
    },

    clearErrors: () => {
        set({
            bunkersError: null,
            statusError: null,
            shiftError: null,
            materialsError: null,
            operatorsError: null,
            fillError: null,
        });
    },

    reset: () => {
        set({
            bunkers: [],
            currentBunker: null,
            bunkerStatus: null,
            shiftStatus: null,
            materials: [],
            operators: [],
            bunkersLoading: false,
            statusLoading: false,
            shiftLoading: false,
            materialsLoading: false,
            operatorsLoading: false,
            fillLoading: false,
            bunkersError: null,
            statusError: null,
            shiftError: null,
            materialsError: null,
            operatorsError: null,
            fillError: null,
        });
    },
}));
