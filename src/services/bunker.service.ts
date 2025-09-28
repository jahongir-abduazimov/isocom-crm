import { API_CONFIG } from "@/config/api.config";

// New Bunker System Interfaces based on documentation

export interface Bunker {
  id: string;
  work_center: string;
  work_center_name: string;
  name: string;
  capacity_kg: string;
  is_filled: boolean;
  created_at: string;
  updated_at: string;
}

export interface Container {
  id: string;
  bunker: string;
  bunker_name: string;
  container_name: string;
  empty_weight_kg: string;
  max_capacity_kg: string;
  current_capacity_kg: string;
  created_at: string;
  updated_at: string;
}

export interface BunkerFillMaterial {
  id: string;
  fill_session: string;
  material: string;
  material_name: string;
  material_code: string;
  quantity_kg: string;
}

export interface DailyMaterialSummary {
  total_pvd_added: number;
  total_vt_added: number;
  total_materials_added: number;
  operators: {
    operator_name: string;
    material_name: string;
    quantity: number;
    added_at: string;
  }[];
}

export interface MaterialPercentages {
  [key: string]: number;
}

export interface RemainingMaterialPercentages {
  remaining_pvd_percentage: number;
  remaining_vt_percentage: number;
}

export interface BunkerFillSession {
  id: string;
  filled_by_name: string;
  bunker_name: string;
  container_name: string;
  bunker_capacity_kg: string;
  order: string;
  order_number: string;
  materials: BunkerFillMaterial[];
  daily_material_summary: DailyMaterialSummary;
  total_materials_added: string;
  bunker_remaining_kg: string;
  material_percentages: MaterialPercentages;
  remaining_material_percentages: RemainingMaterialPercentages;
  container_previous_weight_kg: string;
  filled_at: string;
  notes: string;
  is_remaining_processed: boolean;
}

export interface FillBunkerRequest {
  bunker: string;
  container: string;
  filled_by: string;
  order: string;
  container_previous_weight_kg: number;
  notes: string;
  materials: {
    material: string;
    quantity_kg: number;
  }[];
}

export interface FillBunkerResponse {
  message: string;
  fill_session: BunkerFillSession;
}

export interface ProcessRemainingMaterialsResponse {
  message: string;
  order_number: string;
  order_id: string;
  remaining_pvd_kg: number;
  remaining_vt_kg: number;
  total_remaining_kg: number;
}

// Legacy interfaces for backward compatibility
export interface BunkerStatus {
  bunker_name: string;
  work_center: string;
  current_level_kg: number | string;
  capacity_kg: number | string;
  available_capacity_kg: number | string;
  fill_percentage: number | string;
  is_full: boolean;
  recent_fills: {
    material_name: string;
    quantity_kg: number;
    filled_at: string;
    operator: string;
  }[];
  material_type?: string;
  last_updated: string;
}

export interface ShiftStatus {
  shift_id: string;
  started_at?: string;
  ended_at?: string;
  consumption_kg?: number;
  status: "not_started" | "started" | "ended";
}

export interface StartShiftRequest {
  shift_id: string;
}

export interface StartShiftResponse {
  message: string;
  shift_id: string;
  started_at: string;
  bunker_status: BunkerStatus;
}

export interface EndShiftRequest {
  shift_id: string;
}

export interface EndShiftResponse {
  message: string;
  shift_id: string;
  ended_at: string;
  consumption_kg: number;
  bunker_status: BunkerStatus;
}

export interface FillBunkerEndShiftRequest {
  materials: {
    material_id: string;
    weighed_quantity_kg: number;
  }[];
  operator_id: string;
  step_execution_id: string;
  notes?: string;
}

export interface FillBunkerEndShiftResponse {
  message: string;
  bunker_capacity: number;
  total_added_during_shift: number;
  remaining_material: number;
  pvd_amount: number;
  vt_amount: number;
  operator_name: string;
  filled_at: string;
  fill_log_id: string;
  notes?: string;
  material_deduction: {
    step_execution_id: string;
    order_id: string;
    pvd_deducted: number;
    vt_deducted: number;
    total_deducted: number;
    pvd_used_material_id: string;
    vt_used_material_id: string;
  };
}

class BunkerService {
  private getAuthHeaders() {
    // Auth store dan token olish
    const authStorage = localStorage.getItem("auth-storage");
    let token = null;

    if (authStorage) {
      try {
        const authData = JSON.parse(authStorage);
        token = authData.state?.token;
      } catch (error) {
        console.error("Auth storage ni tahlil qilishda xatolik:", error);
      }
    }

    if (!token) {
      throw new Error("Authentication token not found. Please login again.");
    }

    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  }

  private handleResponse(response: Response) {
    if (!response.ok) {
      if (response.status === 401) {
        // Token eskirgan yoki noto'g'ri
        localStorage.removeItem("auth-storage");
        window.location.href = "/login";
        throw new Error(
          "Autentifikatsiya muvaffaqiyatsiz. Iltimos, qaytadan kirish."
        );
      }
      throw new Error(`HTTP xatoligi! holat: ${response.status}`);
    }
    return response;
  }

  // New Bunker System Methods

  async fetchBunkers(): Promise<Bunker[]> {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.BUNKERS}`,
        {
          headers: this.getAuthHeaders(),
        }
      );

      this.handleResponse(response);
      const data = await response.json();
      return data.results || [];
    } catch (error) {
      console.error("Bunkerlarni olishda xatolik:", error);
      throw error;
    }
  }

  async fetchBunkerById(bunkerId: string): Promise<Bunker> {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.BUNKER_BY_ID(bunkerId)}`,
        {
          headers: this.getAuthHeaders(),
        }
      );

      this.handleResponse(response);
      return await response.json();
    } catch (error) {
      console.error("Bunker ma'lumotlarini olishda xatolik:", error);
      throw error;
    }
  }

  async createBunker(bunkerData: {
    work_center: string;
    name: string;
    capacity_kg: number;
    is_filled: boolean;
  }): Promise<Bunker> {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.BUNKERS}`,
        {
          method: "POST",
          headers: this.getAuthHeaders(),
          body: JSON.stringify(bunkerData),
        }
      );

      this.handleResponse(response);
      return await response.json();
    } catch (error) {
      console.error("Bunker yaratishda xatolik:", error);
      throw error;
    }
  }

  async updateBunker(bunkerId: string, bunkerData: Partial<Bunker>): Promise<Bunker> {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.BUNKER_BY_ID(bunkerId)}`,
        {
          method: "PUT",
          headers: this.getAuthHeaders(),
          body: JSON.stringify(bunkerData),
        }
      );

      this.handleResponse(response);
      return await response.json();
    } catch (error) {
      console.error("Bunkerni yangilashda xatolik:", error);
      throw error;
    }
  }

  async deleteBunker(bunkerId: string): Promise<void> {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.BUNKER_BY_ID(bunkerId)}`,
        {
          method: "DELETE",
          headers: this.getAuthHeaders(),
        }
      );

      this.handleResponse(response);
    } catch (error) {
      console.error("Bunkerni o'chirishda xatolik:", error);
      throw error;
    }
  }

  // Container Management

  async fetchContainers(): Promise<Container[]> {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CONTAINERS}`,
        {
          headers: this.getAuthHeaders(),
        }
      );

      this.handleResponse(response);
      const data = await response.json();
      return data.results || [];
    } catch (error) {
      console.error("Containerlarni olishda xatolik:", error);
      throw error;
    }
  }

  async fetchContainersByBunker(bunkerId: string): Promise<Container[]> {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CONTAINERS}?bunker=${bunkerId}`,
        {
          headers: this.getAuthHeaders(),
        }
      );

      this.handleResponse(response);
      const data = await response.json();
      return data.results || [];
    } catch (error) {
      console.error("Bunker containerlarini olishda xatolik:", error);
      throw error;
    }
  }

  async createContainer(containerData: {
    bunker: string;
    container_name: string;
    empty_weight_kg: string;
    max_capacity_kg: string;
    current_capacity_kg?: string;
  }): Promise<Container> {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CONTAINERS}`,
        {
          method: "POST",
          headers: this.getAuthHeaders(),
          body: JSON.stringify(containerData),
        }
      );

      this.handleResponse(response);
      return await response.json();
    } catch (error) {
      console.error("Container yaratishda xatolik:", error);
      throw error;
    }
  }

  async updateContainer(containerId: string, containerData: Partial<Container> & { bunker?: string }): Promise<Container> {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CONTAINER_BY_ID(containerId)}`,
        {
          method: "PUT",
          headers: this.getAuthHeaders(),
          body: JSON.stringify(containerData),
        }
      );

      this.handleResponse(response);
      return await response.json();
    } catch (error) {
      console.error("Containerni yangilashda xatolik:", error);
      throw error;
    }
  }

  async deleteContainer(containerId: string): Promise<void> {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CONTAINER_BY_ID(containerId)}`,
        {
          method: "DELETE",
          headers: this.getAuthHeaders(),
        }
      );

      this.handleResponse(response);
    } catch (error) {
      console.error("Containerni o'chirishda xatolik:", error);
      throw error;
    }
  }

  // Fill Sessions

  async fetchFillSessions(): Promise<BunkerFillSession[]> {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.FILL_SESSIONS}`,
        {
          headers: this.getAuthHeaders(),
        }
      );

      this.handleResponse(response);
      const data = await response.json();
      return data.results || [];
    } catch (error) {
      console.error("Fill sessionlarni olishda xatolik:", error);
      throw error;
    }
  }

  async fetchBunkerStatus(bunkerId: string): Promise<BunkerFillSession> {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.BUNKER_STATUS(bunkerId)}`,
        {
          headers: this.getAuthHeaders(),
        }
      );

      this.handleResponse(response);
      return await response.json();
    } catch (error) {
      console.error("Bunker holatini olishda xatolik:", error);
      throw error;
    }
  }

  async fillBunker(request: FillBunkerRequest): Promise<FillBunkerResponse> {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.FILL_BUNKER}`,
        {
          method: "POST",
          headers: this.getAuthHeaders(),
          body: JSON.stringify(request),
        }
      );

      this.handleResponse(response);
      return await response.json();
    } catch (error) {
      console.error("Bunkerni to'ldirishda xatolik: ", error);
      throw error;
    }
  }

  async processRemainingMaterials(fillSessionId: string): Promise<ProcessRemainingMaterialsResponse> {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PROCESS_REMAINING_MATERIALS(fillSessionId)}`,
        {
          method: "POST",
          headers: this.getAuthHeaders(),
        }
      );

      this.handleResponse(response);
      return await response.json();
    } catch (error) {
      console.error("Qoldiq materiallarni ayrishda xatolik:", error);
      throw error;
    }
  }

  async fetchShiftStatus(bunkerId: string): Promise<ShiftStatus> {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.BUNKER_SHIFT_STATUS(
          bunkerId
        )}`,
        {
          headers: this.getAuthHeaders(),
        }
      );

      this.handleResponse(response);
      return await response.json();
    } catch (error) {
      console.error("Smena holatini olishda xatolik:", error);
      throw error;
    }
  }

  async startShift(
    bunkerId: string,
    request: StartShiftRequest
  ): Promise<StartShiftResponse> {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.BUNKER_START_SHIFT(
          bunkerId
        )}`,
        {
          method: "POST",
          headers: this.getAuthHeaders(),
          body: JSON.stringify(request),
        }
      );

      this.handleResponse(response);
      return await response.json();
    } catch (error) {
      console.error("Smenani boshlashda xatolik:", error);
      throw error;
    }
  }

  async endShift(
    bunkerId: string,
    request: EndShiftRequest
  ): Promise<EndShiftResponse> {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.BUNKER_END_SHIFT(
          bunkerId
        )}`,
        {
          method: "POST",
          headers: this.getAuthHeaders(),
          body: JSON.stringify(request),
        }
      );

      this.handleResponse(response);
      return await response.json();
    } catch (error) {
      console.error("Smenani tugatishda xatolik:", error);
      throw error;
    }
  }

  async fetchMaterials(): Promise<any[]> {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.MATERIALS}`,
        {
          headers: this.getAuthHeaders(),
        }
      );

      this.handleResponse(response);
      const data = await response.json();
      return data.results || [];
    } catch (error) {
      console.error("Materiallarni olishda xatolik:", error);
      throw error;
    }
  }

  async fetchOperators(): Promise<any[]> {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USERS}`,
        {
          headers: this.getAuthHeaders(),
        }
      );

      this.handleResponse(response);
      const data = await response.json();
      // Filter users with worker roles
      const workerRoles = [
        "WORKER",
        "SMENA_BOSHLIGI",
        "KATTA_MUTAXASSIS",
        "KICHIK_MUTAXASSIS",
        "STAJER",
      ];
      return (
        data.results?.filter((user: any) => workerRoles.includes(user.role)) ||
        []
      );
    } catch (error) {
      console.error("Operatorlarni olishda xatolik:", error);
      throw error;
    }
  }

  async fillBunkerEndShift(
    bunkerId: string,
    request: FillBunkerEndShiftRequest
  ): Promise<FillBunkerEndShiftResponse> {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/extruder/bunkers/${bunkerId}/bulk_fill_bunker_end_shift/`,
        {
          method: "POST",
          headers: this.getAuthHeaders(),
          body: JSON.stringify(request),
        }
      );

      this.handleResponse(response);
      return await response.json();
    } catch (error) {
      console.error("Smena oxirida bunkerni to'ldirishda xatolik: ", error);
      throw error;
    }
  }

  async fetchStepExecutions(workCenterId: string): Promise<any[]> {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/step-executions/?work_center=${workCenterId}&status=IN_PROGRESS&expand=order`,
        {
          headers: this.getAuthHeaders(),
        }
      );

      this.handleResponse(response);
      const data = await response.json();
      return data.results || [];
    } catch (error) {
      console.error("Qadam bajarishlarni olishda xatolik:", error);
      throw error;
    }
  }

  async fetchWorkcenterStock(workcenterId: string): Promise<any> {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/worker/used-materials/workcenter_stock/?workcenter_id=${workcenterId}`,
        {
          headers: this.getAuthHeaders(),
        }
      );

      this.handleResponse(response);
      return await response.json();
    } catch (error) {
      console.error("Stanok zaxirasini olishda xatolik:", error);
      throw error;
    }
  }

  async fetchOrders(): Promise<any[]> {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/worker/used-materials/orders/`,
        {
          headers: this.getAuthHeaders(),
        }
      );

      this.handleResponse(response);
      return await response.json();
    } catch (error) {
      console.error("Buyurtmalarni olishda xatolik:", error);
      throw error;
    }
  }

  async fetchAllStepExecutions(): Promise<any[]> {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/step-executions/?expand=order`,
        {
          headers: this.getAuthHeaders(),
        }
      );

      this.handleResponse(response);
      const data = await response.json();
      return data.results || [];
    } catch (error) {
      console.error("Barcha qadam bajarishlarni olishda xatolik:", error);
      throw error;
    }
  }
}

export const bunkerService = new BunkerService();
