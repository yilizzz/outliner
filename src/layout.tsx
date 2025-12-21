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
      {/* <header></header> */}

      <main className="w-full">{children}</main>

      {/* <footer className="footer">
        <p>© 2024 我的应用</p>
      </footer> */}
      <footer className="fixed bottom-0 bg-gray-50 w-full">
        <nav className="flex justify-around items-center">
          <LanguageToggle />
          <a href="/dashboard" className="text-dark-blue">
            {t("home")}
          </a>
          <ProjectsModal
            userId={userId}
            isOpen={isModalOpen}
            onOpenChange={setIsModalOpen}
          />
        </nav>
      </footer>
    </div>
  );
};

export default Layout;
