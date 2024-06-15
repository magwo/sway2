import { ZeroOneFloat, getCyrb128Seed, getInteger32, getSeedArray, simpleFastCounter32 } from "./hash.math";

export class RandomGenerator {
  public get: () => ZeroOneFloat;

  public getBool() {
    return this.get() > 0.5 ? true : false;
  }

  public getFloat(min: number, max: number): number {
    return min + (max - min) * this.get();
  }

  public getInteger(minInclusive = 0, maxInclusive = Number.MAX_SAFE_INTEGER - 1): number {
    const num = this.get();
    return Math.floor(minInclusive + ((maxInclusive + 1) - minInclusive) * num);
  }

  public getQuadraticDistribution(min: number, max: number) {
    const rnd: ZeroOneFloat = this.get();
    return min + (max - min) * rnd * Math.abs(rnd);
  }

  public getLinearDistribution(min: number, max: number) {
    return this.getFloat(min, max);
  }

  public selectOne<T>(items: T[]): T {
    const index = this.getInteger(0, items.length - 1);
    return items[index];
  }

  public getInteger32(): number {
    return getInteger32(this.get());
  }

  /**
   * @returns A new generator derived from the parent seed and order number. The same parent seed and order number will yield identical derived generators.
   */
  public getDerivedGenerator(order: number) {
    return new RandomGenerator(`${this.seedString}_${order}`);
  }

  constructor(public readonly seedString: string) {
    const seed = getCyrb128Seed(seedString);
    this.get = simpleFastCounter32(...seed);
  }
}
