export const TWO_PI = Math.PI * 2;
export const QUARTER_CIRCLE = Math.PI / 2;
export const HALF_CIRCLE = Math.PI;
export const FULL_CIRCLE = TWO_PI;

export type Position = { x: number; y: number };
export class PositionMath {
  private constructor() {}
  static length2D(p: Position) {
    return Math.sqrt(p.x * p.x + p.y * p.y);
  }
  static add(p1: Position, p2: Position): Position {
    return { x: p1.x + p2.x, y: p1.y + p2.y };
  }
  static addDirectionAndLength(p: Position, angle: number, length: number): Position {
    return { x: p.x + length * Math.cos(angle), y: p.y + length * Math.sin(angle) };
  }
  static delta(p1: Position, p0: Position): Position {
    return { x: p1.x - p0.x, y: p1.y - p0.y };
  }
  static angle(vector: Position): number {
    return Math.atan2(vector.y, vector.x);
  }
  static normalize(vector: Position): Position {
    const len = PositionMath.length2D(vector);
    return { x: vector.x / len, y: vector.y / len };
  }
  static toLength(vector: Position, length: number): Position {
    const currentLen = PositionMath.length2D(vector);
    return {
      x: (length * vector.x) / currentLen,
      y: (length * vector.y) / currentLen,
    };
  }
  static dotProduct(vector1: Position, vector2: Position): number {
    return vector1.x * vector2.x + vector1.y * vector2.y;
  }
  static projectOn(vector: Position, targetVector: Position): Position {
    const dotProduct = PositionMath.dotProduct(vector, targetVector);
    const targetLenSqrd = PositionMath.dotProduct(targetVector, targetVector);
    const factor = dotProduct / targetLenSqrd;
    return { x: targetVector.x * factor, y: targetVector.y * factor };
  }

//   static getNormalOfLength(v1: Position, length: number) {
    
//   }

  static makeAngleWorkable(angle: number) {
    return ((angle + TWO_PI) % TWO_PI) + TWO_PI;
  }
}
