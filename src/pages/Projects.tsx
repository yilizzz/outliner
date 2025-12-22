import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2, Loader, Pencil, DiamondPlus } from "lucide-react";
import {
  useFetchUserProjects,
  useCreateProject,
  useDeleteProject,
} from "../queries/projects.queries";
import { useLanguage } from "../contexts/language_context";
import { Visualizing } from "../components/visualizing";
import { useAuthStore } from "../stores/auth_store";
import CustomInput from "../components/ui/input";
import { ConfirmDialog } from "../components/confirm_dialog";

const Projects: React.FC = ({}) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { userId } = useAuthStore();
  const { data: projects = [] } = useFetchUserProjects(userId);
  const createProjectMutation = useCreateProject(userId);
  const deleteProjectMutation = useDeleteProject(userId);
  const [error, setError] = useState("");
  const [newProjectTitle, setNewProjectTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteProjectId, setDeleteProjectId] = useState<string | null>(null);

  const handleNavigateToProject = (projectId: string) => {
    navigate(`/project/${projectId}`);
  };
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
        handleNavigateToProject(projectId);
      } else {
        setNewProjectTitle("");
        setError(`${t("create_failed")}`);
      }
    } catch (e) {
      setError(`${t("create_failed")}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDeleteProject = async () => {
    if (!deleteProjectId) return;

    try {
      await deleteProjectMutation.mutateAsync(deleteProjectId);
      setDeleteProjectId(null);
    } catch (e) {
      console.error("delete project error", e);
      setError(`${t("delete_failed")}`);
    }
  };

  return (
    <div className="min-h-screen pt-12 pb-16 px-4 overflow-y-auto">
      {/* 新增项目表单 */}
      <form
        onSubmit={handleCreateProject}
        className="mb-6 pb-6 border-b border-gray-200 flex justify-between items-center gap-2 flex-nowrap"
      >
        <CustomInput
          name="title"
          autoFocus
          type="text"
          value={newProjectTitle}
          onChange={(e) => setNewProjectTitle(e.target.value)}
          placeholder={t("placeholder_work_title")}
          disabled={isSubmitting}
        />
        <button
          type="submit"
          disabled={isSubmitting || !newProjectTitle.trim()}
          className=" px-3 py-2 bg-dark-blue text-white rounded-lg  disabled:bg-gray-400 transition-colors font-semibold"
        >
          {isSubmitting ? <Loader /> : <DiamondPlus />}
        </button>
        {error ? <p className="text-dark-red">{error}</p> : <></>}
      </form>

      {/* 项目列表 */}
      <div className="space-y-2">
        <h3 className="font-semibold text-dark-blue mb-4">{t("my_works")}</h3>
        {projects.length === 0 ? (
          <p className="text-gray-500 text-center py-4">{t("work_empty")}</p>
        ) : (
          <div className="space-y-2">
            {projects.map((project: any) => (
              <div
                key={project.id}
                className="flex flex-col items-center justify-between p-3 "
              >
                <div className="w-full flex items-center justify-between flex-nowrap">
                  <p className="font-medium text-gray-800 truncate">
                    {project.title}
                  </p>

                  <div className="flex items-center gap-3 ml-2">
                    <p className="text-xs text-gray-500">
                      {new Date(project.date_created).toLocaleDateString(
                        "zh-CN"
                      )}
                    </p>
                    <button
                      onClick={() => handleNavigateToProject(project.id)}
                      className=" text-dark-blue"
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      onClick={() => setDeleteProjectId(project.id)}
                      className=" text-dark-red"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                <div className="w-full">
                  <Visualizing project_id={project.id} forceRender={true} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={!!deleteProjectId}
        onClose={() => setDeleteProjectId(null)}
        onConfirm={confirmDeleteProject}
        title={t("delete_title")}
        description={t("delete_confirm")}
        confirmText={t("confirm_delete")}
        cancelText={t("cancel")}
        isDestructive
      />
    </div>
  );
};

export default Projects;
