import { Vector2 } from "../../vector2";
import { Canvas } from "../engine/canvas";
import { SceneNode } from "../engine/scene";
import { Renderable } from "./renderable";

export class Food extends Renderable {
  public size: number;

  public color: string = '#FF0000';


  public constructor (parent: SceneNode) {
    const size: number = (Canvas.width / Canvas.height) * 4;
    const position = new Vector2(
      (Math.random() * (Canvas.width - size)) + size,
      (Math.random() * (Canvas.height - size)) + size,
    )
    super(parent, position.x, position.y);
    this.size = size;
  }

  public override onRender () {
    Canvas.drawFillRect(this.position.x, this.position.y, this.size, this.size, this.color);
  }
}