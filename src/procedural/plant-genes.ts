import { Centimeters } from '../app/app';
import { Color, getRgbDeviation } from './color';
import { RandomGenerator } from './random';

export type PlantGeneData = {
  baseSize: number;
  slimness: number;
  crookedness: number;
  uniformity: number;
  balance: number;
  stiffness: number;
  branchCount: number;
  maxBranchDepth: number;
  branchRoundness: number;
  leafSize: Centimeters;
  leafElongation: number;
  leafSubCount: number;
  leafSubPointyness: number;
  flowerSize: Centimeters;
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
    // TODO: Maybe use sub generators for different aspects?
    const g = generator;
    return {
      baseSize: g.getLinearDistribution(0.4, 0.8),
      slimness: g.getLinearDistribution(0.3, 1.9),
      crookedness: g.getLinearDistribution(0.05, 1.0),
      uniformity: g.getLinearDistribution(0.2, 0.99),
      balance: g.getLinearDistribution(0.6, 0.99),
      stiffness: g.getLinearDistribution(0.5, 1.0),
      branchCount: g.getLinearDistribution(1.8, 6.0),//8
      maxBranchDepth: g.getInteger(3, 4), //5
      branchRoundness: g.getLinearDistribution(-0.5, 1.0),
      leafSize: g.getLinearDistribution(5, 15),
      leafElongation: g.getLinearDistribution(0.1, 4.0),
      leafSubCount: g.getInteger(4, 12),
      leafSubPointyness: g.getLinearDistribution(0.01, 0.9),
      flowerSize: g.getQuadraticDistribution(40, 140),
      flowerFrequency: g.getLinearDistribution(-0.1, 0.7),
      fruitFrequency: g.getLinearDistribution(-0.1, 0.4),
      fruitType: g.selectOne(['🥑', '🍋', '🍑', '🍊', '🍆', '🍒', '🍏', '🍇', '🍍', '🥝'])
      // barkColor: getRgbDeviation({ r: 90, g: 60, b: 20 }, 40, g),
      // leafColor: getRgbDeviation({ r: 62, g: 205, b: 4 }, 50, g),
      // flowerColor: getRgbDeviation({ r: 245, g: 221, b: 224 }, 100, g),
    };
  }
}
