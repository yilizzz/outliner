import { Routes, Route } from "react-router-dom";
import Home from "./Home";
import Dashboard from "./Dashboard";
import Project from "./Project";
import { useTokenRefresh } from "../hooks/use_token_refresh";
import PrivateRoute from "../components/private_route";
export default function App() {
  useTokenRefresh();
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route element={<PrivateRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/project/:slug" element={<Project />} />
      </Route>
    </Routes>
  );
}
