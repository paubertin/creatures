import type { Matrix3 } from './mat3';

export class Vector2 {
  public readonly isVector2 = true;

  private _values = new Float32Array(2);

  public constructor(x = 0, y = 0) {
    this._values[0] = x;
    this._values[1] = y;
  }

  public get values () {
    return this._values;
  }

  public get x () {
    return this._values[0];
  }

  public set x (value: number) {
    this._values[0] = value;
  }

  public get y () {
    return this._values[1];
  }

  public set y (value: number) {
    this._values[1] = value;
  }

  public set(x: number, y: number) {
    this.x = x;
    this.y = y;

    return this;
  }

  public setScalar(scalar: number) {
    this.x = scalar;
    this.y = scalar;

    return this;
  }

  public clone() {
    return new Vector2(this.x, this.y);
  }

  public copy(v: Vector2) {
    this.x = v.x;
    this.y = v.y;

    return this;
  }

  public add(v: Vector2) {
    this.x += v.x;
    this.y += v.y;

    return this;
  }

  public addScalar(s: number) {
    this.x += s;
    this.y += s;

    return this;
  }

  public sub(v: Vector2) {
    this.x -= v.x;
    this.y -= v.y;

    return this;
  }

  public subScalar(s: number) {
    this.x -= s;
    this.y -= s;

    return this;
  }

  public multiply(v: Vector2) {
    this.x *= v.x;
    this.y *= v.y;

    return this;
  }

  public multiplyScalar(scalar: number) {
    this.x *= scalar;
    this.y *= scalar;

    return this;
  }

  public divide(v: Vector2) {
    if (v.x === 0 || v.y === 0) {
      throw new Error('Division by 0');
    }
    this.x /= v.x;
    this.y /= v.y;

    return this;
  }

  public divideScalar(scalar: number) {
    return this.multiplyScalar(1 / scalar);
  }

  public applyMatrix3(m: Matrix3) {
    const { x, y } = this;

    const e = m.values;

    this.x = e[0] * x + e[3] * y + e[6];
    this.y = e[1] * x + e[4] * y + e[7];

    return this;
  }

  public min(v: Vector2) {
    this.x = Math.min(this.x, v.x);
    this.y = Math.min(this.y, v.y);

    return this;
  }

  public max(v: Vector2) {
    this.x = Math.max(this.x, v.x);
    this.y = Math.max(this.y, v.y);

    return this;
  }

  public clamp(min: Vector2, max: Vector2) {
    // assumes min < max, componentwise

    this.x = Math.max(min.x, Math.min(max.x, this.x));
    this.y = Math.max(min.y, Math.min(max.y, this.y));

    return this;
  }

  public clampScalar(minVal: number, maxVal: number) {
    this.x = Math.max(minVal, Math.min(maxVal, this.x));
    this.y = Math.max(minVal, Math.min(maxVal, this.y));

    return this;
  }

  public clampLength(min: number, max: number) {
    const length = this.length;

    return this.divideScalar(length || 1).multiplyScalar(Math.max(min, Math.min(max, length)));
  }

  public floor() {
    this.x = Math.floor(this.x);
    this.y = Math.floor(this.y);

    return this;
  }

  public ceil() {
    this.x = Math.ceil(this.x);
    this.y = Math.ceil(this.y);

    return this;
  }

  public round() {
    this.x = Math.round(this.x);
    this.y = Math.round(this.y);

    return this;
  }

  public roundToZero() {
    this.x = (this.x < 0) ? Math.ceil(this.x) : Math.floor(this.x);
    this.y = (this.y < 0) ? Math.ceil(this.y) : Math.floor(this.y);

    return this;
  }

  public negate() {
    this.x = -this.x;
    this.y = -this.y;

    return this;
  }

  public dot(v: Vector2) {
    return this.x * v.x + this.y * v.y;
  }

  public cross(v: Vector2) {
    return this.x * v.y - this.y * v.x;
  }

  public get lengthSq() {
    return this.x * this.x + this.y * this.y;
  }

  public get length() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  public manhattanLength() {
    return Math.abs(this.x) + Math.abs(this.y);
  }

  public normalize() {
    return this.divideScalar(this.length || 1);
  }

  public get heading () {
    // computes the angle in radians with respect to the positive x-axis

    const angle = Math.atan2(-this.y, -this.x) + Math.PI;

    return angle;
  }

  public distanceTo(v: Vector2) {
    return Math.sqrt(this.distanceToSquared(v));
  }

  public distanceToSquared(v: Vector2) {
    const dx = this.x - v.x; const
      dy = this.y - v.y;
    return dx * dx + dy * dy;
  }

  public manhattanDistanceTo(v: Vector2) {
    return Math.abs(this.x - v.x) + Math.abs(this.y - v.y);
  }

  public setLength(length: number) {
    return this.normalize().multiplyScalar(length);
  }

  public lerp(v: Vector2, alpha: number) {
    this.x += (v.x - this.x) * alpha;
    this.y += (v.y - this.y) * alpha;

    return this;
  }

  public lerpVectors(v1: Vector2, v2: Vector2, alpha: number) {
    this.x = v1.x + (v2.x - v1.x) * alpha;
    this.y = v1.y + (v2.y - v1.y) * alpha;

    return this;
  }

  public equals(v: Vector2) {
    return ((v.x === this.x) && (v.y === this.y));
  }

  public fromArray(array: Float32Array, offset = 0) {
    this.x = array[offset];
    this.y = array[offset + 1];

    return this;
  }

  public toArray(array: Float32Array = new Float32Array(2), offset = 0) {
    array[offset] = this.x;
    array[offset + 1] = this.y;

    return array;
  }

  public rotateAround(center: Vector2, angle: number) {
    const c = Math.cos(angle); const
      s = Math.sin(angle);

    const x = this.x - center.x;
    const y = this.y - center.y;

    this.x = x * c - y * s + center.x;
    this.y = x * s + y * c + center.y;

    return this;
  }

  public random() {
    this.x = Math.random();
    this.y = Math.random();

    return this;
  }
}