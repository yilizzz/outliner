import * as d3 from "d3";
import { useRef, useEffect } from "react";
import {
  lightColors,
  darkColors,
  getRandomColors,
} from "../../utils/color_utils";
export const Lotus = ({
  count,

  baseSize,
}: {
  count: number;

  baseSize: number;
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const radius = 80;
  useEffect(() => {
    // 确保 ref 已经挂载
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    // 每次执行前清空，防止重复渲染
    svg.selectAll("*").remove();

    // 创建中心容器
    const g = svg
      .append("g")
      .attr("transform", `translate(${baseSize / 2},${baseSize / 2})`);

    // 1. 生成花瓣数据
    const petals = Array.from({ length: count }, (_, i) => ({
      angle: (i / count) * 360,
      color: lightColors[i % lightColors.length],
    }));

    // 2. 绘制花瓣
    g.selectAll(".petal")
      .data(petals)
      .enter()
      .append("path")
      .attr("class", "petal")
      .attr(
        "d",
        `M0,0 Q${radius / 2.5},${-radius / 1.5} 0,${-radius} Q${
          -radius / 2.5
        },${-radius / 1.5} 0,0`
      )
      .attr("transform", (d) => `rotate(${d.angle})`)
      .attr("fill", (d) => d.color)
      .attr("stroke", "darkergreen")
      .attr("stroke-width", 1)
      .attr("opacity", 0) // 初始透明
      .style("mix-blend-mode", "multiply")
      .transition()
      .duration(1000)
      .delay((_, i) => i * 100)
      .attr("opacity", 1);

    // 3. 绘制花蕊
    g.append("circle")
      .attr("r", radius * 0.09)
      .attr("fill", getRandomColors(darkColors, 1)[0])
      .attr("opacity", 0.9)
      .style("filter", "drop-shadow(0 0 5px white)");
  }, [count, radius, baseSize]); // 依赖项变化时重新绘制

  return (
    <svg
      ref={svgRef}
      width={baseSize}
      height={baseSize}
      viewBox={`0 0 ${baseSize} ${baseSize}`}
      className="mx-auto"
      style={{ overflow: "visible" }}
    />
  );
};
