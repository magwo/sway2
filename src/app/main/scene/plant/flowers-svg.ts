import { ZeroOneFloat } from "../../../../procedural/hash.math";
import { PlantGeneData } from "../../../../procedural/plant-genes";
import { HALF_CIRCLE, Position, Vec2, QUARTER_CIRCLE } from "../../../../procedural/vec2";

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
    const stepAngle = stepSumAngle / numPetals;

    const PETAL_EMPTY_RATIO = 0.6;
    const petalStepAngle = stepAngle * PETAL_EMPTY_RATIO;
    // const emptyStepAngle = stepAngle * (1 - PETAL_EMPTY_RATIO);

    const LENGTH = 5;
    // TODO: Use flower inner radius gene
    const INNER_LENGTH_MULTIPLIER = 0.4;

    const origo = {x: 0, y: 0};

    let path = '';
    for (let i=0; i<numPetals; i++) {
        const angle = startAngle + i * stepAngle;

        const start = Vec2.addInDirection(origo, angle, LENGTH*INNER_LENGTH_MULTIPLIER);
        path += moveCommand(start);

        const petalPoint = Vec2.addInDirection(origo, angle + petalStepAngle / 2, LENGTH);
        path += lineCommand(petalPoint);

        const end = Vec2.addInDirection(origo, angle + petalStepAngle, LENGTH*INNER_LENGTH_MULTIPLIER);
        path += lineCommand(end);
        path += lineCommand(start);
    }
    // Add inner circle:
    const circleStart = Vec2.addInDirection(origo, -QUARTER_CIRCLE, LENGTH * INNER_LENGTH_MULTIPLIER);
    path += moveCommand(circleStart);
    path += arcCommand(Vec2.addInDirection(origo, QUARTER_CIRCLE, LENGTH * INNER_LENGTH_MULTIPLIER));
    path += arcCommand(Vec2.addInDirection(origo, -QUARTER_CIRCLE, LENGTH * INNER_LENGTH_MULTIPLIER));
    return path;
}

function moveCommand(p: Position) {
    return `M ${p.x} ${p.y} `;
}

function lineCommand(p: Position) {
    return `L ${p.x} ${p.y} `;
}

function arcCommand(p: Position) {
    return `A 1 1 0 0 0 ${p.x} ${p.y} `;
}