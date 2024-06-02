import { RandomGenerator } from './random';

export type Color = {
  r: number;
  g: number;
  b: number;
};

function clampColorVal(v: number) {
  return Math.round(Math.max(0.0, Math.min(255.0, v)));
}

export function getRgbDeviation(
  c: Color,
  maxAbsoluteDeviation: number,
  g: RandomGenerator
) {
  return {
    r: clampColorVal(
      g.getLinearDistribution(
        c.r - maxAbsoluteDeviation,
        c.r + maxAbsoluteDeviation
      )
    ),
    g: clampColorVal(
      g.getLinearDistribution(
        c.g - maxAbsoluteDeviation,
        c.g + maxAbsoluteDeviation
      )
    ),
    b: clampColorVal(
      g.getLinearDistribution(
        c.b - maxAbsoluteDeviation,
        c.b + maxAbsoluteDeviation
      )
    ),
  };
}
