import { ZeroOneFloat } from "../../../../procedural/hash.math";
import { PlantGeneData } from "../../../../procedural/plant-genes";
import { HALF_CIRCLE, PositionMath } from "../../../../procedural/position";

// NOTE: Leafs should have target size 10x10, then scaled by renderer to proper size

// TODO: Maybe pass a random generator for deterministic defects of leaves?
export function createLeafPath(genes: PlantGeneData) {
    switch(genes.leafType) {
        case ('radial_points'):
            return createRadialArrowsLeafPath(genes.leafSubCount, genes.leafSubPointyness, genes.leafElongation, genes.leafDefects);
        case ('radial_slices'):
            return createRadialSlicesLeafPath(genes.leafSubCount, genes.leafSubPointyness, genes.leafElongation, genes.leafDefects);
        case ('slices_on_stick'):
            return '';
    }
    return '';
}

function createRadialArrowsLeafPath(numArrows: number, pointyness: ZeroOneFloat, elongation: number, defects: ZeroOneFloat): string {
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
        path += `${command} ${point.x} ${point.y}`;
    }
    path += 'Z';
    return path;
}


function createRadialSlicesLeafPath(numArrows: number, pointyness: ZeroOneFloat, elongation: number, defects: ZeroOneFloat): string {
    const startAngle = -HALF_CIRCLE;
    const endAngle = HALF_CIRCLE;
    const stepSumAngle = startAngle - endAngle;
    const stepAngle = stepSumAngle / (numArrows * 2);

    const LENGTH = 4 + 1.5 * elongation;
    const WIDTH = 4 - 2 * elongation;
    const INNER_LENGTH_MULTIPLIER = 1;

    const origoX = 3.2 - (1 * pointyness) + (0.6 * elongation);

    let path = '';
    let previousLength = 0;
    for (let i=0; i<numArrows*2 + 1; i++) {
        const isInner = (i % 2) === 1;

        const angle = startAngle + (i + 1) * stepAngle;

        let point = {
            x: origoX + LENGTH * Math.cos(angle),
            y: WIDTH * Math.sin(angle)
        };
        const pointLength = isInner ? previousLength : PositionMath.length2D(point);
        previousLength = pointLength;
        if (isInner) {
            point = PositionMath.multiply(point, 1 - INNER_LENGTH_MULTIPLIER);
        }
        
        if(i === 0) {
            path += `M ${point.x} ${point.y}`;
        } else {
            path += `A ${0.3*Math.pow(pointLength, 2) / (stepAngle* 2)} ${0.3*Math.pow(pointLength, 2) / (stepAngle* 2)} 0 0 0 ${point.x} ${point.y}`;
        }
    }
    return path;
}