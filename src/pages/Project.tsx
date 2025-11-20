import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useFetchProjectById } from "../queries/projects.queries";
import {
  useFetchChaptersByProjectId,
  useDeleteChapter,
} from "../queries/chapter.queries";
import { AddChapterModal } from "../components/chapter_modal";
import type { Schema } from "../lib/directus";
import { ChapterList } from "../components/chapter_list";
const Project: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: project } = useFetchProjectById(slug || null);
  const { data: chaptersData } = useFetchChaptersByProjectId(slug || null);

  const [chapters, setChapters] = useState<Array<Schema["chapters"]>>([]);
  const { mutateAsync: deleteMutation } = useDeleteChapter();
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

  return (
    <div>
      <h1>{project?.title}</h1>
      <p>Last updated: {project?.date_updated}</p>
      <ChapterList projectId={slug} />
      <AddChapterModal
        projectId={slug}
        onChapterCreated={handleChapterCreated}
      />
    </div>
  );
};

export default Project;
