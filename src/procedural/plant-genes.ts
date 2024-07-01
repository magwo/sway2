import { Centimeters } from '../app/common';
import { Color, getRgbDeviation } from './color';
import { ZeroOneFloat } from './hash.math';
import { RandomGenerator } from './random';

export type LeafType = 'radial_points' | 'radial_slices' | 'slices_on_stick';
export type FlowerType = 'radial_petals';
export type FruitType = '🥑' | '🍋' | '🍑' | '🍊' | '🍆' | '🍒' | '🍏' | '🍇' | '🍍' | '🥝';

export type PlantGeneData = {
  baseSize: number;
  slimness: number;
  crookedness: number;
  uniformity: number;
  balance: number;
  stiffness: number;
  branchCount: number;
  branchDepthMax: number;
  branchRoundness: number;
  leafType: LeafType;
  leafSize: Centimeters;
  leafElongation: number;
  leafSubCount: number;
  leafSubPointyness: number;
  leafDefects: number;
  flowerType: FlowerType;
  flowerSize: Centimeters;
  flowerSubCount: number;
  flowerSubPointyness: number;
  flowerSubEndWeight: number;
  flowerSpaciousness: ZeroOneFloat;
  flowerInnerRadius: ZeroOneFloat;
  flowerFrequency: number;
  fruitFrequency: number;
  fruitType: string;
  // barkColor: Color;
  // leafColor: Color;
  // flowerColor: Color;
};

export class PlantGenes {
  private constructor(public data: PlantGeneData) {}

  static generateFromPartialData(
    generator: RandomGenerator,
    knownGenes: Partial<PlantGeneData>
  ) {
    const rndGeneData = PlantGenes.createRandomGeneData(generator);
    return {...rndGeneData, ...knownGenes};
  }

  static fromKnownData(genes: PlantGeneData): PlantGenes {
    return new PlantGenes(genes);
  }

  static generateNew(generator: RandomGenerator): PlantGenes {
    return new PlantGenes(PlantGenes.createRandomGeneData(generator));
  }

  static mutate() {
    throw 'Not implemented';
  }

  private static createRandomGeneData(
    generator: RandomGenerator
  ): PlantGeneData {
    const g = generator;
    // TODO: Use branch depth 5 when reworked leaf growth logic - very small currently
    const branchDepthMax = g.getInteger(3, 4); //5
    let branchCount = g.getLinearDistribution(1.8, 6.0);//8
    // Protect against low FPS:
    if (branchDepthMax >= 5 && branchCount > 4) {
      branchCount *= 0.7;
    }
    const leafGenerator = g.getDerivedGenerator('leaf');
    const flowerGenerator = g.getDerivedGenerator('leaf');
    const fruitGenerator = g.getDerivedGenerator('leaf');
    // TODO: Synchronize leaf and flower size
    return {
      baseSize: g.getLinearDistribution(0.4, 0.8),
      slimness: g.getLinearDistribution(0.3, 1.9),
      crookedness: g.getLinearDistribution(0.05, 1.0),
      uniformity: g.getLinearDistribution(0.2, 0.99),
      balance: g.getLinearDistribution(0.6, 0.99),
      stiffness: g.getLinearDistribution(0.5, 1.0),
      branchCount: branchCount,
      branchDepthMax: branchDepthMax,
      branchRoundness: g.getLinearDistribution(-0.5, 1.0),
      leafSize: leafGenerator.getLinearDistribution(8, 15),
      leafElongation: leafGenerator.getLinearDistribution(0.1, 1.0),
      leafType: leafGenerator.selectOne(['radial_points', 'radial_slices', 'slices_on_stick']),
      leafSubCount: leafGenerator.getInteger(7, 14),
      leafSubPointyness: leafGenerator.getLinearDistribution(0.01, 1.0),
      leafDefects: leafGenerator.getLinearDistribution(0.02, 0.4),
      flowerSize: flowerGenerator.getQuadraticDistribution(4, 20),
      flowerType: flowerGenerator.selectOne(['radial_petals']),
      flowerSubCount: flowerGenerator.getInteger(5, 12),
      flowerSubPointyness: flowerGenerator.getLinearDistribution(-0.3, 0.8),
      flowerSubEndWeight: flowerGenerator.getLinearDistribution(0.5, 1.5),
      flowerSpaciousness: flowerGenerator.getLinearDistribution(-0.2, 0.5),
      flowerInnerRadius: flowerGenerator.getLinearDistribution(0.2, 0.7),
      flowerFrequency: 0,//flowerGenerator.getLinearDistribution(-0.2, 0.4),
      fruitFrequency: 0,//fruitGenerator.getLinearDistribution(-0.1, 0.4),
      fruitType: fruitGenerator.selectOne(['🥑', '🍋', '🍑', '🍊', '🍆', '🍒', '🍏', '🍇', '🍍', '🥝'])
      // barkColor: getRgbDeviation({ r: 90, g: 60, b: 20 }, 40, g),
      // leafColor: getRgbDeviation({ r: 62, g: 205, b: 4 }, 50, g),
      // flowerColor: getRgbDeviation({ r: 245, g: 221, b: 224 }, 100, g),
    };
  }
}
