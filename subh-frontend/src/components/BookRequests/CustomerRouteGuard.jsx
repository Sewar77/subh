import { useContext } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { authContext } from "../../Context/authContextValue.js";
import RouteLoading from "../Loading/RouteLoading.jsx";

export default function CustomerRouteGuard() {
  const { user, authLoading } = useContext(authContext);
  const location = useLocation();

  if (authLoading) return <RouteLoading />;

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: `${location.pathname}${location.search}` }}
      />
    );
  }

  if (user.role !== "user") return <Navigate to="/admin" replace />;

  return <Outlet />;
}
