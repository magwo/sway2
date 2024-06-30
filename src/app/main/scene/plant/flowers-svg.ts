import { ZeroOneFloat } from "../../../../procedural/hash.math";
import { PlantGeneData } from "../../../../procedural/plant-genes";
import { HALF_CIRCLE, PositionMath } from "../../../../procedural/position";

// NOTE: Flowers should have target size 10x10, then scaled by renderer to proper size

// TODO: Maybe pass a random generator for deterministic defects?
export function createFlowerPath(genes: PlantGeneData) {
    switch(genes.flowerType) {
        case ('radial_petals'):
            return createRadialPetalsPath(genes.flowerSubCount);
    }
    return '';
}


function createRadialPetalsPath(numPetals: number): string {
    const startAngle = -HALF_CIRCLE;
    const endAngle = HALF_CIRCLE;
    const stepSumAngle = startAngle - endAngle;
    const stepAngle = stepSumAngle / (numPetals * 2);

    const LENGTH = 5;
    const WIDTH = 5;
    const INNER_LENGTH_MULTIPLIER = 1;

    const pointyness = 0;

    const origoX = 0;

    let path = '';
    let previousLength = 0;
    for (let i=0; i<numPetals*2 + 1; i++) {
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
            path += `A ${0.2*Math.pow(pointLength, 2) / (stepAngle* 2)} ${0.2*Math.pow(pointLength, 2) / (stepAngle* 2)} 0 0 0 ${point.x} ${point.y}`;
        }
    }
    return path;
}
