import { Path } from "./geometry/path";

export type PartialDeep<T extends Record<string, any>> = { [k in keyof T]?: T[k] extends Record<string, any> ? PartialDeep<T[k]> : T[k] };

export function toRad(degrees: number) {
  return degrees * Math.PI / 180;
}

export function getAngle(x: number, y: number) {
  return Math.atan2(y, x);
}

export function random(min?: number, max?: number) {
  const rand = Math.random();
  if (typeof min === 'undefined') {
    return rand;
  }
  else if (typeof max === 'undefined') {
    return rand * min;
  }
  else {
    if (min > max) {
      const tmp = min;
      min = max;
      max = tmp;
    }
    return rand * (max - min) + min;
  }
}

const cosTable = new Array(360);
const sinTable = new Array(360);

for (let i = 0; i < 360; i++) {
  cosTable[i] = Math.cos((i / 360) * 2 * Math.PI);
  sinTable[i] = Math.sin((i / 360) * 2 * Math.PI);
}

export function fastSin(xDeg: number) {
  const deg = Math.round(xDeg);
  if (deg >= 0) {
    return sinTable[(deg % 360)];
  }
  return -sinTable[((-deg) % 360)];
};

export function fastCos(xDeg: number) {
  const deg = Math.round(Math.abs(xDeg));
  return cosTable[deg % 360];
};

export function isPointInsideEllipse(point: DOMPoint, center: DOMPoint, semiMajorAxis: number, semiMinorAxis: number) {
  const normalizedPoint = new DOMPoint(point.x - center.x, point.y - center.y);
  const normalizedDistanceX = normalizedPoint.x / semiMajorAxis;
  const normalizedDistanceY = normalizedPoint.y / semiMinorAxis;

  return (normalizedDistanceX * normalizedDistanceX) + (normalizedDistanceY * normalizedDistanceY) <= 1;
}

export type isDefaultableValueInputType = {
  defaultableValue: boolean;
  key: PropertyKey;
  value: unknown;
};

export type isDefaultableValueType = ({
  defaultableValue,
  key,
  value,
}: isDefaultableValueInputType) => boolean;

export type Config = {
  isDefaultableValue?: isDefaultableValueType;
  mergeArrays?: boolean;
};

let config: Config = {};

export function setConfig(newConfig: Config): void {
  config = newConfig;
}

export function defaultComposer<T extends Record<string, any>>(obj: T, ...args: (PartialDeep<T> | undefined)[]): T {
  return args.reduce(compose, obj) as T;
}

function compose<T extends Record<string, any>>(defaults: PartialDeep<T> = {}, obj: PartialDeep<T> = {}): Partial<T> {
  const result: Partial<T> = {};
  const allKeys = new Set([defaults, obj].flatMap(getAllKeys));

  for (let key of allKeys) {
    const defaultsValue = (defaults as any)[key];
    const originalObjectValue = hasOwn(obj, key) ? (obj as any)[key] : undefined;
    const hasDefault = hasOwn(defaults, key);
    const checkOptions = { key, value: originalObjectValue };
    const defaultableValue = checkDefaultableValue(checkOptions);
    const defaultableValueFromConfig =
      config.isDefaultableValue?.({ ...checkOptions, defaultableValue }) ??
      defaultableValue;

    const shouldTakeDefault = hasDefault && defaultableValueFromConfig;

    if (
      shouldTakeDefault &&
      config.mergeArrays &&
      Array.isArray(defaultsValue) &&
      Array.isArray(originalObjectValue)
    ) {
      (result as any)[key] = [...new Set([...defaultsValue, ...originalObjectValue])];
      continue;
    }

    if (shouldTakeDefault) {
      (result as any)[key] = defaultsValue;
      continue;
    }

    if (isObject(defaultsValue) && isObject(originalObjectValue)) {
      (result as any)[key] = compose(defaultsValue, originalObjectValue);
      continue;
    }

    (result as any)[key] = originalObjectValue;
  }

  return result;
}

function isObject(value: any): boolean {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isEmptyObjectOrArray<T>(object: T): boolean {
  if (typeof object !== "object" || object === null) return false;
  return getAllKeys(object).length === 0;
}

function checkDefaultableValue({ value }: { value: unknown }): boolean {
  return (
    value === undefined ||
    value === "" ||
    value === null ||
    isEmptyObjectOrArray(value) ||
    (Boolean(config.mergeArrays) && Array.isArray(value))
  );
}

function hasOwn<T extends PropertyKey>(
  obj: Partial<Record<T, unknown>>,
  key: unknown,
): key is T {
  return Object.prototype.hasOwnProperty.call(obj, key as any);
}

function getAllKeys(object: {}): PropertyKey[] {
  return [
    ...Object.keys(object),
    ...Object.getOwnPropertySymbols(object).filter(
      (key) => Object.getOwnPropertyDescriptor(object, key)?.enumerable,
    ),
  ];
}

export class DOMSegment {
  public constructor(public from: DOMPoint, public to: DOMPoint) { }

  public matrixTransform(matrix?: DOMMatrixInit): DOMSegment {
    return new DOMSegment(this.from.matrixTransform(matrix), this.to.matrixTransform(matrix));
  }

  public get length() {
    return Math.sqrt((this.from.x - this.to.x) ** 2 + (this.from.y - this.to.y) ** 2);
  }

  public transform(matrix: DOMMatrix) {
    const from = matrix.transformPoint(this.from);
    const to = matrix.transformPoint(this.to);
    return new DOMSegment(from, to);
  }
}

export class DOMPolygon {

  private _segments: DOMSegment[];
  private _points: DOMPoint[];

  public constructor(segments: DOMSegment[]) {
    this._checkValid(segments);
    this._segments = segments;
    this._points = [];
    for (let i = 0; i < this._segments.length; ++i) {
      this._points.push(this._segments[i].from);
      if (i < this._segments.length - 1) {
        this._points.push(this._segments[i].to);
      }
    }
  }

  private _checkValid(segments: DOMSegment[]) {
    const start = segments[0].from;
    const end = segments[segments.length - 1].to;
    if (!(start.x === end.x && start.y === end.y)) {
      throw new Error('invalid polygon');
    }
  }

  public matrixTransform(matrix?: DOMMatrixInit) {
    return new DOMPolygon(this._segments.map((s) => s.matrixTransform(matrix)));
  }

  public get length() {
    return this._segments.reduce((prev, cur) => {
      return prev + cur.length;
    }, 0);
  }

}

export class BBox {

  private _segments: DOMSegment[];
  private _points: DOMPoint[];

  public shape: Path;

  public constructor(pt1: DOMPoint, pt2: DOMPoint, pt3: DOMPoint, pt4: DOMPoint)
  public constructor(x: number, y: number, width: number, height: number)
  public constructor(x: number | DOMPoint = 0, y: number | DOMPoint = 0, width: number | DOMPoint = 0, height: number | DOMPoint = 0) {
    if (typeof x === 'number') {
      this._points = [
        new DOMPoint(x, y as number),
        new DOMPoint(x + (width as number), y as number),
        new DOMPoint(x + (width as number), (y as number) + (height as number)),
        new DOMPoint(x, (y as number) + (height as number)),
      ];
    }
    else {
      this._points = [
        x as DOMPoint,
        y as DOMPoint,
        width as DOMPoint,
        height as DOMPoint,
      ];
    }
    this._segments = [
      new DOMSegment(this._points[0], this._points[1]),
      new DOMSegment(this._points[1], this._points[2]),
      new DOMSegment(this._points[2], this._points[3]),
      new DOMSegment(this._points[3], this._points[0]),
    ];

    this.shape = new Path();
    this.shape.moveTo(this._points[0].x, this._points[0].y);
    this.shape.lineTo(this._points[1].x, this._points[1].y);
    this.shape.lineTo(this._points[2].x, this._points[2].y);
    this.shape.lineTo(this._points[3].x, this._points[3].y);
    this.shape.closePath();
  }

  public static fromRect(rect: DOMRect) {
    return new BBox(rect.x, rect.y, rect.width, rect.height);
  }

  public get segments() {
    return this._segments;
  }

  public get points() {
    return this._points;
  }

  public matrixTransform(matrix?: DOMMatrixInit): BBox {
    const tranformedSegments = this.segments.map((s) => s.matrixTransform(matrix));
    return new BBox(tranformedSegments[0].from, tranformedSegments[0].to, tranformedSegments[1].to, tranformedSegments[2].to);
  }

  public transform(matrix: DOMMatrix) {
    const tranformedSegments = this._segments.map((p) => p.transform(matrix));
    return new BBox(tranformedSegments[0].from, tranformedSegments[0].to, tranformedSegments[1].to, tranformedSegments[2].to);
  }
}