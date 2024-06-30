import { max } from 'rxjs';
import { PlantGenes } from './plant-genes';
import {
  EIGTH_CIRCLE,
  FULL_CIRCLE,
  Position,
  Vec2,
  QUARTER_CIRCLE,
} from './vec2';
import { RandomGenerator } from './random';
import { placeBranches } from './branch-placer';
import { TimeSeconds } from '../app/common';

const GROWTH_TIME: TimeSeconds = 90;
const MAX_STEP_SIZE: TimeSeconds = 1/60;
export const END_WIDTH_FACTOR = 0.5;
export const BEND_FACTOR_MAIN_BRANCH = 0.4;
export const BEND_FACTOR_SIDE_BRANCHES = 1.0;

export type PlantSegmentType = 'root' | 'main_branch' | 'branch' | 'leaf' | 'flower' | 'fruit';

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
    return Vec2.addInDirection(
      this.position,
      this.rotation,
      this.length
    );
  }
  getBaseRight() {
    // TODO: Curvature?
    return Vec2.addInDirection(
      this.position,
      this.rotation + QUARTER_CIRCLE,
      this.width
    );
  }
  getBaseLeft() {
    // TODO: Curvature?
    return Vec2.addInDirection(
      this.position,
      this.rotation - QUARTER_CIRCLE,
      this.width
    );
  }

  getEndRight() {
    // TODO: Curvature?
    // TODO: What about end width? Same as next segment base width
    const endPoint = Vec2.addInDirection(
      this.position,
      this.rotation,
      this.length
    );
    return Vec2.addInDirection(
      endPoint,
      this.rotation + QUARTER_CIRCLE,
      this.width * END_WIDTH_FACTOR
    );
  }
  getEndLeft() {
    // TODO: Curvature?
    // TODO: What about end width? Same as next segment base width
    const endPoint = Vec2.addInDirection(
      this.position,
      this.rotation,
      this.length
    );
    return Vec2.addInDirection(
      endPoint,
      this.rotation - QUARTER_CIRCLE,
      this.width * END_WIDTH_FACTOR
    );
  }

  getBranchPosition(anchorFactor: number) {
    return Vec2.addInDirection(
      this.position,
      this.rotation,
      this.length * anchorFactor
    );
  }
}

export class Plant {
  public age = 0;
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

    if(depth <= this.genes.data.branchDepthMax) {
      for (const subSegment of segment.branches) {
        this.planBranchesRecursively(subSegment, depth + 1);
      }
    }
  }


  simulate(deltaTime: TimeSeconds, currentTime: TimeSeconds) {
    // Don't grow too large timesteps
    // let remainingSeconds = dtSeconds;
    // while (remainingSeconds > 0) {
    //   const toStep = Math.min(remainingSeconds, MAX_STEP_SIZE_SECONDS);
    //   this.growSegmentsRecursively(this.rootSegment, toStep, 1);
    //   remainingSeconds -= MAX_STEP_SIZE_SECONDS;
    //   this.age += toStep;
    // }
    this.growSegmentsRecursively(this.rootSegment, deltaTime, 1);
    this.animateRecursively(this.rootSegment, deltaTime, currentTime, BEND_FACTOR_MAIN_BRANCH);
    this.age += deltaTime;
  }

  preGrow(targetAge: number, currentTime: TimeSeconds) {
    let remainingSeconds = Math.min(GROWTH_TIME, targetAge);
    while (remainingSeconds > 0) {
      const toStep = Math.min(remainingSeconds, MAX_STEP_SIZE);
      this.growSegmentsRecursively(this.rootSegment, toStep, 1);
      remainingSeconds -= MAX_STEP_SIZE;
      this.age += toStep;
    }
    this.animateRecursively(this.rootSegment, 0, currentTime, BEND_FACTOR_MAIN_BRANCH);
  }

  private animateRecursively(segment: PlantSegment,
    dtSeconds: TimeSeconds, currentTime: TimeSeconds, bendFactor: number) {

      if (segment.parent) {
        segment.position = segment.parent.getBranchPosition(
          segment.branchAnchorLongitudinal
        );
        segment.rotation = segment.parent.rotation + segment.branchAnchorAngle;
      } else {
        segment.rotation = segment.branchAnchorAngle;
      }

      // TODO: Remove apparent oscillation slowness during growth caused by frequency decrease when length increases
      // Maybe by doing angular momentum simulation instead of time-dependent sinus rotation
      segment.rotation += 0.1 * bendFactor * Math.sin(10*currentTime / (segment.length * segment.density + .1));

      for (let i=0; i<segment.branches.length; i++) {
        const subSegment = segment.branches[i];
        const bendFactor = i === 0 ? BEND_FACTOR_MAIN_BRANCH : BEND_FACTOR_SIDE_BRANCHES;
        this.animateRecursively(subSegment, dtSeconds, currentTime, bendFactor);
      }
    }

  private growSegmentsRecursively(
    segment: PlantSegment,
    deltaTime: TimeSeconds,
    depth: number
  ) {
    if (this.age > GROWTH_TIME) {
      return;
    }
    // TODO: Iron out what the target size/age is actually
    const slowDown = Math.min(1, 20 / (0.01 + segment.length));
    deltaTime *= slowDown;
    segment.length += deltaTime;
    segment.width += deltaTime * 0.07 / this.genes.data.slimness;

    for (const subSegment of segment.branches) {
      if (segment.length > 12 / (depth - 0.2)) {
        // TODO: Maybe don't multiply dt - instead have a growth per segment
        this.growSegmentsRecursively(subSegment, deltaTime * 0.8, depth + 1);
      }
    }
  }

  // TODO: Other methods of creating a plant, not just random
}
