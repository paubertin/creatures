// internal use only
import { PathSegment } from './pathsegment';
import {
  internalPathDataSymbol,
  createDOMMatrixFrom2DInit,
  isValid2DDOMMatrix,
  allAreFinite,
  almostEqual,
  deg,
  abs,
  tau,
  rad,
  EPSILON
} from '../utils';
import { Path } from '../path';
import SvgPath from '../svg/svgpath';

function getConstructorName(instance: any) {

  return Object(instance) === instance &&
      instance instanceof Path
    ? 'Path'
    : instance instanceof CanvasRenderingContext2D
      ? 'CanvasRenderingContext2D'
      : instance instanceof OffscreenCanvasRenderingContext2D
        ? 'OffscreenCanvasRenderingContext2D'
        : instance?.constructor.name || instance;

}

function getErrorMessageHeader(instance: any) {

  return `Failed to execute 'roundRect' on '${ getConstructorName(instance) }':`;

}

function toDOMPointInit(value: { x: number; y: number; z: number; w: number; }) {

  const { x, y, z, w } = value;
  return { x, y, z, w };

}

function toUnrestrictedNumber(value: string | number) {

  return +value;

}

function parseRadiiArgument(value?: any) {

  /*
   * https://webidl.spec.whatwg.org/#es-union
   * with 'optional (unrestricted double or DOMPointInit
   *   or sequence<(unrestricted double or DOMPointInit)>) radii = 0'
   */

  const type = typeof value;

  if (type === 'undefined' || value === null) {

    return [0];

  }
  if (type === 'function') {

    return [NaN];

  }
  if (type === 'object') {

    if (typeof value[Symbol.iterator] === 'function') {

      return [...value].map((elem) => {
        // https://webidl.spec.whatwg.org/#es-union
        // with '(unrestricted double or DOMPointInit)'
        const elemType = typeof elem;
        if (elemType === 'undefined' || elem === null) {
          return 0;
        }
        if (elemType === 'function') {
          return NaN;
        }
        if (elemType === 'object') {
          return toDOMPointInit(elem);
        }
        return toUnrestrictedNumber(elem);
      });

    }

    return [toDOMPointInit(value)];

  }

  return [toUnrestrictedNumber(value)];

}

function toCornerPoint(value: any) {

  const asNumber = toUnrestrictedNumber(value);
  if (Number.isFinite(asNumber)) {

    return {
      x: asNumber,
      y: asNumber
    };

  }
  if (Object(value) === value) {

    return {
      x: toUnrestrictedNumber(value.x ?? 0),
      y: toUnrestrictedNumber(value.y ?? 0)
    };

  }

  return {
    x: NaN,
    y: NaN
  };

}

const SVGPathData_commands = {
  Z: (instance: PathData) =>
    instance.closePath(),
  M: (instance: PathData, params: [ number, number]) =>
    instance.moveTo(...params),
  L: (instance: PathData, params: [ number, number]) =>
    instance.lineTo(...params),
  H: (instance: PathData, [x, ...extraParams]: [ number]) =>
    instance.lineTo(x, instance.lastPoint.y, ...extraParams),
  V: (instance: PathData, params: [ number]) =>
    instance.lineTo(instance.lastPoint.x, ...params),
  C: (instance: PathData, params: [ number, number, number, number, number, number ]) =>
    instance.bezierCurveTo(...params),
  Q: (instance: PathData, params: [ number, number, number, number ]) =>
    instance.quadraticCurveTo(...params)
};

export default class PathData extends Array<PathSegment> {

  public needNewSubpath: boolean;
  public lastPoint: { x: number; y: number } = { x: NaN, y: NaN };

  constructor(data: string | { type: 'Z' | 'L' | 'M' | 'A' | 'C' | 'Q', values: number[] }[] = '') {
    super();
    this.needNewSubpath = true;
    if (typeof data === 'string') {
      const parsed = new SvgPath(data)
        .abs()
        .unshort()
        .unarc();

      if (!Array.isArray(parsed.segments)) {
        return;
      }

      this.lastPoint = { x: NaN, y: NaN };

      for (const [command, ...params] of parsed.segments) {
        const op = (SVGPathData_commands as any)[command];
        if (typeof op === 'function') {
          op(this, params);
        }
      }
    }
    else if (data && isNaN(data as any)) {
      // ok to throw on non iterables
      for (const { type, values } of data) {
        /*
         * The specs are unclear as to what should happen if we input bullshit here
         * The current path-data-polyfill (https://github.com/jarek-foksa/path-data-polyfill)
         * does just append the bullshit to the 'd' attribute. We do the same.
         */
        this.push(new PathSegment(type, values));
        this.lastPoint = ( data as any ).lastPoint;
      }
    }
  }
  isEmpty() {
    return !this.length;
  }
  stringify() {
    return this.map((path_seg) => path_seg.stringify()).join('');
  }
  toExternal() {
    return this.map((path_seg) => path_seg.toExternal());
  }
  ensureThereIsASubpath(x: number, y: number) {
    if (this.needNewSubpath) {
      this.moveTo(x, y);
    }
  }
  addPath(path: { toSVGString: () => string | Path | undefined; }, mat: DOMMatrix2DInit | undefined) {
    if (typeof mat !== 'object' && mat !== undefined) {
      throw new TypeError('Path.addPath: Argument 2 can\'t be converted to a dictionary.');
    }
    // https://drafts.fxtf.org/geometry/#create-a-dommatrix-from-the-2d-dictionary
    const matrix = createDOMMatrixFrom2DInit(mat);
    // https://html.spec.whatwg.org/multipage/canvas.html#dom-path2d-addpath (step 3)
    if (!isValid2DDOMMatrix(matrix)) {
      return;
    }
    // See #1
    // new Path(<SVG-string>) will decompose Arcs to bezier curves
    // This allows us to workaround an issue transforming Arcs
    const decomposed = new Path(path.toSVGString());
    const pathdata = decomposed[internalPathDataSymbol];
    for (let seg of pathdata) {
      this.push(seg.transform(matrix));
    }
  }
  getPathData() {
    // clone to Array
    return Array.from(this).map(({ type, values }) => ({ type, values }));
  }

  arc(x: any, y: any, radius: any, startAngle: any, endAngle: any, ccw = false) {
    return this.ellipse(x, y, radius, radius, 0, startAngle, endAngle, ccw);
  }

  arcTo(x1: number, y1: number, x2: number, y2: number, radius: number) {
    if (!allAreFinite([x1, y1, x2, y2, radius])) {
      return;
    }
    this.ensureThereIsASubpath(x1, y1);
    if (radius < 0) {
      throw new DOMException('radii cannot be negative', 'IndexSizeError');
    }

    const { lastPoint } = this;
    const x0 = lastPoint.x;
    const y0 = lastPoint.y;

    const x21 = x2 - x1;
    const y21 = y2 - y1;
    const x01 = x0 - x1;
    const y01 = y0 - y1;
    const l01_2 = x01 * x01 + y01 * y01;

    if (this.isEmpty()) {
      this.moveTo(x1, y1);
    }
    // Or, is (x1,y1) coincident with (x0,y0)? Do nothing.
    else if (l01_2 <= EPSILON) {
      return;
    }
    // Or, are (x0,y0), (x1,y1) and (x2,y2) collinear?
    // Equivalently, is (x1,y1) coincident with (x2,y2)?
    // Or, is the radius zero? Line to (x1,y1).
    else if (almostEqual(y01 * x21, y21 * x01) || !radius) {
      this.lineTo(x1, y1);
    }
    // Otherwise, draw an arc
    else {
      const x20 = x2 - x0;
      const y20 = y2 - y0;
      const l21_2 = x21 * x21 + y21 * y21;
      const l20_2 = x20 * x20 + y20 * y20;
      const l21 = Math.sqrt(l21_2);
      const l01 = Math.sqrt(l01_2);
      const adjacent = l21_2 + l01_2 - l20_2;
      const hypot = 2 * l21 * l01;
      const arccosine = Math.acos(adjacent / hypot);
      const l = radius * Math.tan((Math.PI - arccosine) / 2);
      const t01 = l / l01;
      const t21 = l / l21;

      // If the start tangent is not coincident with (x0,y0), line to.
      if (!almostEqual(t01, 1)) {
        this.lineTo((x1 + t01 * x01), (y1 + t01 * y01));
      }

      const sweep = y01 * x20 > x01 * y20 ? 1 : 0;
      const endX = lastPoint.x = x1 + t21 * x21;
      const endY = lastPoint.y = y1 + t21 * y21;

      this.push(new PathSegment('A', [radius, radius, 0, 0, sweep, endX, endY]));
    }
  }

  bezierCurveTo(cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number) {

    if (!allAreFinite([cp1x, cp1y, cp2x, cp2y, x, y])) {
      return;
    }
    this.ensureThereIsASubpath(cp1x, cp1y);
    this.push(new PathSegment('C', [cp1x, cp1y, cp2x, cp2y, x, y]));

    const { lastPoint } = this;
    lastPoint.x = x;
    lastPoint.y = y;

  }

  closePath() {
    this.push(new PathSegment('Z'));
  }

  ellipse(
    x: number,
    y: number,
    radiusX: number,
    radiusY: number,
    rotation: number,
    startAngle: number,
    endAngle: number,
    ccw = false
  ) {

    if (!allAreFinite([
      x,
      y,
      radiusX,
      radiusY,
      rotation,
      startAngle,
      endAngle
    ])) {
      return;
    }
    if (radiusX < 0 || radiusY < 0) {
      throw new DOMException('radii cannot be negative', 'IndexSizeError');
    }
    let newStartAngle = startAngle % tau;
    if (newStartAngle <= 0) {
      newStartAngle += tau;
    }

    let delta = newStartAngle - startAngle;
    startAngle = newStartAngle;
    endAngle += delta;

    if (!ccw && (endAngle - startAngle) >= tau) {
      // Draw complete ellipse
      endAngle = startAngle + tau;
    }
    else if (ccw && (startAngle - endAngle) >= tau) {
      // Draw complete ellipse
      endAngle = startAngle - tau;
    }
    else if (!ccw && startAngle > endAngle) {
      endAngle = startAngle + (tau - (startAngle - endAngle) % tau);
    }
    else if (ccw && startAngle < endAngle) {
      endAngle = startAngle - (tau - (endAngle - startAngle) % tau);
    }

    let sweepDegrees = deg(endAngle - startAngle);
    let startDegrees = deg(startAngle);

    // draw in 2 180 degree segments because trying to draw all 360 degrees at once
    // draws nothing.
    if (almostEqual(abs(sweepDegrees), 360)) {
      const halfSweep = sweepDegrees / 2;
      this.arcToOval(
        x,
        y,
        radiusX,
        radiusY,
        rotation,
        startDegrees,
        halfSweep,
        true
      );
      this.arcToOval(
        x,
        y,
        radiusX,
        radiusY,
        rotation,
        startDegrees + halfSweep,
        halfSweep,
        false
      );
    }
    else {
      this.arcToOval(
        x,
        y,
        radiusX,
        radiusY,
        rotation,
        startDegrees,
        sweepDegrees,
        true
      );
    }

  }

  lineTo(x: number, y: number) {

    if (this.isEmpty()) {
      this.moveTo(x, y);
      return;
    }
    if (!allAreFinite([x, y])) {
      return;
    }
    this.push(new PathSegment('L', [x, y]));

    const { lastPoint } = this;
    lastPoint.x = x;
    lastPoint.y = y;

    return;

  }

  moveTo(x: number, y: number) {

    if (!allAreFinite([x, y])) {
      return;
    }

    this.push(new PathSegment('M', [x, y]));

    const { lastPoint } = this;
    lastPoint.x = x;
    lastPoint.y = y;

  }

quadraticCurveTo(cpx: number, cpy: number, x: number, y: number) {

    if (!allAreFinite([cpx, cpy, x, y])) {
      return;
    }
    this.ensureThereIsASubpath(cpx, cpy);
    this.push(new PathSegment('Q', [cpx, cpy, x, y]));

    const { lastPoint } = this;
    lastPoint.x = x;
    lastPoint.y = y;

  }

  rect(x: number, y: number, width: any, height: any) {

    this.moveTo(x, y);
    this.lineTo(x + width, y);
    this.lineTo(x + width, y + height);
    this.lineTo(x, y + height);
    this.closePath();

    const { lastPoint } = this;
    lastPoint.x = x;
    lastPoint.y = y;

  }

  private getEllipsePointForAngle(cx: number, cy: number, rx: number, ry: number, phi: number, theta: number) {
    const { sin, cos } = Math;

    const M = abs(rx) * cos(theta),
      N = abs(ry) * sin(theta);

    return [
      cx + cos(phi) * M - sin(phi) * N,
      cy + sin(phi) * M + cos(phi) * N
    ];
  }

  private getEndpointParameters(cx: any, cy: any, rx: any, ry: any, phi: any, theta: any, dTheta: number) {

    const [x1, y1] = this.getEllipsePointForAngle(cx, cy, rx, ry, phi, theta);
    const [x2, y2] = this.getEllipsePointForAngle(cx, cy, rx, ry, phi, theta + dTheta);

    const fa = abs(dTheta) > Math.PI ? 1 : 0;
    const fs = dTheta > 0 ? 1 : 0;

    return { x1, y1, x2, y2, fa, fs };
  }

  private arcToOval(x: any, y: any, rx: any, ry: any, rotation: number, startDegrees: number, deltaDegrees: number, shouldLineTo: boolean) {

    const { x1, y1, x2, y2, fa, fs } = this.getEndpointParameters(
      x,
      y,
      rx,
      ry,
      rotation,
      rad(startDegrees),
      rad(deltaDegrees)
    ),
      arcSegment = new PathSegment('A', [rx, ry, deg(rotation), fa, fs, x2, y2]),
      { lastPoint } = this;

    if (shouldLineTo) {
      this.lineTo(x1, y1);
    }

    lastPoint.x = x2;
    lastPoint.y = y2;

    this.push(arcSegment);

  }

  public roundRect(x: number, y: number, w: number, h: number, radii?: number | DOMPointInit | (number | DOMPointInit)[]) {



    function fixOverlappingCorners(corners: [any, any, any, any] | { x: number; y: number; }[]) {

      const [upperLeft, upperRight, lowerRight, lowerLeft] = corners;
      const factors = [
        Math.abs(w) / (upperLeft.x + upperRight.x),
        Math.abs(h) / (upperRight.y + lowerRight.y),
        Math.abs(w) / (lowerRight.x + lowerLeft.x),
        Math.abs(h) / (upperLeft.y + lowerLeft.y)
      ];
      const minFactor = Math.min(...factors);
      if (minFactor <= 1) {

        for (const radii of corners) {

          radii.x *= minFactor;
          radii.y *= minFactor;

        }

      }

    }

    if (!([x, y, w, h].every((input) => Number.isFinite(input)))) {

      return;

    }

    radii = parseRadiiArgument(radii);

    let upperLeft, upperRight, lowerRight, lowerLeft;

    if (radii.length === 4) {

      upperLeft = toCornerPoint(radii[0]);
      upperRight = toCornerPoint(radii[1]);
      lowerRight = toCornerPoint(radii[2]);
      lowerLeft = toCornerPoint(radii[3]);

    }
    else if (radii.length === 3) {

      upperLeft = toCornerPoint(radii[0]);
      upperRight = toCornerPoint(radii[1]);
      lowerLeft = toCornerPoint(radii[1]);
      lowerRight = toCornerPoint(radii[2]);

    }
    else if (radii.length === 2) {

      upperLeft = toCornerPoint(radii[0]);
      lowerRight = toCornerPoint(radii[0]);
      upperRight = toCornerPoint(radii[1]);
      lowerLeft = toCornerPoint(radii[1]);

    }
    else if (radii.length === 1) {

      upperLeft = toCornerPoint(radii[0]);
      upperRight = toCornerPoint(radii[0]);
      lowerRight = toCornerPoint(radii[0]);
      lowerLeft = toCornerPoint(radii[0]);

    }
    else {

      throw new RangeError(
        `${getErrorMessageHeader(this)
        } ${radii.length
        } is not a valid size for radii sequence.`
      );

    }

    const corners = [upperLeft, upperRight, lowerRight, lowerLeft];
    const negativeCorner = corners.find(({ x, y }) => x < 0 || y < 0);

    if (corners.some(({ x, y }) => !Number.isFinite(x) || !Number.isFinite(y))) {

      return;

    }

    if (negativeCorner) {

      throw new RangeError(`${getErrorMessageHeader(this)
        } Radius value ${negativeCorner
        } is negative.`
      );

    }

    fixOverlappingCorners(corners);

    if (w < 0 && h < 0) {

      this.moveTo(
        x - upperLeft.x,
        y
      );
      this.ellipse(
        x + w + upperRight.x,
        y - upperRight.y,
        upperRight.x,
        upperRight.y,
        0,
        -Math.PI * 1.5,
        -Math.PI
      );
      this.ellipse(
        x + w + lowerRight.x,
        y + h + lowerRight.y,
        lowerRight.x,
        lowerRight.y,
        0,
        -Math.PI,
        -Math.PI / 2
      );
      this.ellipse(
        x - lowerLeft.x,
        y + h + lowerLeft.y,
        lowerLeft.x,
        lowerLeft.y,
        0,
        -Math.PI / 2,
        0
      );
      this.ellipse(
        x - upperLeft.x,
        y - upperLeft.y,
        upperLeft.x,
        upperLeft.y,
        0,
        0,
        -Math.PI / 2
      );

    }
    else if (w < 0) {

      this.moveTo(
        x - upperLeft.x,
        y
      );
      this.ellipse(
        x + w + upperRight.x,
        y + upperRight.y,
        upperRight.x,
        upperRight.y,
        0,
        -Math.PI / 2,
        -Math.PI,
        true
      );
      this.ellipse(
        x + w + lowerRight.x,
        y + h - lowerRight.y,
        lowerRight.x,
        lowerRight.y,
        0,
        -Math.PI,
        -Math.PI * 1.5,
        true
      );
      this.ellipse(
        x - lowerLeft.x,
        y + h - lowerLeft.y,
        lowerLeft.x,
        lowerLeft.y,
        0,
        Math.PI / 2,
        0,
        true
      );
      this.ellipse(
        x - upperLeft.x,
        y + upperLeft.y,
        upperLeft.x,
        upperLeft.y,
        0,
        0,
        -Math.PI / 2,
        true
      );

    }
    else if (h < 0) {

      this.moveTo(
        x + upperLeft.x,
        y
      );
      this.ellipse(
        x + w - upperRight.x,
        y - upperRight.y,
        upperRight.x,
        upperRight.y,
        0,
        Math.PI / 2,
        0,
        true
      );
      this.ellipse(
        x + w - lowerRight.x,
        y + h + lowerRight.y,
        lowerRight.x,
        lowerRight.y,
        0,
        0,
        -Math.PI / 2,
        true
      );
      this.ellipse(
        x + lowerLeft.x,
        y + h + lowerLeft.y,
        lowerLeft.x,
        lowerLeft.y,
        0,
        -Math.PI / 2,
        -Math.PI,
        true
      );
      this.ellipse(
        x + upperLeft.x,
        y - upperLeft.y,
        upperLeft.x,
        upperLeft.y,
        0,
        -Math.PI,
        -Math.PI * 1.5,
        true
      );

    }
    else {

      this.moveTo(
        x + upperLeft.x,
        y
      );
      this.ellipse(
        x + w - upperRight.x,
        y + upperRight.y,
        upperRight.x,
        upperRight.y,
        0,
        -Math.PI / 2,
        0
      );
      this.ellipse(
        x + w - lowerRight.x,
        y + h - lowerRight.y,
        lowerRight.x,
        lowerRight.y,
        0,
        0,
        Math.PI / 2
      );
      this.ellipse(
        x + lowerLeft.x,
        y + h - lowerLeft.y,
        lowerLeft.x,
        lowerLeft.y,
        0,
        Math.PI / 2,
        Math.PI
      );
      this.ellipse(
        x + upperLeft.x,
        y + upperLeft.y,
        upperLeft.x,
        upperLeft.y,
        0,
        Math.PI,
        Math.PI * 1.5
      );

    }

    this.closePath();
    this.moveTo(x, y);

  }
}
