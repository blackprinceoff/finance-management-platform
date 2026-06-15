import { type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import authStore from "../stores/authStore";

interface ProtectedRouteProps {
  children: ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

export default function ProtectedRoute({
  children,
  requireAuth = true,
  redirectTo = "/auth",
}: ProtectedRouteProps) {
  const hasToken = authStore.token !== null;

  if (requireAuth && !hasToken) {
    return <Navigate to={redirectTo} replace />;
  }

  if (!requireAuth && hasToken) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
