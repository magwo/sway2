import { Position } from "./position";
import { RandomGenerator } from "./random";

export class Plant {

    constructor(public position: Position, private generator: RandomGenerator) {
        
    }
}