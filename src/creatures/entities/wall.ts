import { Canvas } from "../engine/canvas";
import { SceneNode } from "../engine/scene";
import { Path } from "../geometry/path";
import { deg } from "../geometry/utils";
import { Vector2 } from "../geometry/vec2";
import { DOMSegment } from "../utils";
import { Renderable } from "./renderable";

export class Wall extends Renderable {

  private _segment: DOMSegment;
  private _width: number;

  public constructor (parent: SceneNode, segment: DOMSegment, width: number = 10) {
    const from = segment.from;
    const to = segment.to;
    const vector = new Vector2(to.x - from.x, to.y - from.y);
    const orientation = deg(vector.heading);
    const midPoint = new DOMPoint((to.x + from.x) * 0.5, (to.y + from.y) * 0.5);
    const length = vector.length;
    const shape = new Path();
    shape.rect(-length / 2, -width / 2, length, width);
    super(parent, midPoint.x, midPoint.y, orientation, shape, 'WALL');
    this._segment = segment;
    this._width = width;
  }

  protected override onRender() {
    Canvas.custom((ctx) => {
      ctx.fillStyle = 'red';
      ctx.fill(this.shape!);
    });
  }

}