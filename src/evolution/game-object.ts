import { Vector2 } from "../vector2";
import { Color } from "./color";

export abstract class GameObject {
  protected _position: Vector2 = new Vector2();
  protected _radius: number = 0;

  protected _visibilityData(position: Vector2, direction: number) {
    let rx = this._position['x'] - position['x'];
    let ry = this._position['y'] - position['y'];

    let nx = rx * Math.cos(-direction) - ry * Math.sin(-direction);
    let ny = rx * Math.sin(-direction) + ry * Math.cos(-direction);

    return { distanceFromEye: nx, distanceFromLineOfSight: Math.abs(ny) };
  }

  public get radius () {
    return this._radius;
  }

  public get position () {
    return this._position;
  }

  public visible(position: Vector2, direction: number, angle: number) {
    let visibilityData = this._visibilityData(position, direction);
    let sightWidthAtDistance = visibilityData['distanceFromEye'] * Math.tan(angle);
    return visibilityData['distanceFromEye'] > 0 && visibilityData['distanceFromLineOfSight'] < sightWidthAtDistance + this.radius / 2;
  }

  public visibilityDistance(position: Vector2, direction: number) {
    let visibilityData = this._visibilityData(position, direction);
    return visibilityData['distanceFromEye'];
  }

  public abstract visibilityColor (position: Vector2, direction: number): Color;

}