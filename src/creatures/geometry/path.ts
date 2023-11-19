import PathData from './pathdata/pathdata';
import { currentPathSymbol, internalPathDataSymbol } from './utils';
import { svgPathProperties as PathProperties } from './path-properties';
import getBBox from './bbox/getBbox';
import { PathSegment, PathSegmentType, pathSegmentTypeFromLetter } from './pathdata/pathsegment';
import { SVGPathData } from './svg-path-data/svg-path-data';
import { BBox } from '../utils';

const path2DMap = new WeakMap<Path, Path2D>();
const pathDataMap = new WeakMap<Path, PathData>();
const noLengthSegments = new Set(['Z', 'M']);

let Original = globalThis.Path2D;

/*
 * This lists all the consumers of Path2D objects,
 * we need to override them so they use the up to date Path2D object.
 * [ method, indexOfPath2DArgument ]
 */
const Context2DProto = globalThis.CanvasRenderingContext2D?.prototype;
const OffscreenContext2DProto = globalThis.OffscreenCanvasRenderingContext2D?.prototype;
const Path2DProto = globalThis.Path2D.prototype;
// beware the globalThis.Path2D constructor is itself a consumer
// it is not part of this list but should be handled separately
export const consumers: [any, string[]][] = [
  [Context2DProto, [
    'clip',
    'drawFocusIfNeeded',
    'scrollPathIntoView',
    'isPointInPath',
    'isPointInStroke',
    'fill',
    'scrollPathIntoView',
    'stroke'
  ]],
  [OffscreenContext2DProto, [
    'clip',
    'isPointInPath',
    'isPointInStroke',
    'fill',
    'stroke'
  ]],
  [Path2DProto, [
    'addPath'
  ]]
];

for (const [target, keys] of consumers) {
  if (!target) {
    continue;
  }
  for (const key of keys) {
    const originalMethod = target[key];
    target[key] = function (...args: any[]) {
      const mappedArgs = args.map((value) => value instanceof Path ?
        value[currentPathSymbol] : value
      );
      return originalMethod.apply(this, mappedArgs);
    };
  }
}

export class Path extends Path2D {

  private pathData: SVGPathData = new SVGPathData('');

  public constructor(...args: any[]) {
    super(...args);
    const mappedArgs = args.map((value) => value instanceof Path ?
      value.getPathData() : value
    );
    pathDataMap.set(this, new PathData(...mappedArgs));

  }

  getPathData() {
    return pathDataMap.get(this)!; //.toExternal();
  }

  setPathData(segments: { type: 'Z' | 'L' | 'M' | 'A' | 'C' | 'Q', values: number[] }[]) {
    path2DMap.delete(this);
    pathDataMap.set(this, new PathData(segments));
  }

  toSVGString() {
    return pathDataMap.get(this)!.stringify();
  }

  getBBox() {
    return BBox.fromRect(getBBox(this.toSVGString()));
  }

  getTotalLength() {
    const properties = new PathProperties(this.toSVGString());
    return properties.getTotalLength();
  }

  getPointAtLength(length: number) {
    const properties = new PathProperties(this.toSVGString());
    const { x, y } = properties.getPointAtLength(length);
    return new DOMPoint(x, y);
  }

  getPathSegmentAtLength(length: number) {
    const properties = new PathProperties(this.toSVGString());
    const parts = properties.getParts();
    const segments = this.getPathData();
    let totalLength = 0;
    let j = 0;
    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      if (noLengthSegments.has(segment.type) && i < segments.length) {
        continue;
      }
      const part = parts[j++];
      totalLength += part.length;
      if (totalLength > length) {
        return segment;
      }
    }
    return segments[segments.length - 1] || null;
  }

  get [currentPathSymbol]() {
    let path = path2DMap.get(this);
    if (!path) {
      path = new Original(this.toSVGString());
      path2DMap.set(this, path);
    }
    return path;
  }

  get [internalPathDataSymbol]() {
    return pathDataMap.get(this)!;
  }

  get [Symbol.toStringTag]() {
    return 'Path2D';
  }

  static __Path2D = Original;

  public override addPath(path: Path, transform?: DOMMatrix2DInit | undefined): void {
    const pathData = pathDataMap.get(this)!;
    pathData.addPath(path, transform);
  }

  public override roundRect(x: number, y: number, w: number, h: number, radii?: number | DOMPointInit | (number | DOMPointInit)[]): void {
    const pathData = pathDataMap.get(this)!;
    pathData.roundRect(x, y, w, h, radii);
  }

  public override arc(x: number, y: number, radius: number, startAngle: number, endAngle: number, counterclockwise?: boolean | undefined): void {
    const pathData = pathDataMap.get(this)!;
    pathData.arc(x, y, radius, startAngle, endAngle, counterclockwise);
  }

  public override arcTo(x1: number, y1: number, x2: number, y2: number, radius: number): void {
    const pathData = pathDataMap.get(this)!;
    pathData.arcTo(x1, y1, x2, y2, radius);
  }

  public override bezierCurveTo(cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number): void {
    const pathData = pathDataMap.get(this)!;
    pathData.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y);
  }

  public override closePath(): void {
    const pathData = pathDataMap.get(this)!;
    pathData.closePath();
    this.pathData.closePath();
  }

  public override ellipse(x: number, y: number, radiusX: number, radiusY: number, rotation: number, startAngle: number, endAngle: number, counterclockwise?: boolean | undefined): void {
    const pathData = pathDataMap.get(this)!;
    pathData.ellipse(x, y, radiusX, radiusY, rotation, startAngle, endAngle, counterclockwise);
  }

  public override lineTo(x: number, y: number): void {
    const pathData = pathDataMap.get(this)!;
    pathData.lineTo(x, y);
    this.pathData.lineTo(x, y);
  }

  public override moveTo(x: number, y: number): void {
    const pathData = pathDataMap.get(this)!;
    pathData.moveTo(x, y);
    this.pathData.moveTo(x, y);
  }

  public override quadraticCurveTo(cpx: number, cpy: number, x: number, y: number): void {
    const pathData = pathDataMap.get(this)!;
    pathData.quadraticCurveTo(cpx, cpy, x, y);
  }

  public override rect(x: number, y: number, w: number, h: number): void {
    const pathData = pathDataMap.get(this)!;
    pathData.rect(x, y, w, h);
  }

  public toVertices(sampleLength: number = 15) {
    const length = this.getTotalLength();
    const dLength = length / sampleLength;
    let current: number = 0;

    const vertices: DOMPoint[] = [];
    for (let i = 0; i < sampleLength; ++i, current += dLength) {
      const pt = this.getPointAtLength(current);
      vertices.push(pt);
    }

    return vertices;
  }

}
