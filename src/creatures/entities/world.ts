import { Canvas } from "../engine/canvas";
import { Scene, SceneNode } from "../engine/scene";

export class World extends SceneNode {

  public constructor (scene: Scene) {
    super(scene, 'world');
  }

  public override onRender () {
    Canvas.drawFillRect(0, 0, Canvas.width, Canvas.height, '#DDDDDD');
  }

}