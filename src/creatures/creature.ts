import { Vector2 } from "../vector2";
import { Canvas, TextOptions } from "./canvas";
import { CreatureManager } from "./creature.manager";
import { FoodManager } from "./food.manager";
import Network from "./network";
import { fastCos, fastSin, getAngle, isPointInsideEllipse, random, toRad } from "./utils";

export enum Gender {
  UNDEFINED = 'undefined',
  MALE = 'male',
  FEMALE = 'female',
}

export const CREATURE_MAXIMUM_HEALTH: number = 2000;
export const TIME_TO_BE_ADULT: number = 200;
export const TIME_TO_GIVE_BIRTH: number = 200;
export const MAX_SPEED: number = 3 * 0.6;
export const MAX_FORCE: number = 0.03 * 2;

export interface CreatureOptions {
  color?: string;
  rayColor?: string;
  gender?: Gender;
  percentMaxSpeed?: number;
  position?: Vector2;
  health?: number;
  input?: number;
  hidden?: number[];
  output?: number;
}

export class Creature {

  private static ID: number = 0;

  public transform: DOMMatrix = new DOMMatrix();

  private manager!: typeof CreatureManager;

  public size: number;
  public health: number;
  public color: string;
  public rayColor: string;
  public gender: Gender;
  public maxSpeed: number;
  public position: Vector2;
  public velocity: Vector2;
  public acceleration: Vector2 = new Vector2();
  public angle: number;

  public targetCenter: Vector2 = new Vector2();
  public targetLocation: Vector2 = new Vector2();

  public timeAlive: number = 0;
  public timePregnant: number = 0;
  public isPregnant: boolean = false;

  public brain: Network;

  public id: number = Creature.ID++;

  public constructor(opts?: CreatureOptions) {
    const size = (Canvas.width > Canvas.height) ? (Canvas.width / Canvas.height) * 12 : (Canvas.height / Canvas.width) * 12;
    const options: Required<CreatureOptions> = {
      color: '#888888',
      rayColor: '#888888',
      gender: Gender.UNDEFINED,
      percentMaxSpeed: 1,
      position: new Vector2(
        (Math.random() * (Canvas.width - ((Canvas.width > Canvas.height) ? (Canvas.width / Canvas.height) * 12 : (Canvas.height / Canvas.width) * 12))) + ((Canvas.width > Canvas.height) ? (Canvas.width / Canvas.height) * 12 : (Canvas.height / Canvas.width) * 12),
        (Math.random() * (Canvas.height - ((Canvas.width > Canvas.height) ? (Canvas.width / Canvas.height) * 12 : (Canvas.height / Canvas.width) * 12))) + ((Canvas.width > Canvas.height) ? (Canvas.width / Canvas.height) * 12 : (Canvas.height / Canvas.width) * 12),
      ),
      health: 1000,
      input: 5,
      hidden: [10, 8, 6, 4],
      output: 2,
      ...opts,
    };
    this.size = size;
    this.color = options.color;
    this.health = options.health;
    this.rayColor = options.rayColor;
    this.gender = options.gender;

    this.maxSpeed = options.percentMaxSpeed * MAX_SPEED;
    this.position = options.position;
    this.velocity = new Vector2(random(-1, 1), random(-1, 1));
    this.angle = this.velocity.heading;

    this.brain = new Network();
    this.brain.generateNetworkLayers(options.input, options.hidden, options.output);
    console.log(this.brain);

    this.transform.translateSelf(this.position.x, this.position.y);
    this.transform.rotateSelf(this.angle);
  }

  public setManager (m: typeof CreatureManager) {
    this.manager = m;
    return this;
  }

  public get x() {
    return this.position.x;
  }

  public get y() {
    return this.position.y;
  }

  public get rayRadius() {
    const radius = (this.health * (this.size * 4)) / 1000;
    return radius <= this.size ? this.size : radius;
  }

  public get currentSpeed() {
    return (this.health * this.maxSpeed) / (CREATURE_MAXIMUM_HEALTH / 2);
  }

  public isPointInside (pt: DOMPoint) {
    const inverse = this.transform.inverse();
    const point = pt.matrixTransform(inverse);
    return isPointInsideEllipse(point, new DOMPoint(), this.size * 2, this.size);
  }

  public getClosestFood () {
    let minDist = Infinity;
    let position: Vector2 | undefined = undefined;
    for (const food of FoodManager.activeFood) {
      const dist = Vector2.distanceSq(this.position, food.position);
      if (dist < minDist) {
        minDist = dist;
        position = food.position.clone();
      }
    }
    if (minDist < this.rayRadius * this.rayRadius) {
      return position;
    }
    else {
      return undefined;
    }
  }

  private _seek (target: Vector2) {
    const desired = Vector2.add(target, this.position.opposite()).normalize().mult(this.maxSpeed);
    const steer = Vector2.add(desired, this.velocity.opposite()).limit(MAX_FORCE);
    return steer;

  }

  private _calculateTarget(action1: number, action2: number) {
    const state = action1;
    const state2 = (action2 + 1) / 2;

    const angle = state * Math.PI * 0.5 + this.angle;

    const r = this.size * state2;
    const x = r * fastCos(angle);
    const y = r * fastSin(angle);

    this.targetCenter.x = this.position.x + r * fastCos(this.angle);
    this.targetCenter.y = this.position.y + r * fastSin(this.angle);

    this.targetLocation.x = this.targetCenter.x + x * 1.25;
    this.targetLocation.y = this.targetCenter.y + y * 1.25;
  }

  private _applyForce (force: Vector2) {
    this.acceleration.add(force);
  }

  private _update () {
    this.velocity.add(this.acceleration);
    this.velocity.limit(this.maxSpeed);
    if (this.velocity.sqLength > 0) {
      this.angle = this.velocity.heading;
    }
    this.position.add(this.velocity);
    this.acceleration.mult(0);
  }

  public update() {
    const food = this.getClosestFood();
    let foodDist = -1;
    let foodDir = -1;
    if (food) {
      const direction = Vector2.add(this.position, food.opposite());
      foodDist = direction.length / this.rayRadius;
      foodDir = direction.heading;
    }
    const res = this.brain.compute([food ? 1 : 0, this.position.x / Canvas.width, this.position.y / Canvas.height, this.velocity.x, this.velocity.y]);

    this._calculateTarget(this.brain.getAction(0), this.brain.getAction(1));

    const seekForce = this._seek(this.targetLocation);

    this._applyForce(seekForce);

    this._update();

    if (this.x < 0) {
      this.position.x = 0;
      //if the horizontal speed is negative
      //(without this check there will be special cases where the creature will be stuck,
      //endlessly inverting the horizontal speed value from positive to negative and vice versa)
      if (this.velocity.x < 0)
        //invert the value of the horizontal speed
        this.velocity.x *= -1;
    }
    //if this creature is exiting the right boundarie of the screen
    if (this.x > Canvas.width) {
      this.position.x = Canvas.width;
      //if the horizontal speed is positive
      //(without this check there will be special cases where the creature will be stuck,
      //endlessly inverting the horizontal speed value from positive to negative and vice versa)
      if (this.velocity.x > 0)
        //invert the value of the horizontal speed
        this.velocity.x *= -1;
    }
    //if this creature is exiting the top boundarie of the screen
    if (this.y < 0) {
      this.position.y = 0;
      //if the vertical speed is negative
      //(without this check there will be special cases where the creature will be stuck,
      //endlessly inverting the vertical speed value from positive to negative and vice versa)
      if (this.velocity.y < 0)
        //invert the value of the vertical speed
        this.velocity.y *= -1;
    }
    //if this creature is exiting the bottom boundarie of the screen
    if (this.y > Canvas.height) {
      this.position.y = Canvas.height;
      //if the vertical speed is positive
      //(without this check there will be special cases where the creature will be stuck,
      //endlessly inverting the vertical speed value from positive to negative and vice versa)
      if (this.velocity.y > 0)
        //invert the value of the vertical speed
        this.velocity.y *= -1;
    }

    //decrease the health of this creature
    // this.health--;

    //increment this creature time alive
    this.timeAlive++;

    this.transform = new DOMMatrix();
    this.transform.translateSelf(this.position.x, this.position.y);
    this.transform.rotateSelf(this.angle);
  }

  public render() {

    Canvas.custom('creatures', (ctx) => {
      ctx.save();

      if (this.manager.selectedCreature && this.manager.selectedCreature.id !== this.id) {
        ctx.globalAlpha = 0.2;
      }
  
      ctx.setTransform(this.transform);

      ctx.strokeStyle = this.rayColor;
      ctx.beginPath();
      ctx.ellipse(0, 0, this.size * 2, this.size, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.closePath();

      let p = new DOMPoint(this.size * 1.72, 0);
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3, 0, 2 * Math.PI);
      ctx.stroke();
      ctx.closePath();

      ctx.moveTo(p.x, p.y);
      let transform = new DOMMatrix();
      transform.translateSelf(p.x, p.y);
      transform.rotateSelf(-30);
      transform.translateSelf(this.size, 0);
      let endPoint = p.matrixTransform(transform);
      ctx.lineTo(endPoint.x, endPoint.y);
      ctx.stroke();
  
      ctx.moveTo(p.x, p.y);
      transform = new DOMMatrix();
      transform.translateSelf(p.x, p.y);
      transform.rotateSelf(30);
      transform.translateSelf(this.size, 0);
      endPoint = p.matrixTransform(transform);
      ctx.lineTo(endPoint.x, endPoint.y);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(this.size * 1.5, -7, 3, 0, 2 * Math.PI);
      ctx.stroke();
      ctx.closePath();

      ctx.beginPath();
      ctx.arc(this.size * 1.5, 7, 3, 0, 2 * Math.PI);
      ctx.stroke();
      ctx.closePath();

      ctx.restore();
    });

    // Canvas.drawFillRect('creatures', this.x - this.size / 2, this.y - this.size / 2, this.size, this.size, this.color);
    // Canvas.drawCircle('creatures', this.x, this.y, this.rayRadius, this.rayColor);
    /*
    Canvas.drawEllipse('creatures',
      this.x + this.size / 2 * alpha,
      this.y + this.size / 2 * alpha,
      this.rayRadius * 2 * alpha,
      this.rayRadius * alpha,
      toRad(this.angle),
      0,
      Math.PI * 2,
      this.rayColor);
    */

      /*
    Canvas.save('creatures');
    Canvas.rotate('creatures', toRad(this.angle));
    Canvas.drawLine('creatures',
      this.x + this.size / 2 * alpha,
      this.y + this.size / 2 * alpha,
      this.x + this.size / 2 * alpha + this.rayRadius * 2.5 * alpha,
      this.y + this.size / 2 * alpha,
      this.rayColor);
    Canvas.restore('creatures');
    */

    if (this.manager.selectedCreature?.id === this.id) {
      const fontSize = Canvas.width > 900
        ? 10
        : Canvas.width > 450
          ? 6
          : 4;

      const options: TextOptions = {
        fillStyle: '#000000',
        fontSize,
        font: 'Arial',
      };

      Canvas.text('creatures', `Angle: ${(Math.round(this.angle * 100) / 100)}`, this.x - this.size, this.y - this.size * 2.5, options);
      Canvas.text('creatures', `Speed: ${Math.abs(Math.round(this.currentSpeed * 100) / 100)}`, this.x - this.size, this.y - this.size * 2, options);
      Canvas.text('creatures', `Health: ${Math.floor(this.health / 10)}`, this.x - this.size, this.y - this.size * 1.5, options);
      Canvas.text('creatures', `Age: ${Math.round(this.timeAlive)} (${this.isAdult ? 'Adult' : 'Child'})`, this.x - this.size, this.y - this.size, options);
      let state = '';
      if (this.isPregnant) {
        state += 'Pregnant ';
      }
      if (this.isDying) {
        state += 'Dying';
      }
      if (state === '') {
        state = 'Roaming';
      }
      Canvas.text('creatures', `State: ${state}`, this.x - this.size, this.y - this.size / 2, options);
    }

    if (this.isPregnant) {
      Canvas.drawCircle('creatures', this.x, this.y, this.timePregnant / 200, '#000000');
    }
  }

  public get isAdult() {
    return this.timeAlive > TIME_TO_BE_ADULT;
  }

  public get isDead() {
    return this.health <= 0;
  }

  public get isDying() {
    return (this.health / 10) <= 40;
  }
}