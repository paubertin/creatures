import { MTRand } from './rand';

const mt = new MTRand();

export function sigmoid(num: Number) {
  return 1 / 1 + Math.exp(-num);
}

export function normal(opts?: { mean?: number; dev?: number; pool?: number[] }) {
  const options = {
    mean: opts?.mean ?? 0,
    dev: opts?.dev ?? 1,
    pool: opts?.pool ?? [],
  }

  // If a pool has been passed, then we are returning an item from that pool,
  // using the normal distribution settings that were passed in
  if (options.pool.length > 0) {
    return normalPool(options);
  }

  // The Marsaglia Polar method
  let s: number;
  let u: number;
  let v: number;
  let norm: number;
  let mean = options.mean;
  let dev = options.dev;

  do {
    // U and V are from the uniform distribution on (-1, 1)
    u = mt.randExc() * 2 - 1;
    v = mt.randExc() * 2 - 1;

    s = u * u + v * v;
  } while (s >= 1);

  // Compute the standard normal variate
  norm = u * Math.sqrt(-2 * Math.log(s) / s);

  // Shape and scale
  return dev * norm + mean;
}

export function normalPool(options: { mean: number; dev: number; pool: number[] }) {
  let performanceCounter = 0;
  do {
    const idx = Math.round(normal({ mean: options.mean, dev: options.dev }));
    if (idx < options.pool.length && idx >= 0) {
      return options.pool[idx];
    }
    else {
      performanceCounter++;
    }
  } while (performanceCounter < 100);

  throw new RangeError("Chance: Your pool is too small for the given mean and standard deviation. Please adjust.");
};

export function bimodalNormal() {
  return (Math.random() < 0.5 ? 0 : 1) + normal();
};

export function bimodalValueMix(lhs: number, rhs: number) {
  const p = bimodalNormal();
  return p * lhs + (1 - p) * rhs;
};