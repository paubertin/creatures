// from https://github.com/gabelerner/canvg/blob/860e418aca67b9a41e858a223d74d375793ec364/canvg.js#L449


export default class BoundingBox {

  public x1: number;
  public y1: number;
  public x2: number;
  public y2: number;

  public constructor (x1?: number, y1?: number, x2?: number, y2?: number) { // pass in initial points if you want
    this.x1 = Number.NaN;
    this.y1 = Number.NaN;
    this.x2 = Number.NaN;
    this.y2 = Number.NaN;
  
    this.addPoint(x1, y1);
    this.addPoint(x2, y2);
  }

  width () {
    return this.x2 - this.x1;
  }

  height () {
    return this.y2 - this.y1;
  }

  addPoint (x?: number, y?: number) {
    /* eslint no-eq-null: 0, eqeqeq: 0 */
    if (x != undefined) {
      if (isNaN(this.x1) || isNaN(this.x2)) {
        this.x1 = x;
        this.x2 = x;
      }
      if (x < this.x1) this.x1 = x;
      if (x > this.x2) this.x2 = x;
    }

    if (y != undefined) {
      if (isNaN(this.y1) || isNaN(this.y2)) {
        this.y1 = y;
        this.y2 = y;
      }
      if (y < this.y1) this.y1 = y;
      if (y > this.y2) this.y2 = y;
    }
  }

  addX (x: number) {
    this.addPoint(x);
  }

  addY (y: number) {
    this.addPoint(undefined, y);
  }

  addQuadraticCurve (p0x: number, p0y: number, p1x: number, p1y: number, p2x: number, p2y: number) {
    const cp1x = p0x + 2 / 3 * (p1x - p0x); // CP1 = QP0 + 2/3 *(QP1-QP0)
    const cp1y = p0y + 2 / 3 * (p1y - p0y); // CP1 = QP0 + 2/3 *(QP1-QP0)
    const cp2x = cp1x + 1 / 3 * (p2x - p0x); // CP2 = CP1 + 1/3 *(QP2-QP0)
    const cp2y = cp1y + 1 / 3 * (p2y - p0y); // CP2 = CP1 + 1/3 *(QP2-QP0)
    this.addBezierCurve(p0x, p0y, cp1x, cp1y, cp2x, cp2y, p2x, p2y);
  }

  addBezierCurve (p0x: any, p0y: any, p1x: any, p1y: any, p2x: any, p2y: any, p3x: any, p3y: any) {
    // from http://blog.hackers-cafe.net/2009/06/how-to-calculate-bezier-curves-bounding.html
    const p0 = [ p0x, p0y ];
    const p1 = [ p1x, p1y ];
    const p2 = [ p2x, p2y ];
    const p3 = [ p3x, p3y ];

    this.addPoint(p0[0], p0[1]);
    this.addPoint(p3[0], p3[1]);

    let i = 0;
    function f(t: number) {
      return Math.pow(1 - t, 3) * p0[i]
        + 3 * Math.pow(1 - t, 2) * t * p1[i]
        + 3 * (1 - t) * Math.pow(t, 2) * p2[i]
        + Math.pow(t, 3) * p3[i];
    }

    for (i = 0; i <= 1; i++) {

      const b = 6 * p0[i] - 12 * p1[i] + 6 * p2[i];
      const a = -3 * p0[i] + 9 * p1[i] - 9 * p2[i] + 3 * p3[i];
      const c = 3 * p1[i] - 3 * p0[i];

      if (a == 0) {
        if (b == 0) continue;
        const t = -c / b;
        if (0 < t && t < 1) {
          if (i == 0) this.addX(f(t));
          if (i == 1) this.addY(f(t));
        }
        continue;
      }

      const b2ac = Math.pow(b, 2) - 4 * c * a;
      if (b2ac < 0) continue;
      const t1 = (-b + Math.sqrt(b2ac)) / (2 * a);
      if (0 < t1 && t1 < 1) {
        if (i == 0) this.addX(f(t1));
        if (i == 1) this.addY(f(t1));
      }
      const t2 = (-b - Math.sqrt(b2ac)) / (2 * a);
      if (0 < t2 && t2 < 1) {
        if (i == 0) this.addX(f(t2));
        if (i == 1) this.addY(f(t2));
      }
    }
  }

};
