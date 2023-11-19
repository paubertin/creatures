/**
 * Ref: https://en.wikipedia.org/wiki/Cylindrical_coordinate_system
 */

import type { Vector3 } from './vec3';

export class Cylindrical {
  public readonly isCylindrical = true;

  private _radius: number;
  private _theta: number;
  private _y: number;

  public constructor(radius = 1, theta = 0, y = 0) {
    // distance from the origin to a point in the x-z plane
    this._radius = radius;
    // counterclockwise angle in the x-z plane measured in radians from the positive z-axis
    this._theta = theta;
    // height above the x-z plane
    this._y = y;

    return this;
  }

  public get radius () {
    return this._radius;
  }

  public get theta () {
    return this._theta;
  }

  public get y () {
    return this._y;
  }

  public set(radius: number, theta: number, y: number) {
    this._radius = radius;
    this._theta = theta;
    this._y = y;

    return this;
  }

  public copy(other: Cylindrical) {
    this._radius = other._radius;
    this._theta = other._theta;
    this._y = other._y;

    return this;
  }

  public setFromVector3(v: Vector3) {
    return this.setFromCartesianCoords(v.x, v.y, v.z);
  }

  public setFromCartesianCoords(x: number, y: number, z: number) {
    this._radius = Math.sqrt(x * x + z * z);
    this._theta = Math.atan2(x, z);
    this._y = y;

    return this;
  }

  public clone() {
    return new Cylindrical().copy(this);
  }
}
