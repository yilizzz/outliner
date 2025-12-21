import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useFetchProjectById } from "../queries/projects.queries";
import { useFetchChaptersByProjectId } from "../queries/chapter.queries";
import { AddChapterModal } from "../components/chapter_modal";
import type { Schema } from "../lib/directus";
import { ChapterList } from "../components/chapter_list";
import { useUpdateProject } from "../queries/projects.queries";
const Project: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: project } = useFetchProjectById(slug);
  const { data: chaptersData } = useFetchChaptersByProjectId(slug);
  const [chapters, setChapters] = useState<Array<Schema["chapters"]>>([]);
  const [title, setTitle] = useState(project.title);
  const [isEditing, setIsEditing] = useState(false);
  const { mutateAsync: updateProject } = useUpdateProject(project.id);

  // 同步从 API 获取的 chapters 到本地状态
  useEffect(() => {
    if (chaptersData) {
      setChapters(chaptersData);
    }
  }, [chaptersData]);

  // 处理新增章节
  const handleChapterCreated = (newChapter: Schema["chapters"]) => {
    setChapters((prev) =>
      [...prev, newChapter].sort((a, b) => a.sort - b.sort)
    );
  };
  if (!slug || !project || !chapters) return;
  return (
    <div className="min-h-screen pt-12 pb-16 px-4 overflow-y-auto">
      {isEditing ? (
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ padding: "4px", fontSize: "16px" }}
        />
      ) : (
        <div style={{ fontSize: "18px", fontWeight: "bold" }}>{title}</div>
      )}

      {isEditing ? (
        <button
          onClick={async () => {
            {
              await updateProject({ id: project?.id, title: title });
              setIsEditing(false);
            }
          }}
        >
          保存
        </button>
      ) : (
        <button
          onClick={() => {
            setIsEditing(true);
          }}
        >
          编辑
        </button>
      )}
      <ChapterList projectId={slug} />
      <AddChapterModal
        projectId={slug}
        onChapterCreated={handleChapterCreated}
      />
    </div>
  );
};

export default Project;
