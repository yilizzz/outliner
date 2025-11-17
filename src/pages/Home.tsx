import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSecureData } from "../stores/secure_data_store";
import { useAuthStore } from "../stores/auth_store";
import { useTokenRefresh } from "../hooks/use_token_refresh";
import PinSetupScreen from "../components/pin_setup_screen";
import PinUnlockScreen from "../components/pin_unlock_screen";
const Home: React.FC = () => {
  const navigate = useNavigate();
  const { isInitialized, isLoading: isSecureLoading } = useSecureData();
  const { isAuthenticated, logout } = useAuthStore(); // 从 Zustand 获取当前认证状态
  const { checkAndRefreshToken } = useTokenRefresh();
  const [isSessionChecking, setIsSessionChecking] = useState(false);

  useEffect(() => {
    if (isSecureLoading) return;
    if (isInitialized === false) return;
    if (isAuthenticated) {
      console.log("检查 Token 有效性...");
      const checkSession = async () => {
        setIsSessionChecking(true);
        const success = await checkAndRefreshToken();
        console.log("token 刷新结果:", success);

        if (!success) {
          console.log("Token 刷新失败，强制登出到 PIN 验证界面。");
          logout();
        }

        setIsSessionChecking(false);
      };
      checkSession();
    }
  }, [isInitialized, isAuthenticated, checkAndRefreshToken, logout]);

  useEffect(() => {
    if (isSecureLoading || isSessionChecking) return;
    if (isInitialized !== true) return;
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [
    isSecureLoading,
    isSessionChecking,
    isInitialized,
    isAuthenticated,
    navigate,
  ]);

  if (isSecureLoading || isSessionChecking) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <p className="text-xl">正在检查会话安全...</p>
      </div>
    );
  }

  if (isInitialized === false) {
    return <PinSetupScreen />;
  }

  if (isAuthenticated) {
    return null;
  }

  return <PinUnlockScreen />;
};
export default Home;
