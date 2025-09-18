import { API_CONFIG } from '@/config/api.config';

export interface Bunker {
    id: string;
    work_center: string;
    work_center_name: string;
    bunker_name: string;
    capacity_kg: string;
    current_level_kg: string;
    is_filled: boolean;
    filled_by: string | null;
    filled_at: string | null;
    created_at: string;
    material_type?: string;
    last_filled_at?: string;
}

export interface BunkerStatus {
    bunker_name: string;
    work_center: string;
    current_level_kg: number;
    capacity_kg: number;
    available_capacity_kg: number;
    fill_percentage: number;
    is_full: boolean;
    recent_fills: {
        material_name: string;
        quantity_kg: number;
        filled_at: string;
        operator: string;
    }[];
    material_type?: string;
    last_updated: string;
}

export interface FillBunkerRequest {
    material_id: string;
    weighed_quantity_kg: number;
    operator_id: string;
}

export interface FillBunkerResponse {
    message: string;
    bunker_id: string;
    new_level_kg: number;
    fill_percentage: number;
}

export interface ShiftStatus {
    shift_id: string;
    started_at?: string;
    ended_at?: string;
    consumption_kg?: number;
    status: 'not_started' | 'started' | 'ended';
}

export interface StartShiftRequest {
    shift_id: string;
}

export interface StartShiftResponse {
    message: string;
    shift_id: string;
    started_at: string;
    bunker_status: BunkerStatus;
}

export interface EndShiftRequest {
    shift_id: string;
}

export interface EndShiftResponse {
    message: string;
    shift_id: string;
    ended_at: string;
    consumption_kg: number;
    bunker_status: BunkerStatus;
}

class BunkerService {
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

    async fetchBunkers(): Promise<Bunker[]> {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.BUNKERS}`, {
                headers: this.getAuthHeaders()
            });

            this.handleResponse(response);
            const data = await response.json();
            return data.results || [];
        } catch (error) {
            console.error('Error fetching bunkers:', error);
            throw error;
        }
    }

    async fetchBunkerStatus(bunkerId: string): Promise<BunkerStatus> {
        try {
            const response = await fetch(
                `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.BUNKER_STATUS(bunkerId)}`,
                {
                    headers: this.getAuthHeaders()
                }
            );

            this.handleResponse(response);
            return await response.json();
        } catch (error) {
            console.error('Error fetching bunker status:', error);
            throw error;
        }
    }

    async fillBunker(bunkerId: string, request: FillBunkerRequest): Promise<FillBunkerResponse> {
        try {
            const response = await fetch(
                `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.BUNKER_FILL(bunkerId)}`,
                {
                    method: 'POST',
                    headers: this.getAuthHeaders(),
                    body: JSON.stringify(request)
                }
            );

            this.handleResponse(response);
            return await response.json();
        } catch (error) {
            console.error('Error filling bunker:', error);
            throw error;
        }
    }

    async fetchShiftStatus(bunkerId: string): Promise<ShiftStatus> {
        try {
            const response = await fetch(
                `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.BUNKER_SHIFT_STATUS(bunkerId)}`,
                {
                    headers: this.getAuthHeaders()
                }
            );

            this.handleResponse(response);
            return await response.json();
        } catch (error) {
            console.error('Error fetching shift status:', error);
            throw error;
        }
    }

    async startShift(bunkerId: string, request: StartShiftRequest): Promise<StartShiftResponse> {
        try {
            const response = await fetch(
                `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.BUNKER_START_SHIFT(bunkerId)}`,
                {
                    method: 'POST',
                    headers: this.getAuthHeaders(),
                    body: JSON.stringify(request)
                }
            );

            this.handleResponse(response);
            return await response.json();
        } catch (error) {
            console.error('Error starting shift:', error);
            throw error;
        }
    }

    async endShift(bunkerId: string, request: EndShiftRequest): Promise<EndShiftResponse> {
        try {
            const response = await fetch(
                `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.BUNKER_END_SHIFT(bunkerId)}`,
                {
                    method: 'POST',
                    headers: this.getAuthHeaders(),
                    body: JSON.stringify(request)
                }
            );

            this.handleResponse(response);
            return await response.json();
        } catch (error) {
            console.error('Error ending shift:', error);
            throw error;
        }
    }

    async fetchMaterials(): Promise<any[]> {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.MATERIALS}`, {
                headers: this.getAuthHeaders()
            });

            this.handleResponse(response);
            const data = await response.json();
            return data.results || [];
        } catch (error) {
            console.error('Error fetching materials:', error);
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

export const bunkerService = new BunkerService();
