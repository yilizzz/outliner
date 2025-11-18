import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "../stores/auth_store";
const PrivateRoute = () => {
  const { isAuthenticated, auth } = useAuthStore();
  const location = useLocation();

  // 简单检查是否已认证（不做刷新）
  if (!isAuthenticated || !auth) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;
