import { Color } from "./color";
import { BaseDNA } from "./dna/base";
import { Vector2 } from "../vector2";
import { GameObject } from "./game-object";

export class Egg extends GameObject {

  private _exists: boolean = true;

  public constructor(position: Vector2, private _color: Color, private _dna: BaseDNA) {
      super();
      this._position = position;
  }

  public drawTo(context: CanvasRenderingContext2D) {
      context.beginPath();
      context.strokeStyle = `rgb(${this._color.r},${this._color.g},${this._color.b})`;
      context.arc(this._position['x'],this._position['y'],5,0,2*Math.PI);
      context.arc(this._position['x'],this._position['y'],2,0,2*Math.PI);
      context.stroke();

      if (this._dna.constructor.name === 'NeatDna') {
          context.beginPath();
          context.strokeStyle = `rgb(0,0,0)`;
          context.arc(this._position['x'],this._position['y'],1,0,1*Math.PI);
          context.stroke();
      }
  }

  public get exists() {
      return this._exists;
  }

  remove() {
      this._exists = false;
  }

  public override get radius() {
      return 5;
  }

  public get dna () {
    return this._dna;
  }

  public visibilityColor(position: Vector2, direction: number) {
      return this._color;
  }
}