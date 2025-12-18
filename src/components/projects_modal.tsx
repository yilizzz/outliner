import { useState } from "react";
import { useNavigate } from "react-router-dom";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Plus, Trash2, Loader, Pencil, DiamondPlus } from "lucide-react";
import {
  useFetchUserProjects,
  useCreateProject,
  useDeleteProject,
} from "../queries/projects.queries";
import { useLanguage } from "../contexts/language_context";
import { Visualizing } from "./visualizing";
interface ProjectsModalProps {
  userId: string | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const ProjectsModal: React.FC<ProjectsModalProps> = ({
  userId,
  isOpen,
  onOpenChange,
}) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { data: projects = [] } = useFetchUserProjects(userId);
  const createProjectMutation = useCreateProject(userId);
  const deleteProjectMutation = useDeleteProject(userId);

  const [newProjectTitle, setNewProjectTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId || !newProjectTitle.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await createProjectMutation.mutateAsync({
        title: newProjectTitle.trim(),
      });
      const projectId = res?.data?.id || res?.id;

      if (projectId) {
        setNewProjectTitle("");
        onOpenChange(false);
      } else {
        alert("创建项目失败，请重试");
      }
    } catch (e) {
      console.error("create project error", e);
      alert("创建项目发生错误");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!window.confirm("确认删除该项目？此操作不可恢复。")) {
      return;
    }

    try {
      await deleteProjectMutation.mutateAsync(projectId);
    } catch (e) {
      console.error("delete project error", e);
      alert("删除项目失败");
    }
  };

  const handleNavigateToProject = (projectId: string) => {
    navigate(`/project/${projectId}`);
    onOpenChange(false);
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <Dialog.Trigger asChild>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
          <Plus size={18} />
          {t("work_management")}
          {projects.length > 0 && ` (${projects.length})`}
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 animate-in fade-in" />
        <Dialog.Content className="fixed left-[50%] top-[50%] w-[90vw] max-w-md max-h-[80vh] translate-x-[-50%] translate-y-[-50%] bg-white rounded-lg shadow-lg p-6 overflow-y-auto animate-in fade-in zoom-in">
          <div className="flex items-center justify-between mb-6">
            <Dialog.Title className="text-xl font-bold text-gray-800">
              {t("work_management")}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={20} />
              </button>
            </Dialog.Close>
          </div>

          {/* 新增项目表单 */}
          <form
            onSubmit={handleCreateProject}
            className="mb-6 pb-6 border-b border-gray-200 flex justify-center items-center gap-2 flex-nowrap"
          >
            {/* <label className=" text-sm font-medium text-gray-700 mb-2">
              {t("work_title")}
            </label> */}
            <input
              type="text"
              value={newProjectTitle}
              onChange={(e) => setNewProjectTitle(e.target.value)}
              placeholder={t("placeholder_work_title")}
              className=" px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isSubmitting}
            />

            <button
              type="submit"
              disabled={isSubmitting || !newProjectTitle.trim()}
              className=" px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 transition-colors font-semibold"
            >
              {isSubmitting ? <Loader /> : <DiamondPlus />}
            </button>
          </form>

          {/* 项目列表 */}
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-700 mb-4">
              {t("my_works")}
            </h3>
            {projects.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                {t("work_empty")}
              </p>
            ) : (
              <div className="space-y-2">
                {projects.map((project: any) => (
                  <div
                    key={project.id}
                    className="flex flex-col items-center justify-between p-3 rounded-lg bg-green-50 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-800 truncate">
                        {project.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(project.date_updated).toLocaleDateString(
                          "zh-CN"
                        )}
                      </p>
                    </div>
                    <div className="w-full">
                      <Visualizing project_id={project.id} />
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                      <button
                        onClick={() => handleNavigateToProject(project.id)}
                        className="px-3 py-1 text-sm bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteProject(project.id)}
                        className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default ProjectsModal;
