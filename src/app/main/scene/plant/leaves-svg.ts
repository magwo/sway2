import { ZeroOneFloat } from "../../../../procedural/hash.math";
import { HALF_CIRCLE, PositionMath } from "../../../../procedural/position";

// NOTE: Leafs should have target size 10x10, then scaled by renderer to proper size

export function createSimpleLeafPath(): string {
    return `M ${0} ${0} L ${4} ${-2} L ${2} ${1} L ${5} ${5} L ${1} ${3} L ${0} ${8} L ${-1} ${3} L ${-5} ${5} L ${-2} ${1} L ${-4} ${-2} Z`;
}

export function createRadialArrowsLeafPath(numArrows: number, pointyness: ZeroOneFloat, elongation: number, defects: ZeroOneFloat): string {
    // TODO: Curved arrows
    // TODO: Defects
    const startAngle = -HALF_CIRCLE;
    const endAngle = HALF_CIRCLE;
    const stepSumAngle = startAngle - endAngle;
    const stepAngle = stepSumAngle / (numArrows * 2);

    const LENGTH = 4 + 1.5 * elongation;
    const WIDTH = 4 - 2 * elongation;
    const INNER_LENGTH_MULTIPLIER = pointyness * 0.4;

    const origoX = 3.6 - (1 * pointyness) + (0.6 * elongation);

    let path = '';
    for (let i=0; i<numArrows*2; i++) {
        const isInner = (i % 2) === 1;
        
        // const defectAngleError = (-0.1 + 0.2 * Math.sin(17*i)) * stepAngle * defects;
        const angle = startAngle + (i + 1) * stepAngle;

        let point = {
            x: origoX + LENGTH * Math.cos(angle), 
            y: WIDTH * Math.sin(angle)
        };
        if (isInner) {
            point = PositionMath.multiply(point, 1 - INNER_LENGTH_MULTIPLIER);
        }
        
        const command = i === 0 ? 'M' : 'L';
        path += `${command} ${point.x} ${point.y}`;// L ${x2} ${y2}`
    }
    path += 'Z';
    return path;
}