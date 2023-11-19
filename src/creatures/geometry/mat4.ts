import type { Euler } from './euler';
import { Matrix3 } from './mat3';
import type { Quaternion } from './quaternion';
import { EPSILON, deg, rad } from './utils';
import { Vector3 } from './vec3';

export class Matrix4 {
  public readonly isMatrix4 = true;

  private _values = new Float32Array(16);

  public constructor() {
    this._values.set([
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1,
    ]);
  }

  public at(i: number, j: number) {
    return this._values[(i - 1) + (j - 1) * 4];
  }

  public set(i: number, j: number, value: number): this;
  public set(m11: number, m12: number, m13: number, m14: number,
    m21: number, m22: number, m23: number, m24: number,
    m31: number, m32: number, m33: number, m34: number,
    m41: number, m42: number, m43: number, m44: number): this;
  public set(m11: number, m12: number, m13: number, m14?: number,
    m21?: number, m22?: number, m23?: number, m24?: number,
    m31?: number, m32?: number, m33?: number, m34?: number,
    m41?: number, m42?: number, m43?: number, m44?: number) {

    if (m14 === undefined) {
      this._values[(m11 - 1) + (m12 - 1) * 4] = m13;
    }
    else {
      const te = this._values;

      te[0] = m11; te[4] = m12; te[8] = m13; te[12] = m14;
      te[1] = m21!; te[5] = m22!; te[9] = m23!; te[13] = m24!;
      te[2] = m31!; te[6] = m32!; te[10] = m33!; te[14] = m34!;
      te[3] = m41!; te[7] = m42!; te[11] = m43!; te[15] = m44!;
    }

    return this;
  }

  public from (domMatrix: DOMMatrix) {
    const te = this._values;

    te[0] = domMatrix.m11; te[4] = domMatrix.m12; te[8] = domMatrix.m13; te[12] = domMatrix.m14;
    te[1] = domMatrix.m21; te[5] = domMatrix.m22; te[9] = domMatrix.m23; te[13] = domMatrix.m24;
    te[2] = domMatrix.m31; te[6] = domMatrix.m32; te[10] = domMatrix.m33; te[14] = domMatrix.m34;
    te[3] = domMatrix.m41; te[7] = domMatrix.m42; te[11] = domMatrix.m43; te[15] = domMatrix.m44;

    return this;
  }

  public static from (domMatrix: DOMMatrix) {
    const res = new Matrix4();
    const te = res._values;

    te[0] = domMatrix.m11; te[4] = domMatrix.m12; te[8] = domMatrix.m13; te[12] = domMatrix.m14;
    te[1] = domMatrix.m21; te[5] = domMatrix.m22; te[9] = domMatrix.m23; te[13] = domMatrix.m24;
    te[2] = domMatrix.m31; te[6] = domMatrix.m32; te[10] = domMatrix.m33; te[14] = domMatrix.m34;
    te[3] = domMatrix.m41; te[7] = domMatrix.m42; te[11] = domMatrix.m43; te[15] = domMatrix.m44;

    return res;
  }

  public static add (first: Matrix4, other: Matrix4) {
    const res = new Matrix4();
    
    for (let i = 1; i <= 4; i++) {
      for (let j = 1; j <= 4; j++) {
        let val = first.at(1, j) + other.at(i, j);
        res.set(i, j, val);
      } 
    }

    return res;
  }

  public get values() {
    return this._values;
  }

  public get a () {
    return this.m11;
  }
  public get b () {
    return this.m12;
  }
  public get c () {
    return this.m21;
  }
  public get d () {
    return this.m22;
  }
  public get e () {
    return this.m41;
  }
  public get f () {
    return this.m42;
  }

  public get m11() {
    return this._values[0];
  }

  public get m12() {
    return this._values[4];
  }

  public get m13() {
    return this._values[8];
  }

  public get m14() {
    return this._values[12];
  }

  public get m21() {
    return this._values[1];
  }

  public get m22() {
    return this._values[5];
  }

  public get m23() {
    return this._values[9];
  }

  public get m24() {
    return this._values[13];
  }

  public get m31() {
    return this._values[2];
  }

  public get m32() {
    return this._values[6];
  }

  public get m33() {
    return this._values[10];
  }

  public get m34() {
    return this._values[14];
  }

  public get m41() {
    return this._values[3];
  }

  public get m42() {
    return this._values[7];
  }

  public get m43() {
    return this._values[11];
  }

  public get m44() {
    return this._values[15];
  }

  public identity() {
    this.set(

      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1,

    );

    return this;
  }

  public static xRotation(angle: number) {
    return new Matrix4().set(
      1, 0, 0, 0,
      0, Math.cos(angle), Math.sin(angle), 0,
      0, -Math.sin(angle), Math.cos(angle), 0,
      0, 0, 0, 1,
    );
  }

  public static yRotation(angle: number) {
    return new Matrix4().set(
      Math.cos(angle), 0, -Math.sin(angle), 0,
      0, 1, 0, 0,
      Math.sin(angle), 0, Math.cos(angle), 0,
      0, 0, 0, 1,
    );
  }

  public static zRotation(angle: number) {
    return new Matrix4().set(
      Math.cos(angle), Math.sin(angle), 0, 0,
      -Math.sin(angle), Math.cos(angle), 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1,
    );
  }

  public static xRotationDeg(angle: number) {
    angle = rad(angle);
    return new Matrix4().set(
      1, 0, 0, 0,
      0, Math.cos(angle), Math.sin(angle), 0,
      0, -Math.sin(angle), Math.cos(angle), 0,
      0, 0, 0, 1,
    );
  }

  public static yRotationDeg(angle: number) {
    angle = rad(angle);
    return new Matrix4().set(
      Math.cos(angle), 0, -Math.sin(angle), 0,
      0, 1, 0, 0,
      Math.sin(angle), 0, Math.cos(angle), 0,
      0, 0, 0, 1,
    );
  }

  public static zRotationDeg(angle: number) {
    angle = rad(angle);
    return new Matrix4().set(
      Math.cos(angle), Math.sin(angle), 0, 0,
      -Math.sin(angle), Math.cos(angle), 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1,
    );
  }

  public static xTranslation(tx: number) {
    return new Matrix4().set(
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      tx, 0, 0, 1,
    );
  }

  public static yTranslation(ty: number) {
    return new Matrix4().set(
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, ty, 0, 1,
    );
  }

  public static zTranslation(tz: number) {
    return new Matrix4().set(
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, tz, 1,
    );
  }

  public rotateSelf(rx: number = 0, ry: number = 0, rz: number = 0) {
    if (rx !== 0) this.premultiply(Matrix4.xRotation(rx));
    if (ry !== 0) this.premultiply(Matrix4.yRotation(ry));
    if (rz !== 0) this.premultiply(Matrix4.zRotation(rz));
    return this;
  }

  public rotateSelfDeg(rx: number = 0, ry: number = 0, rz: number = 0) {
    if (rx !== 0) this.premultiply(Matrix4.xRotation(rad(rx)));
    if (ry !== 0) this.premultiply(Matrix4.yRotation(rad(ry)));
    if (rz !== 0) this.premultiply(Matrix4.zRotation(rad(rz)));
    return this;
  }

  public rotate(rx: number = 0, ry: number = 0, rz: number = 0) {
    return this.clone().rotateSelf(rx, ry, rz);
  }

  public rotateDeg(rx: number = 0, ry: number = 0, rz: number = 0) {
    return this.clone().rotateSelfDeg(rx, ry, rz);
  }

  public translateSelf(tx: number = 0, ty: number = 0, tz: number = 0) {
    if (tx !== 0) this.multiply(Matrix4.xTranslation(tx));
    if (ty !== 0) this.multiply(Matrix4.yTranslation(ty));
    if (tz !== 0) this.multiply(Matrix4.zTranslation(tz));
    return this;
  }

  public translate(tx: number, ty: number, tz: number = 0) {
    return this.clone().translateSelf(tx, ty, tz);
  }

  public clone() {
    return new Matrix4().fromArray(this._values);
  }

  public copy(m: Matrix4 | DOMMatrix) {
    const te = this._values;

    if (m instanceof Matrix4) {
      const me = m._values;

      te[0] = me[0]; te[1] = me[1]; te[2] = me[2]; te[3] = me[3];
      te[4] = me[4]; te[5] = me[5]; te[6] = me[6]; te[7] = me[7];
      te[8] = me[8]; te[9] = me[9]; te[10] = me[10]; te[11] = me[11];
      te[12] = me[12]; te[13] = me[13]; te[14] = me[14]; te[15] = me[15];
      return this;
    }
    else {
      return this.from(m);
    }
  }

  public copyPosition(m: Matrix4) {
    const te = this._values; const
      me = m._values;

    te[12] = me[12];
    te[13] = me[13];
    te[14] = me[14];

    return this;
  }

  public setFromMatrix3(m: Matrix3) {
    const me = m.values;

    this.set(

      me[0], me[3], me[6], 0,
      me[1], me[4], me[7], 0,
      me[2], me[5], me[8], 0,
      0, 0, 0, 1,

    );

    return this;
  }

  public extractBasis(xAxis: Vector3, yAxis: Vector3, zAxis: Vector3) {
    xAxis.setFromMatrixColumn(this, 0);
    yAxis.setFromMatrixColumn(this, 1);
    zAxis.setFromMatrixColumn(this, 2);

    return this;
  }

  public makeBasis(xAxis: Vector3, yAxis: Vector3, zAxis: Vector3) {
    this.set(
      xAxis.x, yAxis.x, zAxis.x, 0,
      xAxis.y, yAxis.y, zAxis.y, 0,
      xAxis.z, yAxis.z, zAxis.z, 0,
      0, 0, 0, 1,
    );

    return this;
  }

  public extractRotation(m: Matrix4) {
    // this method does not support reflection matrices

    const te = this._values;
    const me = m._values;

    const scaleX = 1 / _v1.setFromMatrixColumn(m, 0).length;
    const scaleY = 1 / _v1.setFromMatrixColumn(m, 1).length;
    const scaleZ = 1 / _v1.setFromMatrixColumn(m, 2).length;

    te[0] = me[0] * scaleX;
    te[1] = me[1] * scaleX;
    te[2] = me[2] * scaleX;
    te[3] = 0;

    te[4] = me[4] * scaleY;
    te[5] = me[5] * scaleY;
    te[6] = me[6] * scaleY;
    te[7] = 0;

    te[8] = me[8] * scaleZ;
    te[9] = me[9] * scaleZ;
    te[10] = me[10] * scaleZ;
    te[11] = 0;

    te[12] = 0;
    te[13] = 0;
    te[14] = 0;
    te[15] = 1;

    return this;
  }

  public makeRotationFromEuler(euler: Euler) {
    const te = this._values;

    const { x } = euler; const { y } = euler; const
      { z } = euler;
    const a = Math.cos(x); const
      b = Math.sin(x);
    const c = Math.cos(y); const
      d = Math.sin(y);
    const e = Math.cos(z); const
      f = Math.sin(z);

    if (euler.order === 'XYZ') {
      const ae = a * e; const af = a * f; const be = b * e; const
        bf = b * f;

      te[0] = c * e;
      te[4] = -c * f;
      te[8] = d;

      te[1] = af + be * d;
      te[5] = ae - bf * d;
      te[9] = -b * c;

      te[2] = bf - ae * d;
      te[6] = be + af * d;
      te[10] = a * c;
    } else if (euler.order === 'YXZ') {
      const ce = c * e; const cf = c * f; const de = d * e; const
        df = d * f;

      te[0] = ce + df * b;
      te[4] = de * b - cf;
      te[8] = a * d;

      te[1] = a * f;
      te[5] = a * e;
      te[9] = -b;

      te[2] = cf * b - de;
      te[6] = df + ce * b;
      te[10] = a * c;
    } else if (euler.order === 'ZXY') {
      const ce = c * e; const cf = c * f; const de = d * e; const
        df = d * f;

      te[0] = ce - df * b;
      te[4] = -a * f;
      te[8] = de + cf * b;

      te[1] = cf + de * b;
      te[5] = a * e;
      te[9] = df - ce * b;

      te[2] = -a * d;
      te[6] = b;
      te[10] = a * c;
    } else if (euler.order === 'ZYX') {
      const ae = a * e; const af = a * f; const be = b * e; const
        bf = b * f;

      te[0] = c * e;
      te[4] = be * d - af;
      te[8] = ae * d + bf;

      te[1] = c * f;
      te[5] = bf * d + ae;
      te[9] = af * d - be;

      te[2] = -d;
      te[6] = b * c;
      te[10] = a * c;
    } else if (euler.order === 'YZX') {
      const ac = a * c; const ad = a * d; const bc = b * c; const
        bd = b * d;

      te[0] = c * e;
      te[4] = bd - ac * f;
      te[8] = bc * f + ad;

      te[1] = f;
      te[5] = a * e;
      te[9] = -b * e;

      te[2] = -d * e;
      te[6] = ad * f + bc;
      te[10] = ac - bd * f;
    } else if (euler.order === 'XZY') {
      const ac = a * c; const ad = a * d; const bc = b * c; const
        bd = b * d;

      te[0] = c * e;
      te[4] = -f;
      te[8] = d * e;

      te[1] = ac * f + bd;
      te[5] = a * e;
      te[9] = ad * f - bc;

      te[2] = bc * f - ad;
      te[6] = b * e;
      te[10] = bd * f + ac;
    }

    // bottom row
    te[3] = 0;
    te[7] = 0;
    te[11] = 0;

    // last column
    te[12] = 0;
    te[13] = 0;
    te[14] = 0;
    te[15] = 1;

    return this;
  }

  public makeRotationFromQuaternion(q: Quaternion) {
    return this.compose(_zero, q, _one);
  }

  public lookAt(eye: Vector3, target: Vector3, up: Vector3) {
    const te = this._values;

    _z.subVectors(eye, target);

    if (_z.lengthSq === 0) {
      // eye and target are in the same position

      _z.z = 1;
    }

    _z.normalize();
    _x.crossVectors(up, _z);

    if (_x.lengthSq === 0) {
      // up and z are parallel

      if (Math.abs(up.z) === 1) {
        _z.x += 0.0001;
      } else {
        _z.z += 0.0001;
      }

      _z.normalize();
      _x.crossVectors(up, _z);
    }

    _x.normalize();
    _y.crossVectors(_z, _x);

    te[0] = _x.x; te[4] = _y.x; te[8] = _z.x;
    te[1] = _x.y; te[5] = _y.y; te[9] = _z.y;
    te[2] = _x.z; te[6] = _y.z; te[10] = _z.z;

    return this;
  }

  public multiply(m: Matrix4) {
    return this.multiplyMatrices(this, m);
  }

  public premultiply(m: Matrix4) {
    return this.multiplyMatrices(m, this);
  }

  public log () {
    const arr: Array<Array<number>> = [
      [0,0,0,0],
      [0,0,0,0],
      [0,0,0,0],
      [0,0,0,0],
    ];
    for (let i = 1; i <=4; i ++) {
      for (let j = 1; j <=4; j ++) {
        arr[j-1][i-1] = this.at(i, j);
      }
    }
    console.log(arr);
  }

  public static multiplyMatrices(a: Matrix4, b: Matrix4) {
    const res = new Matrix4();

    for (let i = 1; i <= 4; i++) {
      for (let j = 1; j <= 4; j++) {
        let val = 0;
        for (let k = 1; k <= 4; k++) {
          val += a.at(i, k) * b.at(k, j);
        }
        res.set(j, i, val);
      } 
    }

    return res;
  }

  public multiplyMatrices(m1: Matrix4, m2: Matrix4) {
    const m11 = m2.m11 * m1.m11 + m2.m12 * m1.m21 + m2.m13 * m1.m31 + m2.m14 * m1.m41;
    const m12 = m2.m11 * m1.m12 + m2.m12 * m1.m22 + m2.m13 * m1.m32 + m2.m14 * m1.m42;
    const m13 = m2.m11 * m1.m13 + m2.m12 * m1.m23 + m2.m13 * m1.m33 + m2.m14 * m1.m43;
    const m14 = m2.m11 * m1.m14 + m2.m12 * m1.m24 + m2.m13 * m1.m34 + m2.m14 * m1.m44;
  
    const m21 = m2.m21 * m1.m11 + m2.m22 * m1.m21 + m2.m23 * m1.m31 + m2.m24 * m1.m41;
    const m22 = m2.m21 * m1.m12 + m2.m22 * m1.m22 + m2.m23 * m1.m32 + m2.m24 * m1.m42;
    const m23 = m2.m21 * m1.m13 + m2.m22 * m1.m23 + m2.m23 * m1.m33 + m2.m24 * m1.m43;
    const m24 = m2.m21 * m1.m14 + m2.m22 * m1.m24 + m2.m23 * m1.m34 + m2.m24 * m1.m44;
  
    const m31 = m2.m31 * m1.m11 + m2.m32 * m1.m21 + m2.m33 * m1.m31 + m2.m34 * m1.m41;
    const m32 = m2.m31 * m1.m12 + m2.m32 * m1.m22 + m2.m33 * m1.m32 + m2.m34 * m1.m42;
    const m33 = m2.m31 * m1.m13 + m2.m32 * m1.m23 + m2.m33 * m1.m33 + m2.m34 * m1.m43;
    const m34 = m2.m31 * m1.m14 + m2.m32 * m1.m24 + m2.m33 * m1.m34 + m2.m34 * m1.m44;
  
    const m41 = m2.m41 * m1.m11 + m2.m42 * m1.m21 + m2.m43 * m1.m31 + m2.m44 * m1.m41;
    const m42 = m2.m41 * m1.m12 + m2.m42 * m1.m22 + m2.m43 * m1.m32 + m2.m44 * m1.m42;
    const m43 = m2.m41 * m1.m13 + m2.m42 * m1.m23 + m2.m43 * m1.m33 + m2.m44 * m1.m43;
    const m44 = m2.m41 * m1.m14 + m2.m42 * m1.m24 + m2.m43 * m1.m34 + m2.m44 * m1.m44;
    const res = new Matrix4().set(m11, m12, m13, m14, m21, m22, m23, m24, m31, m32, m33, m34, m41, m42, m43, m44);

    /*
    for (let i = 1; i <= 4; i++) {
      for (let j = 1; j <= 4; j++) {
        let val = 0;
        for (let k = 1; k <= 4; k++) {
          val += a.at(i, k) * b.at(k, j);
        }
        res.set(j, i, val);
      } 
    }
    */

    return this.copy(res);

    /*
    const a11 = ae[0]; const a12 = ae[4]; const a13 = ae[8]; const
      a14 = ae[12];
    const a21 = ae[1]; const a22 = ae[5]; const a23 = ae[9]; const
      a24 = ae[13];
    const a31 = ae[2]; const a32 = ae[6]; const a33 = ae[10]; const
      a34 = ae[14];
    const a41 = ae[3]; const a42 = ae[7]; const a43 = ae[11]; const
      a44 = ae[15];

    const b11 = be[0]; const b12 = be[4]; const b13 = be[8]; const
      b14 = be[12];
    const b21 = be[1]; const b22 = be[5]; const b23 = be[9]; const
      b24 = be[13];
    const b31 = be[2]; const b32 = be[6]; const b33 = be[10]; const
      b34 = be[14];
    const b41 = be[3]; const b42 = be[7]; const b43 = be[11]; const
      b44 = be[15];

    te[0] = a11 * b11 + a12 * b21 + a13 * b31 + a14 * b41;
    te[1] = a11 * b12 + a12 * b22 + a13 * b32 + a14 * b42;
    te[2] = a11 * b13 + a12 * b23 + a13 * b33 + a14 * b43;
    te[3] = a11 * b14 + a12 * b24 + a13 * b34 + a14 * b44;

    te[4] = a21 * b11 + a22 * b21 + a23 * b31 + a24 * b41;
    te[5] = a21 * b12 + a22 * b22 + a23 * b32 + a24 * b42;
    te[6] = a21 * b13 + a22 * b23 + a23 * b33 + a24 * b43;
    te[7] = a21 * b14 + a22 * b24 + a23 * b34 + a24 * b44;

    te[8] = a31 * b11 + a32 * b21 + a33 * b31 + a34 * b41;
    te[9] = a31 * b12 + a32 * b22 + a33 * b32 + a34 * b42;
    te[10] = a31 * b13 + a32 * b23 + a33 * b33 + a34 * b43;
    te[11] = a31 * b14 + a32 * b24 + a33 * b34 + a34 * b44;

    te[12] = a41 * b11 + a42 * b21 + a43 * b31 + a44 * b41;
    te[13] = a41 * b12 + a42 * b22 + a43 * b32 + a44 * b42;
    te[14] = a41 * b13 + a42 * b23 + a43 * b33 + a44 * b43;
    te[15] = a41 * b14 + a42 * b24 + a43 * b34 + a44 * b44;
    */

    return this;
  }

  public multiplyScalar(s: number) {
    const te = this._values;

    te[0] *= s; te[4] *= s; te[8] *= s; te[12] *= s;
    te[1] *= s; te[5] *= s; te[9] *= s; te[13] *= s;
    te[2] *= s; te[6] *= s; te[10] *= s; te[14] *= s;
    te[3] *= s; te[7] *= s; te[11] *= s; te[15] *= s;

    return this;
  }

  public determinant() {
    const te = this._values;

    const n11 = te[0]; const n12 = te[4]; const n13 = te[8]; const
      n14 = te[12];
    const n21 = te[1]; const n22 = te[5]; const n23 = te[9]; const
      n24 = te[13];
    const n31 = te[2]; const n32 = te[6]; const n33 = te[10]; const
      n34 = te[14];
    const n41 = te[3]; const n42 = te[7]; const n43 = te[11]; const
      n44 = te[15];

    return (
      n41 * (+n14 * n23 * n32 - n13 * n24 * n32
        - n14 * n22 * n33 + n12 * n24 * n33
        + n13 * n22 * n34 - n12 * n23 * n34) +
      n42 * (+n11 * n23 * n34 - n11 * n24 * n33
        + n14 * n21 * n33 - n13 * n21 * n34
        + n13 * n24 * n31 - n14 * n23 * n31) +
      n43 * (+n11 * n24 * n32 - n11 * n22 * n34
        - n14 * n21 * n32 + n12 * n21 * n34
        + n14 * n22 * n31 - n12 * n24 * n31) +
      n44 * (-n13 * n22 * n31 - n11 * n23 * n32
        + n11 * n22 * n33 + n13 * n21 * n32
        - n12 * n21 * n33 + n12 * n23 * n31)
    );
  }

  public transpose() {
    const te = this._values;
    let tmp: number;

    tmp = te[1]; te[1] = te[4]; te[4] = tmp;
    tmp = te[2]; te[2] = te[8]; te[8] = tmp;
    tmp = te[6]; te[6] = te[9]; te[9] = tmp;

    tmp = te[3]; te[3] = te[12]; te[12] = tmp;
    tmp = te[7]; te[7] = te[13]; te[13] = tmp;
    tmp = te[11]; te[11] = te[14]; te[14] = tmp;

    return this;
  }

  public setPosition(...params: [Vector3] | [number, number, number]) {
    const te = this._values;

    if (params.length === 1) {
      te[12] = params[0].x;
      te[13] = params[0].y;
      te[14] = params[0].z;
    } else {
      te[12] = params[0];
      te[13] = params[1];
      te[14] = params[2];
    }

    return this;
  }

  public inverse () {
    return this.clone().invert();
  }

  public invert() {
    // based on http://www.euclideanspace.com/maths/algebra/matrix/functions/inverse/fourD/index.htm
    const te = this._values;

    const n11 = te[0]; const n21 = te[1]; const n31 = te[2]; const n41 = te[3];
    const n12 = te[4]; const n22 = te[5]; const n32 = te[6]; const n42 = te[7];
    const n13 = te[8]; const n23 = te[9]; const n33 = te[10]; const n43 = te[11];
    const n14 = te[12]; const n24 = te[13]; const n34 = te[14]; const n44 = te[15];

    const t11 = n23 * n34 * n42 - n24 * n33 * n42
      + n24 * n32 * n43 - n22 * n34 * n43
      - n23 * n32 * n44 + n22 * n33 * n44;
    const t12 = n14 * n33 * n42 - n13 * n34 * n42
      - n14 * n32 * n43 + n12 * n34 * n43
      + n13 * n32 * n44 - n12 * n33 * n44;
    const t13 = n13 * n24 * n42 - n14 * n23 * n42
      + n14 * n22 * n43 - n12 * n24 * n43
      - n13 * n22 * n44 + n12 * n23 * n44;
    const t14 = n14 * n23 * n32 - n13 * n24 * n32
      - n14 * n22 * n33 + n12 * n24 * n33
      + n13 * n22 * n34 - n12 * n23 * n34;

    const det = n11 * t11 + n21 * t12 + n31 * t13 + n41 * t14;

    if (det === 0) return this.set(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);

    const detInv = 1 / det;

    te[0] = t11 * detInv;
    te[1] = (n24 * n33 * n41 - n23 * n34 * n41
      - n24 * n31 * n43 + n21 * n34 * n43
      + n23 * n31 * n44 - n21 * n33 * n44) * detInv;
    te[2] = (n22 * n34 * n41 - n24 * n32 * n41
      + n24 * n31 * n42 - n21 * n34 * n42
      - n22 * n31 * n44 + n21 * n32 * n44) * detInv;
    te[3] = (n23 * n32 * n41 - n22 * n33 * n41
      - n23 * n31 * n42 + n21 * n33 * n42
      + n22 * n31 * n43 - n21 * n32 * n43) * detInv;

    te[4] = t12 * detInv;
    te[5] = (n13 * n34 * n41 - n14 * n33 * n41
      + n14 * n31 * n43 - n11 * n34 * n43
      - n13 * n31 * n44 + n11 * n33 * n44) * detInv;
    te[6] = (n14 * n32 * n41 - n12 * n34 * n41
      - n14 * n31 * n42 + n11 * n34 * n42
      + n12 * n31 * n44 - n11 * n32 * n44) * detInv;
    te[7] = (n12 * n33 * n41 - n13 * n32 * n41
      + n13 * n31 * n42 - n11 * n33 * n42
      - n12 * n31 * n43 + n11 * n32 * n43) * detInv;

    te[8] = t13 * detInv;
    te[9] = (n14 * n23 * n41 - n13 * n24 * n41
      - n14 * n21 * n43 + n11 * n24 * n43
      + n13 * n21 * n44 - n11 * n23 * n44) * detInv;
    te[10] = (n12 * n24 * n41 - n14 * n22 * n41
      + n14 * n21 * n42 - n11 * n24 * n42
      - n12 * n21 * n44 + n11 * n22 * n44) * detInv;
    te[11] = (n13 * n22 * n41 - n12 * n23 * n41
      - n13 * n21 * n42 + n11 * n23 * n42
      + n12 * n21 * n43 - n11 * n22 * n43) * detInv;

    te[12] = t14 * detInv;
    te[13] = (n13 * n24 * n31 - n14 * n23 * n31
      + n14 * n21 * n33 - n11 * n24 * n33
      - n13 * n21 * n34 + n11 * n23 * n34) * detInv;
    te[14] = (n14 * n22 * n31 - n12 * n24 * n31
      - n14 * n21 * n32 + n11 * n24 * n32
      + n12 * n21 * n34 - n11 * n22 * n34) * detInv;
    te[15] = (n12 * n23 * n31 - n13 * n22 * n31
      + n13 * n21 * n32 - n11 * n23 * n32
      - n12 * n21 * n33 + n11 * n22 * n33) * detInv;

    return this;
  }

  public scale(v: Vector3) {
    const te = this._values;
    const { x } = v; const { y } = v; const
      { z } = v;

    te[0] *= x; te[4] *= y; te[8] *= z;
    te[1] *= x; te[5] *= y; te[9] *= z;
    te[2] *= x; te[6] *= y; te[10] *= z;
    te[3] *= x; te[7] *= y; te[11] *= z;

    return this;
  }

  public getMaxScaleOnAxis() {
    const te = this._values;

    const scaleXSq = te[0] * te[0] + te[1] * te[1] + te[2] * te[2];
    const scaleYSq = te[4] * te[4] + te[5] * te[5] + te[6] * te[6];
    const scaleZSq = te[8] * te[8] + te[9] * te[9] + te[10] * te[10];

    return Math.sqrt(Math.max(scaleXSq, scaleYSq, scaleZSq));
  }

  public makeTranslation(x: number, y: number, z: number) {
    this.set(

      1, 0, 0, x,
      0, 1, 0, y,
      0, 0, 1, z,
      0, 0, 0, 1,

    );

    return this;
  }

  public makeRotationX(theta: number) {
    const c = Math.cos(theta); const
      s = Math.sin(theta);

    this.set(

      1, 0, 0, 0,
      0, c, -s, 0,
      0, s, c, 0,
      0, 0, 0, 1,

    );

    return this;
  }

  public makeRotationY(theta: number) {
    const c = Math.cos(theta); const
      s = Math.sin(theta);

    this.set(

      c, 0, s, 0,
      0, 1, 0, 0,
      -s, 0, c, 0,
      0, 0, 0, 1,

    );

    return this;
  }

  public makeRotationZ(theta: number) {
    const c = Math.cos(theta); const
      s = Math.sin(theta);

    this.set(

      c, -s, 0, 0,
      s, c, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1,

    );

    return this;
  }

  public makeRotationAxis(axis: Vector3, angle: number) {
    // Based on http://www.gamedev.net/reference/articles/article1199.asp

    const c = Math.cos(angle);
    const s = Math.sin(angle);
    const t = 1 - c;
    const { x } = axis; const { y } = axis; const
      { z } = axis;
    const tx = t * x; const
      ty = t * y;

    this.set(

      tx * x + c, tx * y - s * z, tx * z + s * y, 0,
      tx * y + s * z, ty * y + c, ty * z - s * x, 0,
      tx * z - s * y, ty * z + s * x, t * z * z + c, 0,
      0, 0, 0, 1,

    );

    return this;
  }

  public makeScale(x: number, y: number, z: number) {
    this.set(
      x, 0, 0, 0,
      0, y, 0, 0,
      0, 0, z, 0,
      0, 0, 0, 1,
    );

    return this;
  }

  public makeShear(x: number, y: number, z: number) {
    this.set(
      1, y, z, 0,
      x, 1, z, 0,
      x, y, 1, 0,
      0, 0, 0, 1,
    );

    return this;
  }

  public compose(position: Vector3, quaternion: Quaternion, scale: Vector3) {
    const te = this._values;

    const x = quaternion.x; const y = quaternion.y;
    const z = quaternion.z; const w = quaternion.w;

    const x2 = x + x; const y2 = y + y; const z2 = z + z;

    const xx = x * x2; const xy = x * y2; const xz = x * z2;

    const yy = y * y2; const yz = y * z2; const zz = z * z2;
    const wx = w * x2; const wy = w * y2; const wz = w * z2;

    const sx = scale.x; const sy = scale.y; const sz = scale.z;

    te[0] = (1 - (yy + zz)) * sx;
    te[1] = (xy + wz) * sx;
    te[2] = (xz - wy) * sx;
    te[3] = 0;

    te[4] = (xy - wz) * sy;
    te[5] = (1 - (xx + zz)) * sy;
    te[6] = (yz + wx) * sy;
    te[7] = 0;

    te[8] = (xz + wy) * sz;
    te[9] = (yz - wx) * sz;
    te[10] = (1 - (xx + yy)) * sz;
    te[11] = 0;

    te[12] = position.x;
    te[13] = position.y;
    te[14] = position.z;
    te[15] = 1;

    return this;
  }

  public decompose(position: Vector3, quaternion: Quaternion, scale: Vector3) {
    const te = this._values;

    let sx = _v1.set(te[0], te[1], te[2]).length;
    const sy = _v1.set(te[4], te[5], te[6]).length;
    const sz = _v1.set(te[8], te[9], te[10]).length;

    // if determine is negative, we need to invert one scale
    const det = this.determinant();
    if (det < 0) sx = -sx;

    position.x = te[12];
    position.y = te[13];
    position.z = te[14];

    // scale the rotation part
    _m1.copy(this);

    const invSX = 1 / sx;
    const invSY = 1 / sy;
    const invSZ = 1 / sz;

    _m1._values[0] *= invSX;
    _m1._values[1] *= invSX;
    _m1._values[2] *= invSX;

    _m1._values[4] *= invSY;
    _m1._values[5] *= invSY;
    _m1._values[6] *= invSY;

    _m1._values[8] *= invSZ;
    _m1._values[9] *= invSZ;
    _m1._values[10] *= invSZ;

    quaternion.setFromRotationMatrix(_m1);

    scale.x = sx;
    scale.y = sy;
    scale.z = sz;

    return this;
  }

  public makePerspective(left: number, right: number,
    top: number, bottom: number,
    near: number, far: number) {
    const te = this._values;
    const x = 2 * near / (right - left);
    const y = 2 * near / (top - bottom);

    const a = (right + left) / (right - left);
    const b = (top + bottom) / (top - bottom);
    const c = -(far + near) / (far - near);
    const d = -2 * far * near / (far - near);

    te[0] = x; te[4] = 0; te[8] = a; te[12] = 0;
    te[1] = 0; te[5] = y; te[9] = b; te[13] = 0;
    te[2] = 0; te[6] = 0; te[10] = c; te[14] = d;
    te[3] = 0; te[7] = 0; te[11] = -1; te[15] = 0;

    return this;
  }

  public makeOrthographic(left: number, right: number,
    top: number, bottom: number,
    near: number, far: number) {
    const te = this._values;
    const w = 1.0 / (right - left);
    const h = 1.0 / (top - bottom);
    const p = 1.0 / (far - near);

    const x = (right + left) * w;
    const y = (top + bottom) * h;
    const z = (far + near) * p;

    te[0] = 2 * w; te[4] = 0; te[8] = 0; te[12] = -x;
    te[1] = 0; te[5] = 2 * h; te[9] = 0; te[13] = -y;
    te[2] = 0; te[6] = 0; te[10] = -2 * p; te[14] = -z;
    te[3] = 0; te[7] = 0; te[11] = 0; te[15] = 1;

    return this;
  }

  public equals(matrix: Matrix4 | DOMMatrix) {
    const te = this._values;

    if (matrix instanceof Matrix4) { 
      const me = matrix._values;
      
      for (let i = 0; i < 16; i++) {
        if (te[i] !== me[i]) return false;
      }
      
      return true;
    }
    else {
      return Math.abs(this.m11 - matrix.m11) < EPSILON
        && Math.abs(this.m12 - matrix.m12) < EPSILON
        && Math.abs(this.m13 - matrix.m13) < EPSILON
        && Math.abs(this.m14 - matrix.m14) < EPSILON
        && Math.abs(this.m21 - matrix.m21) < EPSILON
        && Math.abs(this.m22 - matrix.m22) < EPSILON
        && Math.abs(this.m23 - matrix.m23) < EPSILON
        && Math.abs(this.m24 - matrix.m24) < EPSILON
        && Math.abs(this.m31 - matrix.m31) < EPSILON
        && Math.abs(this.m32 - matrix.m32) < EPSILON
        && Math.abs(this.m33 - matrix.m33) < EPSILON
        && Math.abs(this.m34 - matrix.m34) < EPSILON
        && Math.abs(this.m41 - matrix.m41) < EPSILON
        && Math.abs(this.m42 - matrix.m42) < EPSILON
        && Math.abs(this.m43 - matrix.m43) < EPSILON
        && Math.abs(this.m44 - matrix.m44) < EPSILON;
    }
  }

  public fromArray(array: Float32Array, offset = 0) {
    for (let i = 0; i < 16; i++) {
      this._values[i] = array[i + offset];
    }

    return this;
  }

  public toArray(array: Float32Array = new Float32Array(16), offset = 0) {
    const te = this._values;

    array[offset] = te[0];
    array[offset + 1] = te[1];
    array[offset + 2] = te[2];
    array[offset + 3] = te[3];

    array[offset + 4] = te[4];
    array[offset + 5] = te[5];
    array[offset + 6] = te[6];
    array[offset + 7] = te[7];

    array[offset + 8] = te[8];
    array[offset + 9] = te[9];
    array[offset + 10] = te[10];
    array[offset + 11] = te[11];

    array[offset + 12] = te[12];
    array[offset + 13] = te[13];
    array[offset + 14] = te[14];
    array[offset + 15] = te[15];

    return array;
  }
}

const _v1 = new Vector3();
const _m1 = new Matrix4();
const _zero = new Vector3(0, 0, 0);
const _one = new Vector3(1, 1, 1);
const _x = new Vector3();
const _y = new Vector3();
const _z = new Vector3();
