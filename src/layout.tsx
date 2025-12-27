import { type ReactNode } from "react";
import LanguageToggle from "./components/language_toggle";
import { Link } from "react-router-dom";
import { House, NotebookText } from "lucide-react";
interface LayoutProps {
  children: ReactNode;
}
const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="w-full bg-gray-50">
      {/* <header></header> */}
      <main className="w-full">{children}</main>
      <footer className="footer fixed bottom-0 bg-gray-50 w-full pb-[env(safe-area-inset-bottom)] z-11">
        <nav className="flex justify-around items-center py-4">
          <LanguageToggle />
          <Link to="/dashboard" className="text-dark-blue">
            <House size={24} />
          </Link>
          <Link to="/projects" className="text-dark-blue">
            <NotebookText size={24} />
          </Link>
        </nav>
      </footer>
    </div>
  );
};

export default Layout;
