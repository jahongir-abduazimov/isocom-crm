import { create } from "zustand";

export interface Location {
  id: string;
  name: string;
  location_type: "WORKCENTER" | "WAREHOUSE" | "WORKSHOP";
  warehouse: string | null;
  work_center: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface LocationsState {
  locations: Location[];
  loading: boolean;
  error: string | null;
  fetchLocations: () => Promise<void>;
  addLocation: (location: Location) => void;
  updateLocation: (id: string, location: Partial<Location>) => void;
  removeLocation: (id: string) => void;
}

export const useLocationsStore = create<LocationsState>((set) => ({
  locations: [],
  loading: false,
  error: null,
  fetchLocations: async () => {
    set({ loading: true, error: null });
    try {
      const request = (await import("@/components/config")).default;
      const res = await request.get("/locations/");
      set({ locations: res.data.results, loading: false });
    } catch (err: any) {
      let message = "Unknown error";
      if (err?.response?.data?.detail) message = err.response.data.detail;
      else if (err instanceof Error) message = err.message;
      set({ error: message, loading: false });
    }
  },
  addLocation: (location) =>
    set((state) => ({ locations: [...state.locations, location] })),
  updateLocation: (id, updatedLocation) =>
    set((state) => ({
      locations: state.locations.map((location) =>
        location.id === id ? { ...location, ...updatedLocation } : location
      ),
    })),
  removeLocation: (id) =>
    set((state) => ({
      locations: state.locations.filter((location) => location.id !== id),
    })),
}));
