import { Vector2 } from "../vector2";
import { Color } from "./color";
import { GameObject } from "./game-object";
import { World } from "./world";

export class Bullet extends GameObject {

  private _speed: number = 6;

  private _exists: boolean = true;

  constructor(position: Vector2, private _direction: number, private _world: World) {
      super();
      this._position = position;
  }

  drawTo(context: CanvasRenderingContext2D) {
      context.beginPath();
      context.strokeStyle = 'rgb(200, 0, 0)';
      context.arc(this._position['x'],this._position['y'],3,0,2*Math.PI);
      context.stroke();
  }

  iterate() {
      let new_position = new Vector2(
          this._position['x'] + this._speed * Math.cos(this._direction),
          this._position['y'] + this._speed * Math.sin(this._direction)
      );

      if(this._collidesWithWall(new_position)) {
          this.remove();
          return;
      }

      this._position['x'] = this._keepInRange(new_position['x'], 0, 1600);
      this._position['y'] = this._keepInRange(new_position['y'], 0, 900);
  }

  _collidesWithWall(new_position: Vector2) {
      let collides = false;
      this._world.getWalls().forEach(wall => {
          collides = collides || wall.vectorColides([this._position, new_position], 5);
      });
      return collides;
  }

  _keepInRange(value: number, min: number, max: number) {
      if (value < min || value > max) {
          this.remove();
      }
      return value;
  }

  public get exists() {
      return this._exists;
  }

  remove() {
      this._exists = false;
  }

  public override visible(position: Vector2, direction: number) {
      let visibilityData = this._visibilityData(position, direction);
      return visibilityData['distanceFromEye'] > 0 && visibilityData['distanceFromLineOfSight'] < 5;
  }

  public override visibilityDistance(position: Vector2, direction: number) {
      let visibilityData = this._visibilityData(position, direction);
      return visibilityData['distanceFromEye'];
  }

  public visibilityColor(position: Vector2, direction: number) {
      return new Color({ r:200, g:0, b:0 });
  }
}