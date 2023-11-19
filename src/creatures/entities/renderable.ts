import { Vector2 } from "../../vector2";
import { Canvas } from "../engine/canvas";
import { SceneNode } from "../engine/scene";
import { TimeStep } from "../engine/time";
import { Matrix4 } from "../geometry/mat4";
import { Path } from "../geometry/path";
import { rad } from "../geometry/utils";
import { BBox } from "../utils";

const TRANSFORM_TYPE: 'CUSTOM' | 'DOM' = 'DOM';

export class Renderable extends SceneNode {

  public position: Vector2;
  public orientation: number;
  public shape?: Path;
  public bbox?: BBox;
  public vertices?: DOMPoint[];

  private _transform: Matrix4;
  private _domTransform: DOMMatrix;
  public rotation: DOMMatrix;
  public translation: DOMMatrix;

  public constructor (parent: SceneNode, x: number, y: number, orientation: number = 0, shape?: Path, name?: string) {
    super(parent, name);
    this.position = new Vector2(x, y);
    this.orientation = orientation;
    this._transform = new Matrix4();
    this._transform.rotateSelf(rad(this.orientation));
    this._transform.translateSelf(this.position.x, this.position.y);
    this._domTransform = new DOMMatrix();
    this._domTransform.translateSelf(this.position.x, this.position.y);
    this._domTransform.rotateSelf(this.orientation);

    this.translation = new DOMMatrix();
    this.translation.translateSelf(this.position.x, this.position.y);
    this.rotation = new DOMMatrix();
    this.rotation.rotateSelf(this.orientation);

    this.shape = shape;

    if (this.shape) {
      this.bbox = this.shape.getBBox();
    }
  }

  protected override onPostUpdate(step: TimeStep): void {
    this._transform = new Matrix4();
    this._transform.rotateSelfDeg(0, 0, rad(this.orientation));
    this._transform.translateSelf(this.position.x, this.position.y);

    this._domTransform = new DOMMatrix();
    this._domTransform.translateSelf(this.position.x, this.position.y);
    this._domTransform.rotateSelf(0, 0, this.orientation);

    this.translation = new DOMMatrix();
    this.translation.translateSelf(this.position.x, this.position.y);
    this.rotation = new DOMMatrix();
    this.rotation.rotateSelf(this.orientation);

    super.onPostUpdate(step);
  }

  public get transform (): DOMMatrix {
    return (TRANSFORM_TYPE === 'CUSTOM' ? this._transform : this._domTransform) as DOMMatrix;
  }

  public get globalTransform (): Matrix4 | DOMMatrix {
    const parentTransform = this.parent instanceof Renderable ? this.parent.globalTransform : (TRANSFORM_TYPE === 'CUSTOM' ? new Matrix4() : new DOMMatrix());

    return (this.transform as any).multiply(parentTransform);
  }

  protected override onPreRender(): void {
    Canvas.save();
    const parentTransform = this.parent instanceof Renderable ? this.parent.transform : (TRANSFORM_TYPE === 'CUSTOM' ? new Matrix4() : new DOMMatrix());

    Canvas.setTransform((this.transform as any).multiply(parentTransform));
    // Canvas.setTransform(this.transform.multiply(parentTransform));

    super.onPreRender();
  }

  protected override onPostRender(): void {
    Canvas.restore();   

    super.onPostRender();
  }

}