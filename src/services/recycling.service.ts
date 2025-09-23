import request from "@/components/config";

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

// New interfaces for batch management and drobilka operations
export interface RecyclingBatch {
    id: string;
    batch_number: string;
    started_at: string;
    started_by: {
        id: string;
        username: string;
        full_name: string;
    };
    status: "IN_PROCESS" | "COMPLETED";
    completed_at?: string;
    total_input?: string;
    total_output?: string;
    notes?: string;
}

export interface CurrentTotals {
    hard_scrap_total: string;
    soft_scrap_total: string;
    unit_of_measure: string;
}

export interface DrobilkaProcess {
    id: string;
    recycling_batch: string;
    drobilka_type: "HARD" | "SOFT";
    drobilka_type_display: string;
    work_center: string;
    work_center_name: string;
    input_quantity: string;
    output_quantity: string | null;
    operators: string[];
    operators_details: Array<{
        id: string;
        name: string;
        username: string;
    }>;
    lead_operator: string;
    lead_operator_name: string;
    started_at: string;
    completed_at: string | null;
    notes?: string;
}

export interface StartDrobilkaRequest {
    recycling_batch: string;
    drobilka_type: "HARD" | "SOFT";
    work_center: string;
    input_quantity: string;
    operators: string[];
}

export interface CompleteDrobilkaRequest {
    output_quantity: string;
    completed_at: string;
    notes?: string;
}

export class RecyclingService {
    static async getRecyclings(): Promise<RecyclingResponse> {
        const response = await request.get<RecyclingResponse>("/recycling/");
        return response.data;
    }

    static async getRecyclingById(id: string): Promise<Recycling> {
        const response = await request.get<Recycling>(`/recycling/${id}/`);
        return response.data;
    }

    // New methods for batch management
    static async startRecyclingBatch(): Promise<RecyclingBatch> {
        const response = await request.post<RecyclingBatch>("/recycling/start_recycling/");
        return response.data;
    }

    static async getCurrentTotals(): Promise<CurrentTotals> {
        const response = await request.get<CurrentTotals>("/recycling/current_totals/");
        return response.data;
    }

    static async completeRecyclingBatch(batchId: string): Promise<RecyclingBatch> {
        const response = await request.post<RecyclingBatch>(`/recycling/${batchId}/complete_recycling/`);
        return response.data;
    }

    // Drobilka operations
    static async startDrobilka(data: StartDrobilkaRequest): Promise<DrobilkaProcess> {
        const response = await request.post<DrobilkaProcess>("/drobilka/", data);
        return response.data;
    }

    static async completeDrobilka(id: string, data: CompleteDrobilkaRequest): Promise<DrobilkaProcess> {
        const response = await request.patch<DrobilkaProcess>(`/drobilka/${id}/`, data);
        return response.data;
    }

    static async getDrobilkaProcesses(): Promise<DrobilkaProcess[]> {
        const response = await request.get<DrobilkaProcess[]>("/drobilka/");
        return response.data;
    }

    static async getDrobilkaProcessById(id: string): Promise<DrobilkaProcess> {
        const response = await request.get<DrobilkaProcess>(`/drobilka/${id}/`);
        return response.data;
    }
}
