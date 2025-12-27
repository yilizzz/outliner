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
import { DiamondPlus, Save, Pencil, Bug } from "lucide-react";
import { Button } from "../components/ui/button";
import { useLanguage } from "../contexts/language_context";
import Input from "../components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { Loader } from "../components/ui/loader";
import { ErrorLine } from "../components/ui/error_line";
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
  const { t } = useLanguage();
  const [error, setError] = useState("");
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
  const handleSave = async () => {
    if (!title.trim()) {
      setError(t("title_empty_error"));
      return;
    }

    try {
      await updateProject({ id: project?.id, title: title.trim() });
      setIsEditing(false);
    } catch (e) {
      setError(t("save_failed"));
    }
  };
  if (isProjectLoading || isChaptersLoading) {
    return <Loader />;
  }

  if (!slug || !project)
    return (
      <div className="min-h-screen flex items-center justify-center">
        {t("empty")}
      </div>
    );

  return (
    <div className="min-h-screen pt-12 pb-16 px-4 overflow-y-auto">
      <div>
        <div className="flex items-center gap-2 mb-4 h-10 relative">
          <AnimatePresence mode="wait">
            {isEditing ? (
              <motion.form
                key="input-editor"
                // 使用 form 的 onSubmit 处理手机键盘的“前往/完成”键
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSave();
                }}
                className="flex-1 flex items-center gap-2"
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "100%" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.3, ease: "linear" }} // 纯线性展开
              >
                <Input
                  className="flex-1 h-9"
                  type="text"
                  inputMode="text" // 确保调起标准文本键盘
                  enterKeyHint="done" // 关键：将手机键盘确认键文字改为“完成”
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  name="project_title"
                />
                <Button
                  type="submit" // 设为 submit 类型
                  size="sm"
                  className="shrink-0"
                >
                  <Save size={18} />
                </Button>
              </motion.form>
            ) : (
              <motion.div
                key="text-display"
                className="flex-1 flex items-center justify-between flex-nowrap min-w-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex-1 text-base font-semibold truncate text-dark-blue min-w-0 mr-4">
                  {title}
                </div>
                <Button
                  className="shrink-0"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  <Pencil size={18} />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        {error && <ErrorLine>{error}</ErrorLine>}
      </div>
      <div className="relative mb-16">
        <ChapterList projectId={slug} />
        {chapters?.length > 99 ? (
          <div className="box">{t("chapters_limit")}</div>
        ) : (
          <div className="absolute -bottom-12 right-0 z-10">
            <Button size="icon" onClick={() => setIsAddModalOpen(true)}>
              <DiamondPlus size={24} />
            </Button>
          </div>
        )}
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
