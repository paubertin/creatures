import { Vector2 } from "../../vector2";
import { Canvas } from "../engine/canvas";
import { SceneNode } from "../engine/scene";
import { TimeStep } from "../engine/time";
import { Path } from "../geometry/path";
import { BBox } from "../utils";

export class Renderable extends SceneNode {

  public position: Vector2;
  public orientation: number;
  public shape?: Path;
  public bbox?: BBox;
  public vertices?: DOMPoint[];

  public transform: DOMMatrix;

  public constructor (parent: SceneNode, x: number, y: number, orientation: number = 0, shape?: Path, name?: string) {
    super(parent, name);
    this.position = new Vector2(x, y);
    this.orientation = orientation;
    this.transform = new DOMMatrix();
    this.transform.translateSelf(this.position.x, this.position.y);
    this.transform.rotateSelf(0, 0, this.orientation);
  }

  protected override onPostUpdate(step: TimeStep): void {
    this.transform = new DOMMatrix();
    this.transform.translateSelf(this.position.x, this.position.y);
    this.transform.rotateSelf(0, 0, this.orientation);

    super.onPostUpdate(step);
  }

  protected override onPreRender(): void {
    Canvas.save();
    const parentTransform = this.parent instanceof Renderable ? this.parent.transform : new DOMMatrix();
    Canvas.setTransform(this.transform.multiply(parentTransform));

    super.onPreRender();
  }

  protected override onPostRender(): void {
    Canvas.restore();   

    super.onPostRender();
  }

}