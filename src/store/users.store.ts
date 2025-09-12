import { create } from "zustand";
import { usersService } from "../services/users.service";
import type { User, CreateUserRequest, UpdateUserRequest } from "../services/users.service";

interface UsersState {
    users: User[];
    loading: boolean;
    error: string | null;
    totalCount: number;
    currentPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;

    // Actions
    fetchUsers: (params?: {
        page?: number;
        limit?: number;
        search?: string;
        is_active?: boolean;
        is_staff?: boolean;
    }) => Promise<void>;
    fetchUser: (id: string) => Promise<User | null>;
    createUser: (user: CreateUserRequest) => Promise<boolean>;
    updateUser: (id: string, data: UpdateUserRequest) => Promise<boolean>;
    deleteUser: (id: string) => Promise<boolean>;
    changePassword: (id: string, newPassword: string) => Promise<boolean>;
    clearError: () => void;
}

export const useUsersStore = create<UsersState>((set) => ({
    users: [],
    loading: false,
    error: null,
    totalCount: 0,
    currentPage: 1,
    hasNextPage: false,
    hasPreviousPage: false,

    fetchUsers: async (params = {}) => {
        set({ loading: true, error: null });
        try {
            const response = await usersService.getUsers(params);
            set({
                users: response.results,
                totalCount: response.count,
                currentPage: params.page || 1,
                hasNextPage: !!response.next,
                hasPreviousPage: !!response.previous,
                loading: false,
            });
        } catch (error) {
            set({
                error: (error as Error).message || "Foydalanuvchilarni yuklashda xatolik",
                loading: false,
            });
        }
    },

    fetchUser: async (id: string) => {
        set({ loading: true, error: null });
        try {
            const user = await usersService.getUser(id);
            set({ loading: false });
            return user;
        } catch (error) {
            set({
                error: (error as Error).message || "Foydalanuvchini yuklashda xatolik",
                loading: false,
            });
            return null;
        }
    },

    createUser: async (userData: CreateUserRequest) => {
        set({ loading: true, error: null });
        try {
            const newUser = await usersService.createUser(userData);
            set((state) => ({
                users: [newUser, ...state.users],
                totalCount: state.totalCount + 1,
                loading: false,
            }));
            return true;
        } catch (error) {
            set({
                error: (error as Error).message || "Foydalanuvchi yaratishda xatolik",
                loading: false,
            });
            return false;
        }
    },

    updateUser: async (id: string, data: UpdateUserRequest) => {
        set({ loading: true, error: null });
        try {
            const updatedUser = await usersService.updateUser(id, data);
            set((state) => ({
                users: state.users.map((user) =>
                    user.id === id ? updatedUser : user
                ),
                loading: false,
            }));
            return true;
        } catch (error) {
            set({
                error: (error as Error).message || "Foydalanuvchini yangilashda xatolik",
                loading: false,
            });
            return false;
        }
    },

    deleteUser: async (id: string) => {
        set({ loading: true, error: null });
        try {
            await usersService.deleteUser(id);
            set((state) => ({
                users: state.users.filter((user) => user.id !== id),
                totalCount: state.totalCount - 1,
                loading: false,
            }));
            return true;
        } catch (error) {
            set({
                error: (error as Error).message || "Foydalanuvchini o'chirishda xatolik",
                loading: false,
            });
            return false;
        }
    },

    changePassword: async (id: string, newPassword: string) => {
        set({ loading: true, error: null });
        try {
            await usersService.changePassword(id, newPassword);
            set({ loading: false });
            return true;
        } catch (error) {
            set({
                error: (error as Error).message || "Parolni o'zgartirishda xatolik",
                loading: false,
            });
            return false;
        }
    },

    clearError: () => {
        set({ error: null });
    },
}));
