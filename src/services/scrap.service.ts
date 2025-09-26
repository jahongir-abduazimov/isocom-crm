import request from "@/components/config";

export interface Scrap {
    id: string;
    step_execution: string;
    scrap_type: "HARD" | "SOFT";
    quantity: string;
    weight: string;
    unit_of_measure: string;
    reason: string;
    status: "PENDING" | "IN_PROCESS" | "COMPLETED";
    recorded_by: {
        id: string;
        username: string;
        full_name: string;
    };
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
    status?: "PENDING" | "IN_PROCESS" | "COMPLETED";
    recorded_by?: string;
}

export class ScrapService {
    static async getScraps(filters?: ScrapFilters): Promise<ScrapResponse> {
        const params = new URLSearchParams();
        if (filters?.step_execution) params.append('step_execution', filters.step_execution);
        if (filters?.scrap_type) params.append('scrap_type', filters.scrap_type);
        if (filters?.status) params.append('status', filters.status);
        if (filters?.recorded_by) params.append('recorded_by', filters.recorded_by);

        const response = await request.get<ScrapResponse>(`/scraps/?${params.toString()}`);
        return response.data;
    }

    static async getScrapById(id: string): Promise<Scrap> {
        const response = await request.get<Scrap>(`/scraps/${id}/`);
        return response.data;
    }
}
