import api from "./api";
import type { AuthResponse, LoginRequest, RegisterRequest } from "../types/auth";

export function login(data: LoginRequest): Promise<AuthResponse> {
  return api.post("/auth/login", data).then((res) => res.data);
}

export function register(data: RegisterRequest): Promise<AuthResponse> {
  return api.post("/auth/register", data).then((res) => res.data);
}
