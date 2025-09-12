import { create } from "zustand";

export interface Workcenter {
    id: string;
    name: string;
    description: string;
    type: "EXTRUDER" | "DEGASSING_AREA" | "LAMINATOR" | "BRONIROVSHIK" | "DUPLICATOR" | "PACKAGING" | "QUALITY_CONTROL" | "BRAK_MAYDALAGICH";
    location: string;
    capacity_per_hour: number | null;
    capacity_unit: string | null;
    last_maintenance_date: string | null;
    is_active: boolean;
}

interface WorkcentersState {
    workcenters: Workcenter[];
    loading: boolean;
    error: string | null;
    fetchWorkcenters: () => Promise<void>;
    addWorkcenter: (
        workcenter: Omit<Workcenter, "id">
    ) => Promise<boolean>;
    deleteWorkcenter: (id: string) => Promise<boolean>;
    updateWorkcenter: (
        id: string,
        workcenter: Partial<Omit<Workcenter, "id">>
    ) => Promise<boolean>;
}

export const useWorkcentersStore = create<WorkcentersState>((set) => ({
    workcenters: [],
    loading: false,
    error: null,
    fetchWorkcenters: async () => {
        set({ loading: true, error: null });
        try {
            const request = (await import("@/components/config")).default;
            const res = await request.get("/workcenters/");
            set({ workcenters: res.data.results, loading: false });
        } catch (err: any) {
            let message = "Unknown error";
            if (err?.response?.data?.detail) message = err.response.data.detail;
            else if (err instanceof Error) message = err.message;
            set({ error: message, loading: false });
        }
    },
    addWorkcenter: async (workcenter) => {
        set({ loading: true, error: null });
        try {
            const request = (await import("@/components/config")).default;
            await request.post("/workcenters/", workcenter);
            set({ loading: false });
            return true;
        } catch (err: any) {
            let message = "Unknown error";
            if (err?.response?.data?.detail) message = err.response.data.detail;
            else if (err instanceof Error) message = err.message;
            set({ error: message, loading: false });
            return false;
        }
    },
    deleteWorkcenter: async (id) => {
        set({ loading: true, error: null });
        try {
            const request = (await import("@/components/config")).default;
            await request.delete(`/workcenters/${id}/`);
            set((state) => ({
                workcenters: state.workcenters.filter((w) => w.id !== id),
                loading: false,
            }));
            return true;
        } catch (err: any) {
            let message = "Unknown error";
            if (err?.response?.data?.detail) message = err.response.data.detail;
            else if (err instanceof Error) message = err.message;
            set({ error: message, loading: false });
            return false;
        }
    },
    updateWorkcenter: async (id, workcenter) => {
        set({ loading: true, error: null });
        try {
            const request = (await import("@/components/config")).default;
            await request.patch(`/workcenters/${id}/`, workcenter);
            set((state) => ({
                workcenters: state.workcenters.map((w) =>
                    w.id === id ? { ...w, ...workcenter } : w
                ),
                loading: false,
            }));
            return true;
        } catch (err: any) {
            let message = "Unknown error";
            if (err?.response?.data?.detail) message = err.response.data.detail;
            else if (err instanceof Error) message = err.message;
            set({ error: message, loading: false });
            return false;
        }
    },
}));
