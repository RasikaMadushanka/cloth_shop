import React from "react";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const user = JSON.parse(localStorage.getItem("user") || "null");

  if (!user || !user.role) {
    return <Navigate to="/" replace />;
  }

  if (user.role === "SUPER_ADMIN") {
    return <>{children}</>;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/inventory" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;