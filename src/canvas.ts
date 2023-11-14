export class Canvas {

  private static _instance: Canvas;

  private _canvas!: HTMLCanvasElement;
  private _context!: CanvasRenderingContext2D;

  public static get initialized () {
    return this._instance !== undefined;
  }

  public static init (selector: string) {
    if (!this._instance) {
      this._instance = new Canvas(selector);
    }
  }

  private static _ckeckInitialized () {
    if (!this.initialized) {
      throw new Error('Canvas not initialized');
    }
  }

  private constructor (selector: string) {
    const canvas = document.querySelector<HTMLCanvasElement>(selector);
    if (!canvas) {
      throw new Error('Canvas not found');
    }
    this._canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Could not initialize canvas context');
    }
    this._context = ctx;
  }

  public static get context () {
    this._ckeckInitialized();
    return this._instance._context;
  }

  public static get canvas () {
    this._ckeckInitialized();
    return this._instance._canvas;
  }
}