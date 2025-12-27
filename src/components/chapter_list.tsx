import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  TouchSensor,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type { Schema } from "../lib/directus";
import { useQueryClient } from "@tanstack/react-query";
import { useFetchChaptersByProjectId } from "../queries/chapter.queries";
import { useUpdateChapterOrder } from "../queries/chapter.queries";
import { useState } from "react";
import { SortableChapterItem } from "./sortable_chapter_item";
import { GripVertical } from "lucide-react";
import { Loader } from "../components/ui/loader";
// 拖拽中的占位预览（可选）
const DragOverlayItem = ({
  chapter,
}: {
  chapter: Schema["chapters"] | null;
}) => {
  if (!chapter) return null;
  return (
    <div className="flex items-center gap-3 p-3 rounded-md bg-white shadow-lg opacity-80 transition-all duration-700">
      <span className="text-dark-blue">
        <GripVertical />
      </span>
      <div>
        <h3 className="font-normal text-sm text-dark-blue truncate leading-tight">
          {chapter.title}
        </h3>
      </div>
    </div>
  );
};

// 主列表组件
export const ChapterList = ({ projectId }: { projectId: string }) => {
  const { data: chapters = [], isLoading } =
    useFetchChaptersByProjectId(projectId);

  const { mutate: updateOrder } = useUpdateChapterOrder(projectId);
  const queryClient = useQueryClient();

  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 4 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 5 },
      onActivation: () => window.alert("Touch activated!"), // 调试用
    }),
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

    const reordered = arrayMove(chapters, oldIndex, newIndex);
    const reorderedWithSort = reordered.map((chapter, index) => ({
      ...chapter,
      sort: index + 1,
    }));

    // 先同步更新缓存，避免视觉回跳
    queryClient.setQueryData(["chapters", projectId], reorderedWithSort);

    const updates: { id: string; sort: number }[] = reordered.map(
      (chapter, index) => ({
        id: chapter.id,
        sort: index + 1,
      })
    );

    updateOrder(updates);
  };

  if (isLoading && chapters.length === 0) return <Loader />;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={chapters.map((ch) => ch.id)}
        strategy={verticalListSortingStrategy}
      >
        {chapters.map((chapter) => (
          <SortableChapterItem
            key={chapter.id}
            chapter={chapter}
            projectId={projectId}
          />
        ))}
      </SortableContext>

      <DragOverlay>
        <DragOverlayItem
          chapter={chapters.find((ch) => ch.id === activeId) || null}
        />
      </DragOverlay>
    </DndContext>
  );
};
