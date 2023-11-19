/**
 * Ref: https://en.wikipedia.org/wiki/Spherical_coordinate_system
 *
 * The polar angle (phi) is measured from the positive y-axis. The positive y-axis is up.
 * The azimuthal angle (theta) is measured from the positive z-axis.
 */

import { clamp } from './utils';
import type { Vector3 } from './vec3';

export class Spherical {
  public readonly isSpherical = true;

  private _radius: number;
  private _theta: number;
  private _phi: number;

  public constructor(radius = 1, phi = 0, theta = 0) {
    this._radius = radius;
    this._phi = phi; // polar angle
    this._theta = theta; // azimuthal angle

    return this;
  }

  public get radius () {
    return this._radius;
  }

  public get theta () {
    return this._theta;
  }

  public get phi () {
    return this._phi;
  }

  public set(radius: number, phi: number, theta: number) {
    this._radius = radius;
    this._phi = phi;
    this._theta = theta;

    return this;
  }

  public copy(other: Spherical) {
    this._radius = other._radius;
    this._phi = other._phi;
    this._theta = other._theta;

    return this;
  }

  // restrict phi to be betwee EPS and PI-EPS
  public makeSafe() {
    const EPS = 0.000001;
    this._phi = Math.max(EPS, Math.min(Math.PI - EPS, this._phi));

    return this;
  }

  public setFromVector3(v: Vector3) {
    return this.setFromCartesianCoords(v.x, v.y, v.z);
  }

  public setFromCartesianCoords(x: number, y: number, z: number) {
    this._radius = Math.sqrt(x * x + y * y + z * z);

    if (this._radius === 0) {
      this._theta = 0;
      this._phi = 0;
    } else {
      this._theta = Math.atan2(x, z);
      this._phi = Math.acos(clamp(y / this._radius, -1, 1));
    }

    return this;
  }

  public clone() {
    return new Spherical().copy(this);
  }
}
