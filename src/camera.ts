import { Canvas } from "./canvas";
import { Events } from "./events";
import { GameObject } from "./gameObject";
import { Vector2 } from "./vector2";

export class Camera extends GameObject {

  public constructor () {
    super();

    Events.on('HERO_POSITION', this, (heroPosition: Vector2) => {
      const heroHalf = 8;
      const width = Canvas.canvas.width;
      const height = Canvas.canvas.height;
      const halfWidth = -heroHalf + width / 2;
      const halfHeight = -heroHalf + height / 2;
      this.position = new Vector2(-heroPosition.x + halfWidth, -heroPosition.y + halfHeight);
    });
  }

}