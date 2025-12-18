import { useState } from "react";
import { useAuthStore } from "../stores/auth_store";
import ProjectsModal from "../components/projects_modal";
import News from "./News";
const Dashboard: React.FC = () => {
  const userId = useAuthStore((state) => state.userId);
  const [isModalOpen, setIsModalOpen] = useState(false);
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部控制栏 */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <ProjectsModal
            userId={userId}
            isOpen={isModalOpen}
            onOpenChange={setIsModalOpen}
          />
        </div>
      </div>

      {/* News 组件 */}
      <div className="mt-8">
        <News />
      </div>
    </div>
  );
};

export default Dashboard;
