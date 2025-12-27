import * as d3 from "d3";
import { useRef, useEffect } from "react";
import { makeRotatable } from "../../utils/make_rotatable";
import {
  getRandomColor,
  darkColors,
  lightColors,
} from "../../utils/color_utils";
export const Sunflower = ({
  count = 20,
  baseSize = 200,
}: {
  count: number;
  baseSize: number;
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const rotationRef = useRef<any>(null);
  // 核心参数配置
  const config = {
    padding: 20, // 留白
    baseColor: getRandomColor(darkColors),
    centerColor: getRandomColor(lightColors),
  };

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // --- 2. 核心数学：计算缩放比例 ---
    // 为了保证花朵总是填满画布，反推间距 c
    // MaxRadius = c * sqrt(N)  =>  c = MaxRadius / sqrt(N)
    const maxRadiusAvailable = baseSize / 2 - config.padding;
    // 限制 c 的最大值，防止节点太少时圆圈分得太散
    const spacing = Math.min(18, maxRadiusAvailable / Math.sqrt(count || 1));

    // --- 3. 生成叶序数据 ---
    const nodes = Array.from({ length: count }, (_, i) => {
      // 黄金角度：137.508 度
      const angle = i * 137.508 * (Math.PI / 180);
      const radius = spacing * Math.sqrt(i);

      return {
        id: i,
        x: radius * Math.cos(angle),
        y: radius * Math.sin(angle),
        r: radius, // 距离圆心的距离，用于配色
        angle: angle,
      };
    });

    // 颜色比例尺：离中心越远，颜色越深/越浅
    const colorScale = d3
      .scaleLinear<string>()
      .domain([0, count])
      .range([config.centerColor, config.baseColor]);

    // 大小比例尺：外面的叶子通常稍微大一点点
    const sizeScale = d3.scaleSqrt().domain([0, count]).range([3, 6]); // 节点半径范围

    const g = svg.append("g");

    // 绘制中心的小核心
    g.append("circle")
      .attr("cx", 0)
      .attr("cy", 0)
      .attr("r", 4)
      .attr("fill", "#fff")
      .attr("opacity", 0.5);

    // 绘制所有节点
    const circles = g
      .selectAll(".node")
      .data(nodes)
      .enter()
      .append("circle")
      .attr("class", "node")
      .attr("cx", (d) => d.x)
      .attr("cy", (d) => d.y)
      .attr("r", 0) // 初始半径为0，用于动画
      .attr("fill", (_, i) => colorScale(i))
      .attr("stroke", "#fff")
      .attr("stroke-width", 1)
      .attr("stroke-opacity", 0.3);

    // --- 5. 动画：螺旋生长效果 ---
    circles
      .transition()
      .duration(800)
      .delay((_, i) => i * 10) // 每个节点延迟一点，形成扩散感
      .ease(d3.easeBackOut.overshoot(3.7)) // 弹性弹出效果
      .attr("r", (_, i) => sizeScale(i));

    rotationRef.current = makeRotatable({ svg, g, center: baseSize / 2 });
    return () => rotationRef.current?.cleanup();
  }, [baseSize, config]);

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
