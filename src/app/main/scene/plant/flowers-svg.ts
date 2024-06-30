import { ZeroOneFloat } from "../../../../procedural/hash.math";
import { PlantGeneData } from "../../../../procedural/plant-genes";
import { HALF_CIRCLE, Vector2, Vec2, QUARTER_CIRCLE } from "../../../../procedural/vec2";

// NOTE: Flowers should have target size 10x10, then scaled by renderer to proper size

// TODO: Maybe pass a random generator for deterministic defects?
export function createFlowerMarkup(genes: PlantGeneData) {
    switch(genes.flowerType) {
        case ('radial_petals'):
            return createRadialPetalsMarkup(genes.flowerSubCount, genes.flowerSubPointyness, genes.flowerSubEndWeight, genes.flowerSpaciousness, genes.flowerInnerRadius);
    }
    return '';
}

const LENGTH = 5;
function createRadialPetalsMarkup(numPetals: number, pointyness: number, subEndWeight: number, spaciousness: ZeroOneFloat, innerRadius: ZeroOneFloat): string {
    const startAngle = -HALF_CIRCLE;
    const endAngle = HALF_CIRCLE;
    const stepSumAngle = startAngle - endAngle;
    const stepAngle = stepSumAngle / numPetals;

    const PETAL_EMPTY_RATIO = 1 - spaciousness;
    const petalStepAngle = stepAngle * PETAL_EMPTY_RATIO;
    // const emptyStepAngle = stepAngle * (1 - PETAL_EMPTY_RATIO);

    // TODO: Use flower inner radius gene
    const INNER_LENGTH_MULTIPLIER = innerRadius;

    const origo = {x: 0, y: 0};

    let petalsPath = '';
    for (let i=0; i<numPetals; i++) {
        const angle = startAngle + i * stepAngle;
        petalsPath += drawPetal(origo, angle, petalStepAngle, LENGTH * innerRadius, pointyness, subEndWeight);
    }
    // Add inner circle:
    const circle = `<circle class="flower-inner" cx="0" cy="0" r="${LENGTH * INNER_LENGTH_MULTIPLIER}" />`;
    return `<path class="petal" d="${petalsPath}" /> ${circle}`;
}

function drawPetal(origo: Vector2, startAngle: number, petalSectorAngle: number, innerRadius: number, pointyness: number, subEndWeight: number) {
    const start = Vec2.addInDirection(origo, startAngle, innerRadius);
    const petalPoint = Vec2.addInDirection(origo, startAngle + petalSectorAngle / 2, LENGTH);
    const end = Vec2.addInDirection(origo, startAngle + petalSectorAngle, innerRadius);

    const startToEnd = Vec2.delta(end, start);
    const startToEndAngle = Vec2.angle(startToEnd);
    const cp1 = start;
    const cp2 = Vec2.addInDirection(petalPoint, startToEndAngle + HALF_CIRCLE + pointyness, (0.3+subEndWeight)*Vec2.length2D(startToEnd));
    const cp3 = Vec2.addInDirection(petalPoint, startToEndAngle - pointyness, (0.3+subEndWeight)*Vec2.length2D(startToEnd));
    const cp4 = end;

    let path = moveCommand(start);
    path += bezierCommand(cp1, cp2, petalPoint);
    path += bezierCommand(cp3, cp4, end);

    return path;
}

function moveCommand(p: Vector2) {
    return `M ${p.x} ${p.y} `;
}

function lineCommand(p: Vector2) {
    return `L ${p.x} ${p.y} `;
}

function bezierCommand(controlPointStart: Vector2, controlPointEnd: Vector2, endPoint: Vector2) {
    return `C ${controlPointStart.x} ${controlPointStart.y} ${controlPointEnd.x} ${controlPointEnd.y} ${endPoint.x} ${endPoint.y} `;
}

function arcCommand(p: Vector2) {
    return `A 1 1 0 0 0 ${p.x} ${p.y} `;
}