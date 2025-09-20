import request from "@/components/config";

export interface Scrap {
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

export interface ScrapResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: Scrap[];
}

export class ScrapService {
    static async getScraps(): Promise<ScrapResponse> {
        const response = await request.get<ScrapResponse>("/scraps/");
        return response.data;
    }

    static async getScrapById(id: string): Promise<Scrap> {
        const response = await request.get<Scrap>(`/scraps/${id}/`);
        return response.data;
    }
}
