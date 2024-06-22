import { PlantSegment, PlantSegmentType } from './plant';
import { PlantGeneData } from './plant-genes';
import {
  EIGTH_CIRCLE,
  HALF_CIRCLE,
  QUARTER_CIRCLE,
  SIXTEENTH_CIRCLE,
} from './position';
import { RandomGenerator } from './random';

function getBranchRotation(
  branchNumber: number,
  startSideMultiplier: number,
  generator: RandomGenerator,
  genes: PlantGeneData
): number {
  const uniformity = genes.uniformity;
  const balance = genes.balance;
  // TODO: Don't always start on the same side - it causes unintentional similarity
  let evenOddMultiplier = branchNumber % 2 === 0 ? -1 : 1;
  evenOddMultiplier *= startSideMultiplier;
  if (balance < generator.get()) {
    // Balance failed - switch side
    // console.log('Balance failed');
    evenOddMultiplier *= generator.getBool() ? -1 : 1;
  }

  const minRot = SIXTEENTH_CIRCLE;
  const maxRot = Math.max(
    minRot,
    SIXTEENTH_CIRCLE,
    HALF_CIRCLE / (branchNumber + 1)
  );
  const rotation = generator.getFloat(
    minRot * evenOddMultiplier,
    maxRot * evenOddMultiplier
  );
  return rotation;
}

function selectLeafType(genes: PlantGeneData, generator: RandomGenerator): 'leaf' | 'flower' | 'fruit' {
  // TODO: More statistically correct distribution - this is naive
  if (generator.get() < genes.flowerFrequency) {
   return 'flower'; 
  } else if(generator.get() < genes.fruitFrequency) {
    return 'fruit';
  }
  return 'leaf';
}

export function placeBranches(
  segment: PlantSegment,
  generator: RandomGenerator,
  genes: PlantGeneData,
  branchDepth: number
) {
    const isAtDeepestDepth = branchDepth === genes.maxBranchDepth;
  const branchCount = isAtDeepestDepth ? 5 : Math.round(
    generator.getFloat(genes.branchCount - 0.5, genes.branchCount + 0.5)
  );

  const startSideMultiplier = generator.getBool() ? -1 : 1;
  const startLongitudinal = 0.2;
  const distanceLongitudinal = 1.0 - startLongitudinal;

  let anchorLongitudinal: number,
    anchorRotation: number,
    type: PlantSegmentType;
  for (let i = 0; i < branchCount; i++) {
    const factor = i / branchCount;
    const halfStepSize = 0.5 / branchCount;

    if (branchDepth === genes.maxBranchDepth) {
      if (i === 0) {
        type = 'leaf';
        anchorLongitudinal = 1;
      } else {
        type = selectLeafType(genes, generator);
        anchorLongitudinal =
        0.2 +
        distanceLongitudinal * factor +
        (1 - genes.uniformity) *
          generator.getFloat(-halfStepSize, halfStepSize);
      }
      anchorRotation = 0;//generator.getFloat(-EIGTH_CIRCLE, +EIGTH_CIRCLE);
    } else if (i === 0) {
      // Make first branch stick to top of trunk, with limited rotation
      anchorLongitudinal = 1;
      anchorRotation =
        genes.crookedness * generator.getFloat(-EIGTH_CIRCLE, +EIGTH_CIRCLE);
      type = 'main_branch';
    } else {
      anchorLongitudinal =
        startLongitudinal +
        distanceLongitudinal * factor +
        (1 - genes.uniformity) *
          generator.getFloat(-halfStepSize, halfStepSize);
      anchorRotation = getBranchRotation(
        i,
        startSideMultiplier,
        generator,
        genes
      );
      type = 'branch';
    }

    // TODO: Flower/fruit/leaf support
    //   if (maxDepth <= 1) {

    // console.log('Long', anchorLongitudinal, 'Rotation', anchorRotation);

    const density = generator.getFloat(0.9, 1.1);
    segment.branches.push(
      new PlantSegment(
        segment,
        // Start with zeroes, update position/rotation later
        { x: 0, y: 0 },
        0,
        0,
        0,
        type,
        anchorLongitudinal,
        anchorRotation,
        density,
      )
    );
  }
}
