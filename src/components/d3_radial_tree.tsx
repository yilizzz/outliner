import React, { useRef, useEffect } from "react";
import * as d3 from "d3";

interface TreeProps {
  contentCount: number;
  colorClass: string;
  id: string;
}

export const D3RadialTree: React.FC<TreeProps> = ({
  contentCount,
  colorClass,
  id,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  const minNodes = 3;
  const maxNodes = 20;

  const nodeScale = d3
    .scaleSqrt()
    .domain([0, 200])
    .range([minNodes, maxNodes])
    .clamp(true);

  const nodeCount = Math.floor(nodeScale(contentCount));

  const baseSize = 280;
  const centerX = baseSize / 2;
  const centerY = baseSize / 2;

  const createTreeData = (count: number) => {
    return {
      name: "Root",
      children: Array.from({ length: count }).map((_, i) => ({
        name: `Chapter ${i + 1}`,
      })),
    };
  };

  const getColor = (className: string) => {
    if (className.includes("green"))
      return { main: "#10B981", light: "#D1FAE5", dark: "#059669" };
    if (className.includes("blue"))
      return { main: "#3B82F6", light: "#DBEAFE", dark: "#2563EB" };
    if (className.includes("pink"))
      return { main: "#EC4899", light: "#FCE7F3", dark: "#DB2777" };
    return { main: "#6366F1", light: "#E0E7FF", dark: "#4F46E5" };
  };

  const colors = getColor(colorClass);

  const innerRadius = 35;
  const baseOuterRadius = Math.min(110, 70 + nodeCount * 2);

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

    const treeData = createTreeData(nodeCount);
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const g = svg
      .append("g")
      .attr("transform", `translate(${centerX},${centerY})`);

    const root = d3.hierarchy(treeData);

    const treeLayout = d3
      .tree<any>()
      .size([2 * Math.PI, baseOuterRadius - innerRadius])
      .separation((a, b) => (a.parent === b.parent ? 1 : 2) / a.depth);

    const tree = treeLayout(root);
    const nodes = tree.descendants();
    const links = tree.links();

    g.append("circle")
      .attr("r", innerRadius + 5)
      .attr("fill", "none")
      .attr("stroke", colors.light)
      .attr("stroke-width", 10)
      .attr("opacity", 0.3);

    const linkGenerator = d3
      .linkRadial<any, any>()
      .angle((d) => d.x)
      .radius((d) => d.y + innerRadius);

    g.selectAll(".link")
      .data(links)
      .enter()
      .append("path")
      .attr("class", "link")
      .attr("d", linkGenerator)
      .attr("fill", "none")
      .attr("stroke", colors.main)
      .attr("stroke-width", 2)
      .attr("stroke-opacity", 0.4)
      .style("opacity", 0)
      .transition()
      .delay((d, i) => i * 50)
      .duration(800)
      .style("opacity", 1);

    const leafNodes = nodes.filter((d) => d.depth === 1);

    const nodeRadii = leafNodes.map((d, i) => getRandomRadius(i));

    g.selectAll(".node-outer")
      .data(leafNodes)
      .enter()
      .append("circle")
      .attr("class", "node-outer")
      .attr(
        "transform",
        (d, i) =>
          `rotate(${(d.x * 180) / Math.PI - 90}) translate(${nodeRadii[i]},0)`
      )
      .attr("r", 0)
      .attr("fill", colors.main)
      .attr("stroke", "#fff")
      .attr("stroke-width", 2)
      .transition()
      .delay((d, i) => 400 + i * 50)
      .duration(600)
      .attr("r", 5);

    g.selectAll(".ray")
      .data(leafNodes)
      .enter()
      .append("line")
      .attr("class", "ray")
      .attr("transform", (d) => `rotate(${(d.x * 180) / Math.PI - 90})`)
      .attr("x1", innerRadius + 8)
      .attr("x2", innerRadius + 8)
      .attr("y1", 0)
      .attr("y2", 0)
      .attr("stroke", colors.main)
      .attr("stroke-width", 1.5)
      .attr("stroke-opacity", 0.25)
      .transition()
      .delay((d, i) => 300 + i * 50)
      .duration(700)
      .attr("x2", (d, i) => nodeRadii[i] - 5);
  }, [nodeCount, colors, id, contentCount, innerRadius, baseOuterRadius]);

  return (
    <div
      className="flex flex-col items-center justify-center p-4 transition-all duration-500"
      style={{ width: baseSize, height: baseSize }}
    >
      <svg
        ref={svgRef}
        width={baseSize}
        height={baseSize}
        viewBox={`0 0 ${baseSize} ${baseSize}`}
        className="mx-auto"
      />
    </div>
  );
};
