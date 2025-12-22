import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useFetchProjectById } from "../queries/projects.queries";
import {
  useFetchChaptersByProjectId,
  useCreateChapter,
} from "../queries/chapter.queries";
import { ChapterEditOrAddModal } from "../components/chapter_edit_or_add_modal";
import type { Schema } from "../lib/directus";
import { ChapterList } from "../components/chapter_list";
import { useUpdateProject } from "../queries/projects.queries";
import { DiamondPlus } from "lucide-react";
import { Button } from "../components/ui/button";

const Project: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: project, isLoading: isProjectLoading } =
    useFetchProjectById(slug);
  const { data: chaptersData, isLoading: isChaptersLoading } =
    useFetchChaptersByProjectId(slug);
  const [chapters, setChapters] = useState<Array<Schema["chapters"]>>([]);
  const [title, setTitle] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const { mutateAsync: updateProject } = useUpdateProject(project?.id || "");
  const { mutateAsync: createChapter } = useCreateChapter();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // 同步从 API 获取的 chapters 到本地状态
  useEffect(() => {
    if (chaptersData) {
      setChapters(chaptersData);
    }
  }, [chaptersData]);

  // 同步项目标题
  useEffect(() => {
    if (project?.title) {
      setTitle(project.title);
    }
  }, [project]);

  const getNextSortOrder = () => {
    if (!chapters || chapters.length === 0) return 1;
    const maxSort = Math.max(...chapters.map((c) => c.sort || 0));
    return maxSort + 1;
  };

  if (isProjectLoading || isChaptersLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!slug || !project) return <div>Project not found</div>;

  return (
    <div className="min-h-screen pt-12 pb-16 px-4 overflow-y-auto">
      <div className="flex items-center gap-2 mb-4">
        {isEditing ? (
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-lg font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        ) : (
          <div className="flex-1 text-lg font-bold truncate">{title}</div>
        )}

        {isEditing ? (
          <Button
            size="sm"
            onClick={async () => {
              {
                await updateProject({ id: project?.id, title: title });
                setIsEditing(false);
              }
            }}
          >
            保存
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setIsEditing(true);
            }}
          >
            编辑
          </Button>
        )}
      </div>

      <ChapterList projectId={slug} />

      <div className="fixed bottom-6 right-6 z-10">
        <Button
          size="icon"
          className="h-14 w-14 rounded-full shadow-lg bg-blue-600 hover:bg-blue-700"
          onClick={() => setIsAddModalOpen(true)}
        >
          <DiamondPlus size={24} />
        </Button>
      </div>

      <ChapterEditOrAddModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={async (data) => {
          await createChapter({
            project: slug,
            title: data.title,
            content: data.content,
            sort: getNextSortOrder(),
          });
          setIsAddModalOpen(false);
        }}
        initialData={null}
      />
    </div>
  );
};

export default Project;
