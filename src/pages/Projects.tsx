import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2, Pencil, DiamondPlus, LoaderPinwheel } from "lucide-react";
import {
  useFetchUserProjects,
  useCreateProject,
  useDeleteProject,
} from "../queries/projects.queries";
import { useLanguage } from "../contexts/language_context";
import { Visualizing } from "../components/visualizing";
import { useAuthStore } from "../stores/auth_store";
import Input from "../components/ui/input";
import { ConfirmDialog } from "../components/confirm_dialog";
import { ErrorLine } from "../components/ui/error_line";
import { Loader } from "../components/ui/loader";
import { Button } from "../components/ui/button";
const Projects: React.FC = ({}) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { userId } = useAuthStore();
  const { data: projects = [], isLoading } = useFetchUserProjects(userId);
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
      setError(`${t("delete_failed")}`);
    }
  };
  if (isLoading) {
    return <Loader />;
  }
  return (
    <div className="min-h-screen pt-12 pb-16 px-4 overflow-y-auto flex flex-col gap-4 max-w-6xl mx-auto">
      {projects.length > 9 ? (
        <div className="box">{t("works_limit")}</div>
      ) : (
        <form
          onSubmit={handleCreateProject}
          className="flex justify-between items-center gap-2 flex-nowrap pb-6 border-b border-light-blue"
        >
          <Input
            name="title"
            type="text"
            value={newProjectTitle}
            onChange={(e) => setNewProjectTitle(e.target.value)}
            placeholder={t("placeholder_work_title")}
            disabled={isSubmitting}
          />
          <Button
            type="submit"
            disabled={isSubmitting || !newProjectTitle.trim()}
          >
            {isSubmitting ? <LoaderPinwheel /> : <DiamondPlus />}
          </Button>
          {error && <ErrorLine>{error}</ErrorLine>}
        </form>
      )}

      <div className="space-y-2 mb-16">
        <h3 className="text-base font-semibold text-dark-blue mb-4">
          {t("my_works")}
        </h3>
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
                  <p className="text-sm font-normal text-dark-blue truncate">
                    {project.title}
                  </p>

                  <div className="flex items-center gap-2 ml-2">
                    <p className="text-xs text-gray-500">
                      {new Date(project.date_created).toLocaleDateString(
                        "zh-CN"
                      )}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleNavigateToProject(project.id)}
                      className=" text-dark-blue"
                    >
                      <Pencil size={18} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteProjectId(project.id)}
                      className=" text-dark-red"
                    >
                      <Trash2 size={18} />
                    </Button>
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
      />
    </div>
  );
};

export default Projects;
