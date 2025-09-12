import axios from "axios";
import { useAuthStore } from "@/store/auth.store";
import { API_CONFIG } from "@/config/api.config";

type AuthStorage = {
  state: {
    token: string;
    // ...other properties
  };
  // ...other properties
};

const request = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
});

request.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const user = localStorage.getItem("auth-storage");
    if (user) {
      const parsedUser = JSON.parse(user) as AuthStorage;
      config.headers["Authorization"] = `Bearer ${parsedUser.state.token}`;
    }
  }
  return config;
});
request.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (typeof window !== "undefined") {
        // Auth store'dan token'ni o'chirish
        const { clearToken } = useAuthStore.getState();
        clearToken();

        // Login sahifasiga yo'naltirish
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default request;
