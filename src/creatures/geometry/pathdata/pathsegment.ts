// dictionary representing every x-y vectors of every segment types
// used for transformation
const pointsMap = {
  Z: [],
  L: [{ x: 0, y: 1 }],
  M: [{ x: 0, y: 1 }],
  A: [{ x: 0, y: 1 }, { x: 5, y: 6 }], // Doesn't work
  C: [{ x: 0, y: 1 }, { x: 2, y: 3 }, { x: 4, y: 5 }],
  Q: [{ x: 0, y: 1 }, { x: 2, y: 3 }]
};

export enum PathSegmentType {
  UNKNOWN = 0,
  CLOSEPATH = 1,
  MOVETO_ABS = 2,
  MOVETO_REL = 3,
  LINETO_ABS = 4,
  LINETO_REL = 5,
  CURVETO_CUBIC_ABS = 6,
  CURVETO_CUBIC_REL = 7,
  CURVETO_QUADRATIC_ABS = 8,
  CURVETO_QUADRATIC_REL = 9,
  ARC_ABS = 10,
  ARC_REL = 11,
  LINETO_HORIZONTAL_ABS = 12,
  LINETO_HORIZONTAL_REL = 13,
  LINETO_VERTICAL_ABS = 14,
  LINETO_VERTICAL_REL = 15,
  CURVETO_CUBIC_SMOOTH_ABS = 16,
  CURVETO_CUBIC_SMOOTH_REL = 17,
  CURVETO_QUADRATIC_SMOOTH_ABS = 18,
  CURVETO_QUADRATIC_SMOOTH_REL = 19,
}

export function pathSegmentTypeFromLetter(type: string): PathSegmentType {
  switch (type) {
    case 'Z':
    case 'z':
      return PathSegmentType.CLOSEPATH;
    case 'M':
      return PathSegmentType.MOVETO_ABS;
    case 'm':
      return PathSegmentType.MOVETO_REL;
    case 'L':
      return PathSegmentType.LINETO_ABS;
    case 'l':
      return PathSegmentType.LINETO_REL;
    case 'C':
      return PathSegmentType.CURVETO_CUBIC_ABS;
    case 'c':
      return PathSegmentType.CURVETO_CUBIC_REL;
    case 'Q':
      return PathSegmentType.CURVETO_QUADRATIC_ABS;
    case 'q':
      return PathSegmentType.CURVETO_QUADRATIC_REL;
    case 'A':
      return PathSegmentType.ARC_ABS;
    case 'a':
      return PathSegmentType.ARC_REL;
    case 'H':
      return PathSegmentType.LINETO_HORIZONTAL_ABS;
    case 'h':
      return PathSegmentType.LINETO_HORIZONTAL_REL;
    case 'V':
      return PathSegmentType.LINETO_VERTICAL_ABS;
    case 'v':
      return PathSegmentType.LINETO_VERTICAL_REL;
    case 'S':
      return PathSegmentType.CURVETO_CUBIC_SMOOTH_ABS;
    case 's':
      return PathSegmentType.CURVETO_CUBIC_SMOOTH_REL;
    case 'T':
      return PathSegmentType.CURVETO_QUADRATIC_SMOOTH_ABS;
    case 't':
      return PathSegmentType.CURVETO_QUADRATIC_SMOOTH_REL;
    default:
      return PathSegmentType.UNKNOWN;
  }
}

// internal use only
export class PathSegment {
  public type: 'Z' | 'L' | 'M' | 'A' | 'C' | 'Q';
  public values: number[];

  private _x?: number;
  private _y?: number;

  public get x () {
    return this._x;
  }
  public get y () {
    return this._y;
  }

  constructor(type: 'Z' | 'L' | 'M' | 'A' | 'C' | 'Q', values: number[] = []) {
    this.type = type;
    this.values = values.slice();

    switch (type) {
      case 'M':
      case 'L':
      case 'C':
        this._x = values[0]; this._y = values[1]; break;
      case 'A':

    }
    if (type === 'M') {
      this._x = values[0];
      this._y = values[1];
    }

  }
  stringify() {
    return this.type + this.values.join(' ');
  }
  toExternal() {
    return this as PathSegment;
    const { type, values } = this;
    return { type, values: values.slice() };
  }
  transformSelf(mat?: DOMMatrix) {
    return transformSegment(this, mat, this);
  }
  transform(mat?: DOMMatrix) {
    return transformSegment(this, mat);
  }
}

/* eslint no-use-before-define: 'off' */
function transformSegment(source: PathSegment, mat?: DOMMatrix, target?: PathSegment) {
  const { values, type } = source;
  if (!target) {
    target = new PathSegment(type, values);
  }
  if (!mat) {
    return target;
  }
  const pointsIndices = pointsMap[type];
  for (const { x, y } of pointsIndices) {
    const newPt = mat.transformPoint({
      x: values[x],
      y: values[y]
    });
    target.values[x] = newPt.x;
    target.values[y] = newPt.y;
  }
  return target;
}