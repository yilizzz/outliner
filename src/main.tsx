import { createRoot } from 'react-dom/client'
import './index.css'
import React from "react";
import { HashRouter } from "react-router-dom"; // HashRouter 对 Capacitor 静态部署更稳
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./pages/App.tsx";
import "./index.css";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <QueryClientProvider client={queryClient}>
            <HashRouter>
                <App />
            </HashRouter>
        </QueryClientProvider>
    </React.StrictMode>
);
