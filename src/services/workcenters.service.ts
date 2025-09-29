import request from "@/components/config/index";
import type { Workcenter } from "@/store/workcenters.store";

export interface WorkcentersApiResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: Workcenter[];
}

export class WorkcentersService {
    static async getWorkcenters(): Promise<WorkcentersApiResponse> {
        const response = await request.get<WorkcentersApiResponse>("/workcenters/");
        return response.data;
    }

    static async getWorkcenterById(id: string): Promise<Workcenter> {
        const response = await request.get<Workcenter>(`/workcenters/${id}/`);
        return response.data;
    }

    static async createWorkcenter(
        workcenterData: Omit<Workcenter, "id">
    ): Promise<Workcenter> {
        const response = await request.post<Workcenter>("/workcenters/", workcenterData);
        return response.data;
    }

    static async updateWorkcenter(
        id: string,
        workcenterData: Partial<Omit<Workcenter, "id">>
    ): Promise<Workcenter> {
        const response = await request.patch<Workcenter>(`/workcenters/${id}/`, workcenterData);
        return response.data;
    }

    static async deleteWorkcenter(id: string): Promise<void> {
        await request.delete(`/workcenters/${id}/`);
    }
}

export default WorkcentersService;
