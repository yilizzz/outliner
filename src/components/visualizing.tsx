import React, { useRef, useEffect, useMemo } from "react";

import { useFetchProjectById } from "../queries/projects.queries";
import { LoaderPinwheel } from "lucide-react";
import { Lotus } from "./flowers/lotus";
import { Dandelion } from "./flowers/dandelion";
import { Swirl } from "./flowers/swirl";
import { Ray } from "./flowers/ray";
import { Sunflower } from "./flowers/sunflower";
import { SwirlNew } from "./flowers/swirl_new";
import { useInView } from "../hooks/use_in_view";
interface TreeProps {
  project_id: string;
}
export const Visualizing: React.FC<TreeProps> = ({ project_id }) => {
  //const { data: project, isLoading } = useFetchProjectById(project_id);

  const project = { chapters: new Array(5).fill(0) };

  const baseSize = 280;

  const chapterCount = project?.chapters?.length || 0;
  const [containerRef, isInView] = useInView();
  // if (isLoading) {
  //   return <div style={{ width: baseSize, height: baseSize }}>Loading...</div>;
  // }
  const components = [
    <Sunflower key="sunflower" count={chapterCount} baseSize={baseSize} />,
    <Dandelion key="dandelion" count={chapterCount} baseSize={baseSize} />,
    <Ray key="ray" count={chapterCount} baseSize={baseSize} />,
    <Swirl key="swirl" count={chapterCount} baseSize={baseSize} />,
    <Lotus key="lotus" count={chapterCount} baseSize={baseSize} />,
    <SwirlNew key="swirl" count={chapterCount} baseSize={baseSize} />,
  ];

  // 随机选择一个组件
  //const randomIndex = Math.floor(Math.random() * components.length);
  const randomIndex = 5;
  const selectedComponent = components[randomIndex];
  return (
    <div className="flex flex-col items-center justify-center">
      {chapterCount === 0 ? (
        <></>
      ) : (
        <div ref={containerRef} style={{ width: baseSize, height: baseSize }}>
          {isInView ? (
            selectedComponent
          ) : (
            <div style={{ width: "100%", height: "100%" }} />
          )}
        </div>
      )}
    </div>
  );
};
