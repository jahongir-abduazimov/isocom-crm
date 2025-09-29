import request from "@/components/config/index";

// Brak (Scrap) tizimi - dokumentatsiyaga muvofiq yangilangan
export interface Scrap {
  id: string;
  step_execution: string;
  scrap_type: "HARD" | "SOFT";
  scrap_type_display: string;
  quantity: string;
  weight: string;
  unit_of_measure: string;
  reason: string;
  reason_display: string;
  status: "PENDING" | "IN_DROBIL" | "RECYCLED" | "MOVED";
  status_display: string;
  recorded_by: {
    id: string;
    username: string;
    full_name: string;
  } | null;
  recorded_by_name: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface ScrapResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Scrap[];
}

export interface ScrapFilters {
  step_execution?: string;
  scrap_type?: "HARD" | "SOFT";
  status?: "PENDING" | "IN_DROBIL" | "RECYCLED" | "MOVED";
  recorded_by?: string;
  date_range?: string;
}

// Real-time brak ma'lumotlari
export interface RealTimeScrapData {
  today_total: {
    hard_scrap: number;
    soft_scrap: number;
    total_weight: number;
  };
  by_workcenter: Record<
    string,
    {
      hard_scrap: number;
      soft_scrap: number;
      total_weight: number;
    }
  >;
}

// Brak statistikasi
export interface ScrapStatistics {
  total_quantity: number;
  total_weight: number;
  by_type: Array<{
    scrap_type: string;
    count: number;
    total_quantity: number;
    total_weight: number;
  }>;
  by_status: Array<{
    status: string;
    count: number;
    total_quantity: number;
    total_weight: number;
  }>;
}

export class ScrapService {
  static async getScraps(filters?: ScrapFilters): Promise<ScrapResponse> {
    const params = new URLSearchParams();
    if (filters?.step_execution)
      params.append("step_execution", filters.step_execution);
    if (filters?.scrap_type) params.append("scrap_type", filters.scrap_type);
    if (filters?.status) params.append("status", filters.status);
    if (filters?.recorded_by) params.append("recorded_by", filters.recorded_by);
    if (filters?.date_range) params.append("date_range", filters.date_range);

    const response = await request.get<ScrapResponse>(
      `/scraps/?${params.toString()}`
    );
    return response.data;
  }

  static async getScrapById(id: string): Promise<Scrap> {
    const response = await request.get<Scrap>(`/scraps/${id}/`);
    return response.data;
  }

  // Yangi metodlar - dokumentatsiyaga muvofiq
  static async getRealTimeScrap(): Promise<RealTimeScrapData> {
    const response = await request.get<RealTimeScrapData>(
      "/scraps/real_time_scrap/"
    );
    return response.data;
  }

  static async getScrapStatistics(): Promise<ScrapStatistics> {
    const response = await request.get<ScrapStatistics>("/scraps/statistics/");
    return response.data;
  }

  static async getProductionScraps(stepExecutionId: string): Promise<Scrap[]> {
    const response = await request.get<Scrap[]>(
      `/scraps/production_scraps/?step_execution=${stepExecutionId}`
    );
    return response.data;
  }

  static async createScrap(scrapData: Partial<Scrap>): Promise<Scrap> {
    const response = await request.post<Scrap>("/scraps/", scrapData);
    return response.data;
  }

  static async updateScrap(
    id: string,
    scrapData: Partial<Scrap>
  ): Promise<Scrap> {
    const response = await request.patch<Scrap>(`/scraps/${id}/`, scrapData);
    return response.data;
  }
}
