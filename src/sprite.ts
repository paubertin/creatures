import { Animations } from "./animations";
import { GameObject } from "./gameObject";
import { GRID_SIZE } from "./helpers/constants";
import { ImageResource } from "./resource";
import { Vector2 } from "./vector2";

interface Spriteoptions {
  resource: ImageResource;
  frameSize?: Vector2;
  hFrames?: number;
  vFrames?: number;
  frame?: number;
  scale?: number;
  position?: Vector2;
  animations?: Animations;
}

export class Sprite extends GameObject {

  private _resource: ImageResource;
  private _frameSize: Vector2;
  private _hFrames: number;
  private _vFrames: number;
  private _frame: number;
  private _scale: number;
  public animations: Animations | null;

  private _frameMap: Map<number, Vector2> = new Map();

  public constructor (opts: Spriteoptions) {
    super(opts.position);
    this._resource = opts.resource;
    this._frameSize = opts.frameSize ?? new Vector2(GRID_SIZE, GRID_SIZE);
    this._hFrames = opts.hFrames ?? 1;
    this._vFrames = opts.vFrames ?? 1;
    this._frame = opts.frame ?? 0;
    this._scale = opts.scale ?? 1;
    this.animations = opts.animations ?? null;
    this._buildFrameMap();
  }

  public set resource (img: ImageResource) {
    this._resource = img;
  }

  public set frameSize (vec: Vector2) {
    this._frameSize = vec;
  }

  public set frame (f: number) {
    this._frame = f;
  }

  protected override _update (dt: number, root: GameObject) {
    if (!this.animations) {
      return;
    }

    this.animations.update(dt);
    this._frame = this.animations.frame;
  }

  private _buildFrameMap () {
    let frameCount = 0;
    for (let v = 0; v < this._vFrames; ++v) {
      for (let h = 0; h < this._hFrames; ++h) {
        this._frameMap.set(frameCount, new Vector2(this._frameSize.x * h, this._frameSize.y * v));
        frameCount++;
      }
    }
  }

  protected override _render (ctx: CanvasRenderingContext2D, pos: Vector2) {
    if (!this._resource.isLoaded) {
      return;
    }

    let frameCoordX = 0;
    let frameCoordY = 0;
    const frame = this._frameMap.get(this._frame);
    if (frame) {
      frameCoordX = frame.x;
      frameCoordY = frame.y;
    }

    const frameSizeX = this._frameSize.x;
    const frameSizeY = this._frameSize.y;

    ctx.drawImage(
      this._resource.image,
      frameCoordX,
      frameCoordY,
      frameSizeX,
      frameSizeY,
      pos.x,
      pos.y,
      frameSizeX * this._scale,
      frameSizeY * this._scale,
    );
  }

}
