import { Position } from "./position";
import { RandomGenerator } from "./random";


// TODO: Maybe different types for different types of segments - trunk, branches, leaves?
export type PlantSegment = {
    position: Position;
    length: number;
    branchAnchorLongitudinal: number;
    branchAnchorAngle: number;
    branches: PlantSegment[];
}

export class Plant {

    public segments: PlantSegment[] = [];

    constructor(public position: Position, private generator: RandomGenerator) {
        this.segments.push({
            position: {x: 0, y: 0},
            length: 0,
            branchAnchorLongitudinal: 0,
            branchAnchorAngle: 0,
            branches: [],
        });
    }

    grow(dtSeconds: number) {

    }

    // TODO: Other methods of creating a plant, not just random
}