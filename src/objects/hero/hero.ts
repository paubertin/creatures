import { Animations } from "../../animations";
import { Events } from "../../events";
import { FrameIndexPattern } from "../../frameIndexPattern";
import { GameObject } from "../../gameObject";
import { GRID_SIZE } from "../../helpers/constants";
import { gridCells, isSpaceFree } from "../../helpers/grid";
import { moveTowards } from "../../helpers/moveTowards";
import { ARROW, Input } from "../../input";
import { walls } from "../../levels/level1";
import { Resources } from "../../resource";
import { Sprite } from "../../sprite";
import { Vector2 } from "../../vector2";
import { STANDING_DOWN, STANDING_LEFT, STANDING_RIGHT, STANDING_UP, WALK_DOWN, WALK_LEFT, WALK_RIGHT, WALK_UP, makeStandingFrames } from './hero.animations';

export class Hero extends GameObject {

  private _facingDirection: ARROW = ARROW.DOWN;
  private _destination: Vector2;
  private _body: Sprite;

  private _timeStill = 0;

  public constructor (x: number, y: number)
  public constructor (position: Vector2)
  public constructor (position: Vector2 | number, y?: number) {
    const pos = position instanceof Vector2 ? position : new Vector2(position, y);
    super(pos);
    this._destination = this._position.clone();

    const shadow = new Sprite({
      resource: Resources.get('shadow'),
      frameSize: new Vector2(32, 32),
      position: new Vector2(-8, -20),
    });

    this.addChild(shadow);

    this._body = new Sprite({
      resource: Resources.get('neko'),
      frameSize: new Vector2(34, 34),
      hFrames: 10,
      vFrames: 2,
      frame: 0,
      position: new Vector2(-9, -20),
      animations: new Animations({
        walkLeft: new FrameIndexPattern({ duration: 200, frames: [ { time: 0, frame: 1 }, { time: 100, frame: 9 } ]}),
        walkRight: new FrameIndexPattern({ duration: 200, frames: [ { time: 0, frame: 18 }, { time: 100, frame: 10 } ]}),
        walkDown:  new FrameIndexPattern(makeStandingFrames(0)),
        walkUp:  new FrameIndexPattern(makeStandingFrames(0)),
        standRight: new FrameIndexPattern(makeStandingFrames(0)),
        standLeft: new FrameIndexPattern(makeStandingFrames(0)),
        standDown: new FrameIndexPattern(makeStandingFrames(0)),
        standUp: new FrameIndexPattern(makeStandingFrames(0)),
        crying: new FrameIndexPattern({ duration: 400, frames: [ {time: 0, frame: 4}, { time: 200, frame: 6 } ] }),
        happy: new FrameIndexPattern({ duration: 200, frames: [ { time: 0, frame: 2 }, { time: 100, frame: 5 } ]}), 
        /*
        */
      }),
      /*
      animations: new Animations({
        walkRight: new FrameIndexPattern(WALK_RIGHT),
        walkLeft: new FrameIndexPattern(WALK_LEFT),
        walkDown: new FrameIndexPattern(WALK_DOWN),
        walkUp: new FrameIndexPattern(WALK_UP),
        standRight: new FrameIndexPattern(STANDING_RIGHT),
        standLeft: new FrameIndexPattern(STANDING_LEFT),
        standDown: new FrameIndexPattern(STANDING_DOWN),
        standUp: new FrameIndexPattern(STANDING_UP),
      }),
      */
    });

    this.addChild(this._body);

    Events.on('ROD_COLLIDE', this, () => {
      this._body.animations?.playAndOverride('happy', 1000);
    });
  }

  protected override _onStart () {
    Events.emit('HERO_POSITION', this.position);
  }

  protected override _update (dt: number, root: GameObject) {
    const distance = moveTowards(this, this._destination);
    const hasArrived = distance <= 1;
    if (hasArrived) {
      this._tryMove(dt);
    }

    this._tryEmitPosition();
  }

  private _tryEmitPosition () {
    if (this.hasMoved) {
      Events.emit('HERO_POSITION', this.position);
    }
  }

  private _tryMove (dt: number) {
    this._timeStill += dt;
    if (Input.direction === undefined) {
      if (this._timeStill > 4000) { this._body.animations?.play('crying') }
      else if (this._facingDirection === ARROW.LEFT) { this._body.animations?.play('standLeft')}
      else if (this._facingDirection === ARROW.DOWN) { this._body.animations?.play('standDown')}
      else if (this._facingDirection === ARROW.UP) { this._body.animations?.play('standUp')}
      else if (this._facingDirection === ARROW.RIGHT) { this._body.animations?.play('standRight')}
      return;
    }
    this._timeStill = 0;

    const nextPosition = this._destination.clone();;

    if (Input.direction === ARROW.DOWN) {
      nextPosition.y += GRID_SIZE;
      this._body.animations?.play('walkDown');
    }
    else if (Input.direction === ARROW.UP) {
      nextPosition.y -= GRID_SIZE;
      this._body.animations?.play('walkUp');
    }
    else if (Input.direction === ARROW.RIGHT) {
      nextPosition.x += GRID_SIZE;
      this._body.animations?.play('walkRight');
    }
    else if (Input.direction === ARROW.LEFT) {
      nextPosition.x -= GRID_SIZE;
      this._body.animations?.play('walkLeft');
    }

    this._facingDirection = Input.direction ?? this._facingDirection;

    if (isSpaceFree(walls, nextPosition)) {
      this._destination = nextPosition;
    }

  };

}