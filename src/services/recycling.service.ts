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

export class RecyclingService {
    static async getRecyclings(): Promise<RecyclingResponse> {
        const response = await request.get<RecyclingResponse>("/recycling/");
        return response.data;
    }

    static async getRecyclingById(id: string): Promise<Recycling> {
        const response = await request.get<Recycling>(`/recycling/${id}/`);
        return response.data;
    }
}
