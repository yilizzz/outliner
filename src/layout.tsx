import { type ReactNode } from "react";
import LanguageToggle from "./components/language_toggle";
import { useLanguage } from "./contexts/language_context";
interface LayoutProps {
  children: ReactNode;
}
const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { t } = useLanguage();
  return (
    <div className="w-full">
      <header className="flex justify-end items-center">
        <nav>
          <a href="/dashboard">{t("home")}</a>
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
