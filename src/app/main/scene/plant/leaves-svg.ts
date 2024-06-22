import { ZeroOneFloat } from "../../../../procedural/hash.math";
import { HALF_CIRCLE, QUARTER_CIRCLE, SIXTEENTH_CIRCLE } from "../../../../procedural/position";
import { Centimeters } from "../../../common";

// NOTE: Leafs should have target size 0.1x0.1 meters, then scaled by renderer

export function createSimpleLeafPath(): string {
    const cm = 1 / 100;
    return `M ${0*cm} ${0*cm} L ${4*cm} ${-2*cm} L ${2*cm} ${1*cm} L ${5*cm} ${5*cm} L ${1*cm} ${3*cm} L ${0*cm} ${8*cm} L ${-1*cm} ${3*cm} L ${-5*cm} ${5*cm} L ${-2*cm} ${1*cm} L ${-4*cm} ${-2*cm} Z`;
}

export function createRadialArrowsLeafPath(numArrows: number, pointyness: ZeroOneFloat, elongation: number): string {
    // TODO: Curved arrows
    const startAngle = -HALF_CIRCLE;
    const endAngle = HALF_CIRCLE;
    const stepSumAngle = startAngle - endAngle;
    const stepAngle = stepSumAngle / numArrows;
    const cm = 1 / 100;

    const POINT_LENGTH = 6 / (1+elongation);
    const INNER_LENGTH = POINT_LENGTH * (1 - pointyness);

    let path = '';
    for (let i=0; i<numArrows; i++) {
        const angle = startAngle + stepAngle * 0.5 + i * stepAngle;
        const pointFraction = i / (numArrows - 1);
        const pointLengthMultiplier = 1 + elongation * Math.sin(HALF_CIRCLE * pointFraction);
        const pointLength = POINT_LENGTH * pointLengthMultiplier;

        // Outer point:
        const x = pointLength * Math.cos(angle);
        const y = pointLength * Math.sin(angle);

        // Next inner point:
        const innerAngle = angle + stepAngle * 0.5;
        const innerFraction = (i + 0.5) / (numArrows - 1);
        const innerLengthMultiplier = 1 + elongation * Math.sin(HALF_CIRCLE * innerFraction);
        const innerLength = INNER_LENGTH * innerLengthMultiplier;
        const x2 = innerLength * Math.cos(innerAngle);
        const y2 = innerLength * Math.sin(innerAngle);
        
        const command = i === 0 ? 'M' : 'L';
        path += `${command} ${x*cm} ${y*cm} L ${x2*cm} ${y2*cm}`
    }
    path += 'Z';
    return path;
}