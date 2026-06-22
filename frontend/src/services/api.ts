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
        const errorData = data as Record<string, unknown>;
        if ("error" in errorData && "path" in errorData) {
          toast.error((errorData.error as string) || "An error occurred");
        } else if ("message" in errorData) {
          toast.error((errorData.message as string) || "An error occurred");
        } else {
          Object.entries(errorData).forEach(([key, msg]) => {
            if (
              typeof msg === "string" &&
              !["timestamp", "path", "status", "error"].includes(key)
            ) {
              toast.error(msg);
            }
          });
        }
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
