import { useState, type ReactNode } from "react";
import LanguageToggle from "./components/language_toggle";
import { useLanguage } from "./contexts/language_context";
import ProjectsModal from "./components/projects_modal";
import { useAuthStore } from "./stores/auth_store";
interface LayoutProps {
  children: ReactNode;
}
const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { t } = useLanguage();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { userId } = useAuthStore();
  return (
    <div className="w-full">
      <header className="flex justify-end items-center">
        <nav className="flex justify-end items-center">
          <a href="/dashboard">{t("home")}</a>
          <ProjectsModal
            userId={userId}
            isOpen={isModalOpen}
            onOpenChange={setIsModalOpen}
          />
        </nav>
        <LanguageToggle />
      </header>

      <main className="w-full">{children}</main>

      {/* <footer className="footer">
        <p>© 2024 我的应用</p>
      </footer> */}
    </div>
  );
};

export default Layout;
