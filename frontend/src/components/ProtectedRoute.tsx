import { type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { observer } from "mobx-react-lite";
import authStore from "../stores/authStore";

interface ProtectedRouteProps {
  children: ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
  redirectTo?: string;
}

function ProtectedRoute({
  children,
  requireAuth = true,
  requireAdmin = false,
  redirectTo = "/auth",
}: ProtectedRouteProps) {
  const hasToken = authStore.token !== null;

  if (requireAuth && !hasToken) {
    return <Navigate to={redirectTo} replace />;
  }

  if (!requireAuth && hasToken) {
    return <Navigate to="/dashboard" replace />;
  }

  if (requireAdmin && !authStore.isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

export default observer(ProtectedRoute);
