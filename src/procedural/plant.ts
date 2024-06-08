import { max } from 'rxjs';
import { PlantGenes } from './plant-genes';
import {
  FULL_CIRCLE,
  Position,
  PositionMath,
  QUARTER_CIRCLE,
} from './position';
import { RandomGenerator } from './random';
import { placeBranches } from './branch-placer';

const GROWTH_TIME_SECONDS = 10;
const END_WIDTH_FACTOR = 0.5;

export type PlantSegmentType = 'root' | 'main_branch' | 'branch' | 'leaf' | 'flower' | 'fruit';

// TODO: Maybe different types for different types of segments - trunk, branches, leaves?
export class PlantSegment {
  branches: PlantSegment[] = [];
  isGrowing = false;

  constructor(
    public parent: PlantSegment | undefined,
    public position: Position,
    public rotation: number,
    public length: number,
    public width: number,
    public type: PlantSegmentType,
    public branchAnchorLongitudinal: number = 0,
    public branchAnchorAngle: number = 0
  ) {}
  // roundness: number;

  getEndPoint() {
    // TODO: Curvature?
    return PositionMath.addDirectionAndLength(
      this.position,
      this.rotation,
      this.length
    );
  }
  getBaseRight() {
    // TODO: Curvature?
    return PositionMath.addDirectionAndLength(
      this.position,
      this.rotation + QUARTER_CIRCLE,
      this.width
    );
  }
  getBaseLeft() {
    // TODO: Curvature?
    return PositionMath.addDirectionAndLength(
      this.position,
      this.rotation - QUARTER_CIRCLE,
      this.width
    );
  }

  getEndRight() {
    // TODO: Curvature?
    // TODO: What about end width? Same as next segment base width
    const endPoint = PositionMath.addDirectionAndLength(
      this.position,
      this.rotation,
      this.length
    );
    return PositionMath.addDirectionAndLength(
      endPoint,
      this.rotation + QUARTER_CIRCLE,
      this.width * END_WIDTH_FACTOR
    );
  }
  getEndLeft() {
    // TODO: Curvature?
    // TODO: What about end width? Same as next segment base width
    const endPoint = PositionMath.addDirectionAndLength(
      this.position,
      this.rotation,
      this.length
    );
    return PositionMath.addDirectionAndLength(
      endPoint,
      this.rotation - QUARTER_CIRCLE,
      this.width * END_WIDTH_FACTOR
    );
  }

  getBranchPosition(anchorFactor: number) {
    return PositionMath.addDirectionAndLength(
      this.position,
      this.rotation,
      this.length * anchorFactor
    );
  }
}

export class Plant {
  public readonly age = 0;
  public readonly rootSegment: PlantSegment;

  constructor(public position: Position, public readonly genes: PlantGenes, private generator: RandomGenerator) {
    this.rootSegment = new PlantSegment(
        undefined,
      { x: 0, y: 0 },
      -QUARTER_CIRCLE,
      0,
      0,
      'root'
    );

    this.planBranches();
    console.log("getTotalBranchCount", this.getTotalBranchCount());
  }

  getTotalBranchCount(): number {
     return this.getBranchCountRecursively(this.rootSegment);
  }

  private getBranchCountRecursively(segment: PlantSegment): number {
    let sum = 1;
    for (const subSegment of segment.branches) {
      sum += this.getBranchCountRecursively(subSegment);
    }
    return sum;
  }

  planBranches() {
    this.planBranchesRecursively(this.rootSegment, this.genes.data.maxBranchDepth);
  }

  private planBranchesRecursively(
    segment: PlantSegment,
    maxDepth: number
  ) {
    placeBranches(segment, this.generator, this.genes.data);

    if(maxDepth > 0) {
      for (const subSegment of segment.branches) {
        this.planBranchesRecursively(subSegment, maxDepth - 1)
      }
    }
  }


  grow(dtSeconds: number) {
    // Don't grow too large timesteps
    let remainingSeconds = dtSeconds;
    const maxStepSize = 1/60;
    while (remainingSeconds > 0) {
      const toStep = Math.min(remainingSeconds, maxStepSize);
      this.growSegmentsRecursively(this.rootSegment, toStep, 3);
      remainingSeconds -= maxStepSize;
    }
  }

  private growSegmentsRecursively(
    segment: PlantSegment,
    dtSeconds: number,
    maxDepth: number
  ) {
    const slowDown = Math.min(1, 30 / (0.01 + segment.length * segment.width));
    dtSeconds *= slowDown;
    segment.length += dtSeconds;
    segment.width += dtSeconds * 0.07;
    segment.branchAnchorAngle +=
      0.2 * (-0.5 * dtSeconds + dtSeconds * Math.random());


    for (const subSegment of segment.branches) {
      subSegment.position = segment.getBranchPosition(
        subSegment.branchAnchorLongitudinal
      );
      subSegment.rotation = segment.rotation + subSegment.branchAnchorAngle;

      if (maxDepth >= 0 && segment.length > (1+maxDepth) * 3) {
        this.growSegmentsRecursively(subSegment, dtSeconds * 0.8, maxDepth - 1);
      }
    }
  }

  // TODO: Other methods of creating a plant, not just random
}
