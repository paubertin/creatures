import { Vector2 } from "../../vector2";
import { Canvas } from "../engine/canvas";
import { SceneNode } from "../engine/scene";
import { Path } from "../geometry/path";
import { Renderable } from "./renderable";

export class Food extends Renderable {
  public size: number;

  public color: string = '#249710';


  public constructor (parent: SceneNode) {
    const size: number = (Canvas.width / Canvas.height) * 4;
    const position = new Vector2(
      (Math.random() * (Canvas.width - size)) + size,
      (Math.random() * (Canvas.height - size)) + size,
    )
    const shape = new Path();
    shape.arc(0, 0, 4, 0, Math.PI * 2);
    super(parent, position.x, position.y, 0, shape, 'FOOD');
    this.size = size;
  }

  public override onRender () {
    Canvas.custom((ctx) => {
      ctx.fillStyle = this.color;
      ctx.fill(this.shape!);
    });
  }
}