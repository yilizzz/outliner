import { useRef, useEffect } from "react";
import * as d3 from "d3";
import { makeRotatable } from "../../utils/make_rotatable";
import {
  getRandomColors,
  darkColors,
  lightColors,
} from "../../utils/color_utils";
export const Dandelion = ({
  count,
  baseSize,
}: {
  count: number;
  baseSize: number;
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const rotationRef = useRef<any>(null);
  const radius = baseSize / 2;
  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);

    svg.selectAll("*").remove();
    const g = svg.append("g");
    // generate nodes using phyllotaxis for even distribution
    const puffNodes = d3.range(count).map((i) => {
      const index = i + 1; // 跳过 i=0，让第一个点就有半径
      const angle = index * 137.508; // golden angle
      const r =
        Math.sqrt(index / (count + 1)) * // 分母略大于 count，防止最外层超限
        radius *
        (0.6 + Math.random() * 0.4);
      const x = r * Math.cos((angle * Math.PI) / 180);
      const y = r * Math.sin((angle * Math.PI) / 180);
      const color = getRandomColors(darkColors, 1)[0];
      return { x, y, i, color };
    });
    // center dot
    g.append("circle")
      .attr("class", "dandelion-center")
      .attr("cx", 0)
      .attr("cy", 0)
      .attr("r", 3)
      .attr("fill", darkColors[0])
      .attr("opacity", 0.9);

    // lines
    g.selectAll(".puff-line")
      .data(puffNodes)
      .enter()
      .append("line")
      .attr("class", "puff-line")
      .attr("x1", 0)
      .attr("y1", 0)
      .attr("x2", 0)
      .attr("y2", 0)
      .attr("stroke", (d: any) => d.color)
      .attr("stroke-width", 0.7)
      .attr("stroke-opacity", 0.28)
      .transition()
      .delay((d: any, i: number) => i * 8)
      .duration(1000)
      .attr("x2", (d: any) => d.x)
      .attr("y2", (d: any) => d.y);

    // end dots
    g.selectAll(".puff-dot")
      .data(puffNodes)
      .enter()
      .append("circle")
      .attr("class", "puff-dot")
      .attr("cx", 0)
      .attr("cy", 0)
      .attr("r", 0)
      .attr("fill", (d: any, i: number) =>
        i % 2 === 0
          ? getRandomColors(darkColors, 1)[0]
          : getRandomColors(lightColors, 1)[0]
      )
      .attr("stroke", "#ffffff")
      .attr("stroke-width", 1)
      .transition()
      .delay((d: any, i: number) => 300 + i * 6)
      .duration(1000)
      .attr("cx", (d: any) => d.x)
      .attr("cy", (d: any) => d.y)
      .attr("r", 1.9);

    rotationRef.current = makeRotatable({ svg, g, center: baseSize / 2 });
    return () => rotationRef.current?.cleanup();
  }, [count, baseSize]);

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
