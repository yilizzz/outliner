import * as d3 from "d3";
export interface RotationController {
  toggleRotation: () => void;
  stopRotation: () => void;
  isRotating: () => boolean;
}

export const createRotationController = ({
  g,
  center,
}: {
  g: d3.Selection<SVGSVGElement | null, unknown, null, undefined>;
  center: number;
}): RotationController => {
  let rotating = true;
  let angle = 0;
  let timer: d3.Timer | null = null;

  const startRotation = () => {
    if (timer) timer.stop();
    let last = Date.now();
    timer = d3.timer(() => {
      const now = Date.now();
      const dt = (now - last) / 1000;
      last = now;
      angle = (angle + dt * 60) % 360;
      g.attr("transform", `rotate(${angle})`);
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

  const isRotating = () => rotating;

  startRotation();

  return { toggleRotation, stopRotation, isRotating };
};
