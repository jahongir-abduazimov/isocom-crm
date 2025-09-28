import { create } from "zustand";
import { bunkerService } from "@/services/bunker.service";
import type {
  Bunker,
  Container,
  BunkerFillSession,
  FillBunkerRequest,
  BunkerStatus,
  ShiftStatus,
  StartShiftRequest,
  EndShiftRequest,
} from "@/services/bunker.service";

interface BunkerState {
  // State
  bunkers: Bunker[];
  containers: Container[];
  fillSessions: BunkerFillSession[];
  currentBunker: Bunker | null;
  currentContainer: Container | null;
  currentFillSession: BunkerFillSession | null;
  bunkerStatus: BunkerStatus | null;
  shiftStatus: ShiftStatus | null;
  materials: any[];
  operators: any[];
  orders: any[];

  // Loading states
  bunkersLoading: boolean;
  containersLoading: boolean;
  fillSessionsLoading: boolean;
  statusLoading: boolean;
  shiftLoading: boolean;
  materialsLoading: boolean;
  operatorsLoading: boolean;
  ordersLoading: boolean;
  fillLoading: boolean;
  processRemainingLoading: boolean;

  // Error states
  bunkersError: string | null;
  containersError: string | null;
  fillSessionsError: string | null;
  statusError: string | null;
  shiftError: string | null;
  materialsError: string | null;
  operatorsError: string | null;
  ordersError: string | null;
  fillError: string | null;
  processRemainingError: string | null;

  // Actions
  fetchBunkers: () => Promise<void>;
  fetchBunkerById: (bunkerId: string) => Promise<void>;
  createBunker: (bunkerData: {
    work_center: string;
    name: string;
    capacity_kg: number;
    is_filled: boolean;
  }) => Promise<void>;
  updateBunker: (
    bunkerId: string,
    bunkerData: Partial<Bunker>
  ) => Promise<void>;
  deleteBunker: (bunkerId: string) => Promise<void>;

  fetchContainers: () => Promise<void>;
  fetchContainersByBunker: (bunkerId: string) => Promise<void>;
  createContainer: (containerData: {
    bunker: string;
    container_name: string;
    empty_weight_kg: string;
    max_capacity_kg: string;
    current_capacity_kg?: string;
  }) => Promise<void>;
  updateContainer: (
    containerId: string,
    containerData: Partial<Container> & { bunker?: string }
  ) => Promise<void>;
  deleteContainer: (containerId: string) => Promise<void>;

  fetchFillSessions: () => Promise<void>;
  fetchBunkerStatus: (bunkerId: string) => Promise<void>;
  fillBunker: (request: FillBunkerRequest) => Promise<void>;
  processRemainingMaterials: (fillSessionId: string) => Promise<void>;

  fetchMaterials: () => Promise<void>;
  fetchOperators: () => Promise<void>;
  fetchOrders: () => Promise<void>;

  // Legacy methods for backward compatibility
  fetchShiftStatus: (bunkerId: string) => Promise<void>;
  startShift: (bunkerId: string, request: StartShiftRequest) => Promise<void>;
  endShift: (bunkerId: string, request: EndShiftRequest) => Promise<void>;

  setCurrentBunker: (bunker: Bunker | null) => void;
  setCurrentContainer: (container: Container | null) => void;
  setCurrentFillSession: (fillSession: BunkerFillSession | null) => void;
  clearErrors: () => void;
  reset: () => void;
}

export const useBunkerStore = create<BunkerState>((set, get) => ({
  // Initial state
  bunkers: [],
  containers: [],
  fillSessions: [],
  currentBunker: null,
  currentContainer: null,
  currentFillSession: null,
  bunkerStatus: null,
  shiftStatus: null,
  materials: [],
  operators: [],
  orders: [],

  bunkersLoading: false,
  containersLoading: false,
  fillSessionsLoading: false,
  statusLoading: false,
  shiftLoading: false,
  materialsLoading: false,
  operatorsLoading: false,
  ordersLoading: false,
  fillLoading: false,
  processRemainingLoading: false,

  bunkersError: null,
  containersError: null,
  fillSessionsError: null,
  statusError: null,
  shiftError: null,
  materialsError: null,
  operatorsError: null,
  ordersError: null,
  fillError: null,
  processRemainingError: null,

  // Actions
  fetchBunkers: async () => {
    set({ bunkersLoading: true, bunkersError: null });
    try {
      const bunkers = await bunkerService.fetchBunkers();
      set({ bunkers, bunkersLoading: false });
    } catch (error) {
      set({
        bunkersError:
          error instanceof Error ? error.message : "Failed to fetch bunkers",
        bunkersLoading: false,
      });
    }
  },

  fetchBunkerById: async (bunkerId: string) => {
    set({ bunkersLoading: true, bunkersError: null });
    try {
      const bunker = await bunkerService.fetchBunkerById(bunkerId);
      set({ currentBunker: bunker, bunkersLoading: false });
    } catch (error) {
      set({
        bunkersError:
          error instanceof Error ? error.message : "Failed to fetch bunker",
        bunkersLoading: false,
      });
    }
  },

  createBunker: async (bunkerData) => {
    set({ bunkersLoading: true, bunkersError: null });
    try {
      const bunker = await bunkerService.createBunker(bunkerData);
      set((state) => ({
        bunkers: [...state.bunkers, bunker],
        bunkersLoading: false,
      }));
    } catch (error) {
      set({
        bunkersError:
          error instanceof Error ? error.message : "Failed to create bunker",
        bunkersLoading: false,
      });
    }
  },

  updateBunker: async (bunkerId, bunkerData) => {
    set({ bunkersLoading: true, bunkersError: null });
    try {
      const updatedBunker = await bunkerService.updateBunker(
        bunkerId,
        bunkerData
      );
      set((state) => ({
        bunkers: state.bunkers.map((b) =>
          b.id === bunkerId ? updatedBunker : b
        ),
        currentBunker:
          state.currentBunker?.id === bunkerId
            ? updatedBunker
            : state.currentBunker,
        bunkersLoading: false,
      }));
    } catch (error) {
      set({
        bunkersError:
          error instanceof Error ? error.message : "Failed to update bunker",
        bunkersLoading: false,
      });
    }
  },

  deleteBunker: async (bunkerId) => {
    set({ bunkersLoading: true, bunkersError: null });
    try {
      await bunkerService.deleteBunker(bunkerId);
      set((state) => ({
        bunkers: state.bunkers.filter((b) => b.id !== bunkerId),
        currentBunker:
          state.currentBunker?.id === bunkerId ? null : state.currentBunker,
        bunkersLoading: false,
      }));
    } catch (error) {
      set({
        bunkersError:
          error instanceof Error ? error.message : "Failed to delete bunker",
        bunkersLoading: false,
      });
    }
  },

  // Container Management
  fetchContainers: async () => {
    set({ containersLoading: true, containersError: null });
    try {
      const containers = await bunkerService.fetchContainers();
      set({ containers, containersLoading: false });
    } catch (error) {
      set({
        containersError:
          error instanceof Error ? error.message : "Failed to fetch containers",
        containersLoading: false,
      });
    }
  },

  fetchContainersByBunker: async (bunkerId) => {
    set({ containersLoading: true, containersError: null });
    try {
      const containers = await bunkerService.fetchContainersByBunker(bunkerId);
      set({ containers, containersLoading: false });
    } catch (error) {
      set({
        containersError:
          error instanceof Error ? error.message : "Failed to fetch containers",
        containersLoading: false,
      });
    }
  },

  createContainer: async (containerData) => {
    set({ containersLoading: true, containersError: null });
    try {
      const container = await bunkerService.createContainer(containerData);
      set((state) => ({
        containers: [...state.containers, container],
        containersLoading: false,
      }));
    } catch (error) {
      set({
        containersError:
          error instanceof Error ? error.message : "Failed to create container",
        containersLoading: false,
      });
    }
  },

  updateContainer: async (containerId, containerData) => {
    set({ containersLoading: true, containersError: null });
    try {
      const updatedContainer = await bunkerService.updateContainer(
        containerId,
        containerData
      );
      set((state) => ({
        containers: state.containers.map((c) =>
          c.id === containerId ? updatedContainer : c
        ),
        currentContainer:
          state.currentContainer?.id === containerId
            ? updatedContainer
            : state.currentContainer,
        containersLoading: false,
      }));
    } catch (error) {
      set({
        containersError:
          error instanceof Error ? error.message : "Failed to update container",
        containersLoading: false,
      });
    }
  },

  deleteContainer: async (containerId) => {
    set({ containersLoading: true, containersError: null });
    try {
      await bunkerService.deleteContainer(containerId);
      set((state) => ({
        containers: state.containers.filter((c) => c.id !== containerId),
        currentContainer:
          state.currentContainer?.id === containerId
            ? null
            : state.currentContainer,
        containersLoading: false,
      }));
    } catch (error) {
      set({
        containersError:
          error instanceof Error ? error.message : "Failed to delete container",
        containersLoading: false,
      });
    }
  },

  // Fill Sessions
  fetchFillSessions: async () => {
    set({ fillSessionsLoading: true, fillSessionsError: null });
    try {
      const fillSessions = await bunkerService.fetchFillSessions();
      set({ fillSessions, fillSessionsLoading: false });
    } catch (error) {
      set({
        fillSessionsError:
          error instanceof Error
            ? error.message
            : "Failed to fetch fill sessions",
        fillSessionsLoading: false,
      });
    }
  },

  fetchBunkerStatus: async (bunkerId: string) => {
    set({ statusLoading: true, statusError: null });
    try {
      const bunkerStatus = await bunkerService.fetchBunkerStatus(bunkerId);
      set({ currentFillSession: bunkerStatus, statusLoading: false });
    } catch (error) {
      set({
        statusError:
          error instanceof Error
            ? error.message
            : "Failed to fetch bunker status",
        statusLoading: false,
      });
    }
  },

  processRemainingMaterials: async (fillSessionId: string) => {
    set({ processRemainingLoading: true, processRemainingError: null });
    try {
      await bunkerService.processRemainingMaterials(fillSessionId);
      set((state) => ({
        fillSessions: state.fillSessions.map((fs) =>
          fs.id === fillSessionId ? { ...fs, is_remaining_processed: true } : fs
        ),
        processRemainingLoading: false,
      }));
    } catch (error) {
      set({
        processRemainingError:
          error instanceof Error
            ? error.message
            : "Failed to process remaining materials",
        processRemainingLoading: false,
      });
    }
  },

  fetchOrders: async () => {
    set({ ordersLoading: true, ordersError: null });
    try {
      const orders = await bunkerService.fetchOrders();
      set({ orders, ordersLoading: false });
    } catch (error) {
      set({
        ordersError:
          error instanceof Error ? error.message : "Failed to fetch orders",
        ordersLoading: false,
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
        shiftError:
          error instanceof Error
            ? error.message
            : "Failed to fetch shift status",
        shiftLoading: false,
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
        materialsError:
          error instanceof Error ? error.message : "Failed to fetch materials",
        materialsLoading: false,
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
        operatorsError:
          error instanceof Error ? error.message : "Failed to fetch operators",
        operatorsLoading: false,
      });
    }
  },

  fillBunker: async (request: FillBunkerRequest) => {
    set({ fillLoading: true, fillError: null });
    try {
      const response = await bunkerService.fillBunker(request);
      set((state) => ({
        fillSessions: [response.fill_session, ...state.fillSessions],
        fillLoading: false,
      }));
    } catch (error) {
      set({
        fillError:
          error instanceof Error ? error.message : "Failed to fill bunker",
        fillLoading: false,
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
        shiftError:
          error instanceof Error ? error.message : "Failed to start shift",
        shiftLoading: false,
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
        shiftError:
          error instanceof Error ? error.message : "Failed to end shift",
        shiftLoading: false,
      });
    }
  },

  setCurrentBunker: (bunker: Bunker | null) => {
    set({ currentBunker: bunker });
  },

  setCurrentContainer: (container: Container | null) => {
    set({ currentContainer: container });
  },

  setCurrentFillSession: (fillSession: BunkerFillSession | null) => {
    set({ currentFillSession: fillSession });
  },

  clearErrors: () => {
    set({
      bunkersError: null,
      containersError: null,
      fillSessionsError: null,
      statusError: null,
      shiftError: null,
      materialsError: null,
      operatorsError: null,
      ordersError: null,
      fillError: null,
      processRemainingError: null,
    });
  },

  reset: () => {
    set({
      bunkers: [],
      containers: [],
      fillSessions: [],
      currentBunker: null,
      currentContainer: null,
      currentFillSession: null,
      bunkerStatus: null,
      shiftStatus: null,
      materials: [],
      operators: [],
      orders: [],
      bunkersLoading: false,
      containersLoading: false,
      fillSessionsLoading: false,
      statusLoading: false,
      shiftLoading: false,
      materialsLoading: false,
      operatorsLoading: false,
      ordersLoading: false,
      fillLoading: false,
      processRemainingLoading: false,
      bunkersError: null,
      containersError: null,
      fillSessionsError: null,
      statusError: null,
      shiftError: null,
      materialsError: null,
      operatorsError: null,
      ordersError: null,
      fillError: null,
      processRemainingError: null,
    });
  },
}));
