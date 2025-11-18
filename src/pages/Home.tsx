import { Navigate } from "react-router-dom";
import { useSecureData } from "../stores/secure_data_store";
import { useAuthStore } from "../stores/auth_store";
import PinSetupScreen from "../components/pin_setup_screen";
import PinUnlockScreen from "../components/pin_unlock_screen";
const Home: React.FC = () => {
  const { isInitialized, isLoading: isSecureLoading } = useSecureData();
  const { isAuthenticated } = useAuthStore();

  // 加载中状态
  if (isSecureLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <p className="text-xl">正在加载...</p>
      </div>
    );
  }

  // 如果已登录，重定向到 dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  // 未初始化 → 显示 PinSetup
  if (isInitialized === false) {
    return <PinSetupScreen />;
  }

  // 已初始化但未登录 → 显示 PinUnlock
  return <PinUnlockScreen />;
};
export default Home;
