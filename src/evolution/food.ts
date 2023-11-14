import { Vector2 } from "../vector2";
import { Color } from "./color";
import { GameObject } from "./game-object";

export class Food extends GameObject {

  private _exists: boolean = true;

  constructor(position: Vector2, private _value: number, radius: number) {
    super();
    this._position = position;
    this._radius = radius;
  }

  drawTo(context: CanvasRenderingContext2D) {
    context.beginPath();
    let color = this.visibilityColor();
    context.strokeStyle = `rgb(${color.r},${color.g},${color.b})`;
    context.arc(this._position['x'], this._position['y'], this.radius, 0, 2 * Math.PI);
    context.stroke();
  }

  exists() {
    return this._exists;
  }

  remove() {
    this._exists = false;
  }

  public get value() {
    return this._value;
  }

  public visibilityColor(position?: Vector2, direction?: number) {
    return new Color({ r: 0, g: 0, b: 0 });
  }
}