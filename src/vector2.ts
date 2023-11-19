export const dividedByPi = 1 / Math.PI;

export class Vector2 extends DOMPoint {

  public constructor ()
  public constructor (obj: { x: number; y: number })
  public constructor (x: number, y: number)
  public constructor (x: number | {  x: number; y: number } = 0, y: number = 0) {
    if (typeof x === 'number') {
      super(x, y);
    }
    else {
      super(x.x, x.y);
    }
  }

  public set (value: number, direction: number) {
    this.x = Math.cos(direction) * value;
    this.y = Math.sin(direction) * value;
  }

  public clone () {
    return new Vector2(this.x, this.y);
  }

  public get heading () {
    return Math.atan2(this.y, this.x) * 180 * dividedByPi;
  }

  public add (value: number): this
  public add (vec: Vector2): this
  public add (value: number | Vector2): this {
    if (typeof value === 'number') {
      this.x += value;
      this.y += value;
    }
    else {
      this.x += value.x;
      this.y += value.y;
    }
    return this;
  }

  public static add (...vectors: [ Vector2, Vector2, ...Vector2[] ]): Vector2 {
    if (vectors.length === 2) {
      return vectors[0].clone().add(vectors[1]);
    }
    else {
      const first = vectors.shift()!;
      const second = vectors.shift()!;
      return this.add(first.clone().add(second), ...vectors);
    }
  }

  public normalize () {
    const length = this.length;
    if (length > 0) {
      this.x /= length;
      this.y /= length;
    }
    return this;
  }

  public limit (a: number) {
    const sqLength = this.sqLength;
    if (sqLength > a *a ) {
      this.div(Math.sqrt(sqLength)).mult(a);
    }
    return this;
  }

  public div (a: number) {
    const b = 1 / a;
    return this.mult(b);
  }

  public mult (a: number | Vector2) {
    if (typeof a === 'number') {
      this.x *= a;
      this.y *= a;
    }
    else {
      this.x *= a.x;
      this.y *= a.y;
    }
    return this;
  }

  public opposite () {
    return new Vector2(-this.x, -this.y);
  }

  public equals (other: Vector2) {
    return this.x === other.x && this.y === other.y;
  }

  public copy (other: Vector2): this {
    this.x = other.x;
    this.y = other.y;
    return this;
  }

  public static round (vec: Vector2) {
    return new Vector2(Math.round(vec.x), Math.round(vec.y));
  }

  public get sqLength () {
    return this.x**2 + this.y**2;
  }

  public get length () {
    return Math.sqrt(this.x**2 + this.y**2);
  }

  public static distanceSq (vec1: { x: number, y: number }, vec2: { x: number, y: number }) {
    return (vec1.x - vec2.x)**2 + (vec1.y - vec2.y)**2
  }

}

