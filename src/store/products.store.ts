import { create } from "zustand";
import request from "../components/config";

export interface Product {
  id?: string;
  name: string;
  slug?: string;
  code?: string;
  type?: string;
  unit?: string;
  description?: string;
  price?: number | string;
  is_active?: boolean;
  length?: number | null;
  thickness?: number | null;
  diameter?: number | null;
  width?: number | null;
  created_at?: string;
  updated_at?: string;
}

interface ProductsState {
  products: Product[];
  loading: boolean;
  error: string | null;
  fetchProducts: () => Promise<void>;
  deleteProduct: (id: string) => Promise<boolean>;
  updateProduct: (
    id: string,
    data: Partial<Omit<Product, "id" | "created_at" | "updated_at">>
  ) => Promise<boolean>;
  addProduct: (product: Product) => Promise<void>;
}

export const useProductsStore = create<ProductsState>((set) => ({
  products: [],
  loading: false,
  error: null,

  fetchProducts: async () => {
    set({ loading: true, error: null });
    try {
      const res = await request.get("/products/");
      console.log("API Response - GET /products/", res.data);
      set({ products: res.data.results || [], loading: false });
    } catch (error) {
      console.error("API Error - GET /products/", error);
      set({
        error: (error as Error).message || "Xatolik yuz berdi",
        loading: false,
      });
    }
  },

  addProduct: async (product) => {
    set({ loading: true, error: null });
    try {
      console.log("API Request - POST /products/", product);
      const response = await request.post("/products/", product);
      console.log("API Response - POST /products/", response.data);
      set({ loading: false });
    } catch (error) {
      console.error("API Error - POST /products/", error);
      set({ loading: false, error: (error as Error).message });
    }
  },

  deleteProduct: async (id: string) => {
    set({ loading: true });
    try {
      await request.delete(`/products/${id}/`);
      set((state) => ({
        products: state.products.filter((p) => p.id !== id),
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

  updateProduct: async (
    id: string,
    data: Partial<Omit<Product, "id" | "created_at" | "updated_at">>
  ) => {
    set({ loading: true });
    try {
      console.log(`API Request - PATCH /products/${id}/`, data);
      const response = await request.patch(`/products/${id}/`, data);
      console.log(`API Response - PATCH /products/${id}/`, response.data);
      set((state) => ({
        products: state.products.map((p) =>
          p.id === id ? { ...p, ...data } : p
        ),
        loading: false,
      }));
      return true;
    } catch (error) {
      console.error(`API Error - PATCH /products/${id}/`, error);
      set({
        error: (error as Error).message || "Xatolik yuz berdi",
        loading: false,
      });
      return false;
    }
  },
}));
