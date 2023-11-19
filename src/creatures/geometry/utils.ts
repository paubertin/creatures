const tau = Math.PI * 2;
const EPSILON = 1e-6;

const _lut: string[] = [];

for (let i = 0; i < 256; i++) {
  _lut[i] = (i < 16 ? '0' : '') + (i).toString(16);
}

let _seed = 1234567;

const DEG2RAD = Math.PI / 180;

const RAD2DEG = 180 / Math.PI;

function abs(val: number) { return Math.abs(val); }

function deg(rad: number) { return rad * RAD2DEG; }

function rad(deg: number) { return deg * DEG2RAD; }

function allAreFinite(args: unknown[]) {
  return !args.some((arg) => arg !== undefined && !Number.isFinite(arg));
}

function almostEqual(floata: number, floatb: number) {
  return abs(floata - floatb) < EPSILON;
}

const currentPathSymbol = Symbol('currentPath');
const internalPathDataSymbol = Symbol('pathData');

// DOMMatrix.fromMatrix() will validate and fixup the dict
// By extracting only the 2D properties we actually end up with
// a validate and fixup 2D dict.
// The error message will say fromMatrix instead of addPath, but that's ok.
function createDOMMatrixFrom2DInit(val?: DOMMatrix2DInit) {
  if (!val || typeof val !== 'object') {
    return new DOMMatrix();
  }
  const {
    a, b, c, d, e, f,
    m11, m12, m21, m22, m41, m42
  } = val;
  const dict2D = {
    is2D: true,
    a, b, c, d, e, f,
    m11, m12, m21, m22, m41, m42
  };
  return DOMMatrix.fromMatrix(dict2D);
}

function isValid2DDOMMatrix(mat: DOMMatrix) {
  return (['m11', 'm12', 'm21', 'm22', 'm41', 'm42'] as (keyof DOMMatrix)[])
    .every((key) => Number.isFinite(mat[key]));
}

function clamp (value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

/**
 * https://en.wikipedia.org/wiki/Linear_interpolation
 */
function lerp (x: number, y: number, t: number) {
  return (1 - t) * x + t * y;
}

/**
 * https://en.wikipedia.org/wiki/Modulo_operation
 */
function euclideanModulo (n: number, m: number) {
  return ((n % m) + m) % m;
}

export {
  tau,
  abs,
  deg,
  rad,
  EPSILON,
  allAreFinite,
  almostEqual,
  currentPathSymbol,
  internalPathDataSymbol,
  createDOMMatrixFrom2DInit,
  isValid2DDOMMatrix,
  
  clamp,
  lerp,
  euclideanModulo,
};
