import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Schema } from "../lib/directus";
import { useUpdateChapter } from "../queries/chapter.queries";
import { useDeleteChapterInProject } from "../queries/chapter.queries";
import { useState } from "react";
import { ChapterEditOrAddModal } from "./chapter_edit_or_add_modal";
import { ConfirmDialog } from "./confirm_dialog";
import { useLanguage } from "../contexts/language_context";
import { Button } from "./ui/button";

import { Pencil, Trash2, GripVertical } from "lucide-react";
// 单个章节项（可排序）
export const SortableChapterItem = ({
  chapter,
  projectId,
}: {
  chapter: Schema["chapters"];
  projectId: string;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: chapter.id });
  const { mutateAsync: updateChapter } = useUpdateChapter(projectId);
  const { mutateAsync: deleteChapter } = useDeleteChapterInProject(projectId);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const { t } = useLanguage();
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 100 : "auto",
  };
  const preview = (chapter.content || "").slice(0, 10);

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className="flex items-center gap-3 p-2 px-3 rounded-lg bg-light-green shadow-md mb-2 touch-manipulation h-16" // 显式设置高度 h-16
        {...attributes}
        {...listeners}
      >
        <button className="cursor-grab active:cursor-grabbing text-dark-blue p-2 touch-none">
          <GripVertical size={20} />
        </button>

        <div className="flex-1 min-w-0 flex flex-col justify-center overflow-hidden">
          <h3 className="font-medium text-dark-blue truncate leading-tight">
            {chapter.title}
          </h3>
          <p className="text-xs text-dark-blue/60 truncate leading-tight mt-0.5">
            {preview}
          </p>
        </div>

        <div className="flex gap-1">
          {" "}
          {/* 稍微缩小按钮间距 */}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsEditModalOpen(true)}
          >
            <Pencil size={16} />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsDeleteConfirmOpen(true)}
          >
            <Trash2 size={16} />
          </Button>
        </div>
      </div>

      <ChapterEditOrAddModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={async (data) => {
          await updateChapter({
            id: chapter.id,
            title: data.title,
            content: data.content,
          });
          setIsEditModalOpen(false);
        }}
        initialData={chapter}
      />

      <ConfirmDialog
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={async () => {
          try {
            setIsDeleting(true);
            await deleteChapter(chapter.id);
          } finally {
            setIsDeleting(false);
          }
        }}
        title={t("delete_title")}
        description={t("delete_confirm")}
        confirmText={t("confirm_delete")}
        cancelText={t("cancel")}
      />
    </>
  );
};
