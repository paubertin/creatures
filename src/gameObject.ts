import { Events } from "./events";
import { Vector2 } from "./vector2";

export class GameObject {

  public static count: number = 0;

  protected _id: number;
  protected _position: Vector2;
  protected _lastPosition: Vector2;
  protected _children: GameObject[] = [];
  protected _parent: GameObject | null = null;

  public constructor (position?: Vector2) {
    this._position = position?.clone() ?? new Vector2();
    this._lastPosition = this._position.clone();
    this._id = GameObject.getId();
  }

  public get position () {
    return this._position;
  }

  public set position (p: Vector2) {
    this._position = p;
  }

  public get hasMoved () {
    return !this._position.equals(this._lastPosition);
  }

  public get id () {
    return this._id;
  }

  public static getId () {
    return this.count++;
  }

  public onStart () {
    this._children.forEach((child) => child.onStart());
    this._onStart();
  }

  protected _onStart () {

  }

  public update (dt: number, root: GameObject) {
    this._lastPosition.copy(this._position);
    this._children.forEach((child) => child.update(dt, root));
    this._update(dt, root);
  }

  protected _update (dt: number, root: GameObject) {

  }

  public render (ctx: CanvasRenderingContext2D, position: Vector2 = new Vector2()) {
    const drawPosition = Vector2.add(this._position, position);

    this._render(ctx, drawPosition);

    this._children.forEach((child) => child.render(ctx, drawPosition));
  }

  protected _render (ctx: CanvasRenderingContext2D, position: Vector2) {}

  public addChild (child: GameObject) {
    child._parent = this;
    this._children.push(child);
  }

  public removeChild (child: GameObject) {
    child._parent = null;
    Events.unsubscribe(child);
    this._children = this._children.filter((c) => c._id !== child._id);
  }

  public get parent () {
    return this._parent;
  }

  public destroy () {
    this._children.forEach((child) => child.destroy());
    this.parent?.removeChild(this);
  }

}
