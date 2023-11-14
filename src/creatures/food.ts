import { Vector2 } from "../vector2";
import { Canvas } from "./canvas";

export class Food {
  public size: number = (Canvas.width / Canvas.height) * 4;

  public color: string = '#FF0000';

  public position: Vector2;

  public constructor () {
    this.position = new Vector2(
      (Math.random() * (Canvas.width - this.size)) + this.size,
      (Math.random() * (Canvas.height - this.size)) + this.size,
    );
  }

  public render () {
    Canvas.drawFillRect('food', this.position.x, this.position.y, this.size, this.size, this.color);
  }
}