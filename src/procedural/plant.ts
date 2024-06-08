import { PlantGenes } from './plant-genes';
import {
  FULL_CIRCLE,
  Position,
  PositionMath,
  QUARTER_CIRCLE,
} from './position';
import { RandomGenerator } from './random';

const GROWTH_TIME_SECONDS = 10;
const END_WIDTH_FACTOR = 0.5;

export type PlantSegmentType = 'root' | 'main_branch' | 'branch' | 'flower' | 'fruit';

// TODO: Maybe different types for different types of segments - trunk, branches, leaves?
export class PlantSegment {
  branches: PlantSegment[] = [];

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
  public age = 0;
  public rootSegment: PlantSegment;
  private genes: PlantGenes;

  constructor(public position: Position, private generator: RandomGenerator) {
    this.genes = PlantGenes.generateNew(generator);
    this.rootSegment = new PlantSegment(
        undefined,
      { x: 0, y: 0 },
      -QUARTER_CIRCLE,
      0,
      0,
      'root'
    );
  }

  grow(dtSeconds: number) {
    this.growSegmentsRecursively(this.rootSegment, dtSeconds, 3);
  }

  growSegmentsRecursively(
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

    const MAX_BRANCHES = 6;
    if (segment.branches.length <= MAX_BRANCHES && segment.length > 10) {
      let anchorLongitudinal = this.generator.getFloat(0.3, 1.0);
      let anchorRotation = this.generator.getFloat(
        -QUARTER_CIRCLE,
        QUARTER_CIRCLE
      );
      let type: PlantSegmentType = 'branch';

      if (maxDepth <= 1) {
        type = 'flower';
        anchorLongitudinal = 1;
      } else if (segment.branches.length === 0) {
        // Make first branch stick to top of trunk
        anchorLongitudinal = 1;
        anchorRotation /= 3;
        type = 'main_branch'
      }
      segment.branches.push(
        new PlantSegment(
            segment,
          // Start with zeroes, update position/rotation below
          { x: 0, y: 0 },
          0,
          0,
          0,
          type,
          anchorLongitudinal,
          anchorRotation
        )
      );
    }

    for (const subSegment of segment.branches) {
      subSegment.position = segment.getBranchPosition(
        subSegment.branchAnchorLongitudinal
      );
      subSegment.rotation = segment.rotation + subSegment.branchAnchorAngle;

      if (maxDepth > 0) {
        this.growSegmentsRecursively(subSegment, dtSeconds * 0.8, maxDepth - 1);
      }
    }
  }

  // TODO: Other methods of creating a plant, not just random
}
