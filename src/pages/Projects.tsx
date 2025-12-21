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

  const handleDeleteProject = async (projectId: string) => {
    if (!window.confirm("确认删除该项目？此操作不可恢复。")) {
      return;
    }

    try {
      await deleteProjectMutation.mutateAsync(projectId);
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
        className="mb-6 pb-6 border-b border-gray-200 flex justify-center items-center gap-2 flex-nowrap"
      >
        <input
          type="text"
          value={newProjectTitle}
          onChange={(e) => setNewProjectTitle(e.target.value)}
          placeholder={t("placeholder_work_title")}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-blue"
          disabled={isSubmitting}
        />

        <button
          type="submit"
          disabled={isSubmitting || !newProjectTitle.trim()}
          className=" px-3 py-2 bg-dark-green text-white rounded-lg  disabled:bg-gray-400 transition-colors font-semibold"
        >
          {isSubmitting ? <Loader /> : <DiamondPlus />}
        </button>
        {error ? <p className="text-dark-red">{error}</p> : <></>}
      </form>

      {/* 项目列表 */}
      <div className="space-y-2">
        {/* <h3 className="font-semibold text-gray-700 mb-4">
              {t("my_works")}
            </h3> */}
        {projects.length === 0 ? (
          <p className="text-gray-500 text-center py-4">{t("work_empty")}</p>
        ) : (
          <div className="space-y-2">
            {projects.map((project: any) => (
              <div
                key={project.id}
                className="flex flex-col items-center justify-between p-3 "
              >
                <div className="w-full flex items-center justify-between flex-wrap">
                  <p className="font-medium text-gray-800 truncate">
                    {project.title}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(project.date_created).toLocaleDateString("zh-CN")}
                  </p>
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
                <div className="w-full">
                  <Visualizing project_id={project.id} forceRender={true} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Projects;
