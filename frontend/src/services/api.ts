import axios from "axios";
import toast from "react-hot-toast";
import authStore from "../stores/authStore";

const api = axios.create({
  baseURL: "/api",
});

api.interceptors.request.use((config) => {
  if (authStore.token) {
    config.headers.Authorization = `Bearer ${authStore.token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response) {
      const { status, data } = error.response;

      if (
        status === 401 &&
        !error.config?.url?.includes("/auth/login") &&
        !error.config?.url?.includes("/auth/register")
      ) {
        authStore.logout();
        window.location.href = "/auth";
        return Promise.reject(error);
      }

      if (status === 400 && typeof data === "object" && data !== null) {
        Object.values(data as Record<string, string>).forEach((msg) => {
          if (typeof msg === "string") toast.error(msg);
        });
        return Promise.reject(error);
      }

      if (status >= 500) {
        toast.error("Internal Server Error");
      }
    }
    return Promise.reject(error);
  },
);

export default api;
