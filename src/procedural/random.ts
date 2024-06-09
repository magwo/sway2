function simpleFastCounter32(
  a: number,
  b: number,
  c: number,
  d: number
): () => ZeroOneFloat {
  // This is a pseudo random number generator using a 128-bit seed (4 integer numbers)
  return function () {
    a |= 0;
    b |= 0;
    c |= 0;
    d |= 0;
    let t = (((a + b) | 0) + d) | 0;
    d = (d + 1) | 0;
    a = b ^ (b >>> 9);
    b = (c + (c << 3)) | 0;
    c = (c << 21) | (c >>> 11);
    c = (c + t) | 0;
    return (t >>> 0) / 4294967296;
  };
}

// FROM SOURCE: https://stackoverflow.com/questions/521295/seeding-the-random-number-generator-in-javascript
//   const seedgen = () => (Math.random()*2**32)>>>0;
//   const getRand = simpleFastCounter32(seedgen(), seedgen(), seedgen(), seedgen());
//   for(let i=0; i<10; i++) console.log(getRand());

export type Seed = [number, number, number, number];
export type ZeroOneFloat = number;

function getInteger32(n: ZeroOneFloat) {
  return (n * 2 ** 32) >>> 0;
}

function getSeedArray(rnd: () => ZeroOneFloat): Seed {
  return [
    getInteger32(rnd()),
    getInteger32(rnd()),
    getInteger32(rnd()),
    getInteger32(rnd()),
  ];
}

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
    const seed = this.seed;
    const seeder = simpleFastCounter32(...seed);
    // Step the seeder at least once
    for (let i = 0; i < order + 1; i++) {
      seeder();
    }
    return new RandomGenerator(getSeedArray(seeder));
  }

  constructor(public readonly seed: Seed) {
    if (seed.length !== 4) {
      throw 'Incorrect seed size';
    }
    this.get = simpleFastCounter32(...seed);
  }
}
