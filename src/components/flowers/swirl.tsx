import * as d3 from "d3";
import { useEffect, useRef } from "react";
import { makeRotatable } from "../../utils/make_rotatable";
import {
  getRandomColors,
  darkColors,
  lightColors,
} from "../../utils/color_utils";
import {
  getMaxAllowedRadius,
  computeBaseOuterRadius,
  computeInnerRadius,
  deterministicRadius,
} from "../../utils/flower_utils";

export const Swirl = ({
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

  // 配置参数（颜色与曲线因子）
  const config = {
    colors: {
      start: getRandomColors(lightColors, 1)[0],
      end: getRandomColors(darkColors, 1)[0],
      core: getRandomColors(lightColors, 1)[0],
    },
    radiusVariation: 0.35,
    curveOffset: 1.3,
  };

  const maxAllowedRadius = getMaxAllowedRadius(baseSize);
  const baseOuterRadius = computeBaseOuterRadius(baseSize, count);
  const innerRadius = computeInnerRadius(baseSize);

  const getRadius = (index: number, count: number) => {
    return deterministicRadius(
      index,
      baseOuterRadius,
      config.radiusVariation,
      maxAllowedRadius
    );
  };

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // 定义渐变与发光效果
    const defs = svg.append("defs");

    // 主发光滤镜
    const glowFilter = defs.append("filter").attr("id", "glow");
    glowFilter
      .append("feGaussianBlur")
      .attr("in", "SourceGraphic")
      .attr("stdDeviation", "6.5")
      .attr("result", "coloredBlur");
    const feMerge = glowFilter.append("feMerge");
    feMerge.append("feMergeNode").attr("in", "coloredBlur");
    feMerge.append("feMergeNode").attr("in", "SourceGraphic");

    // 强发光滤镜（用于花粉）
    const brightGlow = defs.append("filter").attr("id", "brightGlow");
    brightGlow
      .append("feGaussianBlur")
      .attr("in", "SourceGraphic")
      .attr("stdDeviation", "3")
      .attr("result", "blur");
    const brightMerge = brightGlow.append("feMerge");
    brightMerge.append("feMergeNode").attr("in", "blur");
    brightMerge.append("feMergeNode").attr("in", "SourceGraphic");

    const g = svg.append("g");

    // 绘制中心饼图
    const pieData = Array.from({ length: 18 }, (_, i) => i);
    const pie = d3.pie<number>().value(() => 1);
    const arc = d3
      .arc<d3.PieArcDatum<number>>()
      .innerRadius(0)
      .outerRadius(innerRadius);

    g.selectAll(".pie-slice")
      .data(pie(pieData))
      .enter()
      .append("path")
      .attr("class", "pie-slice")
      .attr("d", arc)
      .attr("fill", (d, i) =>
        d3.interpolateRgb(config.colors.start, config.colors.end)(i / 18)
      )
      .attr("opacity", 0)
      //   .attr("stroke", config.colors.core)
      //   .attr("stroke-width", 0.5)
      .transition()
      .duration(3000)
      .ease(d3.easePolyOut.exponent(2.5))
      .delay((_, i) => i * 40)
      .attr("opacity", 0.85);

    const petalAngleStep = (2 * Math.PI) / count;

    // 准备数据
    const petals = Array.from({ length: count }, (_, i) => {
      const angle = i * petalAngleStep;
      const radius = getRadius(i, count);

      const x0 = Math.cos(angle) * innerRadius;
      const y0 = Math.sin(angle) * innerRadius;

      const x1 = Math.cos(angle) * radius;
      const y1 = Math.sin(angle) * radius;

      const controlRadius = (innerRadius + radius) / 2;
      const controlAngle = angle + config.curveOffset;

      const cX = Math.cos(controlAngle) * controlRadius;
      const cY = Math.sin(controlAngle) * controlRadius;

      return {
        path: `M ${x0},${y0} Q ${cX},${cY} ${x1},${y1}`,
        color: d3.interpolateCool(i / count),
        length: radius,
      };
    });

    // 绘制花瓣（背景层 - 更宽更柔和）
    // g.selectAll(".petal-bg")
    //   .data(petals)
    //   .enter()
    //   .append("path")
    //   .attr("class", "petal-bg")
    //   .attr("d", (d) => d.path)
    //   .attr("fill", "none")
    //   .attr("stroke", config.colors.end)
    //   .attr("stroke-width", 4.5)
    //   .attr("stroke-linecap", "round")
    //   .attr("stroke-linejoin", "round")
    //   .attr("opacity", 0.15)
    // .style("filter", "url(#glow)");

    // 绘制花瓣（前景层 - 主视觉）
    g.selectAll(".petal")
      .data(petals)
      .enter()
      .append("path")
      .attr("class", "petal")
      .attr("d", (d) => d.path)
      .attr("fill", "none")
      .attr("stroke", (d, i) =>
        d3.interpolateRgb(config.colors.start, config.colors.end)(i / count)
      )
      .attr("stroke-width", 2)
      .attr("stroke-linecap", "round")
      .attr("stroke-linejoin", "round")
      .attr("opacity", 0.75)

      .attr("stroke-dasharray", function () {
        return this.getTotalLength();
      })
      .attr("stroke-dashoffset", function () {
        return this.getTotalLength();
      })
      .transition()
      .duration(3000)
      .ease(d3.easePolyOut.exponent(2.5))
      .delay((_, i) => i * 25)
      .attr("stroke-dashoffset", 0)
      .attr("opacity", 1);

    // 在末端添加发光花粉（多层次效果）
    g.selectAll(".pollen")
      .data(petals)
      .enter()
      .append("circle")
      .attr("r", 0.5)
      .attr("cx", (d) => {
        const pathParts = d.path.split(" ");
        const endCoords = pathParts[pathParts.length - 1].split(",");
        return parseFloat(endCoords[0]);
      })
      .attr("cy", (d) => {
        const pathParts = d.path.split(" ");
        const endCoords = pathParts[pathParts.length - 1].split(",");
        return parseFloat(endCoords[1]);
      })
      .attr("fill", (d, i) =>
        d3.interpolateRgb(config.colors.start, config.colors.end)(i / count)
      )
      .attr("opacity", 0)
      .style("filter", "url(#brightGlow)")
      .transition()
      .delay((_, i) => 900 + i * 25)
      .duration(600)
      .attr("r", 6)
      .attr("opacity", 0.85)
      .transition()
      .duration(1500)
      .attr("r", 3.5)
      .attr("opacity", 0.6);

    rotationRef.current = makeRotatable({ svg, g, center: baseSize / 2 });
    return () => rotationRef.current?.cleanup();
  }, [baseSize, centerX, centerY, config]);

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
