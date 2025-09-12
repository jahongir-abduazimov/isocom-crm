import { create } from "zustand";
import request from "../components/config";

export interface ProductComponent {
  id: string;
  finished_product: string;
  semi_finished_product: string;
  created_at: string;
  updated_at: string;
}

export interface ProductComponentsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: ProductComponent[];
}

interface ProductComponentsState {
  productComponents: ProductComponent[];
  loading: boolean;
  error: string | null;
  fetchProductComponents: () => Promise<void>;
  deleteProductComponent: (id: string) => Promise<boolean>;
  addProductComponent: (
    data: Omit<ProductComponent, "id" | "created_at" | "updated_at">
  ) => Promise<void>;
  updateProductComponent: (
    id: string,
    data: Omit<ProductComponent, "id" | "created_at" | "updated_at">
  ) => Promise<boolean>;
  getProductComponentById: (id: string) => Promise<ProductComponent | null>;
}

export const useProductComponentsStore = create<ProductComponentsState>(
  (set) => ({
    productComponents: [],
    loading: false,
    error: null,

    fetchProductComponents: async () => {
      set({ loading: true, error: null });
      try {
        const res = await request.get<ProductComponentsResponse>(
          "/product-components/"
        );
        set({ productComponents: res.data.results || [], loading: false });
      } catch (error) {
        set({
          error: (error as Error).message || "Xatolik yuz berdi",
          loading: false,
        });
      }
    },

    addProductComponent: async (data) => {
      set({ loading: true, error: null });
      try {
        await request.post("/product-components/", data);
        // Refresh the list after adding
        const res = await request.get<ProductComponentsResponse>("/product-components/");
        set({ productComponents: res.data.results || [], loading: false });
      } catch (error) {
        set({ loading: false, error: (error as Error).message });
      }
    },

    deleteProductComponent: async (id: string) => {
      set({ loading: true });
      try {
        await request.delete(`/product-components/${id}/`);
        set((state) => ({
          productComponents: state.productComponents.filter(
            (pc) => pc.id !== id
          ),
          loading: false,
        }));
        return true;
      } catch (error) {
        set({
          error: (error as Error).message || "Xatolik yuz berdi",
          loading: false,
        });
        return false;
      }
    },

    updateProductComponent: async (id: string, data) => {
      set({ loading: true, error: null });
      try {
        await request.patch(`/product-components/${id}/`, data);
        set((state) => ({
          productComponents: state.productComponents.map((pc) =>
            pc.id === id ? { ...pc, ...data } : pc
          ),
          loading: false,
        }));
        return true;
      } catch (error) {
        set({
          error: (error as Error).message || "Xatolik yuz berdi",
          loading: false,
        });
        return false;
      }
    },

    getProductComponentById: async (id: string) => {
      set({ loading: true, error: null });
      try {
        const res = await request.get<ProductComponent>(`/product-components/${id}/`);
        set({ loading: false });
        return res.data;
      } catch (error) {
        set({
          error: (error as Error).message || "Xatolik yuz berdi",
          loading: false,
        });
        return null;
      }
    },
  })
);
