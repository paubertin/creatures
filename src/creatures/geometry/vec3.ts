import { clamp } from './utils';
import { Quaternion } from './quaternion';
import type { Euler } from './euler';
import type { Matrix3 } from './mat3';
import type { Matrix4 } from './mat4';
import type { Spherical } from './spherical';
import type { Cylindrical } from './cylindrical';


export class Vector3 {
  public readonly isVector3 = true;

  private _values = new Float32Array(2);

  constructor(x = 0, y = 0, z = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
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

  public get z () {
    return this._values[2];
  }

  public set z (value: number) {
    this._values[2] = value;
  }

  public set(x: number, y: number, z?: number) {
    if (z === undefined) z = this.z; // sprite.scale.set(x,y)

    this.x = x;
    this.y = y;
    this.z = z;

    return this;
  }

  public setScalar(scalar: number) {
    this.x = scalar;
    this.y = scalar;
    this.z = scalar;

    return this;
  }

  public clone() {
    return new Vector3(this.x, this.y, this.z);
  }

  public copy(v: Vector3) {
    this.x = v.x;
    this.y = v.y;
    this.z = v.z;

    return this;
  }

  public add(v: Vector3) {
    this.x += v.x;
    this.y += v.y;
    this.z += v.z;

    return this;
  }

  public addScalar(s: number) {
    this.x += s;
    this.y += s;
    this.z += s;

    return this;
  }

  public addVectors(a: Vector3, b: Vector3) {
    this.x = a.x + b.x;
    this.y = a.y + b.y;
    this.z = a.z + b.z;

    return this;
  }

  public addScaledVector(v: Vector3, s: number) {
    this.x += v.x * s;
    this.y += v.y * s;
    this.z += v.z * s;

    return this;
  }

  public sub(v: Vector3) {
    this.x -= v.x;
    this.y -= v.y;
    this.z -= v.z;

    return this;
  }

  public subScalar(s: number) {
    this.x -= s;
    this.y -= s;
    this.z -= s;

    return this;
  }

  public subVectors(a: Vector3, b: Vector3) {
    this.x = a.x - b.x;
    this.y = a.y - b.y;
    this.z = a.z - b.z;

    return this;
  }

  public multiply(v: Vector3) {
    this.x *= v.x;
    this.y *= v.y;
    this.z *= v.z;

    return this;
  }

  public multiplyScalar(scalar: number) {
    this.x *= scalar;
    this.y *= scalar;
    this.z *= scalar;

    return this;
  }

  public multiplyVectors(a: Vector3, b: Vector3) {
    this.x = a.x * b.x;
    this.y = a.y * b.y;
    this.z = a.z * b.z;

    return this;
  }

  public applyEuler(euler: Euler) {
    return this.applyQuaternion(_quaternion.setFromEuler(euler));
  }

  public applyAxisAngle(axis: Vector3, angle: number) {
    return this.applyQuaternion(_quaternion.setFromAxisAngle(axis, angle));
  }

  public applyMatrix3(m: Matrix3) {
    const { x, y, z } = this;
    const e = m.values;

    this.x = e[0] * x + e[3] * y + e[6] * z;
    this.y = e[1] * x + e[4] * y + e[7] * z;
    this.z = e[2] * x + e[5] * y + e[8] * z;

    return this;
  }

  public applyNormalMatrix(m: Matrix3) {
    return this.applyMatrix3(m).normalize();
  }

  public applyMatrix4(m: Matrix4) {
    const { x, y, z } = this;
    const e = m.values;

    const w = 1 / (e[3] * x + e[7] * y + e[11] * z + e[15]);

    this.x = (e[0] * x + e[4] * y + e[8] * z + e[12]) * w;
    this.y = (e[1] * x + e[5] * y + e[9] * z + e[13]) * w;
    this.z = (e[2] * x + e[6] * y + e[10] * z + e[14]) * w;

    return this;
  }

  public applyQuaternion(q: Quaternion) {
    const { x, y, z } = this;
    const qx = q.x;
    const qy = q.y;
    const qz = q.z;
    const qw = q.w;

    // calculate quat * vector

    const ix = qw * x + qy * z - qz * y;
    const iy = qw * y + qz * x - qx * z;
    const iz = qw * z + qx * y - qy * x;
    const iw = -qx * x - qy * y - qz * z;

    // calculate result * inverse quat

    this.x = ix * qw + iw * -qx + iy * -qz - iz * -qy;
    this.y = iy * qw + iw * -qy + iz * -qx - ix * -qz;
    this.z = iz * qw + iw * -qz + ix * -qy - iy * -qx;

    return this;
  }

  public transformDirection(m: Matrix4) {
    // input: THREE.Matrix4 affine matrix
    // vector interpreted as a direction

    const { x, y, z } = this;
    const e = m.values;

    this.x = e[0] * x + e[4] * y + e[8] * z;
    this.y = e[1] * x + e[5] * y + e[9] * z;
    this.z = e[2] * x + e[6] * y + e[10] * z;

    return this.normalize();
  }

  public divide(v: Vector3) {
    this.x /= v.x;
    this.y /= v.y;
    this.z /= v.z;

    return this;
  }

  public divideScalar(scalar: number) {
    return this.multiplyScalar(1 / scalar);
  }

  public min(v: Vector3) {
    this.x = Math.min(this.x, v.x);
    this.y = Math.min(this.y, v.y);
    this.z = Math.min(this.z, v.z);

    return this;
  }

  public max(v: Vector3) {
    this.x = Math.max(this.x, v.x);
    this.y = Math.max(this.y, v.y);
    this.z = Math.max(this.z, v.z);

    return this;
  }

  public clamp(min: Vector3, max: Vector3) {
    // assumes min < max, componentwise

    this.x = Math.max(min.x, Math.min(max.x, this.x));
    this.y = Math.max(min.y, Math.min(max.y, this.y));
    this.z = Math.max(min.z, Math.min(max.z, this.z));

    return this;
  }

  public clampScalar(minVal: number, maxVal: number) {
    this.x = Math.max(minVal, Math.min(maxVal, this.x));
    this.y = Math.max(minVal, Math.min(maxVal, this.y));
    this.z = Math.max(minVal, Math.min(maxVal, this.z));

    return this;
  }

  public clampLength(min: number, max: number) {
    const length = this.length;

    return this.divideScalar(length || 1).multiplyScalar(Math.max(min, Math.min(max, length)));
  }

  public floor() {
    this.x = Math.floor(this.x);
    this.y = Math.floor(this.y);
    this.z = Math.floor(this.z);

    return this;
  }

  public ceil() {
    this.x = Math.ceil(this.x);
    this.y = Math.ceil(this.y);
    this.z = Math.ceil(this.z);

    return this;
  }

  public round() {
    this.x = Math.round(this.x);
    this.y = Math.round(this.y);
    this.z = Math.round(this.z);

    return this;
  }

  public roundToZero() {
    this.x = (this.x < 0) ? Math.ceil(this.x) : Math.floor(this.x);
    this.y = (this.y < 0) ? Math.ceil(this.y) : Math.floor(this.y);
    this.z = (this.z < 0) ? Math.ceil(this.z) : Math.floor(this.z);

    return this;
  }

  public negate() {
    this.x = -this.x;
    this.y = -this.y;
    this.z = -this.z;

    return this;
  }

  public dot(v: Vector3) {
    return this.x * v.x + this.y * v.y + this.z * v.z;
  }

  public get lengthSq() {
    return this.x * this.x + this.y * this.y + this.z * this.z;
  }

  public get length() {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
  }

  public manhattanLength() {
    return Math.abs(this.x) + Math.abs(this.y) + Math.abs(this.z);
  }

  public normalize() {
    return this.divideScalar(this.length || 1);
  }

  public setLength(length: number) {
    return this.normalize().multiplyScalar(length);
  }

  public lerp(v: Vector3, alpha: number) {
    this.x += (v.x - this.x) * alpha;
    this.y += (v.y - this.y) * alpha;
    this.z += (v.z - this.z) * alpha;

    return this;
  }

  public lerpVectors(v1: Vector3, v2: Vector3, alpha: number) {
    this.x = v1.x + (v2.x - v1.x) * alpha;
    this.y = v1.y + (v2.y - v1.y) * alpha;
    this.z = v1.z + (v2.z - v1.z) * alpha;

    return this;
  }

  public cross(v: Vector3) {
    return this.crossVectors(this, v);
  }

  public crossVectors(a: Vector3, b: Vector3) {
    const ax = a.x;
    const ay = a.y;
    const az = a.z;

    const bx = b.x;
    const by = b.y;
    const bz = b.z;

    this.x = ay * bz - az * by;
    this.y = az * bx - ax * bz;
    this.z = ax * by - ay * bx;

    return this;
  }

  public projectOnVector(v: Vector3) {
    const denominator = v.lengthSq;

    if (denominator === 0) return this.set(0, 0, 0);

    const scalar = v.dot(this) / denominator;

    return this.copy(v).multiplyScalar(scalar);
  }

  public projectOnPlane(planeNormal: Vector3) {
    _vector.copy(this).projectOnVector(planeNormal);

    return this.sub(_vector);
  }

  public reflect(normal: Vector3) {
    // reflect incident vector off plane orthogonal to normal
    // normal is assumed to have unit length

    return this.sub(_vector.copy(normal).multiplyScalar(2 * this.dot(normal)));
  }

  public angleTo(v: Vector3) {
    const denominator = Math.sqrt(this.lengthSq * v.lengthSq);

    if (denominator === 0) return Math.PI / 2;

    const theta = this.dot(v) / denominator;

    // clamp, to handle numerical problems

    return Math.acos(clamp(theta, -1, 1));
  }

  public distanceTo(v: Vector3) {
    return Math.sqrt(this.distanceToSquared(v));
  }

  public distanceToSquared(v: Vector3) {
    const dx = this.x - v.x;
    const dy = this.y - v.y;
    const dz = this.z - v.z;

    return dx * dx + dy * dy + dz * dz;
  }

  public manhattanDistanceTo(v: Vector3) {
    return Math.abs(this.x - v.x) + Math.abs(this.y - v.y) + Math.abs(this.z - v.z);
  }

  public setFromSpherical(s: Spherical) {
    return this.setFromSphericalCoords(s.radius, s.phi, s.theta);
  }

  public setFromSphericalCoords(radius: number, phi: number, theta: number) {
    const sinPhiRadius = Math.sin(phi) * radius;

    this.x = sinPhiRadius * Math.sin(theta);
    this.y = Math.cos(phi) * radius;
    this.z = sinPhiRadius * Math.cos(theta);

    return this;
  }

  public setFromCylindrical(c: Cylindrical) {
    return this.setFromCylindricalCoords(c.radius, c.theta, c.y);
  }

  public setFromCylindricalCoords(radius: number, theta: number, y: number) {
    this.x = radius * Math.sin(theta);
    this.y = y;
    this.z = radius * Math.cos(theta);

    return this;
  }

  public setFromMatrixPosition(m: Matrix4) {
    const e = m.values;

    this.x = e[12];
    this.y = e[13];
    this.z = e[14];

    return this;
  }

  public setFromMatrixScale(m: Matrix4) {
    const sx = this.setFromMatrixColumn(m, 0).length;
    const sy = this.setFromMatrixColumn(m, 1).length;
    const sz = this.setFromMatrixColumn(m, 2).length;

    this.x = sx;
    this.y = sy;
    this.z = sz;

    return this;
  }

  public setFromMatrixColumn(m: Matrix4, index: number) {
    return this.fromArray(m.values, index * 4);
  }

  public setFromMatrix3Column(m: Matrix3, index: number) {
    return this.fromArray(m.values, index * 3);
  }

  public equals(v: Vector3) {
    return ((v.x === this.x) && (v.y === this.y) && (v.z === this.z));
  }

  public fromArray(array: Float32Array, offset = 0) {
    this.x = array[offset];
    this.y = array[offset + 1];
    this.z = array[offset + 2];

    return this;
  }

  public toArray(array: Float32Array = new Float32Array(3), offset = 0) {
    array[offset] = this.x;
    array[offset + 1] = this.y;
    array[offset + 2] = this.z;

    return array;
  }

  public random() {
    this.x = Math.random();
    this.y = Math.random();
    this.z = Math.random();

    return this;
  }
}

const _vector = new Vector3();
const _quaternion = new Quaternion();