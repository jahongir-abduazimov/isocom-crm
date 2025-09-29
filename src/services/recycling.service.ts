import request from "@/components/config/index";

// Qayta ishlash partiyasi (Recycling Batch) - dokumentatsiyaga muvofiq
export interface RecyclingBatch {
    id: string;
    batch_number: string;
    started_at: string;
    started_by: {
        id: string;
        username: string;
        full_name: string;
    };
    status: "IN_PROGRESS" | "COMPLETED";
    status_display: string;
    completed_at?: string;
    total_hard_scrap: number;
    total_soft_scrap: number;
    final_vt_quantity?: number;
    notes?: string;
    created_at: string;
    updated_at: string;
}

// Joriy to'plangan braklar miqdorlari
export interface CurrentTotals {
    hard_scrap: number;
    soft_scrap: number;
    unit_of_measure: string;
}

// Drobilka jarayoni
export interface DrobilkaProcess {
    id: string;
    recycling_batch: string;
    recycling_batch_number: string;
    drobilka_type: "HARD" | "SOFT";
    drobilka_type_display: string;
    work_center: string;
    work_center_name: string;
    input_quantity: number;
    output_quantity?: number;
    operators: string[];
    operators_details: Array<{
        id: string;
        name: string;
        username: string;
    }>;
    lead_operator: string;
    lead_operator_name: string;
    started_at: string;
    completed_at?: string;
    notes?: string;
    efficiency_percentage?: number;
}

// Drobilka boshlash so'rovi
export interface StartDrobilkaRequest {
    recycling_batch: string;
    drobilka_type: "HARD" | "SOFT";
    work_center: string;
    input_quantity: number;
    operators: string[];
    lead_operator: string;
    notes?: string;
}

// Drobilka yakunlash so'rovi
export interface CompleteDrobilkaRequest {
    output_quantity: number;
    notes?: string;
}

// Qayta ishlash yakunlash so'rovi
export interface CompleteRecyclingRequest {
    final_vt_quantity: number;
    notes?: string;
}

// Legacy interfaces (eski tizim uchun saqlanadi)
export interface ScrapDetails {
    id: string;
    production_step: string;
    scrap_type: "HARD" | "SOFT";
    scrap_type_display: string;
    quantity: string;
    unit_of_measure: string;
    reason: string;
    reason_display: string;
    status: "PENDING" | "CONFIRMED" | "RECYCLED" | "WRITTEN_OFF";
    status_display: string;
    material: string;
    product: string | null;
    cost: string | null;
    reported_by: string;
    reported_by_name: string;
    confirmed_by: string | null;
    notes: string;
    reported_at: string;
    confirmed_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface Recycling {
    id: string;
    scrap: string;
    scrap_details: ScrapDetails;
    recycled_quantity: string;
    recycled_to: string;
    recycled_by: string;
    recycled_by_name: string;
    recycled_at: string;
    notes: string;
    created_at: string;
    updated_at: string;
}

export interface RecyclingResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: Recycling[];
}


export class RecyclingService {
    // Legacy methods (eski tizim uchun saqlanadi)
    static async getRecyclings(): Promise<RecyclingResponse> {
        const response = await request.get<RecyclingResponse>("/recycling/");
        return response.data;
    }

    static async getRecyclingById(id: string): Promise<Recycling> {
        const response = await request.get<Recycling>(`/recycling/${id}/`);
        return response.data;
    }

    // Yangi qayta ishlash tizimi - dokumentatsiyaga muvofiq
    static async startRecyclingBatch(): Promise<RecyclingBatch> {
        const response = await request.post<RecyclingBatch>("/recycling/start_recycling/");
        return response.data;
    }

    static async getCurrentTotals(): Promise<CurrentTotals> {
        const response = await request.get<CurrentTotals>("/recycling/current_totals/");
        return response.data;
    }

    static async completeRecyclingBatch(batchId: string, data: CompleteRecyclingRequest): Promise<RecyclingBatch> {
        const response = await request.post<RecyclingBatch>(`/recycling/${batchId}/complete_recycling/`, data);
        return response.data;
    }

    static async getRecyclingBatches(): Promise<RecyclingBatch[]> {
        const response = await request.get<RecyclingBatch[]>("/recycling/");
        return response.data;
    }

    static async getRecyclingBatchById(id: string): Promise<RecyclingBatch> {
        const response = await request.get<RecyclingBatch>(`/recycling/${id}/`);
        return response.data;
    }

    // Drobilka operatsiyalari
    static async startDrobilka(data: StartDrobilkaRequest): Promise<DrobilkaProcess> {
        const response = await request.post<DrobilkaProcess>("/drobilka/", data);
        return response.data;
    }

    static async completeDrobilka(id: string, data: CompleteDrobilkaRequest): Promise<DrobilkaProcess> {
        const response = await request.patch<DrobilkaProcess>(`/drobilka/${id}/`, data);
        return response.data;
    }

    static async getDrobilkaProcesses(): Promise<DrobilkaProcess[]> {
        const response = await request.get("/drobilka/");
        // Handle different response formats
        if (Array.isArray(response.data)) {
            return response.data;
        } else if (response.data && Array.isArray(response.data.results)) {
            return response.data.results;
        } else {
            return [];
        }
    }

    static async getDrobilkaProcessById(id: string): Promise<DrobilkaProcess> {
        const response = await request.get<DrobilkaProcess>(`/drobilka/${id}/`);
        return response.data;
    }

    // Drobilka jarayonini o'chirish
    static async deleteDrobilkaProcess(id: string): Promise<void> {
        await request.delete(`/drobilka/${id}/`);
    }

    // Qayta ishlash samaradorligini hisoblash
    static async getRecyclingEfficiency(batchId: string): Promise<{
        total_input: number;
        total_output: number;
        efficiency_percentage: number;
        loss_percentage: number;
        processing_time?: string;
    }> {
        const response = await request.get(`/recycling/${batchId}/efficiency/`);
        return response.data;
    }
}
