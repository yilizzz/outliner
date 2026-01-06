import { Routes, Route, useLocation } from "react-router-dom";
import Home from "./Home";
import Dashboard from "./Dashboard";
import Project from "./Project";
import Projects from "./Projects";
import { useTokenRefresh } from "../hooks/use_token_refresh";
import PrivateRoute from "../components/private_route";
import PinForgotScreen from "../components/pin_forgot_screen";
import PinResetScreen from "../components/pin_reset_screen";
export default function App() {
  const location = useLocation();

  // 总是调用 Hook（遵守 React Hook 规则），在 Hook 内部根据路由决定行为
  useTokenRefresh(location.pathname);

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/pin-forgot" element={<PinForgotScreen />} />
      <Route path="/pin-reset" element={<PinResetScreen />} />
      <Route element={<PrivateRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/project/:slug" element={<Project />} />
      </Route>
    </Routes>
  );
}
