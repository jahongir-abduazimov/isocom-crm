import { create } from "zustand";
import { persist } from "zustand/middleware";
import ProductionService from "@/services/production.service";

// Types
export interface UsedMaterial {
  id: string;
  order: string;
  material: string;
  material_name: string;
  quantity: string;
  step_execution: string;
  available_quantity: number;
  workcenter_name: string;
}

export interface StepExecution {
  id: string;
  order: string;
  production_step: string;
  production_step_name: string;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
  assigned_operator: string;
  assigned_operator_name: string;
  work_center: string;
  start_time: string | null;
  end_time: string | null;
  actual_duration_hours: number | null;
  notes: string;
  quality_notes: string;
  quantity_processed: number | null;
}

export interface ProductionOrder {
  id: string;
  produced_product: string | null;
  produced_product_name?: string;
  unit_of_measure: string;
  produced_quantity: string;
  operators: string[];
  operators_names: string[];
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  description: string;
  start_date: string | null;
  completion_date: string | null;
  created_at: string;
  used_materials: UsedMaterial[];
  step_executions: StepExecution[];
  completion_percentage: number;
  current_step: StepExecution;
}

export interface ProductionOutput {
  id: number;
  outputNumber: string;
  orderNumber: string;
  product: string;
  quantity: number;
  actualQuantity: number;
  quality: "Excellent" | "Good" | "Fair" | "Poor";
  date: string;
  shift: "Day" | "Night";
  operator: string;
  status: "Completed" | "In Progress" | "Pending";
  createdAt: string;
  updatedAt: string;
}

export interface ProductionStepExecution {
  id: number;
  executionNumber: string;
  orderNumber: string;
  stepName: string;
  stepNumber: number;
  operator: string;
  startTime: string;
  endTime: string | null;
  duration: string;
  status: "Completed" | "In Progress" | "Failed" | "Pending";
  quality: "Excellent" | "Good" | "Fair" | "Poor" | null;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductionStep {
  id: number;
  stepNumber: number;
  stepName: string;
  description: string;
  estimatedDuration: string;
  requiredSkills: string[];
  tools: string[];
  qualityChecks: string[];
  status: "Active" | "Inactive" | "Draft";
  createdAt: string;
  updatedAt: string;
}

// API Response Types
export interface OrdersApiResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: ProductionOrder[];
}

// Store State
interface ProductionState {
  // Orders
  orders: ProductionOrder[];
  selectedOrder: ProductionOrder | null;

  // Outputs
  outputs: ProductionOutput[];
  selectedOutput: ProductionOutput | null;

  // Step Executions
  stepExecutions: ProductionStepExecution[];
  selectedExecution: ProductionStepExecution | null;

  // Steps
  steps: ProductionStep[];
  selectedStep: ProductionStep | null;

  // Used Materials
  usedMaterials: UsedMaterial[];
  selectedMaterial: UsedMaterial | null;

  // Loading states
  loading: boolean;
  error: string | null;

  // Actions for Orders
  fetchOrders: () => Promise<void>;
  fetchOrderById: (id: string) => Promise<void>;
  createOrder: (
    order: Omit<ProductionOrder, "id" | "created_at">
  ) => Promise<void>;
  updateOrder: (id: string, order: Partial<ProductionOrder>) => Promise<void>;
  deleteOrder: (id: string) => Promise<void>;
  setSelectedOrder: (order: ProductionOrder | null) => void;

  // Actions for Outputs
  addOutput: (
    output: Omit<ProductionOutput, "id" | "createdAt" | "updatedAt">
  ) => void;
  updateOutput: (id: number, output: Partial<ProductionOutput>) => void;
  deleteOutput: (id: number) => void;
  setSelectedOutput: (output: ProductionOutput | null) => void;

  // Actions for Step Executions
  addStepExecution: (
    execution: Omit<ProductionStepExecution, "id" | "createdAt" | "updatedAt">
  ) => void;
  updateStepExecution: (
    id: number,
    execution: Partial<ProductionStepExecution>
  ) => void;
  deleteStepExecution: (id: number) => void;
  setSelectedExecution: (execution: ProductionStepExecution | null) => void;

  // Actions for Steps
  addStep: (
    step: Omit<ProductionStep, "id" | "createdAt" | "updatedAt">
  ) => void;
  updateStep: (id: number, step: Partial<ProductionStep>) => void;
  deleteStep: (id: number) => void;
  setSelectedStep: (step: ProductionStep | null) => void;

  // Actions for Used Materials
  addUsedMaterial: (material: Omit<UsedMaterial, "id">) => void;
  updateUsedMaterial: (id: string, material: Partial<UsedMaterial>) => void;
  deleteUsedMaterial: (id: string) => void;
  setSelectedMaterial: (material: UsedMaterial | null) => void;

  // Utility actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useProductionStore = create<ProductionState>()(
  persist(
    (set) => ({
      // Initial state
      orders: [],
      selectedOrder: null,
      outputs: [],
      selectedOutput: null,
      stepExecutions: [],
      selectedExecution: null,
      steps: [],
      selectedStep: null,
      usedMaterials: [],
      selectedMaterial: null,
      loading: false,
      error: null,

      // Order actions
      fetchOrders: async () => {
        set({ loading: true, error: null });
        try {
          const data = await ProductionService.getOrders();
          set({ orders: data.results, loading: false });
        } catch (error: any) {
          set({
            error:
              error.response?.data?.message ||
              error.message ||
              "An error occurred",
            loading: false,
          });
        }
      },

      fetchOrderById: async (id: string) => {
        set({ loading: true, error: null });
        try {
          const order = await ProductionService.getOrderById(id);
          set({ selectedOrder: order, loading: false });
        } catch (error: any) {
          set({
            error:
              error.response?.data?.message ||
              error.message ||
              "An error occurred",
            loading: false,
          });
        }
      },

      createOrder: async (orderData) => {
        set({ loading: true, error: null });
        try {
          const newOrder = await ProductionService.createOrder(orderData);
          set((state) => ({
            orders: [...state.orders, newOrder],
            loading: false,
          }));
        } catch (error: any) {
          set({
            error:
              error.response?.data?.message ||
              error.message ||
              "An error occurred",
            loading: false,
          });
        }
      },

      updateOrder: async (id, orderData) => {
        set({ loading: true, error: null });
        try {
          const updatedOrder = await ProductionService.updateOrder(
            id,
            orderData
          );
          set((state) => ({
            orders: state.orders.map((o) => (o.id === id ? updatedOrder : o)),
            loading: false,
          }));
        } catch (error: any) {
          set({
            error:
              error.response?.data?.message ||
              error.message ||
              "An error occurred",
            loading: false,
          });
        }
      },

      deleteOrder: async (id) => {
        set({ loading: true, error: null });
        try {
          await ProductionService.deleteOrder(id);
          set((state) => ({
            orders: state.orders.filter((o) => o.id !== id),
            loading: false,
          }));
        } catch (error: any) {
          set({
            error:
              error.response?.data?.message ||
              error.message ||
              "An error occurred",
            loading: false,
          });
        }
      },

      setSelectedOrder: (order) => {
        set({ selectedOrder: order });
      },

      // Output actions
      addOutput: (output) => {
        const newOutput: ProductionOutput = {
          ...output,
          id: Date.now(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({
          outputs: [...state.outputs, newOutput],
        }));
      },

      updateOutput: (id, output) => {
        set((state) => ({
          outputs: state.outputs.map((o) =>
            o.id === id
              ? { ...o, ...output, updatedAt: new Date().toISOString() }
              : o
          ),
        }));
      },

      deleteOutput: (id) => {
        set((state) => ({
          outputs: state.outputs.filter((o) => o.id !== id),
        }));
      },

      setSelectedOutput: (output) => {
        set({ selectedOutput: output });
      },

      // Step Execution actions
      addStepExecution: (execution) => {
        const newExecution: ProductionStepExecution = {
          ...execution,
          id: Date.now(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({
          stepExecutions: [...state.stepExecutions, newExecution],
        }));
      },

      updateStepExecution: (id, execution) => {
        set((state) => ({
          stepExecutions: state.stepExecutions.map((e) =>
            e.id === id
              ? { ...e, ...execution, updatedAt: new Date().toISOString() }
              : e
          ),
        }));
      },

      deleteStepExecution: (id) => {
        set((state) => ({
          stepExecutions: state.stepExecutions.filter((e) => e.id !== id),
        }));
      },

      setSelectedExecution: (execution) => {
        set({ selectedExecution: execution });
      },

      // Step actions
      addStep: (step) => {
        const newStep: ProductionStep = {
          ...step,
          id: Date.now(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({
          steps: [...state.steps, newStep],
        }));
      },

      updateStep: (id, step) => {
        set((state) => ({
          steps: state.steps.map((s) =>
            s.id === id
              ? { ...s, ...step, updatedAt: new Date().toISOString() }
              : s
          ),
        }));
      },

      deleteStep: (id) => {
        set((state) => ({
          steps: state.steps.filter((s) => s.id !== id),
        }));
      },

      setSelectedStep: (step) => {
        set({ selectedStep: step });
      },

      // Used Material actions
      addUsedMaterial: (material) => {
        const newMaterial: UsedMaterial = {
          ...material,
          id: Date.now().toString(),
        };
        set((state) => ({
          usedMaterials: [...state.usedMaterials, newMaterial],
        }));
      },

      updateUsedMaterial: (id, material) => {
        set((state) => ({
          usedMaterials: state.usedMaterials.map((m) =>
            m.id === id ? { ...m, ...material } : m
          ),
        }));
      },

      deleteUsedMaterial: (id) => {
        set((state) => ({
          usedMaterials: state.usedMaterials.filter((m) => m.id !== id),
        }));
      },

      setSelectedMaterial: (material) => {
        set({ selectedMaterial: material });
      },

      // Utility actions
      setLoading: (loading) => {
        set({ loading });
      },

      setError: (error) => {
        set({ error });
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: "production-storage",
      partialize: (state) => ({
        orders: state.orders,
        outputs: state.outputs,
        stepExecutions: state.stepExecutions,
        steps: state.steps,
        usedMaterials: state.usedMaterials,
      }),
    }
  )
);
