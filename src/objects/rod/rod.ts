import { Events } from "../../events";
import { GameObject } from "../../gameObject";
import { Resources } from "../../resource";
import { Sprite } from "../../sprite";
import { Vector2 } from "../../vector2";

export class Rod extends GameObject {

  public constructor (x: number, y: number)
  public constructor (position: Vector2)
  public constructor (position: Vector2 | number, y?: number) {
    const pos = position instanceof Vector2 ? position : new Vector2(position, y);
    super(pos);

    const sprite = new Sprite({
      resource: Resources.get('rod'),
      position: new Vector2(0, -5),
    });

    this.addChild(sprite);

    Events.on('HERO_POSITION', this, (position: Vector2) => {
      const rounded = Vector2.round(position);
      if (rounded.equals(this.position)) {
        this._onCollideWithHero();
      }
    });
  }

  private _onCollideWithHero () {
    Events.emit('ROD_COLLIDE');
    this.destroy();
  }
}