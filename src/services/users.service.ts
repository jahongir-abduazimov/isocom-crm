import API_CONFIG, { DEFAULT_VALUES } from "@/config/api.config";
import request from "@/components/config";

export interface User {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  phone_number: string | null;
  role: string | null;
  role_display: string | null;
  role_display_uz: string | null;
  employee_id: string | null;
  is_active: boolean;
  is_staff: boolean;
  is_superuser: boolean;
  shift: string | null;
  is_operator: boolean;
  is_supervisor: boolean;
  is_specialist: boolean;
  role_level: number;
  profile_picture: string | null;
  date_joined: string;
  last_login: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: User[];
}

export interface CreateUserRequest {
  username: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  password: string;
  password_confirm: string;
  role?: string;
  employee_id?: string;
  shift?: string;
  is_active?: boolean;
  is_staff?: boolean;
}

export interface UpdateUserRequest {
  username?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  password?: string;
  role?: string;
  employee_id?: string;
  is_active?: boolean;
  is_staff?: boolean;
  is_superuser?: boolean;
  is_operator?: boolean;
  is_supervisor?: boolean;
  is_specialist?: boolean;
  shift?: string;
}

class UsersService {
  // Helper method to get default pagination parameters
  private getDefaultPaginationParams(params?: {
    page?: number;
    limit?: number;
  }) {
    return {
      page: params?.page || 1,
      limit: params?.limit || DEFAULT_VALUES.PAGE_SIZE,
    };
  }

  // Get all users with pagination
  async getUsers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    is_active?: boolean;
    is_staff?: boolean;
  }): Promise<UserResponse> {
    try {
      const paginationParams = this.getDefaultPaginationParams(params);
      const searchParams = new URLSearchParams();
      searchParams.append("page", paginationParams.page.toString());
      searchParams.append("limit", paginationParams.limit.toString());

      if (params?.search) searchParams.append("search", params.search);
      if (params?.is_active !== undefined)
        searchParams.append("is_active", params.is_active.toString());
      if (params?.is_staff !== undefined)
        searchParams.append("is_staff", params.is_staff.toString());

      const url = `${API_CONFIG.ENDPOINTS.USERS}?${searchParams}`;
      console.log("Fetching users from:", url);

      const response = await request.get<UserResponse>(url);
      console.log("API Response data:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching users:", error);
      throw error;
    }
  }

  // Get user by ID
  async getUser(id: string): Promise<User> {
    try {
      const url = API_CONFIG.ENDPOINTS.USER_BY_ID(id);
      const response = await request.get<User>(url);
      return response.data;
    } catch (error) {
      console.error("Error fetching user:", error);
      throw error;
    }
  }

  // Create new user
  async createUser(data: CreateUserRequest): Promise<User> {
    try {
      const url = API_CONFIG.ENDPOINTS.USERS;
      const response = await request.post<User>(url, data);
      return response.data;
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  }

  // Update user
  async updateUser(id: string, data: UpdateUserRequest): Promise<User> {
    try {
      const url = API_CONFIG.ENDPOINTS.USER_BY_ID(id);
      const response = await request.put<User>(url, data);
      return response.data;
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  }

  // Delete user
  async deleteUser(id: string): Promise<void> {
    try {
      const url = API_CONFIG.ENDPOINTS.USER_BY_ID(id);
      await request.delete(url);
    } catch (error) {
      console.error("Error deleting user:", error);
      throw error;
    }
  }

  // Change user password
  async changePassword(id: string, newPassword: string): Promise<void> {
    try {
      const url = `${API_CONFIG.ENDPOINTS.USER_BY_ID(id)}change-password/`;
      await request.post(url, { password: newPassword });
    } catch (error) {
      console.error("Error changing password:", error);
      throw error;
    }
  }

  // Get user groups
  async getUserGroups(id: string): Promise<string[]> {
    try {
      const url = `${API_CONFIG.ENDPOINTS.USER_BY_ID(id)}groups/`;
      const response = await request.get<{ groups: string[] }>(url);
      return response.data.groups;
    } catch (error) {
      console.error("Error fetching user groups:", error);
      throw error;
    }
  }

  // Get user permissions
  async getUserPermissions(id: string): Promise<string[]> {
    try {
      const url = `${API_CONFIG.ENDPOINTS.USER_BY_ID(id)}permissions/`;
      const response = await request.get<{ permissions: string[] }>(url);
      return response.data.permissions;
    } catch (error) {
      console.error("Error fetching user permissions:", error);
      throw error;
    }
  }

  // Bulk update users
  async bulkUpdateUsers(
    updates: { id: string; data: UpdateUserRequest }[]
  ): Promise<User[]> {
    try {
      const url = `${API_CONFIG.ENDPOINTS.USERS}bulk/`;
      const response = await request.put<User[]>(url, { updates });
      return response.data;
    } catch (error) {
      console.error("Error bulk updating users:", error);
      throw error;
    }
  }

  // Export users
  async exportUsers(format: "csv" | "excel" = "csv"): Promise<Blob> {
    try {
      const url = `${API_CONFIG.ENDPOINTS.USERS}export/?format=${format}`;
      const response = await request.get(url, { responseType: "blob" });
      return response.data;
    } catch (error) {
      console.error("Error exporting users:", error);
      throw error;
    }
  }
}

export const usersService = new UsersService();
