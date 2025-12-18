import * as d3 from "d3";
import { useEffect, useRef } from "react";
import {
  lightColors,
  darkColors,
  getRandomColors,
} from "../../utils/color_utils";
export const Ray = ({
  count,
  baseSize,
}: {
  count: number;
  baseSize: number;
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  const centerX = baseSize / 2;
  const centerY = baseSize / 2;
  const innerRadius = 10;
  const baseOuterRadius = Math.min(110, 70 + count * 2);

  const radiusVariation = 0.4;
  const getRandomRadius = (index: number) => {
    const seed = Math.sin(index * 12.9898) * 43758.5453;
    const random = seed - Math.floor(seed);
    const minRadius = baseOuterRadius * (1 - radiusVariation);
    const maxRadius = baseOuterRadius * (1 + radiusVariation);
    return minRadius + random * (maxRadius - minRadius);
  };

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const g = svg
      .append("g")
      .attr("transform", `translate(${centerX},${centerY})`);

    const numCurves = 24; // 花蕊的数量
    const angleStep = (2 * Math.PI) / numCurves; // 每条曲线之间的角度间隔

    for (let i = 0; i < numCurves; i++) {
      const angle = i * angleStep;

      // 定义控制点的位置，以创造向外弯曲的效果
      const controlX1 = Math.cos(angle - Math.PI / 6) * (innerRadius / 3); // 第一个控制点
      const controlY1 = Math.sin(angle - Math.PI / 6) * (innerRadius / 3);
      const controlX2 = Math.cos(angle + Math.PI / 6) * (innerRadius / 3); // 第二个控制点
      const controlY2 = Math.sin(angle + Math.PI / 6) * (innerRadius / 3);

      const endX = Math.cos(angle) * (innerRadius + 5); // 结束点
      const endY = Math.sin(angle) * (innerRadius + 5);

      g.append("path")
        .attr(
          "d",
          `M 0,0 C ${controlX1},${controlY1} ${controlX2},${controlY2} ${endX},${endY}`
        )
        .attr("stroke", getRandomColors(lightColors, 1)[0])
        .attr("fill", "none")
        .attr("stroke-width", 2)
        .attr("opacity", 0.8);
    }
    g.append("circle")
      .attr("r", innerRadius + 3)
      .attr("fill", "none")
      .attr("stroke", getRandomColors(lightColors, 1)[0])
      .attr("stroke-width", 10)
      .attr("opacity", 0.3);

    if (count > 0) {
      const angles = Array.from(
        { length: count },
        (_, i) => (i / count) * 2 * Math.PI
      );
      const radii = angles.map((_, i) => getRandomRadius(i)); // 保留随机半径变化（可选）

      g.selectAll(".custom-ray")
        .data(angles)
        .enter()
        .append("path")
        .attr("class", "custom-ray")
        // 使用d属性来描述曲线路径
        .attr("d", (d, i) => {
          const startRadius = innerRadius; // 起始半径（圆环）
          const endRadius = radii[i]; // 结束半径（外部节点）
          const startX = Math.cos(d) * startRadius;
          const startY = Math.sin(d) * startRadius;
          const endX = Math.cos(d) * endRadius;
          const endY = Math.sin(d) * endRadius;

          // 控制点的位置，可以根据实际需求调整
          const controlDistance = (endRadius - startRadius) / 2; // 控制点距离起始点的距离
          const amplitude = 20; // 正弦波振幅，可以调整曲线的波动程度

          // 创建一个简单的正弦波形，这里简化处理，实际应用中可能需要更多控制点
          return `M ${startX},${startY} C ${startX + controlDistance},${
            startY - amplitude
          }, ${endX - controlDistance},${endY + amplitude}, ${endX},${endY}`;
        })
        .attr("stroke", getRandomColors(darkColors, 1)[0])
        .attr("stroke-width", 1.5)
        .attr("fill", "none")
        .attr("stroke-opacity", 0.25)
        .style("opacity", 0)
        .transition()
        .delay((_, i) => 300 + i * 50)
        .duration(700)
        .style("opacity", 1);
    }
  }, [count, innerRadius, baseOuterRadius]);

  return (
    <svg
      ref={svgRef}
      width={baseSize}
      height={baseSize}
      viewBox={`0 0 ${baseSize} ${baseSize}`}
      className="mx-auto"
    />
  );
};
