import * as d3 from "d3";
import { createRotationController } from "./create_rotation_controller";
export const makeRotatable = ({
  svg,
  g,
  center,
}: {
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  g: d3.Selection<SVGGElement, unknown, null, undefined>;
  center: number;
}) => {
  const rotationController = createRotationController({ g, center });
  const pointerHandler = (event: any) => {
    // on touch devices, prevent default scrolling gesture when tapping the svg
    try {
      event.preventDefault();
    } catch (e) {
      /* ignore */
    }
    rotationController.toggleRotation();
  };

  svg.on("pointerdown", pointerHandler);

  return {
    rotationController,
    cleanup: () => {
      rotationController.stopRotation();
      g.remove();
    },
  };
};
