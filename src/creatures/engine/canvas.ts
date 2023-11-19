import { Path } from "../geometry/path";

export interface TextOptions {
  fillStyle?: string;
  font?: string;
  fontSize?: number
}

export interface CanvasOptions {
  canvasElement: string;
  width: number;
  height: number;
}

export class Canvas {
  private width!: number;
  private height!: number;
  private canvasElement: HTMLCanvasElement;

  private context: CanvasRenderingContext2D;

  private static instance: Canvas;

  private static _debug: boolean = false;

  private constructor(options: CanvasOptions) {
    this.canvasElement = document.getElementById(options.canvasElement) as HTMLCanvasElement;
    this.context = this.canvasElement.getContext('2d')!;
  }

  public static set debug (d: boolean) {
    this._debug = d;
  }

  public static get debug () {
    return this._debug;
  }

  public static init(options: CanvasOptions) {
    if (!this.instance) {
      this.instance = new Canvas(options);
      this.width = options.width;
      this.height = options.height;
    }
  }

  public static get width() {
    return this.instance.width;
  }

  public static set width (w: number) {
    this.instance.width = w;

    this.instance.canvasElement.setAttribute('width', `${this.width}`);
  }

  public static get height() {
    return this.instance.height;
  }

  public static set height (h: number) {
    this.instance.height = h;

    this.instance.canvasElement.setAttribute('height', `${this.height}`);
  }

  public static save () {
    const ctx = this.instance.context;
    ctx.save();
  }

  public static restore () {
    const ctx = this.instance.context;
    ctx.restore();
  }

  public static rotate (angle: number) {
    const ctx = this.instance.context;
    ctx.setTransform()
    ctx.rotate(angle);
  }

  public static drawFillRect(topLeftX: number, topLeftY: number, width: number, height: number, fillColor: string) {
    const ctx = this.instance.context;
    ctx.fillStyle = fillColor;
    ctx.fillRect(topLeftX, topLeftY, width, height);
  }

  public static drawLine (x0: number, y0: number, x1: number, y1: number, color: string) {
    const ctx = this.instance.context;

    ctx.strokeStyle = color;
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.stroke();
  }

  public static drawEllipse (x: number, y: number, radiusX: number, radiusY: number, rotation: number, startAngle: number, endAngle: number, strokeColor: string) {
    const ctx = this.instance.context;
  
    ctx.strokeStyle = strokeColor;
    ctx.beginPath();
    ctx.ellipse(x, y, radiusX, radiusY, rotation, startAngle, endAngle);
    ctx.stroke();
    ctx.closePath();
  }

  public static custom(cb: (ctx: CanvasRenderingContext2D) => void) {
    const ctx = this.instance.context;
    cb(ctx);
  }

  public static drawCircle(centerX: number, centerY: number, radius: number, strokeColor: string) {
    const ctx = this.instance.context;

    ctx.strokeStyle = strokeColor;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.closePath();
  }

  public static text (txt: string, x: number, y: number, options?: TextOptions) {
    const ctx = this.instance.context;

    const opts = {
      fillStyle: '#FFFFFF',
      font: 'Arial',
      fontSize: 10,
      ...options,
    };

    ctx.fillStyle = opts.fillStyle;
    ctx.font = `${opts.fontSize}px ${opts.font}`;

    ctx.fillText(txt, x, y);
  }

  public static clearRect (x: number = 0, y: number = 0, w: number = this.width, h: number = this.height) {
    const ctx = this.instance.context;

    ctx.clearRect(x, y, w, h);
  }

  public static isPointInPath(x: number, y: number, fillRule?: CanvasFillRule): boolean;
  public static isPointInPath(path: Path, x: number, y: number, fillRule?: CanvasFillRule): boolean;
  public static isPointInPath (path: Path | number, x: number, y?: number | CanvasFillRule, fillRule?: CanvasFillRule) {
    const ctx = this.instance.context;

    if (typeof path === 'number') {
      return ctx.isPointInPath(path, x, y as CanvasFillRule | undefined);
    }
    else {
      return ctx.isPointInPath(path as Path, x, y as number, fillRule);
    }
  }

  public static setTransform (transform?: DOMMatrix2DInit) {
    const ctx = this.instance.context;

    ctx.setTransform(transform);
    // console.log('set Transform', ctx.getTransform());
  }
}