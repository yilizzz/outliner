import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useQuery } from "@tanstack/react-query";
import type { Schema } from "../lib/directus";
import { useFetchChaptersByProjectId } from "../queries/chapter.queries";
import { useUpdateChapterOrder } from "../queries/chapter.queries";
import { useState } from "react";

// 单个章节项（可排序）
const SortableChapterItem = ({ chapter }: { chapter: Schema["chapters"] }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: chapter.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 100 : "auto",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-3 border rounded-md bg-white shadow-sm mb-2 cursor-move hover:bg-gray-50"
      {...attributes}
    >
      <button
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
        aria-label="拖拽排序"
      >
        ☰
      </button>
      <div className="flex-1">
        <h3 className="font-medium">{chapter.title}</h3>
      </div>
    </div>
  );
};

// 拖拽中的占位预览（可选）
const DragOverlayItem = ({
  chapter,
}: {
  chapter: Schema["chapters"] | null;
}) => {
  if (!chapter) return null;
  return (
    <div className="flex items-center gap-3 p-3 border rounded-md bg-white shadow-lg opacity-80">
      <span className="text-gray-400">☰</span>
      <div>
        <h3 className="font-medium">{chapter.title}</h3>
      </div>
    </div>
  );
};

// 主列表组件
export const ChapterList = ({ projectId }: { projectId: string }) => {
  const { data: chapters = [], isLoading } =
    useFetchChaptersByProjectId(projectId);
  const { mutate: updateOrder } = useUpdateChapterOrder();

  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event: any) => {
    setActiveId(null);
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = chapters.findIndex((ch) => ch.id === active.id);
    const newIndex = chapters.findIndex((ch) => ch.id === over.id);

    // 计算新顺序
    const reordered = arrayMove(chapters, oldIndex, newIndex);

    const updates: { id: string; sort: number }[] = reordered.map(
      (chapter, index) => ({
        id: chapter.id,
        sort: index + 1,
      })
    );

    // 调用 mutation
    updateOrder(updates);
  };

  if (isLoading) return <div>加载章节...</div>;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={chapters} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {chapters.map((chapter) => (
            <SortableChapterItem key={chapter.id} chapter={chapter} />
          ))}
        </div>
      </SortableContext>

      <DragOverlay>
        <DragOverlayItem
          chapter={chapters.find((ch) => ch.id === activeId) || null}
        />
      </DragOverlay>
    </DndContext>
  );
};
