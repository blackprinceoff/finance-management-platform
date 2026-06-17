export type UserStatus = "ACTIVE" | "BLOCKED" | "BANNED";

export interface AdminUser {
  id: number;
  username: string;
  email: string;
  status: UserStatus;
  roles: string[];
}

export interface AuditLog {
  id: number;
  userId: number;
  action: string;
  timestamp: string;
  ipAddress: string;
}
