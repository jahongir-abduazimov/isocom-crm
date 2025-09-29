import request from "@/components/config/index";
import type { Location } from "@/store/locations.store";

export interface LocationsApiResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Location[];
}

export class LocationsService {
  static async getLocations(): Promise<LocationsApiResponse> {
    const response = await request.get<LocationsApiResponse>("/locations/");
    return response.data;
  }

  static async getLocationById(id: string): Promise<Location> {
    const response = await request.get<Location>(`/locations/${id}/`);
    return response.data;
  }

  static async createLocation(data: {
    name: string;
    location_type: "WAREHOUSE" | "WORKCENTER" | "WORKSHOP";
    warehouse: string | null;
    work_center: string | null;
    is_active: boolean;
  }): Promise<Location> {
    const response = await request.post<Location>("/locations/", data);
    return response.data;
  }

  static async updateLocation(id: string, data: Partial<{
    name: string;
    location_type: "WAREHOUSE" | "WORKCENTER" | "WORKSHOP";
    warehouse: string | null;
    work_center: string | null;
    is_active: boolean;
  }>): Promise<Location> {
    const response = await request.put<Location>(`/locations/${id}/`, data);
    return response.data;
  }

  static async deleteLocation(id: string): Promise<void> {
    await request.delete(`/locations/${id}/`);
  }
}

export default LocationsService;
