import { ZeroOneFloat } from "../../../../procedural/hash.math";
import { HALF_CIRCLE, QUARTER_CIRCLE, SIXTEENTH_CIRCLE } from "../../../../procedural/position";
import { Centimeters } from "../../../common";

// NOTE: Leafs should have target size 10x10, then scaled by renderer to proper size

export function createSimpleLeafPath(): string {
    return `M ${0} ${0} L ${4} ${-2} L ${2} ${1} L ${5} ${5} L ${1} ${3} L ${0} ${8} L ${-1} ${3} L ${-5} ${5} L ${-2} ${1} L ${-4} ${-2} Z`;
}

export function createRadialArrowsLeafPath(numArrows: number, pointyness: ZeroOneFloat, elongation: number, defects: ZeroOneFloat): string {
    // TODO: Curved arrows
    const startAngle = -HALF_CIRCLE;
    const endAngle = HALF_CIRCLE;
    const stepSumAngle = startAngle - endAngle;
    const stepAngle = stepSumAngle / numArrows;

    const POINT_LENGTH = 6 / (1+elongation);
    const INNER_LENGTH = POINT_LENGTH * (1 - pointyness);

    let path = '';
    for (let i=0; i<numArrows; i++) {
        const defectAngleError = (-0.1 + 0.2 * Math.sin(17*i)) * stepAngle * defects;
        const angle = startAngle + stepAngle * 0.5 + i * stepAngle + defectAngleError;
        const pointFraction = i / (numArrows - 1);
        const pointLengthMultiplier = 1 + elongation * Math.sin(HALF_CIRCLE * pointFraction);
        const pointLength = POINT_LENGTH * pointLengthMultiplier;

        // Outer point:
        const x = pointLength * Math.cos(angle);
        const y = pointLength * Math.sin(angle);

        // Next inner point:
        const defectInnerAngleError = (-0.1 + 0.2 * Math.sin(31*i)) * stepAngle * defects;
        const innerAngle = angle + stepAngle * 0.5 + defectInnerAngleError;
        const innerFraction = (i + 0.5) / (numArrows - 1);
        const innerLengthMultiplier = 1 + elongation * Math.sin(HALF_CIRCLE * innerFraction);
        const innerLength = INNER_LENGTH * innerLengthMultiplier;
        const x2 = innerLength * Math.cos(innerAngle);
        const y2 = innerLength * Math.sin(innerAngle);
        
        const command = i === 0 ? 'M' : 'L';
        path += `${command} ${x} ${y} L ${x2} ${y2}`
    }
    path += 'Z';
    return path;
}