import { create } from "zustand";
import { workerService } from "@/services/worker.service";
import type {
  WorkerOrder,
  ProductionStep,
  WorkcenterStock,
  BulkCreateRequest,
  BulkCreateResponse,
} from "@/services/worker.service";

interface SelectedItem {
  id: string;
  name: string;
  type: "material" | "product";
  quantity: number;
  unit_of_measure: string;
  available_quantity: number;
}

interface Operator {
  id: string;
  first_name: string;
  last_name: string;
  username?: string;
  email: string;
  role: string;
  work_center?: string;
}

interface WorkerState {
  // Operators
  operators: Operator[];
  selectedOperator: Operator | null;
  operatorsLoading: boolean;
  operatorsError: string | null;

  // Orders
  orders: WorkerOrder[];
  selectedOrder: WorkerOrder | null;
  ordersLoading: boolean;
  ordersError: string | null;

  // Production Steps
  productionSteps: ProductionStep[];
  selectedStep: ProductionStep | null;
  stepsLoading: boolean;
  stepsError: string | null;

  // Stock Data
  stockData: WorkcenterStock | null;
  stockLoading: boolean;
  stockError: string | null;

  // Selected Items
  selectedItems: SelectedItem[];

  // Submission
  submitting: boolean;
  submitError: string | null;

  // Actions
  fetchOperators: () => Promise<void>;
  setSelectedOperator: (operator: Operator | null) => void;
  fetchOrders: () => Promise<void>;
  setSelectedOrder: (order: WorkerOrder | null) => void;
  fetchOrderSteps: () => Promise<void>;
  setSelectedStep: (step: ProductionStep | null) => void;
  fetchWorkcenterStock: (workcenterId: string) => Promise<void>;
  addSelectedItem: (item: SelectedItem) => void;
  removeSelectedItem: (itemId: string) => void;
  updateSelectedItemQuantity: (itemId: string, quantity: number) => void;
  clearSelectedItems: () => void;
  submitBulkCreate: () => Promise<{
    success: boolean;
    data?: BulkCreateResponse;
    error?: string;
  }>;
  reset: () => void;
}

export const useWorkerStore = create<WorkerState>((set, get) => ({
  // Initial state
  operators: [],
  selectedOperator: null,
  operatorsLoading: false,
  operatorsError: null,

  orders: [],
  selectedOrder: null,
  ordersLoading: false,
  ordersError: null,

  productionSteps: [],
  selectedStep: null,
  stepsLoading: false,
  stepsError: null,

  stockData: null,
  stockLoading: false,
  stockError: null,

  selectedItems: [],

  submitting: false,
  submitError: null,

  // Actions
  fetchOperators: async () => {
    set({ operatorsLoading: true, operatorsError: null });
    try {
      const operators = await workerService.fetchOperators();
      set({ operators, operatorsLoading: false });
    } catch (error) {
      set({
        operatorsError:
          error instanceof Error ? error.message : "Failed to fetch operators",
        operatorsLoading: false,
      });
    }
  },

  setSelectedOperator: (operator) => {
    set({ selectedOperator: operator });
    // Clear related data when operator changes
    if (operator) {
      set({
        orders: [],
        selectedOrder: null,
        productionSteps: [],
        selectedStep: null,
        stockData: null,
        selectedItems: [],
      });
    }
  },

  fetchOrders: async () => {
    set({ ordersLoading: true, ordersError: null });
    try {
      const orders = await workerService.fetchOrders();
      set({ orders, ordersLoading: false });
    } catch (error) {
      set({
        ordersError:
          error instanceof Error ? error.message : "Failed to fetch orders",
        ordersLoading: false,
      });
    }
  },

  setSelectedOrder: (order) => {
    set({ selectedOrder: order });
    // Clear related data when order changes
    if (order) {
      set({
        productionSteps: [],
        selectedStep: null,
        stockData: null,
        selectedItems: [],
      });
    }
  },

  fetchOrderSteps: async () => {
    set({ stepsLoading: true, stepsError: null });
    try {
      const productionSteps = await workerService.fetchOrderSteps();
      set({ productionSteps, stepsLoading: false });
    } catch (error) {
      set({
        stepsError:
          error instanceof Error
            ? error.message
            : "Failed to fetch production steps",
        stepsLoading: false,
      });
    }
  },

  setSelectedStep: (step) => {
    set({ selectedStep: step });
    // Clear stock data when step changes
    if (step) {
      set({
        stockData: null,
        selectedItems: [],
      });
    }
  },

  fetchWorkcenterStock: async (workcenterId) => {
    set({ stockLoading: true, stockError: null });
    try {
      const stockData = await workerService.fetchWorkcenterStock(workcenterId);
      set({ stockData, stockLoading: false });
    } catch (error) {
      set({
        stockError:
          error instanceof Error ? error.message : "Failed to fetch stock data",
        stockLoading: false,
      });
    }
  },

  addSelectedItem: (item) => {
    const { selectedItems } = get();
    const existingItem = selectedItems.find(
      (i) => i.id === item.id && i.type === item.type
    );

    if (existingItem) {
      // Update existing item
      set({
        selectedItems: selectedItems.map((i) =>
          i.id === item.id && i.type === item.type
            ? { ...i, quantity: item.quantity }
            : i
        ),
      });
    } else {
      // Add new item
      set({ selectedItems: [...selectedItems, item] });
    }
  },

  removeSelectedItem: (itemId) => {
    const { selectedItems } = get();
    set({
      selectedItems: selectedItems.filter((item) => item.id !== itemId),
    });
  },

  updateSelectedItemQuantity: (itemId, quantity) => {
    const { selectedItems } = get();
    set({
      selectedItems: selectedItems.map((item) =>
        item.id === itemId ? { ...item, quantity } : item
      ),
    });
  },

  clearSelectedItems: () => {
    set({ selectedItems: [] });
  },

  submitBulkCreate: async () => {
    const { selectedOperator, selectedOrder, selectedStep, selectedItems } = get();

    if (!selectedOperator || !selectedOrder || !selectedStep || selectedItems.length === 0) {
      return { success: false, error: "Missing required data" };
    }

    set({ submitting: true, submitError: null });

    try {
      const request: BulkCreateRequest = {
        order_id: selectedOrder.id,
        production_step_id: selectedStep.id,
        operator_id: selectedOperator.id,
        items: selectedItems.map((item) => ({
          material_id: item.type === "material" ? item.id : undefined,
          product_id: item.type === "product" ? item.id : undefined,
          quantity: item.quantity,
          unit_of_measure: item.unit_of_measure || "PIECE",
        })),
      };

      const result = await workerService.bulkCreateUsedMaterials(request);
      set({ submitting: false });
      return { success: true, data: result };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to submit";
      set({ submitError: errorMessage, submitting: false });
      return { success: false, error: errorMessage };
    }
  },

  reset: () => {
    set({
      operators: [],
      selectedOperator: null,
      operatorsLoading: false,
      operatorsError: null,
      orders: [],
      selectedOrder: null,
      ordersLoading: false,
      ordersError: null,
      productionSteps: [],
      selectedStep: null,
      stepsLoading: false,
      stepsError: null,
      stockData: null,
      stockLoading: false,
      stockError: null,
      selectedItems: [],
      submitting: false,
      submitError: null,
    });
  },
}));
