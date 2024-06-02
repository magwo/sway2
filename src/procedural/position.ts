const TWO_PI = Math.PI * 2;
export type Position = [number, number];
export class PositionMath {
    private constructor() {}
    static length2D(p: Position) {
        return Math.sqrt(p[0] * p[0] + p[1] * p[1]);
    }
    static add(p1: Position, p2: Position): Position {
        return [p1[0] + p2[0], p1[1] + p2[1]];
    }
    static delta(p1: Position, p0: Position): Position {
        return [p1[0] - p0[0], p1[1] - p0[1]];
    }
    static angle(vector: Position): number {
        return Math.atan2(vector[1], vector[0]);
    }
    static normalize(vector: Position): Position {
        const len = PositionMath.length2D(vector);
        return [vector[0] / len, vector[1] / len];
    }
    static toLength(vector: Position, length: number): Position {
        const currentLen = PositionMath.length2D(vector);
        return [length * vector[0] / currentLen, length * vector[1] / currentLen];
    }
    static dotProduct(vector1: Position, vector2: Position): number {
        return vector1[0] * vector2[0] + vector1[1] * vector2[1];
    }
    static projectOn(vector: Position, targetVector: Position): Position {
        const dotProduct = PositionMath.dotProduct(vector, targetVector);
        const targetLenSqrd = PositionMath.dotProduct(targetVector, targetVector);
        const factor = dotProduct / targetLenSqrd;
        return [targetVector[0] * factor, targetVector[1] * factor];
    }

    static makeAngleWorkable(angle: number) {
        return ((angle + TWO_PI) % TWO_PI) + TWO_PI;
    }
}