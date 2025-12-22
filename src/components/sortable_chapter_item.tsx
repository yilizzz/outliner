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
        className="flex items-center gap-3 p-3 border rounded-md bg-white shadow-sm mb-2 cursor-move hover:bg-gray-50 touch-manipulation"
        {...attributes}
        {...listeners}
      >
        <button
          className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 p-2 touch-none"
          aria-label="拖拽排序"
        >
          ☰
        </button>
        <div className="flex-1">
          <h3 className="font-medium">
            {chapter.title}
            <span className="ml-2 text-sm text-gray-500">{preview}</span>
          </h3>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={() => setIsEditModalOpen(true)}
          >
            编辑
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={() => setIsDeleteConfirmOpen(true)}
            isLoading={isDeleting}
          >
            删除
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
        isDestructive
      />
    </>
  );
};
