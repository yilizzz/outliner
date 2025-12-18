export const getMaxAllowedRadius = (baseSize: number, padding = 6) => {
  return Math.max(0, baseSize / 2 - padding);
};

export const computeBaseOuterRadius = (
  baseSize: number,
  count: number,
  opts?: { maxByCount?: number }
) => {
  const maxAllowed = getMaxAllowedRadius(baseSize);
  const computedByCount = 70 + Math.sqrt(Math.max(0, count)) * 8; // sqrt 缓和增长
  const desiredOuter = Math.min(opts?.maxByCount ?? 110, computedByCount);
  return Math.min(desiredOuter, maxAllowed);
};

export const computeInnerRadius = (
  baseSize: number,
  ratio = 0.06,
  minVal = 3,
  maxVal = 20
) => {
  return Math.max(minVal, Math.min(maxVal, baseSize * ratio));
};

export const deterministicRadius = (
  index: number,
  baseOuterRadius: number,
  variation = 0.3,
  maxAllowed?: number
) => {
  const seed = Math.sin(index * 12.9898) * 43758.5453;
  const random = seed - Math.floor(seed);
  const minR = baseOuterRadius * (1 - variation);
  const maxR = baseOuterRadius * (1 + variation);
  const r = minR + random * (maxR - minR);
  if (typeof maxAllowed === "number") return Math.min(r, maxAllowed);
  return r;
};

export default {
  getMaxAllowedRadius,
  computeBaseOuterRadius,
  computeInnerRadius,
  deterministicRadius,
};
