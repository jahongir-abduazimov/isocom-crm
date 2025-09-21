import API_CONFIG, {
  STATUS_MAPPINGS,
  DEFAULT_VALUES,
} from "@/config/api.config";
import request from "@/components/config";

export interface InventoryMovement {
  id: string;
  material: string | null;
  product: string | null;
  from_location: string;
  to_location: string;
  quantity: string;
  created_at: string;
  user: string;
}

export interface StockLevel {
  id: string;
  material: string | null;
  product: string | null;
  location: string;
  quantity: string;
}

export interface StockLevelResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: StockLevel[];
}

export interface CreateInventoryMovementRequest {
  materialId: string;
  movementType: keyof typeof STATUS_MAPPINGS.MOVEMENT_TYPE;
  quantity: number;
  fromLocation?: string;
  toLocation?: string;
  reference: string;
  notes?: string;
}

export interface CreateInventoryMovementLogRequest {
  material?: string;
  product?: string;
  from_location: string;
  to_location: string;
  quantity: string;
  user: string;
}

export interface UpdateStockLevelRequest {
  materialId: string;
  currentStock: number;
  minimumStock?: number;
  maximumStock?: number;
  location: string;
}

export interface CreateStockLevelRequest {
  material?: string;
  product?: string;
  location: string;
  quantity: string;
}

class StockService {
  // Helper method to get default pagination parameters
  private getDefaultPaginationParams(params?: {
    page?: number;
    limit?: number;
  }) {
    return {
      page: params?.page || 1,
      limit: params?.limit || DEFAULT_VALUES.PAGE_SIZE,
    };
  }

  // Inventory Movement Logs
  async getInventoryMovements(params?: {
    page?: number;
    limit?: number;
    materialId?: string;
    movementType?: string;
    location?: string;
    startDate?: string;
    endDate?: string;
    userId?: string;
  }): Promise<{
    results: InventoryMovement[];
    count: number;
    next: string | null;
    previous: string | null;
  }> {
    try {
      const paginationParams = this.getDefaultPaginationParams(params);
      const searchParams = new URLSearchParams();
      searchParams.append("page", paginationParams.page.toString());
      searchParams.append("limit", paginationParams.limit.toString());
      if (params?.materialId)
        searchParams.append("material", params.materialId);
      if (params?.movementType)
        searchParams.append("movement_type", params.movementType);
      if (params?.location) searchParams.append("location", params.location);
      if (params?.startDate)
        searchParams.append("start_date", params.startDate);
      if (params?.endDate) searchParams.append("end_date", params.endDate);
      if (params?.userId) searchParams.append("user", params.userId);

      const url = `${API_CONFIG.ENDPOINTS.INVENTORY_MOVEMENT_LOGS}?${searchParams}`;
      console.log("Fetching inventory movements from:", url);

      const response = await request.get<{
        results: InventoryMovement[];
        count: number;
        next: string | null;
        previous: string | null;
      }>(url);
      console.log("API Response data:", response.data);
      return response.data;
    } catch (error) {
      console.error("Inventar harakatlarini olishda xatolik:", error);
      throw error;
    }
  }

  async getInventoryMovement(id: string): Promise<InventoryMovement> {
    try {
      const url = API_CONFIG.ENDPOINTS.INVENTORY_MOVEMENT_BY_ID(id);
      const response = await request.get<InventoryMovement>(url);
      return response.data;
    } catch (error) {
      console.error("Inventar harakatini olishda xatolik:", error);
      throw error;
    }
  }

  async createInventoryMovement(
    data: CreateInventoryMovementRequest
  ): Promise<InventoryMovement> {
    try {
      const url = API_CONFIG.ENDPOINTS.INVENTORY_MOVEMENT_LOGS;
      const response = await request.post<InventoryMovement>(url, data);
      return response.data;
    } catch (error) {
      console.error("Inventar harakati yaratishda xatolik:", error);
      throw error;
    }
  }

  async createInventoryMovementLog(
    data: CreateInventoryMovementLogRequest
  ): Promise<InventoryMovement> {
    try {
      const url = API_CONFIG.ENDPOINTS.INVENTORY_MOVEMENT_LOGS;
      const response = await request.post<InventoryMovement>(url, data);
      return response.data;
    } catch (error) {
      console.error("Inventar harakati logini yaratishda xatolik:", error);
      throw error;
    }
  }

  async updateInventoryMovement(
    id: string,
    data: Partial<CreateInventoryMovementRequest>
  ): Promise<InventoryMovement> {
    try {
      const url = API_CONFIG.ENDPOINTS.INVENTORY_MOVEMENT_BY_ID(id);
      const response = await request.put<InventoryMovement>(url, data);
      return response.data;
    } catch (error) {
      console.error("Inventar harakatini yangilashda xatolik:", error);
      throw error;
    }
  }

  async updateInventoryMovementLog(
    id: string,
    data: Partial<CreateInventoryMovementLogRequest>
  ): Promise<InventoryMovement> {
    try {
      const url = API_CONFIG.ENDPOINTS.INVENTORY_MOVEMENT_BY_ID(id);
      const response = await request.put<InventoryMovement>(url, data);
      return response.data;
    } catch (error) {
      console.error("Inventar harakati logini yangilashda xatolik:", error);
      throw error;
    }
  }

  async deleteInventoryMovement(id: string): Promise<void> {
    try {
      const url = API_CONFIG.ENDPOINTS.INVENTORY_MOVEMENT_BY_ID(id);
      await request.delete(url);
    } catch (error) {
      console.error("Inventar harakatini o'chirishda xatolik: ", error);
      throw error;
    }
  }

  // Stock Levels
  async getStockLevels(): Promise<StockLevelResponse> {
    try {
      const url = API_CONFIG.ENDPOINTS.STOCK_LEVELS;
      console.log("Fetching stock levels from:", url);
      const response = await request.get<StockLevelResponse>(url);
      console.log("API Response data:", response.data);
      return response.data;
    } catch (error) {
      console.error("Zaxira darajalarini olishda xatolik:", error);
      throw error;
    }
  }

  async getStockLevel(id: string): Promise<StockLevel> {
    try {
      const url = API_CONFIG.ENDPOINTS.STOCK_LEVEL_BY_ID(id);
      const response = await request.get<StockLevel>(url);
      return response.data;
    } catch (error) {
      console.error("Zaxira darajasini olishda xatolik:", error);
      throw error;
    }
  }

  async createStockLevel(data: CreateStockLevelRequest): Promise<StockLevel> {
    try {
      const url = API_CONFIG.ENDPOINTS.STOCK_LEVELS;
      const response = await request.post<StockLevel>(url, data);
      return response.data;
    } catch (error) {
      console.error("Zaxira darajasini yaratishda xatolik:", error);
      throw error;
    }
  }

  async updateStockLevel(
    id: string,
    data: UpdateStockLevelRequest
  ): Promise<StockLevel> {
    try {
      const url = API_CONFIG.ENDPOINTS.STOCK_LEVEL_BY_ID(id);
      const response = await request.put<StockLevel>(url, data);
      return response.data;
    } catch (error) {
      console.error("Zaxira darajasini yangilashda xatolik:", error);
      throw error;
    }
  }

  async bulkUpdateStockLevels(
    data: UpdateStockLevelRequest[]
  ): Promise<StockLevel[]> {
    try {
      const url = API_CONFIG.ENDPOINTS.STOCK_LEVELS_BULK;
      const response = await request.put<StockLevel[]>(url, { updates: data });
      return response.data;
    } catch (error) {
      console.error("Zaxira darajalarini to'plam yangilashda xatolik: ", error);
      throw error;
    }
  }

  async deleteStockLevel(id: string): Promise<void> {
    try {
      const url = API_CONFIG.ENDPOINTS.STOCK_LEVEL_BY_ID(id);
      await request.delete(url);
    } catch (error) {
      console.error("Zaxira darajasini o'chirishda xatolik: ", error);
      throw error;
    }
  }

  // Stock Reports
  async getStockSummary(): Promise<{
    totalItems: number;
    totalValue: number;
    lowStockItems: number;
    outOfStockItems: number;
    highStockItems: number;
    normalStockItems: number;
  }> {
    try {
      const url = API_CONFIG.ENDPOINTS.STOCK_SUMMARY;
      const response = await request.get<{
        totalItems: number;
        totalValue: number;
        lowStockItems: number;
        outOfStockItems: number;
        highStockItems: number;
        normalStockItems: number;
      }>(url);
      return response.data;
    } catch (error) {
      console.error("Zaxira xulosasini olishda xatolik:", error);
      throw error;
    }
  }

  async exportStockLevels(format: "csv" | "excel" = "csv"): Promise<Blob> {
    try {
      const url = `${API_CONFIG.ENDPOINTS.STOCK_EXPORT}?format=${format}`;
      const response = await request.get(url, { responseType: "blob" });
      return response.data;
    } catch (error) {
      console.error("Zaxira darajalarini eksport qilishda xatolik:", error);
      throw error;
    }
  }

  async exportInventoryMovements(
    format: "csv" | "excel" = "csv",
    params?: {
      startDate?: string;
      endDate?: string;
      materialId?: string;
      movementType?: string;
      location?: string;
    }
  ): Promise<Blob> {
    try {
      const searchParams = new URLSearchParams();
      searchParams.append("format", format);
      if (params?.startDate) searchParams.append("startDate", params.startDate);
      if (params?.endDate) searchParams.append("endDate", params.endDate);
      if (params?.materialId)
        searchParams.append("materialId", params.materialId);
      if (params?.movementType)
        searchParams.append("movementType", params.movementType);
      if (params?.location) searchParams.append("location", params.location);

      const url = `${API_CONFIG.ENDPOINTS.INVENTORY_MOVEMENTS_EXPORT}?${searchParams}`;
      const response = await request.get(url, { responseType: "blob" });
      return response.data;
    } catch (error) {
      console.error("Inventar harakatlarini eksport qilishda xatolik:", error);
      throw error;
    }
  }
}

export const stockService = new StockService();
