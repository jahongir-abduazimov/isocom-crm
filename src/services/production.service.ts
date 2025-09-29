import request from "@/components/config/index";
import type {
  ProductionOrder,
  OrdersApiResponse,
} from "@/store/production.store";
import { API_CONFIG } from "@/config/api.config";

// Production Steps Types
export interface ProductionStep {
  id: string;
  name: string;
  step_type:
  | "EXTRUSION"
  | "DEGASSING"
  | "LAMINATION"
  | "BRONZING"
  | "DUPLICATION"
  | "PACKAGING"
  | "QUALITY_CONTROL"
  | "WAREHOUSE_TRANSFER"
  | "CUSTOMER_DELIVERY";
  description: string | null;
  duration_hours: string | null;
  is_required: boolean;
  order_sequence: number;
}

export interface ProductionStepsApiResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: ProductionStep[];
}

// Production Outputs Types
export interface ProductionOutput {
  id: string;
  step_execution: string;
  product: string;
  product_name: string;
  unit_of_measure: string;
  quantity: string;
  weight: string;
  gross_weight?: string | null;
  tare_weight?: string | null;
  uses_spool: boolean;
  spool_count?: number | null;
  quality_status: string;
  operator?: string | null;
  operator_name?: string;
  notes: string;
  order_id?: string | null;
  order_description?: string;
  order_product_name?: string;
  created_at: string;
  updated_at: string;
}

export interface ProductionOutputsApiResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: ProductionOutput[];
}

// Production Step Executions Types
export interface ProductionStepExecution {
  id: string;
  order: string;
  production_step: string;
  production_step_name: string;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "SKIPPED" | "FAILED";
  assigned_operator: string | null;
  assigned_operator_name: string | null;
  operators: string[];
  operators_count: number;
  operators_names: string[];
  work_center: string | null;
  work_center_name: string | null;
  start_time: string | null;
  end_time: string | null;
  actual_duration_hours: string | null;
  notes: string | null;
  quality_notes: string | null;
  quantity_processed: string | null;
}

export interface ProductionStepExecutionsApiResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: ProductionStepExecution[];
}

// User Types
export interface User {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  phone_number: string | null;
  role: string | null;
  role_display: string | null;
  role_display_uz: string | null;
  employee_id: string | null;
  is_active: boolean;
  shift: string | null;
  is_operator: boolean;
  is_supervisor: boolean;
  is_specialist: boolean;
  role_level: number;
  profile_picture: string | null;
  created_at: string;
  updated_at: string;
}

export interface UsersApiResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: User[];
}

// Used Materials Types
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

export interface UsedMaterialsApiResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: UsedMaterial[];
}

export class ProductionService {
  // Orders API
  static async getOrders(): Promise<OrdersApiResponse> {
    const response = await request.get<OrdersApiResponse>(
      API_CONFIG.ENDPOINTS.ORDERS
    );
    return response.data;
  }

  static async getOrderById(id: string): Promise<ProductionOrder> {
    const response = await request.get<ProductionOrder>(
      API_CONFIG.ENDPOINTS.ORDER_BY_ID(id)
    );
    return response.data;
  }

  static async createOrder(
    orderData: Omit<ProductionOrder, "id" | "created_at">
  ): Promise<ProductionOrder> {
    const response = await request.post<ProductionOrder>(
      API_CONFIG.ENDPOINTS.ORDERS,
      orderData
    );
    return response.data;
  }

  static async updateOrder(
    id: string,
    orderData: Partial<ProductionOrder>
  ): Promise<ProductionOrder> {
    const response = await request.patch<ProductionOrder>(
      API_CONFIG.ENDPOINTS.ORDER_BY_ID(id),
      orderData
    );
    return response.data;
  }

  static async deleteOrder(id: string): Promise<void> {
    await request.delete(API_CONFIG.ENDPOINTS.ORDER_BY_ID(id));
  }

  // Step Executions API
  static async getStepExecutions(orderId: string): Promise<any[]> {
    const response = await request.get(
      API_CONFIG.ENDPOINTS.STEP_EXECUTIONS(orderId)
    );
    return response.data;
  }


  // Used Materials API
  static async getUsedMaterials(orderId: string): Promise<any[]> {
    const response = await request.get(
      API_CONFIG.ENDPOINTS.USED_MATERIALS(orderId)
    );
    return response.data;
  }

  static async updateUsedMaterial(materialId: string, data: any): Promise<any> {
    const response = await request.patch(
      API_CONFIG.ENDPOINTS.USED_MATERIAL_BY_ID(materialId),
      data
    );
    return response.data;
  }

  // Operators API
  static async getOperators(): Promise<any[]> {
    const response = await request.get(API_CONFIG.ENDPOINTS.OPERATORS);
    return response.data.results || [];
  }

  // Users API
  static async getUsers(): Promise<UsersApiResponse> {
    const response = await request.get<UsersApiResponse>(
      API_CONFIG.ENDPOINTS.USERS
    );
    return response.data;
  }

  static async getWorkers(): Promise<User[]> {
    const response = await this.getUsers();
    // Filter users with role "WORKER"
    return response.results.filter(user => user.role === "WORKER");
  }

  // Work Centers API
  static async getWorkCenters(): Promise<any[]> {
    const response = await request.get(API_CONFIG.ENDPOINTS.WORK_CENTERS);
    return response.data.results || [];
  }

  // Production Steps API
  static async getProductionSteps(): Promise<ProductionStepsApiResponse> {
    const response = await request.get<ProductionStepsApiResponse>(
      API_CONFIG.ENDPOINTS.PRODUCTION_STEPS
    );
    return response.data;
  }

  static async getProductionStepById(id: string): Promise<ProductionStep> {
    const response = await request.get<ProductionStep>(
      API_CONFIG.ENDPOINTS.PRODUCTION_STEP_BY_ID(id)
    );
    return response.data;
  }

  static async createProductionStep(
    stepData: Omit<ProductionStep, "id">
  ): Promise<ProductionStep> {
    const response = await request.post<ProductionStep>(
      API_CONFIG.ENDPOINTS.PRODUCTION_STEPS,
      stepData
    );
    return response.data;
  }

  static async updateProductionStep(
    id: string,
    stepData: Partial<ProductionStep>
  ): Promise<ProductionStep> {
    const response = await request.patch<ProductionStep>(
      API_CONFIG.ENDPOINTS.PRODUCTION_STEP_BY_ID(id),
      stepData
    );
    return response.data;
  }

  static async deleteProductionStep(id: string): Promise<void> {
    await request.delete(API_CONFIG.ENDPOINTS.PRODUCTION_STEP_BY_ID(id));
  }

  // Production Outputs API
  static async getProductionOutputs(): Promise<ProductionOutputsApiResponse> {
    const response = await request.get<ProductionOutputsApiResponse>(
      API_CONFIG.ENDPOINTS.PRODUCTION_OUTPUTS
    );
    return response.data;
  }

  static async getProductionOutputById(id: string): Promise<ProductionOutput> {
    const response = await request.get<ProductionOutput>(
      API_CONFIG.ENDPOINTS.PRODUCTION_OUTPUT_BY_ID(id)
    );
    return response.data;
  }

  static async deleteProductionOutput(id: string): Promise<void> {
    await request.delete(API_CONFIG.ENDPOINTS.PRODUCTION_OUTPUT_BY_ID(id));
  }

  static async createProductionOutput(
    outputData: Omit<ProductionOutput, "id" | "product_name">
  ): Promise<ProductionOutput> {
    const response = await request.post<ProductionOutput>(
      API_CONFIG.ENDPOINTS.PRODUCTION_OUTPUTS,
      outputData
    );
    return response.data;
  }

  static async updateProductionOutput(
    id: string,
    outputData: Omit<ProductionOutput, "id" | "product_name">
  ): Promise<ProductionOutput> {
    const response = await request.patch<ProductionOutput>(
      API_CONFIG.ENDPOINTS.PRODUCTION_OUTPUT_BY_ID(id),
      outputData
    );
    return response.data;
  }

  // All Step Executions API
  static async getAllStepExecutions(): Promise<ProductionStepExecutionsApiResponse> {
    const response = await request.get<ProductionStepExecutionsApiResponse>(
      API_CONFIG.ENDPOINTS.ALL_STEP_EXECUTIONS
    );
    return response.data;
  }

  static async getStepExecutionById(id: string): Promise<ProductionStepExecution> {
    const response = await request.get<ProductionStepExecution>(
      API_CONFIG.ENDPOINTS.STEP_EXECUTION_BY_ID(id)
    );
    return response.data;
  }

  static async updateStepExecution(
    id: string,
    executionData: Partial<ProductionStepExecution>
  ): Promise<ProductionStepExecution> {
    const response = await request.patch<ProductionStepExecution>(
      API_CONFIG.ENDPOINTS.STEP_EXECUTION_BY_ID(id),
      executionData
    );
    return response.data;
  }

  static async deleteStepExecution(id: string): Promise<void> {
    await request.delete(API_CONFIG.ENDPOINTS.STEP_EXECUTION_BY_ID(id));
  }

  static async createStepExecution(
    executionData: Omit<
      ProductionStepExecution,
      "id" | "production_step_name" | "assigned_operator_name"
    >
  ): Promise<ProductionStepExecution> {
    const response = await request.post<ProductionStepExecution>(
      API_CONFIG.ENDPOINTS.ALL_STEP_EXECUTIONS,
      executionData
    );
    return response.data;
  }

  // All Used Materials API
  static async getAllUsedMaterials(): Promise<UsedMaterialsApiResponse> {
    const response = await request.get<UsedMaterialsApiResponse>(
      API_CONFIG.ENDPOINTS.ALL_USED_MATERIALS
    );
    return response.data;
  }

  static async deleteUsedMaterial(id: string): Promise<void> {
    await request.delete(API_CONFIG.ENDPOINTS.USED_MATERIAL_BY_ID(id));
  }

  static async createUsedMaterial(
    materialData: Omit<
      UsedMaterial,
      "id" | "material_name" | "available_quantity" | "workcenter_name"
    >
  ): Promise<UsedMaterial> {
    const response = await request.post<UsedMaterial>(
      API_CONFIG.ENDPOINTS.ALL_USED_MATERIALS,
      materialData
    );
    return response.data;
  }

  // Materials API
  static async getMaterials(): Promise<any> {
    const response = await request.get(API_CONFIG.ENDPOINTS.MATERIALS);
    return response.data;
  }

  // Products API
  static async getProducts(): Promise<any> {
    const response = await request.get(API_CONFIG.ENDPOINTS.PRODUCTS);
    return response.data;
  }
}

export default ProductionService;
