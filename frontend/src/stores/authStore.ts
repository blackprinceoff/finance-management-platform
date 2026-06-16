import { makeAutoObservable, runInAction } from "mobx";
import axios from "axios";
import * as authService from "../services/authService";
import type { ErrorResponse, LoginRequest, RegisterRequest } from "../types/auth";

class AuthStore {
  token: string | null = localStorage.getItem("token");
  isLoading = false;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  async login(data: LoginRequest): Promise<boolean> {
    this.isLoading = true;
    this.error = null;
    try {
      const response = await authService.login(data);
      runInAction(() => {
        this.token = response.token;
      });
      localStorage.setItem("token", response.token);
      return true;
    } catch (e) {
      runInAction(() => {
        this.error = extractErrorMessage(e);
      });
      return false;
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  async register(data: RegisterRequest): Promise<boolean> {
    this.isLoading = true;
    this.error = null;
    try {
      const response = await authService.register(data);
      runInAction(() => {
        this.token = response.token;
      });
      localStorage.setItem("token", response.token);
      return true;
    } catch (e) {
      runInAction(() => {
        this.error = extractErrorMessage(e);
      });
      return false;
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  logout(): void {
    this.token = null;
    localStorage.removeItem("token");
  }
}

function extractErrorMessage(e: unknown): string {
  if (axios.isAxiosError<ErrorResponse>(e) && e.response?.data?.error) {
    return e.response.data.error;
  }
  if (axios.isAxiosError(e)) {
    return e.message;
  }
  if (e instanceof Error) {
    return e.message;
  }
  return "An unexpected error occurred";
}

const authStore = new AuthStore();
export default authStore;
