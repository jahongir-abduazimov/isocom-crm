import { API_CONFIG } from '@/config/api.config';

export interface WorkerOrder {
    id: string;
    produced_product__name: string;
    produced_quantity: number;
    status: string;
}

export interface ProductionStep {
    id: string;
    name: string;
    step_type: string;
    description: string | null;
    duration_hours: string | null;
    is_required: boolean;
    order_sequence: number;
    work_center: string | null;
    work_center_name: string | null;
}

export interface ProductionStepsResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: ProductionStep[];
}

export interface StockMaterial {
    material__id: string;
    material__name: string;
    material__unit_of_measure: string;
    quantity: number;
}

export interface StockProduct {
    product__id: string;
    product__name: string;
    product__unit_of_measure: string;
    quantity: number;
}

export interface WorkcenterStock {
    workcenter_location: string;
    materials: StockMaterial[];
    products: StockProduct[];
}

export interface BulkCreateItem {
    material_id?: string;
    product_id?: string;
    quantity: number;
    unit_of_measure: string;
}

export interface BulkCreateRequest {
    order_id: string;
    production_step_id: string;
    operator_id: string;
    items: BulkCreateItem[];
}

export interface BulkCreateResponse {
    message: string;
    order_id: string;
    order_status: string;
    step_execution_id: string;
    created_items_count: number;
    assigned_operator: string;
}

class WorkerService {
    private getAuthHeaders() {
        // Auth store dan token olish
        const authStorage = localStorage.getItem('auth-storage');
        let token = null;

        if (authStorage) {
            try {
                const authData = JSON.parse(authStorage);
                token = authData.state?.token;
            } catch (error) {
                console.error('Error parsing auth storage:', error);
            }
        }

        if (!token) {
            throw new Error('Authentication token not found. Please login again.');
        }

        return {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
    }

    private handleResponse(response: Response) {
        if (!response.ok) {
            if (response.status === 401) {
                // Token eskirgan yoki noto'g'ri
                localStorage.removeItem('auth-storage');
                window.location.href = '/login';
                throw new Error('Authentication failed. Please login again.');
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response;
    }

    async fetchOrders(): Promise<WorkerOrder[]> {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.WORKER_ORDERS}`, {
                headers: this.getAuthHeaders()
            });

            this.handleResponse(response);
            return await response.json();
        } catch (error) {
            console.error('Error fetching orders:', error);
            throw error;
        }
    }

    async fetchOrderSteps(): Promise<ProductionStep[]> {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.WORKER_ORDER_STEPS()}`, {
                headers: this.getAuthHeaders()
            });

            this.handleResponse(response);
            const data: ProductionStepsResponse = await response.json();
            return data.results;
        } catch (error) {
            console.error('Error fetching production steps:', error);
            throw error;
        }
    }

    async fetchWorkcenterStock(workcenterId: string): Promise<WorkcenterStock> {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.WORKER_WORKCENTER_STOCK(workcenterId)}`, {
                headers: this.getAuthHeaders()
            });

            this.handleResponse(response);
            return await response.json();
        } catch (error) {
            console.error('Error fetching workcenter stock:', error);
            throw error;
        }
    }

    async bulkCreateUsedMaterials(request: BulkCreateRequest): Promise<BulkCreateResponse> {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.WORKER_BULK_CREATE}`, {
                method: 'POST',
                headers: this.getAuthHeaders(),
                body: JSON.stringify(request)
            });

            this.handleResponse(response);
            return await response.json();
        } catch (error) {
            console.error('Error creating used materials:', error);
            throw error;
        }
    }

    async fetchMaterials(): Promise<any[]> {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.WORKER_MATERIALS}`, {
                headers: this.getAuthHeaders()
            });

            this.handleResponse(response);
            return await response.json();
        } catch (error) {
            console.error('Error fetching materials:', error);
            throw error;
        }
    }

    async fetchProducts(): Promise<any[]> {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.WORKER_PRODUCTS}`, {
                headers: this.getAuthHeaders()
            });

            this.handleResponse(response);
            return await response.json();
        } catch (error) {
            console.error('Error fetching products:', error);
            throw error;
        }
    }

    async fetchOperators(): Promise<any[]> {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USERS}`, {
                headers: this.getAuthHeaders()
            });

            this.handleResponse(response);
            const data = await response.json();
            // Filter users with worker roles
            const workerRoles = ['WORKER', 'SMENA_BOSHLIGI', 'KATTA_MUTAXASSIS', 'KICHIK_MUTAXASSIS', 'STAJER'];
            return data.results?.filter((user: any) => workerRoles.includes(user.role)) || [];
        } catch (error) {
            console.error('Error fetching operators:', error);
            throw error;
        }
    }
}

export const workerService = new WorkerService();
