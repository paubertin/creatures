export class MTRand {
  /**
   * length of state vector
   */
  private readonly N = 624;
  /**
   * period parameter
   */
  private readonly M = 397;
  /**
   * constant vector a
   */
  private readonly MATRIX_A = 0x9908b0df;
  /**
   * most significant w-r bits
   */
  private readonly UPPER_MASK = 0x80000000;
  /**
   * least significant r bits
   */
  private readonly LOWER_MASK = 0x7fffffff;

  /**
   * internal state
   */
  private state: Array<number> = new Array<number>(this.N);

  private cursor: number = this.N + 1;

  public constructor();
  public constructor(seed: number);
  public constructor(initKey: number[], keyLength: number);
  public constructor(seed?: number | number[], keyLength?: number) {
    if (seed === undefined) {
      seed = new Date().getTime();
    }
    if (typeof seed === 'number') {
      this._init(seed);
    }
    else {
      this._initByArray(seed, keyLength!);
    }
  }

  private _init(s: number) {
    this.state[0] = s >>> 0;
    for (this.cursor = 1; this.cursor < this.N; this.cursor++) {
      const s = this.state[this.cursor - 1] ^ (this.state[this.cursor - 1] >>> 30);
      this.state[this.cursor] =
        ((((s & 0xffff0000) >>> 16) * 1812433253) << 16) +
        (s & 0x0000ffff) * 1812433253 +
        this.cursor;
      /* See Knuth TAOCP Vol2. 3rd Ed. P.106 for multiplier. */
      /* In the previous versions, MSBs of the seed affect   */
      /* only MSBs of the array mt[].                        */
      /* 2002/01/09 modified by Makoto Matsumoto             */
      this.state[this.cursor] >>>= 0;
      /* for >32 bit machines */
    }
  }

  private _initByArray(initKey: number[], keyLength: number) {
    let i = 1;
    let j = 0;
    let k = this.N > keyLength ? this.N : keyLength;
    this._init(19650218);
    for (; k; k--) {
      const s = this.state[i - 1] ^ (this.state[i - 1] >>> 30);
      this.state[i] =
        (this.state[i] ^
          (((((s & 0xffff0000) >>> 16) * 1664525) << 16) +
            (s & 0x0000ffff) * 1664525)) +
        initKey[j] +
        j; /* non linear */
      this.state[i] >>>= 0; /* for WORDSIZE > 32 machines */
      i++;
      j++;
      if (i >= this.N) {
        this.state[0] = this.state[this.N - 1];
        i = 1;
      }
      if (j >= keyLength) j = 0;
    }
    for (k = this.N - 1; k; k--) {
      const s = this.state[i - 1] ^ (this.state[i - 1] >>> 30);
      this.state[i] =
        (this.state[i] ^
          (((((s & 0xffff0000) >>> 16) * 1566083941) << 16) +
            (s & 0x0000ffff) * 1566083941)) -
        i; /* non linear */
      this.state[i] >>>= 0; /* for WORDSIZE > 32 machines */
      i++;
      if (i >= this.N) {
        this.state[0] = this.state[this.N - 1];
        i = 1;
      }
    }

    this.state[0] = 0x80000000; /* MSB is 1; assuring non-zero initial array */
  }

  /**
   * Generates a random integer in [0 , 2^32-1]
   */
  public randInt(): number;
  /**
  * Generates a random integer in [0 , n] for n < 2^32
  */
  public randInt(n: number): number;
  public randInt(n?: number) {
    if (n === undefined) {
      let y;
      const mag01 = [0x0, this.MATRIX_A];
      /* mag01[x] = x * MATRIX_A  for x=0,1 */

      if (this.cursor >= this.N) {
        /* generate N words at one time */
        let kk;

        if (this.cursor === this.N + 1)
          /* if init_genrand() has not been called, */
          this._init(5489); /* a default initial seed is used */

        for (kk = 0; kk < this.N - this.M; kk++) {
          y =
            (this.state[kk] & this.UPPER_MASK) | (this.state[kk + 1] & this.LOWER_MASK);
          this.state[kk] = this.state[kk + this.M] ^ (y >>> 1) ^ mag01[y & 0x1];
        }
        for (; kk < this.N - 1; kk++) {
          y =
            (this.state[kk] & this.UPPER_MASK) | (this.state[kk + 1] & this.LOWER_MASK);
          this.state[kk] =
            this.state[kk + (this.M - this.N)] ^ (y >>> 1) ^ mag01[y & 0x1];
        }
        y =
          (this.state[this.N - 1] & this.UPPER_MASK) |
          (this.state[0] & this.LOWER_MASK);
        this.state[this.N - 1] = this.state[this.M - 1] ^ (y >>> 1) ^ mag01[y & 0x1];

        this.cursor = 0;
      }

      y = this.state[this.cursor++];

      /* Tempering */
      y ^= y >>> 11;
      y ^= (y << 7) & 0x9d2c5680;
      y ^= (y << 15) & 0xefc60000;
      y ^= y >>> 18;

      return y >>> 0;
    }
    else {
      let used = n;
      used |= used >> 1;
      used |= used >> 2;
      used |= used >> 4;
      used |= used >> 8;
      used |= used >> 16;

      let i: number;
      do {
        i = this.randInt() & used;
      } while (i > n);
      return i;
    }
  }

  /**
   * Generates a random real number in [0 , 1]
   */
  public rand(): number;
  /**
   * Generates a random real number in [0 , n]
   */
  public rand(n: number): number;
  public rand(n?: number) {
    return this.randInt() * ((n ?? 1) / 4294967295.0);
  }

  /**
   * Generates a random real number in [0 , 1)
   */
  public randExc(): number;
  /**
   * Generates a random real number in [0 , n)
   */
  public randExc(n: number): number;
  public randExc(n?: number) {
    return this.randInt() * ((n ?? 1) / 4294967296.0);
  }

  /**
   * Generates a random real number in (0 , 1)
   */
  public randDblExc(): number;
  /**
   * Generates a random real number in [0 , n)
   */
  public randDblExc(n: number): number;
  public randDblExc(n?: number) {
    return (this.randInt() + 0.5) * ((n ?? 1) / 4294967296.0);
  }

  /**
   * Generates a random number on [0,1) with 53-bit resolution
   */
  public rand53(): number {
    const a = this.randInt() >>> 5;
    const b = this.randInt() >>> 6;
    return (a * 67108864.0 + b) * (1.0 / 9007199254740992.0);
  }

  public benchmark (n = 1000) {
    console.time(`${n} random integers`);
    for (let i = 0; i < n; ++i) {
      this.randInt();
    }
    console.timeEnd(`${n} random integers`);
    console.time(`${n} random 53-bit`);
    for (let i = 0; i < n; ++i) {
      this.rand53();
    }
    console.timeEnd(`${n} random 53-bit`);
  }
}

export class MersenneTwister {
  private cursor: number = 1;
  private readonly N = 624;
  private state = new Uint32Array(this.N);

  public constructor(seed: number | Uint32Array = new Date().getTime()) {
    if (typeof seed === 'number') {
      this.state[0] = seed;
      while (this.cursor < this.N) {
        seed = this.state[this.cursor - 1]! ^ (this.state[this.cursor - 1]! >>> 30);
        // ↑
        // ╰— reuse seed to store the s value
        //                            ╭————————————————————————————————————┬— this is s
        //                            ↓                                    ↓
        this.state[this.cursor] = (((seed >>> 16) * 1812433253) << 16) + (seed & 0xffff) * 1812433253 + this.cursor++;
        // See Knuth TAOCP Vol2. 3rd Ed. P.106 for multiplier.
        // In the previous versions, MSBs of the seed affect
        // only MSBs of the array mt[].
        // 2002/01/09 modified by Makoto Matsumoto
      }
    }
    else {
      this.cursor = seed[0];
      this.state.set(seed.slice(1));
    }
  }

  private next (mt: Uint32Array, i: number, j: number, k: number) {
    //            ╭— most significant w-r bits
    //            |                       ╭— least significant r bits
    //            ↓                       ↓
    j = (mt[i]! & 0x80000000) | (mt[j]! & 0x7fffffff);
    // ↑
    // ╰— reuse j to store the y value
    //                ╭—————————————┬— this is y
    //                |             |          ╭— constant vector a
    //                ↓             ↓          ↓
    mt[i] = mt[k]! ^ (j >>> 1) ^ (-(j & 0x1) & 0x9908b0df);
    //                           ↑                       ↑
    //                           ╰———————————————————————┴— instead of multiplication or array access, we’ll use a mask
};

  private twist (mt: Uint32Array) {
    // generate N words at one time
    let i = 0;

    while (i < 227) this.next(mt, i++, i, i + 396);
    while (i < 623) this.next(mt, i++, i, i - 228);

    this.next(mt, 623, 0, 396);
  }

  /**
   * Random 32-bit unsigned integer.
   */
  public u32(): number {
    if (this.cursor >= 624) {
      this.twist(this.state);
      this.cursor = 0;
    }

    let y = this.state[this.cursor++]!;

    /* Tempering */
    y ^= y >>> 11;
    y ^= (y << 7) & 0x9d2c5680;
    y ^= (y << 15) & 0xefc60000;
    y ^= y >>> 18;

    return y >>> 0;
  }

  /**
   * Generates a random integer in [0 , 2^32-1]
   */
  public randInt(): number;
  /**
  * Generates a random integer in [0 , n] for n < 2^32
  */
  public randInt(n: number): number;
  public randInt(n?: number) {
    if (n === undefined) {
      return this.u32();
    }
    else {
      let used = n;
      used |= used >> 1;
      used |= used >> 2;
      used |= used >> 4;
      used |= used >> 8;
      used |= used >> 16;

      let i: number;
      do {
        i = this.randInt() & used;
      } while (i > n);
      return i;
    }
  }

  /**
   * Random [0, 1] float with single precision.
   */
  public f32_ii(): number { // Random [0, 1] float with single precision.
    return this.u32() / 0x0_ffff_ffff;
  }

  /**
   * Random [0, 1) float with single precision.
   */
  public f32_ix(): number {
    return this.u32() / 0x1_0000_0000;
  }

  /**
   * Random (0, 1) float with single precision.
   */
  public f32_xx(): number {
    return (this.u32() + 0.5) / 0x1_0000_0000;
  }

  /**
   * Random 53-bit unsigned integer.
   */
  public u53(): number {
    return (this.u32() >>> 5) * 67108864 + (this.u32() >>> 6);
  }

  /**
   * Random [0, 1) float with double precision.
   */
  public f64_ix(): number {
    return this.u53() / 0x20_0000_0000_0000;
  }

  /**
   * nonuniform random number distributions
   */
  public randNorm (mean: number, variance: number): number {
    // Return a real number from a normal (Gaussian) distribution with given
    // mean and variance by Box-Muller method
    const r = Math.sqrt( -2.0 * Math.log( 1.0 - this.f32_xx()) ) * variance;
    const phi = 2.0 * Math.PI * this.f32_ix();
    return mean + r * Math.cos(phi);
  }

  /**
   * Export the state.
   */
  public save(): Uint32Array {
    let dump = new Uint32Array(625);

    dump[0] = this.cursor;
    dump.set(this.state, 1);

    return dump;
  }

  public benchmark (n = 1000) {
    console.time(`${n} random numbers`);
    for (let i = 0; i < n; ++i) {
      this.f32_ii();
    }
    console.timeEnd(`${n} random numbers`);
  }
}
