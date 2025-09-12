import { create } from 'zustand';
import type {
    InventoryMovement,
    StockLevel,
    CreateInventoryMovementRequest,
    CreateStockLevelRequest,
    UpdateStockLevelRequest,
} from '@/services/stock.service';
import { stockService } from '@/services/stock.service';

interface StockSummary {
    totalItems: number;
    totalValue: number;
    lowStockItems: number;
    outOfStockItems: number;
    highStockItems: number;
    normalStockItems: number;
}

interface StockState {
    // Inventory Movements
    movements: InventoryMovement[];
    movementsLoading: boolean;
    movementsError: string | null;
    movementsTotal: number;

    // Stock Levels
    stockLevels: StockLevel[];
    stockLevelsLoading: boolean;
    stockLevelsError: string | null;
    stockLevelsTotal: number;

    // Stock Summary
    stockSummary: StockSummary | null;
    summaryLoading: boolean;
    summaryError: string | null;

    // Actions
    fetchMovements: (params?: {
        page?: number;
        limit?: number;
        materialId?: string;
        movementType?: string;
        location?: string;
        startDate?: string;
        endDate?: string;
    }) => Promise<void>;

    fetchStockLevels: () => Promise<void>;

    fetchStockSummary: () => Promise<void>;

    createMovement: (data: CreateInventoryMovementRequest) => Promise<InventoryMovement | null>;
    updateMovement: (id: string, data: Partial<CreateInventoryMovementRequest>) => Promise<InventoryMovement | null>;
    deleteMovement: (id: string) => Promise<boolean>;

    createStockLevel: (data: CreateStockLevelRequest) => Promise<StockLevel | null>;
    updateStockLevel: (id: string, data: UpdateStockLevelRequest) => Promise<StockLevel | null>;
    deleteStockLevel: (id: string) => Promise<boolean>;
    bulkUpdateStockLevels: (data: UpdateStockLevelRequest[]) => Promise<StockLevel[] | null>;

    exportStockLevels: (format?: 'csv' | 'excel') => Promise<Blob | null>;
    exportMovements: (format?: 'csv' | 'excel', params?: {
        startDate?: string;
        endDate?: string;
        materialId?: string;
        movementType?: string;
        location?: string;
    }) => Promise<Blob | null>;

    clearErrors: () => void;
}

export const useStockStore = create<StockState>((set, get) => ({
    // Initial state
    movements: [],
    movementsLoading: false,
    movementsError: null,
    movementsTotal: 0,

    stockLevels: [],
    stockLevelsLoading: false,
    stockLevelsError: null,
    stockLevelsTotal: 0,

    stockSummary: null,
    summaryLoading: false,
    summaryError: null,

    // Actions
    fetchMovements: async (params) => {
        set({ movementsLoading: true, movementsError: null });
        try {
            const response = await stockService.getInventoryMovements(params);
            set({
                movements: response.results,
                movementsTotal: response.count,
                movementsLoading: false
            });
        } catch (error) {
            set({
                movementsError: error instanceof Error ? error.message : 'Failed to fetch movements',
                movementsLoading: false
            });
        }
    },

    fetchStockLevels: async () => {
        set({ stockLevelsLoading: true, stockLevelsError: null });
        try {
            const response = await stockService.getStockLevels();
            set({
                stockLevels: response.results,
                stockLevelsTotal: response.count,
                stockLevelsLoading: false
            });
        } catch (error) {
            set({
                stockLevelsError: error instanceof Error ? error.message : 'Failed to fetch stock levels',
                stockLevelsLoading: false
            });
        }
    },

    fetchStockSummary: async () => {
        set({ summaryLoading: true, summaryError: null });
        try {
            const summary = await stockService.getStockSummary();
            set({
                stockSummary: summary,
                summaryLoading: false
            });
        } catch (error) {
            set({
                summaryError: error instanceof Error ? error.message : 'Failed to fetch stock summary',
                summaryLoading: false
            });
        }
    },

    createMovement: async (data) => {
        try {
            const newMovement = await stockService.createInventoryMovement(data);

            // Add to current movements list
            const { movements } = get();
            set({ movements: [newMovement, ...movements] });

            // Refresh stock levels as movement affects stock
            get().fetchStockLevels();

            return newMovement;
        } catch (error) {
            set({
                movementsError: error instanceof Error ? error.message : 'Failed to create movement'
            });
            return null;
        }
    },

    updateMovement: async (id, data) => {
        try {
            const updatedMovement = await stockService.updateInventoryMovement(id, data);

            // Update in current movements list
            const { movements } = get();
            const updatedMovements = movements.map(movement =>
                movement.id === id ? updatedMovement : movement
            );
            set({ movements: updatedMovements });

            // Refresh stock levels as movement affects stock
            get().fetchStockLevels();

            return updatedMovement;
        } catch (error) {
            set({
                movementsError: error instanceof Error ? error.message : 'Failed to update movement'
            });
            return null;
        }
    },

    deleteMovement: async (id) => {
        try {
            await stockService.deleteInventoryMovement(id);

            // Remove from current movements list
            const { movements } = get();
            const filteredMovements = movements.filter(movement => movement.id !== id);
            set({ movements: filteredMovements });

            // Refresh stock levels as movement affects stock
            get().fetchStockLevels();

            return true;
        } catch (error) {
            set({
                movementsError: error instanceof Error ? error.message : 'Failed to delete movement'
            });
            return false;
        }
    },

    createStockLevel: async (data) => {
        try {
            const newStockLevel = await stockService.createStockLevel(data);

            // Add to current stock levels list
            const { stockLevels } = get();
            set({ stockLevels: [newStockLevel, ...stockLevels] });

            // Refresh summary
            get().fetchStockSummary();

            return newStockLevel;
        } catch (error) {
            set({
                stockLevelsError: error instanceof Error ? error.message : 'Failed to create stock level'
            });
            return null;
        }
    },

    updateStockLevel: async (id, data) => {
        try {
            const updatedStockLevel = await stockService.updateStockLevel(id, data);

            // Update in current stock levels list
            const { stockLevels } = get();
            const updatedStockLevels = stockLevels.map(stock =>
                stock.id === id ? updatedStockLevel : stock
            );
            set({ stockLevels: updatedStockLevels });

            // Refresh summary
            get().fetchStockSummary();

            return updatedStockLevel;
        } catch (error) {
            set({
                stockLevelsError: error instanceof Error ? error.message : 'Failed to update stock level'
            });
            return null;
        }
    },

    deleteStockLevel: async (id) => {
        try {
            await stockService.deleteStockLevel(id);

            // Remove from current stock levels list
            const { stockLevels } = get();
            const updatedStockLevels = stockLevels.filter(stock => stock.id !== id);
            set({ stockLevels: updatedStockLevels });

            // Refresh summary
            get().fetchStockSummary();

            return true;
        } catch (error) {
            set({
                stockLevelsError: error instanceof Error ? error.message : 'Failed to delete stock level'
            });
            return false;
        }
    },

    bulkUpdateStockLevels: async (data) => {
        try {
            const updatedStockLevels = await stockService.bulkUpdateStockLevels(data);

            // Replace current stock levels list
            set({ stockLevels: updatedStockLevels });

            // Refresh summary
            get().fetchStockSummary();

            return updatedStockLevels;
        } catch (error) {
            set({
                stockLevelsError: error instanceof Error ? error.message : 'Failed to bulk update stock levels'
            });
            return null;
        }
    },

    exportStockLevels: async (format = 'csv') => {
        try {
            const blob = await stockService.exportStockLevels(format);
            return blob;
        } catch (error) {
            set({
                stockLevelsError: error instanceof Error ? error.message : 'Failed to export stock levels'
            });
            return null;
        }
    },

    exportMovements: async (format = 'csv', params) => {
        try {
            const blob = await stockService.exportInventoryMovements(format, params);
            return blob;
        } catch (error) {
            set({
                movementsError: error instanceof Error ? error.message : 'Failed to export movements'
            });
            return null;
        }
    },

    clearErrors: () => {
        set({
            movementsError: null,
            stockLevelsError: null,
            summaryError: null
        });
    }
}));
