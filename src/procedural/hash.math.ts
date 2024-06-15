
// FROM SOURCE: https://stackoverflow.com/questions/521295/seeding-the-random-number-generator-in-javascript
//   const seedgen = () => (Math.random()*2**32)>>>0;
//   const getRand = simpleFastCounter32(seedgen(), seedgen(), seedgen(), seedgen());
//   for(let i=0; i<10; i++) console.log(getRand());

export type Seed = [number, number, number, number];
export type ZeroOneFloat = number;

export function getInteger32(n: ZeroOneFloat) {
  return (n * 2 ** 32) >>> 0;
}

export function getSeedArray(rnd: () => ZeroOneFloat): Seed {
  return [
    getInteger32(rnd()),
    getInteger32(rnd()),
    getInteger32(rnd()),
    getInteger32(rnd()),
  ];
}


export function getCyrb128Seed(str: string): Seed {
  let h1 = 1779033703, h2 = 3144134277,
      h3 = 1013904242, h4 = 2773480762;
  for (let i = 0, k; i < str.length; i++) {
      k = str.charCodeAt(i);
      h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
      h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
      h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
      h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
  }
  h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
  h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
  h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
  h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
  h1 ^= (h2 ^ h3 ^ h4), h2 ^= h1, h3 ^= h1, h4 ^= h1;
  return [h1>>>0, h2>>>0, h3>>>0, h4>>>0];
}
// Side note: Only designed & tested for seed generation,
// may be suboptimal as a general 128-bit hash.

export function simpleFastCounter32(
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
