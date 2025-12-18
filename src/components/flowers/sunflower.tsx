import * as d3 from "d3";
import { useRef, useEffect, useMemo } from "react";
export const Sunflower = ({
  count = 20,
  baseSize = 200,
}: {
  count: number;
  baseSize: number;
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  // 核心参数配置
  const config = useMemo(
    () => ({
      padding: 20, // 留白
      baseColor: "#6366F1", // 主色
      centerColor: "#F59E0B", // 花蕊色 (金色)
      glowColor: "#818CF8", // 发光色
    }),
    []
  );

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // 清除画布

    // --- 1. 滤镜定义 (让粒子看起来在发光) ---
    const defs = svg.append("defs");
    const filter = defs.append("filter").attr("id", "bloom-glow");
    filter
      .append("feGaussianBlur")
      .attr("stdDeviation", "1.5")
      .attr("result", "coloredBlur");
    const feMerge = filter.append("feMerge");
    feMerge.append("feMergeNode").attr("in", "coloredBlur");
    feMerge.append("feMergeNode").attr("in", "SourceGraphic");

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

    // --- 4. 绘制 ---
    // 因为 viewBox 已经设为以中心为原点，这里直接绘制，不需要 append("g").transform...

    // 绘制中心的小核心
    svg
      .append("circle")
      .attr("cx", 0)
      .attr("cy", 0)
      .attr("r", 4)
      .attr("fill", "#fff")
      .attr("opacity", 0.5)
      .style("filter", "url(#bloom-glow)");

    // 绘制所有节点
    const circles = svg
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
      .attr("stroke-opacity", 0.3)
      .style("filter", "url(#bloom-glow)"); // 应用发光

    // --- 5. 动画：螺旋生长效果 ---
    circles
      .transition()
      .duration(800)
      .delay((_, i) => i * 10) // 每个节点延迟一点，形成扩散感
      .ease(d3.easeBackOut.overshoot(1.7)) // 弹性弹出效果
      .attr("r", (_, i) => sizeScale(i));

    // --- 6. 交互 (可选) ---
    circles
      .on("mouseenter", function () {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("r", 10) // 放大
          .attr("fill", "#fff");
      })
      .on("mouseleave", function (_, i) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("r", sizeScale(i)) // 恢复大小
          .attr("fill", colorScale(i));
      });
  }, [baseSize, config]);

  return (
    <div
      className="flex items-center justify-center w-full h-full p-4"
      style={{ width: baseSize, height: baseSize }}
    >
      {/* 关键修复：
        1. viewBox 设置为 [-half, -half, size, size]
           这使得 (0,0) 坐标位于 SVG 的正中心。
        2. display: block 防止 svg 默认的行内元素底部留白
      */}
      <svg
        ref={svgRef}
        width={baseSize}
        height={baseSize}
        viewBox={`${-baseSize / 2} ${-baseSize / 2} ${baseSize} ${baseSize}`}
        style={{ display: "block", overflow: "visible" }}
      />
    </div>
  );
};
