import request from "@/components/config";

// Updated interface to match actual API response
export interface Warehouse {
    id: string;
    name: string;
    description: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface WarehousesApiResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: Warehouse[];
}

export class WarehouseService {
    static async getWarehouses(): Promise<WarehousesApiResponse> {
        const response = await request.get<WarehousesApiResponse>("/warehouses/");
        return response.data;
    }

    static async getWarehouseById(id: string): Promise<Warehouse> {
        const response = await request.get<Warehouse>(`/warehouses/${id}/`);
        return response.data;
    }

    static async createWarehouse(data: Omit<Warehouse, 'id' | 'created_at' | 'updated_at'>): Promise<Warehouse> {
        const response = await request.post<Warehouse>("/warehouses/", data);
        return response.data;
    }

    static async updateWarehouse(id: string, data: Partial<Omit<Warehouse, 'id' | 'created_at' | 'updated_at'>>): Promise<Warehouse> {
        const response = await request.put<Warehouse>(`/warehouses/${id}/`, data);
        return response.data;
    }

    static async deleteWarehouse(id: string): Promise<void> {
        await request.delete(`/warehouses/${id}/`);
    }
}

export default WarehouseService;
