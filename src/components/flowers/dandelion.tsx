import { useRef, useEffect } from "react";
import * as d3 from "d3";
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

  const radius = baseSize / 2;
  useEffect(() => {
    const svg = d3.select(svgRef.current);
    if (!svgRef.current) return;

    svg.selectAll("*").remove();

    svg
      .attr("width", baseSize)
      .attr("height", baseSize)
      .attr("viewBox", `0 0 ${baseSize} ${baseSize}`);

    // center group
    const g = svg
      .append("g")
      .attr("transform", `translate(${baseSize / 2},${baseSize / 2})`);

    // generate nodes using phyllotaxis for even distribution
    const nodes = d3.range(count).map((i) => {
      const angle = i * 137.508; // golden angle
      const r =
        Math.sqrt(i / Math.max(1, count)) *
        radius *
        (0.6 + Math.random() * 0.4);
      const x = r * Math.cos((angle * Math.PI) / 180);
      const y = r * Math.sin((angle * Math.PI) / 180);
      return { x, y, i };
    });

    // lines
    g.selectAll(".puff-line")
      .data(nodes)
      .enter()
      .append("line")
      .attr("class", "puff-line")
      .attr("x1", 0)
      .attr("y1", 0)
      .attr("x2", 0)
      .attr("y2", 0)
      .attr("stroke", getRandomColors(darkColors, 1)[0])
      .attr("stroke-width", 0.7)
      .attr("stroke-opacity", 0.28)
      .transition()
      .delay((d: any, i: number) => i * 8)
      .duration(600)
      .attr("x2", (d: any) => d.x)
      .attr("y2", (d: any) => d.y);

    // end dots
    g.selectAll(".puff-dot")
      .data(nodes)
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
      .duration(400)
      .attr("cx", (d: any) => d.x)
      .attr("cy", (d: any) => d.y)
      .attr("r", 1.9);

    // rotation via d3.timer to ensure rotation happens around group's center
    let rotating = true;
    let angle = 0;
    let timer: d3.Timer | null = null;
    const center = baseSize / 2;

    const startRotation = () => {
      if (timer) timer.stop();
      let last = Date.now();
      timer = d3.timer(() => {
        const now = Date.now();
        const dt = (now - last) / 1000; // seconds
        last = now;
        // 360 degrees per 6s => 60 deg/s
        angle = (angle + dt * 60) % 360;
        g.attr("transform", `translate(${center},${center}) rotate(${angle})`);
      });
    };

    const stopRotation = () => {
      if (timer) {
        timer.stop();
        timer = null;
      }
    };

    const toggleRotation = () => {
      rotating = !rotating;
      if (rotating) startRotation();
      else stopRotation();
    };

    // start rotating immediately after render
    if (rotating) startRotation();

    const pointerHandler = (event: any) => {
      // on touch devices, prevent default scrolling gesture when tapping the svg
      try {
        event.preventDefault();
      } catch (e) {
        /* ignore */
      }
      toggleRotation();
    };

    svg.on("pointerdown", pointerHandler);

    return () => {
      svg.on("pointerdown", null);
      stopRotation();
      svg.selectAll("*").remove();
    };
  }, [count, baseSize]);

  return <svg ref={svgRef} className="mx-auto" />;
};
