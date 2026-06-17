import { makeAutoObservable, runInAction } from "mobx";
import { jwtDecode } from "jwt-decode";
import * as authService from "../services/authService";
import { extractErrorMessage } from "../utils/errorUtils";
import type { JwtPayload, LoginRequest, RegisterRequest } from "../types/auth";

class AuthStore {
  token: string | null = localStorage.getItem("token");
  roles: string[] = JSON.parse(localStorage.getItem("roles") ?? "[]");
  isLoading = false;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  get isAdmin(): boolean {
    return this.roles.includes("ROLE_ADMIN");
  }

  private setToken(token: string) {
    this.token = token;
    localStorage.setItem("token", token);
    try {
      const decoded = jwtDecode<JwtPayload>(token);
      this.roles = decoded.roles ?? [];
    } catch {
      this.roles = [];
    }
    localStorage.setItem("roles", JSON.stringify(this.roles));
  }

  private clearAuth() {
    this.token = null;
    this.roles = [];
    localStorage.removeItem("token");
    localStorage.removeItem("roles");
  }

  async login(data: LoginRequest): Promise<boolean> {
    this.isLoading = true;
    this.error = null;
    try {
      const response = await authService.login(data);
      runInAction(() => {
        this.setToken(response.token);
      });
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
        this.setToken(response.token);
      });
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
    this.clearAuth();
  }
}

const authStore = new AuthStore();
export default authStore;
