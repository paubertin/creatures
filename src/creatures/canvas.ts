export interface TextOptions {
  fillStyle?: string;
  font?: string;
  fontSize?: number
}

export class Canvas {
  private width: number;
  private height: number;
  private world: HTMLCanvasElement;
  private creatures: HTMLCanvasElement;
  private food: HTMLCanvasElement;

  private ctx: Record<string, CanvasRenderingContext2D> = {};

  private static instance: Canvas;

  private constructor() {
    this.width = Math.max(document.documentElement.clientWidth || window.innerWidth || 0);
    this.height = Math.max(document.documentElement.clientHeight || window.innerHeight || 0);

    this.world = document.getElementById('world') as HTMLCanvasElement;
    this.creatures = document.getElementById('creatures') as HTMLCanvasElement;
    this.food = document.getElementById('food') as HTMLCanvasElement;

    this.world.setAttribute('width', `${this.width}`);
    this.world.setAttribute('height', `${this.height}`);
    this.creatures.setAttribute('width', `${this.width}`);
    this.creatures.setAttribute('height', `${this.height}`);
    this.food.setAttribute('width', `${this.width}`);
    this.food.setAttribute('height', `${this.height}`);

    this.ctx['world'] = this.world.getContext('2d')!;
    this.ctx['creatures'] = this.creatures.getContext('2d')!;
    this.ctx['food'] = this.food.getContext('2d')!;
    console.log(this);
  }

  public static init() {
    if (!this.instance) {
      this.instance = new Canvas();
    }
  }

  public static get width() {
    return this.instance.width;
  }

  public static get height() {
    return this.instance.height;
  }

  public static save (canvas: string) {
    const ctx = this.instance.ctx[canvas];
    ctx.save();
  }

  public static restore (canvas: string) {
    const ctx = this.instance.ctx[canvas];
    ctx.restore();
  }

  public static rotate (canvas: string, angle: number) {
    const ctx = this.instance.ctx[canvas];
    ctx.setTransform()
    ctx.rotate(angle);
  }

  public static drawFillRect(canvas: string, topLeftX: number, topLeftY: number, width: number, height: number, fillColor: string) {
    const ctx = this.instance.ctx[canvas];
    ctx.fillStyle = fillColor;
    ctx.fillRect(topLeftX, topLeftY, width, height);
  }

  public static drawLine (canvas: string, x0: number, y0: number, x1: number, y1: number, color: string) {
    const ctx = this.instance.ctx[canvas];

    ctx.strokeStyle = color;
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.stroke();
  }

  public static drawEllipse (canvas: string, x: number, y: number, radiusX: number, radiusY: number, rotation: number, startAngle: number, endAngle: number, strokeColor: string) {
    const ctx = this.instance.ctx[canvas];
  
    ctx.strokeStyle = strokeColor;
    ctx.beginPath();
    ctx.ellipse(x, y, radiusX, radiusY, rotation, startAngle, endAngle);
    ctx.stroke();
    ctx.closePath();
  }

  public static custom(canvas: string, cb: (ctx: CanvasRenderingContext2D) => void) {
    const ctx = this.instance.ctx[canvas];
    cb(ctx);
  }

  public static drawCircle(canvas: string, centerX: number, centerY: number, radius: number, strokeColor: string) {
    const ctx = this.instance.ctx[canvas];

    ctx.strokeStyle = strokeColor;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.closePath();
  }

  public static text (canvas: string, txt: string, x: number, y: number, options?: TextOptions) {
    const ctx = this.instance.ctx[canvas];

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

  public static clearRect (canvas: string, x: number = 0, y: number = 0, w: number = this.width, h: number = this.height) {
    const ctx = this.instance.ctx[canvas];

    ctx.clearRect(x, y, w, h);
  }
}