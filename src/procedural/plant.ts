import { max } from 'rxjs';
import { PlantGenes } from './plant-genes';
import {
  EIGTH_CIRCLE,
  FULL_CIRCLE,
  Position,
  PositionMath,
  QUARTER_CIRCLE,
} from './position';
import { RandomGenerator } from './random';
import { placeBranches } from './branch-placer';

const GROWTH_TIME_SECONDS = 90;
export const END_WIDTH_FACTOR = 0.5;
export const BEND_FACTOR_MAIN_BRANCH = 0.4;
export const BEND_FACTOR_SIDE_BRANCHES = 1.0;

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
    public branchAnchorLongitudinal: number,
    public branchAnchorAngle: number,
    public readonly density: number
  ) {}
  // roundness: number;

  // TODO: Maybe use computed (memoized) property for all corners, for better performance?

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
    const rootDensity = 1.0;
    this.rootSegment = new PlantSegment(
        undefined,
      { x: 0, y: 0 },
      -QUARTER_CIRCLE,
      0,
      0,
      'root',
      0,
      -QUARTER_CIRCLE + genes.data.crookedness * generator.getQuadraticDistribution(-EIGTH_CIRCLE, EIGTH_CIRCLE),
      rootDensity,
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
    this.planBranchesRecursively(this.rootSegment, 1);
  }

  private planBranchesRecursively(
    segment: PlantSegment,
    depth: number,
  ) {
    placeBranches(segment, this.generator, this.genes.data, depth);

    if(depth <= this.genes.data.maxBranchDepth) {
      for (const subSegment of segment.branches) {
        this.planBranchesRecursively(subSegment, depth + 1);
      }
    }
  }


  simulate(dtSeconds: number, timeSeconds: number) {
    // TODO: Also animate tree
    // Don't grow too large timesteps
    let remainingSeconds = dtSeconds;
    const maxStepSize = 1/60;
    while (remainingSeconds > 0) {
      const toStep = Math.min(remainingSeconds, maxStepSize);
      this.growSegmentsRecursively(this.rootSegment, toStep, timeSeconds, 1);
      this.animateRecursively(this.rootSegment, dtSeconds, timeSeconds, BEND_FACTOR_MAIN_BRANCH);
      remainingSeconds -= maxStepSize;
    }
  }

  private animateRecursively(segment: PlantSegment,
    dtSeconds: number, timeSeconds: number, bendFactor: number) {

      if (segment.parent) {
        segment.position = segment.parent.getBranchPosition(
          segment.branchAnchorLongitudinal
        );
        segment.rotation = segment.parent.rotation + segment.branchAnchorAngle;
      } else {
        segment.rotation = segment.branchAnchorAngle;
      }

      segment.rotation += 0.1 * bendFactor * Math.sin(10*timeSeconds / (segment.length * segment.density + .1));

      for (let i=0; i<segment.branches.length; i++) {
        const subSegment = segment.branches[i];
        const bendFactor = i === 0 ? BEND_FACTOR_MAIN_BRANCH : BEND_FACTOR_SIDE_BRANCHES;
        this.animateRecursively(subSegment, dtSeconds, timeSeconds, bendFactor);
      }
    }

  private growSegmentsRecursively(
    segment: PlantSegment,
    dtSeconds: number,
    timeSeconds: number,
    depth: number
  ) {
    if (timeSeconds > GROWTH_TIME_SECONDS) {
      return;
    }
    // TODO: Iron out what the target size/age is actually
    const slowDown = Math.min(1, 30 / (0.01 + segment.length * segment.width));
    dtSeconds *= slowDown;
    segment.length += dtSeconds;
    segment.width += dtSeconds * 0.07;

    if (segment.parent) {
      segment.position = segment.parent.getBranchPosition(
        segment.branchAnchorLongitudinal
      );
      segment.rotation = segment.parent.rotation + segment.branchAnchorAngle;
    } else {
      segment.rotation = segment.branchAnchorAngle;
    }

    for (const subSegment of segment.branches) {
      if (segment.length > 12 / (depth - 0.2)) {
        // TODO: Maybe don't multiply dt - instead have a growth per segment
        this.growSegmentsRecursively(subSegment, dtSeconds * 0.8, timeSeconds, depth + 1);
      }
    }
  }

  // TODO: Other methods of creating a plant, not just random
}
