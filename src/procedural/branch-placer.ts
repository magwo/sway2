import { PlantSegment, PlantSegmentType } from './plant';
import { PlantGeneData } from './plant-genes';
import { QUARTER_CIRCLE } from './position';
import { RandomGenerator } from './random';

const GOLDEN_RATIO_FACTOR = 0.6180469716;

export function placeBranches(
  segment: PlantSegment,
  generator: RandomGenerator,
  genes: PlantGeneData,
) {
  const branchCount = Math.round(
    generator.getFloat(genes.branchCount - 0.5, genes.branchCount + 0.5)
  );

  while (segment.branches.length <= branchCount) {
    let anchorLongitudinal = generator.getFloat(GOLDEN_RATIO_FACTOR - 0.2, 1.0);
    let anchorRotation = generator.getFloat(-QUARTER_CIRCLE, QUARTER_CIRCLE);
    let type: PlantSegmentType = 'branch';

    // TODO: Flower/fruit/leaf support
    //   if (maxDepth <= 1) {
    //     type = 'flower';
    //     anchorLongitudinal = 1;

    if (segment.branches.length === 0) {
      // Make first branch stick to top of trunk
      anchorLongitudinal = 1;
      anchorRotation /= 3;
      type = 'main_branch';
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
}
