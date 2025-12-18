import * as d3 from "d3";
import { useEffect, useRef } from "react";
import {
  lightColors,
  darkColors,
  getRandomColors,
} from "../../utils/color_utils";
import { makeRotatable } from "../../utils/make_rotatable";
import {
  getMaxAllowedRadius,
  computeBaseOuterRadius,
  computeInnerRadius,
  deterministicRadius,
} from "../../utils/flower_utils";
export const Ray = ({
  count,
  baseSize,
}: {
  count: number;
  baseSize: number;
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const rotationRef = useRef<any>(null);
  const centerX = baseSize / 2;
  const centerY = baseSize / 2;

  const maxAllowedRadius = getMaxAllowedRadius(baseSize);
  const baseOuterRadius = computeBaseOuterRadius(baseSize, count, {
    maxByCount: 110,
  });

  // innerRadius 跟画布比例，保证在小画布下不会太大/太小
  const innerRadius = computeInnerRadius(baseSize, 0.1, 4, 20);

  const radiusVariation = 0.4;
  const getRandomRadius = (index: number) => {
    return deterministicRadius(
      index,
      baseOuterRadius,
      radiusVariation,
      maxAllowedRadius
    );
  };
  const stamentsColor = getRandomColors(lightColors, 1)[0];
  const lineColor = getRandomColors(darkColors, 1)[0];
  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const g = svg
      .append("g")
      .attr("transform", `translate(${centerX},${centerY})`);

    const numCurves = 36; // 花蕊的数量
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
        .attr("stroke", stamentsColor)
        .attr("fill", "none")
        .attr("stroke-width", 1.5)
        .attr("opacity", 1);
    }
    g.append("circle")
      .attr("r", innerRadius + 1)
      .attr("fill", "none")
      .attr("stroke", stamentsColor)
      .attr("stroke-width", 5)
      .attr("opacity", 1);

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
      .attr("stroke", lineColor)
      .attr("stroke-width", 1)
      .attr("fill", "none")
      .attr("stroke-opacity", 0.25)
      .style("opacity", 0)
      .transition()
      .delay((_, i) => 300 + i * 50)
      .duration(700)
      .style("opacity", 1);

    rotationRef.current = makeRotatable({ svg, g, center: baseSize / 2 });
    return () => rotationRef.current?.cleanup();
  }, [count, innerRadius, baseOuterRadius]);

  return (
    <svg
      ref={svgRef}
      width={baseSize}
      height={baseSize}
      viewBox={`${-baseSize / 2} ${-baseSize / 2} ${baseSize} ${baseSize}`}
      style={{ overflow: "visible" }}
    />
  );
};
