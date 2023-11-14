export function randFloat (min: number, max: number) {
  return Math.random() * (max - min) + min;
}


/**
 * @function clamp
 * @param {Number} v the value to clamp
 * @param {Number} min the minimum value
 * @param {Number} max the maxmimum value
 *
 * clamps a value between a minimum & maximum value
 */
export function clamp(v: number, min: number, max: number) {
  if (v < min) return min;
  if (v > max) return max;
  return v;
}