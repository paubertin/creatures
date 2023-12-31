import { Quaternion } from './quaternion';
import { Vector3 } from './vec3';
import { Matrix4 } from './mat4';
import { clamp } from './utils';

const _matrix = new Matrix4();
const _quaternion = new Quaternion();

export type IOrder = 'XYZ' | 'YZX' | 'ZXY' | 'XZY' | 'YXZ' | 'ZYX';

export class Euler {
  public static readonly DefaultOrder: IOrder = 'XYZ';
  public static readonly RotationOrders: IOrder[] = ['XYZ', 'YZX', 'ZXY', 'XZY', 'YXZ', 'ZYX'];

  public readonly isEuler = true;

  private _x: number;
  private _y: number;
  private _z: number;
  private _order: IOrder;

  public constructor(x = 0, y = 0, z = 0, order = Euler.DefaultOrder) {
    this._x = x;
    this._y = y;
    this._z = z;
    this._order = order;
  }

  public get x() {
    return this._x;
  }

  public set x(value: number) {
    this._x = value;
    this._onChangeCallback();
  }

  public get y() {
    return this._y;
  }

  public set y(value: number) {
    this._y = value;
    this._onChangeCallback();
  }

  public get z() {
    return this._z;
  }

  public set z(value: number) {
    this._z = value;
    this._onChangeCallback();
  }

  public get order() {
    return this._order;
  }

  public set order(value: IOrder) {
    this._order = value;
    this._onChangeCallback();
  }

  public set(x: number, y: number, z: number, order: IOrder) {
    this._x = x;
    this._y = y;
    this._z = z;
    this._order = order || this._order;

    this._onChangeCallback();

    return this;
  }

  public clone() {
    return new Euler(this._x, this._y, this._z, this._order);
  }

  public copy(euler: Euler) {
    this._x = euler._x;
    this._y = euler._y;
    this._z = euler._z;
    this._order = euler._order;

    this._onChangeCallback();

    return this;
  }

  public setFromRotationMatrix(m: Matrix4, order?: IOrder, update?: boolean) {
    // assumes the upper 3x3 of m is a pure rotation matrix (i.e, unscaled)

    const te = m.values;
    const m11 = te[0]; const m12 = te[4]; const
      m13 = te[8];
    const m21 = te[1]; const m22 = te[5]; const
      m23 = te[9];
    const m31 = te[2]; const m32 = te[6]; const
      m33 = te[10];

    order = order || this._order;

    switch (order) {
      case 'XYZ':

        this._y = Math.asin(clamp(m13, -1, 1));

        if (Math.abs(m13) < 0.9999999) {
          this._x = Math.atan2(-m23, m33);
          this._z = Math.atan2(-m12, m11);
        } else {
          this._x = Math.atan2(m32, m22);
          this._z = 0;
        }

        break;

      case 'YXZ':

        this._x = Math.asin(-clamp(m23, -1, 1));

        if (Math.abs(m23) < 0.9999999) {
          this._y = Math.atan2(m13, m33);
          this._z = Math.atan2(m21, m22);
        } else {
          this._y = Math.atan2(-m31, m11);
          this._z = 0;
        }

        break;

      case 'ZXY':

        this._x = Math.asin(clamp(m32, -1, 1));

        if (Math.abs(m32) < 0.9999999) {
          this._y = Math.atan2(-m31, m33);
          this._z = Math.atan2(-m12, m22);
        } else {
          this._y = 0;
          this._z = Math.atan2(m21, m11);
        }

        break;

      case 'ZYX':

        this._y = Math.asin(-clamp(m31, -1, 1));

        if (Math.abs(m31) < 0.9999999) {
          this._x = Math.atan2(m32, m33);
          this._z = Math.atan2(m21, m11);
        } else {
          this._x = 0;
          this._z = Math.atan2(-m12, m22);
        }

        break;

      case 'YZX':

        this._z = Math.asin(clamp(m21, -1, 1));

        if (Math.abs(m21) < 0.9999999) {
          this._x = Math.atan2(-m23, m22);
          this._y = Math.atan2(-m31, m11);
        } else {
          this._x = 0;
          this._y = Math.atan2(m13, m33);
        }

        break;

      case 'XZY':

        this._z = Math.asin(-clamp(m12, -1, 1));

        if (Math.abs(m12) < 0.9999999) {
          this._x = Math.atan2(m32, m22);
          this._y = Math.atan2(m13, m11);
        } else {
          this._x = Math.atan2(-m23, m33);
          this._y = 0;
        }

        break;

      default:

        console.warn(`setFromRotationMatrix() encountered an unknown order: ${ order}`);
    }

    this._order = order;

    if (update !== false) this._onChangeCallback();

    return this;
  }

  public setFromQuaternion(q: Quaternion, order?: IOrder, update?: boolean) {
    _matrix.makeRotationFromQuaternion(q);

    return this.setFromRotationMatrix(_matrix, order, update);
  }

  public setFromVector3(v: Vector3, order?: IOrder) {
    return this.set(v.x, v.y, v.z, order || this._order);
  }

  public reorder(newOrder: IOrder) {
    // WARNING: this discards revolution information -bhouston

    _quaternion.setFromEuler(this);

    return this.setFromQuaternion(_quaternion, newOrder);
  }

  public equals(euler: Euler) {
    return (euler._x === this._x) && (euler._y === this._y)
    && (euler._z === this._z) && (euler._order === this._order);
  }

  public fromArray(array: [number, number, number, IOrder]) {
    this._x = array[0];
    this._y = array[1];
    this._z = array[2];
    if (array[3] !== undefined) this._order = array[3];

    this._onChangeCallback();

    return this;
  }

  public toArray(array: Array<number | IOrder> = [], offset = 0) {
    array[offset] = this._x;
    array[offset + 1] = this._y;
    array[offset + 2] = this._z;
    array[offset + 3] = this._order;

    return array;
  }

  public toVector3(optionalResult?: Vector3) {
    if (optionalResult) {
      return optionalResult.set(this._x, this._y, this._z);
    } else {
      return new Vector3(this._x, this._y, this._z);
    }
  }

  public onChange (callback: () => void) {
    this._onChangeCallback = callback;

    return this;
  }

  private _onChangeCallback() {}
}
