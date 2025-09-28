import { create } from "zustand";
import { workerService } from "@/services/worker.service";
import { useAuthStore } from "@/store/auth.store";
import type {
  Workcenter,
  WorkerOrder,
  ProductionStep,
  WorkcenterStock,
  BulkCreateRequest,
  BulkCreateResponse,
  OrdersByWorkcenterTypeResponse,
  ProductionStepsByWorkcenterTypeResponse,
  StepExecutionResponse,
  BulkCreateByWorkcenterTypeRequest,
  BulkCreateByWorkcenterTypeResponse,
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
  // New Workflow State
  workcenters: Workcenter[];
  workcentersLoading: boolean;
  workcentersError: string | null;
  selectedWorkcenterType: string | null;
  selectedWorkcenterId: string | null;

  // Orders (New Workflow)
  ordersByWorkcenterType: OrdersByWorkcenterTypeResponse | null;
  allOrders: WorkerOrder[];
  selectedOrder: WorkerOrder | null;
  ordersLoading: boolean;
  ordersError: string | null;

  // Production Steps (New Workflow)
  productionStepsByWorkcenterType: ProductionStepsByWorkcenterTypeResponse | null;
  selectedStep: ProductionStep | null;
  stepsLoading: boolean;
  stepsError: string | null;

  // Step Execution
  stepExecution: StepExecutionResponse | null;
  stepExecutionLoading: boolean;
  stepExecutionError: string | null;

  // Stock Data
  stockData: WorkcenterStock | null;
  stockLoading: boolean;
  stockError: string | null;

  // Selected Items
  selectedItems: SelectedItem[];

  // Current Step in workflow (New: 1=Workcenter, 2=Order, 3=Step, 4=Materials)
  currentStep: number;

  // Submission
  submitting: boolean;
  submitError: string | null;

  // Legacy State (for backward compatibility)
  operators: Operator[];
  operatorsLoading: boolean;
  operatorsError: string | null;
  orders: WorkerOrder[];
  productionSteps: ProductionStep[];

  // Actions - New Workflow
  fetchWorkcenters: () => Promise<void>;
  setSelectedWorkcenterType: (type: string | null) => void;
  setSelectedWorkcenterId: (id: string | null) => void;
  fetchOrdersByWorkcenterType: (workcenterType: string) => Promise<void>;
  fetchAllOrders: () => Promise<void>;
  setSelectedOrder: (order: WorkerOrder | null) => void;
  fetchProductionStepsByWorkcenterType: (workcenterType: string) => Promise<void>;
  setSelectedStep: (step: ProductionStep | null) => void;
  getOrCreateStepExecution: (orderId: string, workcenterType: string) => Promise<void>;
  fetchWorkcenterStock: (workcenterId: string) => Promise<void>;
  addSelectedItem: (item: SelectedItem) => void;
  removeSelectedItem: (itemId: string) => void;
  updateSelectedItemQuantity: (itemId: string, quantity: number) => void;
  clearSelectedItems: () => void;
  setCurrentStep: (step: number) => void;
  submitBulkCreateByWorkcenterType: () => Promise<{
    success: boolean;
    data?: BulkCreateByWorkcenterTypeResponse;
    error?: string;
  }>;

  // Legacy Actions (for backward compatibility)
  fetchOperators: () => Promise<void>;
  fetchOrders: () => Promise<void>;
  fetchOrderSteps: () => Promise<void>;
  submitBulkCreate: () => Promise<{
    success: boolean;
    data?: BulkCreateResponse;
    error?: string;
  }>;
  reset: () => void;
}

export const useWorkerStore = create<WorkerState>((set, get) => ({
  // New Workflow Initial State
  workcenters: [],
  workcentersLoading: false,
  workcentersError: null,
  selectedWorkcenterType: null,
  selectedWorkcenterId: null,

  ordersByWorkcenterType: null,
  allOrders: [],
  selectedOrder: null,
  ordersLoading: false,
  ordersError: null,

  productionStepsByWorkcenterType: null,
  selectedStep: null,
  stepsLoading: false,
  stepsError: null,

  stepExecution: null,
  stepExecutionLoading: false,
  stepExecutionError: null,

  stockData: null,
  stockLoading: false,
  stockError: null,

  selectedItems: [],

  currentStep: 1,

  submitting: false,
  submitError: null,

  // Legacy Initial State (for backward compatibility)
  operators: [],
  operatorsLoading: false,
  operatorsError: null,
  orders: [],
  productionSteps: [],

  // New Workflow Actions
  fetchWorkcenters: async () => {
    set({ workcentersLoading: true, workcentersError: null });
    try {
      const workcenters = await workerService.fetchWorkcenters();
      set({ workcenters, workcentersLoading: false });
    } catch (error) {
      set({
        workcentersError:
          error instanceof Error ? error.message : "Failed to fetch workcenters",
        workcentersLoading: false,
      });
    }
  },

  setSelectedWorkcenterType: (type) => {
    set({ selectedWorkcenterType: type });
    // Clear related data when workcenter type changes
    if (type) {
      set({
        ordersByWorkcenterType: null,
        selectedOrder: null,
        productionStepsByWorkcenterType: null,
        selectedStep: null,
        stepExecution: null,
        stockData: null,
        selectedItems: [],
        currentStep: 2, // Move to order selection step
      });
    }
  },

  setSelectedWorkcenterId: (id) => {
    set({ selectedWorkcenterId: id });
  },

  fetchOrdersByWorkcenterType: async (workcenterType) => {
    set({ ordersLoading: true, ordersError: null });
    try {
      const ordersResponse = await workerService.fetchOrdersByWorkcenterType(workcenterType);
      set({ ordersByWorkcenterType: ordersResponse, ordersLoading: false });
    } catch (error) {
      set({
        ordersError:
          error instanceof Error ? error.message : "Failed to fetch orders",
        ordersLoading: false,
      });
    }
  },

  fetchAllOrders: async () => {
    set({ ordersLoading: true, ordersError: null });
    try {
      const allOrders = await workerService.fetchAllOrders();
      set({ allOrders, ordersLoading: false });
    } catch (error) {
      set({
        ordersError:
          error instanceof Error ? error.message : "Failed to fetch all orders",
        ordersLoading: false,
      });
    }
  },

  setSelectedOrder: (order) => {
    set({ selectedOrder: order });
    // Clear related data when order changes
    if (order) {
      set({
        productionStepsByWorkcenterType: null,
        selectedStep: null,
        stepExecution: null,
        stockData: null,
        selectedItems: [],
        currentStep: 3, // Move to step selection
      });
    }
  },

  fetchProductionStepsByWorkcenterType: async (workcenterType) => {
    set({ stepsLoading: true, stepsError: null });
    try {
      const stepsResponse = await workerService.fetchProductionStepsByWorkcenterType(workcenterType);
      set({ productionStepsByWorkcenterType: stepsResponse, stepsLoading: false });
    } catch (error) {
      set({
        stepsError:
          error instanceof Error ? error.message : "Failed to fetch production steps",
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
        currentStep: 4, // Move to material selection
      });
    }
  },

  getOrCreateStepExecution: async (orderId, workcenterType) => {
    set({ stepExecutionLoading: true, stepExecutionError: null });
    try {
      const stepExecution = await workerService.getOrCreateStepExecution(orderId, workcenterType);
      set({ stepExecution, stepExecutionLoading: false });
    } catch (error) {
      set({
        stepExecutionError:
          error instanceof Error ? error.message : "Failed to get/create step execution",
        stepExecutionLoading: false,
      });
    }
  },

  // Legacy Actions
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

  setCurrentStep: (step) => {
    set({ currentStep: step });
  },

  // New Workflow Bulk Create
  submitBulkCreateByWorkcenterType: async () => {
    const { selectedOrder, selectedStep, selectedItems, selectedWorkcenterId } = get();
    const { selectedOperator } = useAuthStore.getState();

    if (!selectedOperator || !selectedOrder || !selectedStep || !selectedWorkcenterId || selectedItems.length === 0) {
      return { success: false, error: "Missing required data" };
    }

    set({ submitting: true, submitError: null });

    try {
      const request: BulkCreateByWorkcenterTypeRequest = {
        order_id: selectedOrder.id,
        production_step_id: selectedStep.id,
        operator_id: selectedOperator.id,
        workcenter_id: selectedWorkcenterId,
        items: selectedItems.map((item) => ({
          material_id: item.type === "material" ? item.id : undefined,
          product_id: item.type === "product" ? item.id : undefined,
          quantity: item.quantity.toString(),
          unit_of_measure: item.unit_of_measure || "PIECE",
        })),
      };

      const result = await workerService.bulkCreateByWorkcenterType(request);
      set({ submitting: false });
      return { success: true, data: result };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to submit";
      set({ submitError: errorMessage, submitting: false });
      return { success: false, error: errorMessage };
    }
  },

  // Legacy Bulk Create
  submitBulkCreate: async () => {
    const { selectedOrder, selectedStep, selectedItems } = get();
    const { selectedOperator } = useAuthStore.getState();

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
          quantity: item.quantity.toString(),
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
      // New Workflow State
      workcenters: [],
      workcentersLoading: false,
      workcentersError: null,
      selectedWorkcenterType: null,
      selectedWorkcenterId: null,
      ordersByWorkcenterType: null,
      allOrders: [],
      productionStepsByWorkcenterType: null,
      stepExecution: null,
      stepExecutionLoading: false,
      stepExecutionError: null,

      // Common State
      selectedOrder: null,
      ordersLoading: false,
      ordersError: null,
      selectedStep: null,
      stepsLoading: false,
      stepsError: null,
      stockData: null,
      stockLoading: false,
      stockError: null,
      selectedItems: [],
      currentStep: 1,
      submitting: false,
      submitError: null,

      // Legacy State
      operators: [],
      operatorsLoading: false,
      operatorsError: null,
      orders: [],
      productionSteps: [],
    });
  },
}));
