import * as d3 from "d3";
import { useEffect, useMemo, useRef } from "react";
export const Swirl = ({
  count,
  baseSize,
}: {
  count: number;
  baseSize: number;
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  const centerX = baseSize / 2;
  const centerY = baseSize / 2;

  // 配置参数
  const config = useMemo(
    () => ({
      colors: {
        start: "#818CF8", // 亮紫色（近圆心）
        end: "#4F46E5", // 深靛蓝（远端）
        core: "#fbbf24", // 金色花蕊
      },
      innerRadius: 8,
      baseOuterRadius: 100, // 基础外半径
      radiusVariation: 0.3, // 长度随机因子
      curveOffset: 0.3, // 曲线弯曲程度 (弧度)，控制旋转感
    }),
    []
  );

  // 生成确定性的随机半径 (保留你的逻辑)
  const getRadius = (index: number, count: number) => {
    const seed = Math.sin(index * 12.9898) * 43758.5453;
    const random = seed - Math.floor(seed);
    // 稍微调整半径逻辑，让它跟数量有关，避免太稀疏或太拥挤
    const dynamicBase = config.baseOuterRadius;
    const minRadius = dynamicBase * (1 - config.radiusVariation);
    const maxRadius = dynamicBase * (1 + config.radiusVariation);
    return minRadius + random * (maxRadius - minRadius);
  };

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // 清除画布

    // 1. 定义渐变 Defs
    const defs = svg.append("defs");

    // 创建放射状射线的线性渐变 (沿着路径)
    // 注意：SVG线性渐变是基于坐标轴的，对于放射状线条，
    // 最好的办法是给每条线应用颜色插值，或者使用简单的从内向外透明度变化
    // 这里我们使用一种发光滤镜效果
    const filter = defs.append("filter").attr("id", "glow");

    filter
      .append("feGaussianBlur")
      .attr("stdDeviation", "2.5")
      .attr("result", "coloredBlur");
    //????????????????????????????feMerge没有使用
    const feMerge = filter.append("feMerge");
    feMerge.append("feMergeNode").attr("in", "coloredBlur");
    feMerge.append("feMergeNode").attr("in", "SourceGraphic");

    const g = svg
      .append("g")
      .attr("transform", `translate(${centerX},${centerY})`);

    // --- 绘制中心花蕊 (简化版，更现代) ---
    // 外层光晕
    // g.append("circle")
    //   .attr("r", config.innerRadius + 5)
    //   .attr("fill", config.colors.colors?.light || "#E0E7FF")
    //   .attr("opacity", 0.2)
    //   .style("filter", "url(#glow)");

    // // 核心实心圆
    // g.append("circle")
    //   .attr("r", config.innerRadius)
    //   .attr("fill", "none")
    //   .attr("stroke", config.colors.core)
    //   .attr("stroke-width", 2)
    //   .attr("stroke-dasharray", "3 2") // 虚线增加细节
    //   .attr("opacity", 0.8);
    const numCurves = 16; // 花蕊的数量
    const angleStep = (2 * Math.PI) / numCurves; // 每条曲线之间的角度间隔
    const innerRadius = config.innerRadius;
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
        .attr("stroke", "goldenrod") // 使用固定颜色值，可以根据喜好更改
        .attr("fill", "none")
        .attr("stroke-width", 2)
        .attr("opacity", 0.8);
    }

    if (count > 0) {
      const angleStep = (2 * Math.PI) / count;

      // 准备数据
      const petals = Array.from({ length: count }, (_, i) => {
        const angle = i * angleStep; // 当前角度
        const radius = getRadius(i, count);

        // --- 核心数学修正 ---
        // 起点 (圆心边缘)
        const x0 = Math.cos(angle) * config.innerRadius;
        const y0 = Math.sin(angle) * config.innerRadius;

        // 终点 (外圈)
        const x1 = Math.cos(angle) * radius;
        const y1 = Math.sin(angle) * radius;

        // 控制点：不只是加减坐标，而是将角度偏移
        // 这会创造出一种“漩涡”或“风车”的效果，看起来更有机
        const controlRadius = (config.innerRadius + radius) / 2;
        const controlAngle = angle + config.curveOffset; // 关键：角度偏移

        const cX = Math.cos(controlAngle) * controlRadius;
        const cY = Math.sin(controlAngle) * controlRadius;

        return {
          path: `M ${x0},${y0} Q ${cX},${cY} ${x1},${y1}`, // 使用二次贝塞尔曲线 (Q)
          color: d3.interpolateCool(i / count), // 使用 D3 内置色阶让每条线颜色略有不同
          length: radius,
        };
      });

      // 绘制花瓣
      g.selectAll(".petal")
        .data(petals)
        .enter()
        .append("path")
        .attr("class", "petal")
        .attr("d", (d) => d.path)
        .attr("fill", "none")
        .attr("stroke", config.colors.start) // 也可以用 d.color 变成彩色的
        .attr("stroke-width", 1.5)
        .attr("stroke-linecap", "round")
        .attr("opacity", 0.6)
        .style("filter", "url(#glow)") // 添加发光效果
        // 动画部分
        .attr("stroke-dasharray", function () {
          return this.getTotalLength();
        })
        .attr("stroke-dashoffset", function () {
          return this.getTotalLength();
        })
        .transition()
        .duration(1000)
        .ease(d3.easeCubicOut) // 使用这种缓动函数，更有“喷射”感
        .delay((_, i) => i * 30) // 错开时间
        .attr("stroke-dashoffset", 0)
        .style("stroke", config.colors.end); // 动画结束变色

      // 可选：在末端添加小圆点 (花粉)
      g.selectAll(".pollen")
        .data(petals)
        .enter()
        .append("circle")
        .attr("r", 2)
        .attr("cx", (d) => {
          // 解析路径终点略显复杂，这里重新计算一下
          // 简单起见，利用数据中的逻辑重算终点
          // 实际项目中可以把坐标存在 data 里
          const pathParts = d.path.split(" ");
          const endCoords = pathParts[pathParts.length - 1].split(",");
          return parseFloat(endCoords[0]);
        })
        .attr("cy", (d) => {
          const pathParts = d.path.split(" ");
          const endCoords = pathParts[pathParts.length - 1].split(",");
          return parseFloat(endCoords[1]);
        })
        .attr("fill", config.colors.end)
        .attr("opacity", 0)
        .transition()
        .delay((_, i) => 800 + i * 30)
        .duration(500)
        .attr("opacity", 0.8);
    }
  }, [baseSize, centerX, centerY, config]);
  return (
    <svg
      ref={svgRef}
      width={baseSize}
      height={baseSize}
      viewBox={`0 0 ${baseSize} ${baseSize}`}
      className="mx-auto"
      style={{ overflow: "visible" }} // 防止光晕被切断
    />
  );
};
