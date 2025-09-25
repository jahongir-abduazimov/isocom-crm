import { API_CONFIG } from '@/config/api.config';

// New Workflow Interfaces
export interface Workcenter {
    id: string;
    name: string;
    type: string;
    description: string;
}

export interface WorkerOrder {
    id: string;
    produced_product_name: string;
    produced_product__name?: string;
    produced_quantity: number;
    unit_of_measure: string;
    status: string;
    description: string;
    step_execution_id: string;
    step_name: string;
    step_status: string;
    created_at: string;
}

export interface OrdersByWorkcenterTypeResponse {
    workcenter_type: string;
    orders: WorkerOrder[];
    total_orders: number;
}

export interface ProductionStepsByWorkcenterTypeResponse {
    workcenter_type: string;
    production_steps: ProductionStep[];
}

export interface StepExecutionResponse {
    step_execution_id: string;
    order_id: string;
    production_step_id: string;
    production_step_name: string;
    status: string;
    created: boolean;
    workcenter_type: string;
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

// New Workflow Bulk Create Request
export interface BulkCreateByWorkcenterTypeRequest {
    order_id: string;
    production_step_id: string;
    operator_id: string;
    workcenter_type: string;
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

// New Workflow Bulk Create Response
export interface BulkCreateByWorkcenterTypeResponse {
    message: string;
    order_id: string;
    order_status: string;
    step_execution_id: string;
    step_execution_created: boolean;
    production_step_name: string;
    workcenter_type: string;
    created_items_count: number;
    assigned_operator: string;
    assigned_operator_id: string;
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
                console.error('Auth storage ni tahlil qilishda xatolik:', error);
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
                throw new Error('Autentifikatsiya muvaffaqiyatsiz. Iltimos, qaytadan kirish.');
            }
            throw new Error(`HTTP xatoligi! holat: ${response.status}`);
        }
        return response;
    }

    // New Workflow Methods
    async fetchWorkcenters(): Promise<Workcenter[]> {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.WORKER_WORKCENTERS}`, {
                headers: this.getAuthHeaders()
            });

            this.handleResponse(response);
            return await response.json();
        } catch (error) {
            console.error('Workcenterlarni olishda xatolik:', error);
            throw error;
        }
    }

    async fetchOrdersByWorkcenterType(workcenterType: string): Promise<OrdersByWorkcenterTypeResponse> {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.WORKER_ORDERS_BY_WORKCENTER_TYPE(workcenterType)}`, {
                headers: this.getAuthHeaders()
            });

            this.handleResponse(response);
            return await response.json();
        } catch (error) {
            console.error('Workcenter type bo\'yicha buyurtmalarni olishda xatolik:', error);
            throw error;
        }
    }

    async fetchProductionStepsByWorkcenterType(workcenterType: string): Promise<ProductionStepsByWorkcenterTypeResponse> {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.WORKER_PRODUCTION_STEPS_BY_WORKCENTER_TYPE(workcenterType)}`, {
                headers: this.getAuthHeaders()
            });

            this.handleResponse(response);
            return await response.json();
        } catch (error) {
            console.error('Workcenter type bo\'yicha production steplarni olishda xatolik:', error);
            throw error;
        }
    }

    async getOrCreateStepExecution(orderId: string, workcenterType: string): Promise<StepExecutionResponse> {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.WORKER_GET_OR_CREATE_STEP_EXECUTION(orderId, workcenterType)}`, {
                headers: this.getAuthHeaders()
            });

            this.handleResponse(response);
            return await response.json();
        } catch (error) {
            console.error('Step execution olish/yaratishda xatolik:', error);
            throw error;
        }
    }

    async bulkCreateByWorkcenterType(request: BulkCreateByWorkcenterTypeRequest): Promise<BulkCreateByWorkcenterTypeResponse> {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.WORKER_BULK_CREATE_BY_WORKCENTER_TYPE}`, {
                method: 'POST',
                headers: this.getAuthHeaders(),
                body: JSON.stringify(request)
            });

            this.handleResponse(response);
            return await response.json();
        } catch (error) {
            console.error('Workcenter type bo\'yicha bulk create da xatolik:', error);
            throw error;
        }
    }

    // New method to fetch all orders without workcenter type filter
    async fetchAllOrders(): Promise<WorkerOrder[]> {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.WORKER_ALL_ORDERS}`, {
                headers: this.getAuthHeaders()
            });

            this.handleResponse(response);
            return await response.json();
        } catch (error) {
            console.error('Barcha buyurtmalarni olishda xatolik:', error);
            throw error;
        }
    }

    // Legacy Methods (for backward compatibility)
    async fetchOrders(): Promise<WorkerOrder[]> {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.WORKER_ORDERS}`, {
                headers: this.getAuthHeaders()
            });

            this.handleResponse(response);
            return await response.json();
        } catch (error) {
            console.error('Buyurtmalarni olishda xatolik:', error);
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
            console.error('Ishlab chiqarish qadamlari olishda xatolik:', error);
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
            console.error('Stanok zaxirasini olishda xatolik:', error);
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
            console.error('Ishlatilgan materiallarni yaratishda xatolik:', error);
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
            console.error('Materiallarni olishda xatolik:', error);
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
            console.error('Maxsulotlarni olishda xatolik:', error);
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
            console.error('Operatorlarni olishda xatolik:', error);
            throw error;
        }
    }
}

export const workerService = new WorkerService();
