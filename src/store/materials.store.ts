import { create } from "zustand";

export interface Material {
  id: string;
  name: string;
  slug: string;
  code: string;
  unit_of_measure: string;
  type: string;
  description: string;
  price: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface MaterialsState {
  materials: Material[];
  loading: boolean;
  error: string | null;
  fetchMaterials: () => Promise<void>;
  addMaterial: (
    material: Omit<Material, "id" | "created_at" | "updated_at">
  ) => Promise<boolean>;
  deleteMaterial: (id: string) => Promise<boolean>;
  updateMaterial: (
    id: string,
    material: Partial<Omit<Material, "id" | "created_at" | "updated_at">>
  ) => Promise<boolean>;
}

export const useMaterialsStore = create<MaterialsState>((set) => ({
  materials: [],
  loading: false,
  error: null,
  fetchMaterials: async () => {
    set({ loading: true, error: null });
    try {
      const request = (await import("@/components/config")).default;
      const res = await request.get("/materials/");
      set({ materials: res.data.results, loading: false });
    } catch (err: any) {
      let message = "Unknown error";
      if (err?.response?.data?.detail) message = err.response.data.detail;
      else if (err instanceof Error) message = err.message;
      set({ error: message, loading: false });
    }
  },
  addMaterial: async (material) => {
    set({ loading: true, error: null });
    try {
      const request = (await import("@/components/config")).default;
      await request.post("/materials/", material);
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
  deleteMaterial: async (id) => {
    set({ loading: true, error: null });
    try {
      const request = (await import("@/components/config")).default;
      await request.delete(`/materials/${id}/`);
      set((state) => ({
        materials: state.materials.filter((m) => m.id !== id),
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
  updateMaterial: async (id, material) => {
    set({ loading: true, error: null });
    try {
      const request = (await import("@/components/config")).default;
      await request.patch(`/materials/${id}/`, material);
      set((state) => ({
        materials: state.materials.map((m) =>
          m.id === id ? { ...m, ...material } : m
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
