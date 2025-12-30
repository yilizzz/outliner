import React, { useMemo } from "react";

import { useFetchProjectById } from "../queries/projects.queries";
import { Loader } from "lucide-react";
import { Lotus } from "./flowers/lotus";
import { Dandelion } from "./flowers/dandelion";
import { Ray } from "./flowers/ray";
import { Sunflower } from "./flowers/sunflower";
import { Swirl } from "./flowers/swirl";
import { useInView } from "react-intersection-observer";
import { useLanguage } from "../contexts/language_context";
interface TreeProps {
  project_id: string;
}
export const Visualizing: React.FC<TreeProps> = ({ project_id }) => {
  const { data: project, isLoading } = useFetchProjectById(project_id);
  const { t } = useLanguage();
  const baseSize = 280;
  const chapterCount = project?.chapters?.length || 0;

  const { ref: containerRef, inView } = useInView({
    triggerOnce: true, // 如果只需要加载一次，可以设为 true 提升性能
    rootMargin: "-300px 0px",
  });

  // 只有当 project_id 改变或 chapterCount 改变时才重新计算
  const selectedComponent = useMemo(() => {
    if (chapterCount === 0) return null;

    const components = [
      <Sunflower key="sunflower" count={chapterCount} baseSize={baseSize} />,
      <Dandelion key="dandelion" count={chapterCount} baseSize={baseSize} />,
      <Ray key="ray" count={chapterCount} baseSize={baseSize} />,
      <Lotus key="lotus" count={chapterCount} baseSize={baseSize} />,
      <Swirl key="swirl" count={chapterCount} baseSize={baseSize} />,
    ];

    const randomIndex = Math.floor(Math.random() * components.length);
    return components[randomIndex];
  }, [chapterCount, project_id]); // 加上 project_id 确保不同项目的形状不同

  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center"
        style={{ width: baseSize, height: baseSize }}
      >
        <Loader className="animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center">
      {chapterCount === 0 ? (
        <p className="text-gray-500 text-center py-4 text-sm">
          {t("chapter_empty")}
        </p>
      ) : (
        /*  将 ref 挂载在包装层上 */
        <div
          ref={containerRef}
          style={{
            width: baseSize,
            height: baseSize,
          }}
        >
          {inView ? (
            selectedComponent
          ) : (
            /* 占位符：保持高度一致，防止滚动条抖动 */
            <div
              style={{ width: baseSize, height: baseSize }}
              className="bg-transparent"
            />
          )}
        </div>
      )}
    </div>
  );
};
