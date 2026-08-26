import { Navigate } from "react-router-dom";
import { AUTH_DISABLED } from "../../config/env";

type ProtectedRouteProps = {
  children: React.ReactNode;
};

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  if (AUTH_DISABLED) {
    return <>{children}</>;
  }

  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
