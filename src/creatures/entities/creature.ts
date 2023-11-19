import { Vector2 } from "../../vector2";
import { Canvas, TextOptions } from "../engine/canvas";
import { CreatureManager } from "../creature.manager";
import { FoodManager } from "../food.manager";
import { Path } from "../geometry/path";
import Network from "../network";
import { RangeSensor, Sensor } from "./sensor";
import { BBox, fastCos, fastSin, getAngle, isPointInsideEllipse, random, toRad } from "../utils";
import { SceneNode } from "../engine/scene";
import { TimeStep } from "../engine/time";
import { Renderable } from "./renderable";
import { rad } from "../geometry/utils";

export enum Gender {
  UNDEFINED = 'undefined',
  MALE = 'male',
  FEMALE = 'female',
}

export const CREATURE_MAXIMUM_HEALTH: number = 2000;
export const TIME_TO_BE_ADULT: number = 200;
export const TIME_TO_GIVE_BIRTH: number = 200;
export const MAX_SPEED: number = 10;
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

export class Creature extends Renderable {

  public override shape: Path;
  public override bbox: BBox;
  public override vertices: DOMPoint[];

  private manager?: typeof CreatureManager;

  public sensors: RangeSensor[] = [];

  public size: number;
  public health: number;
  public color: string;
  public rayColor: string;
  public gender: Gender;
  public maxSpeed: number;
  public velocity: Vector2;
  public acceleration: Vector2 = new Vector2();

  public targetCenter: Vector2 = new Vector2();
  public targetLocation: Vector2 = new Vector2();

  public timeAlive: number = 0;
  public timePregnant: number = 0;
  public isPregnant: boolean = false;

  public brain: Network;

  public constructor(parent: SceneNode, opts?: CreatureOptions) {
    const position = new Vector2(
      (Math.random() * (Canvas.width - ((Canvas.width > Canvas.height) ? (Canvas.width / Canvas.height) * 12 : (Canvas.height / Canvas.width) * 12))) + ((Canvas.width > Canvas.height) ? (Canvas.width / Canvas.height) * 12 : (Canvas.height / Canvas.width) * 12),
      (Math.random() * (Canvas.height - ((Canvas.width > Canvas.height) ? (Canvas.width / Canvas.height) * 12 : (Canvas.height / Canvas.width) * 12))) + ((Canvas.width > Canvas.height) ? (Canvas.width / Canvas.height) * 12 : (Canvas.height / Canvas.width) * 12),
    );
    const velocity = new Vector2(random(-1, 1), random(-1, 1));
    // const vx = Math.random() < 0.5 ? -1 : 1;
    // const velocity = new Vector2(vx, 1);
    super(parent, position.x, position.y, velocity.heading, undefined, 'creature');

    const sensor = new RangeSensor(this, 200, 0, 60);
    this.sensors.push(
      sensor,
    );

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
      input: 0 + this.sensors.reduce((n, s) => { return n + s.resolution }, 0),
      hidden: [ 5 ],
      output: 2,
      ...opts,
    };

    this.size = 10;
    this.color = options.color;
    this.health = options.health;
    this.rayColor = options.rayColor;
    this.gender = options.gender;

    this.maxSpeed = options.percentMaxSpeed * MAX_SPEED;
    this.position = options.position;
    this.velocity = velocity;
    this.velocity = new Vector2(0, 0);

    this.brain = new Network();
    this.brain.generateNetworkLayers(options.input, options.hidden, options.output);
    this.addChild(sensor);

    this.shape = new Path();
    this.shape.ellipse(0, 0, this.size * 2, this.size, 0, 0, Math.PI * 2);
    this.bbox = this.shape.getBBox();

    this.vertices = this.shape.toVertices(15);
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

    const angle = state * Math.PI * 0.5 + this.orientation;

    const r = this.size * state2;
    const x = r * fastCos(angle);
    const y = r * fastSin(angle);

    this.targetCenter.x = this.position.x + r * fastCos(this.orientation);
    this.targetCenter.y = this.position.y + r * fastSin(this.orientation);

    this.targetLocation.x = this.targetCenter.x + x * 1.25;
    this.targetLocation.y = this.targetCenter.y + y * 1.25;
  }

  private _applyForce (force: Vector2) {
    this.acceleration.add(force);
  }

  private _update (step: TimeStep) {
    // console.log('before update, Vx =', this.velocity.x);
    // console.log('before update, Vy =', this.velocity.y);
    this.velocity.add(this.acceleration);
    this.velocity.limit(this.maxSpeed); 
    if (this.velocity.sqLength > 0) {
      this.orientation = this.velocity.heading;
    }
    // console.log('after update, Vx =', this.velocity.x);
    // console.log('after update, Vy =', this.velocity.y);
    this.position.add(this.velocity);
    // this.position.add(Vector2.add(this.velocity.mult(step.seconds), this.acceleration.mult(step.seconds * step.seconds)));
    this.acceleration.mult(0);
  }

  private _updateMovement (forward: 1 | 0, reverse: 1 | 0, left: 1 | 0, right: 1 | 0) {
    console.log(forward, reverse, left, right);
    let speed = this.velocity.length;
    if(forward){
        speed+=0.4 * MAX_SPEED;
    }
    if(reverse){
      speed-=0.4 * MAX_SPEED;
    }

    if(speed>this.maxSpeed){
        speed=this.maxSpeed;
    }
    if(speed<-this.maxSpeed/2){
        speed=-this.maxSpeed/2;
    }

    if(speed!=0){
        const flip=speed>0?1:-1;
        if(left){
            this.orientation+=rad(0.03*flip);
        }
        if(right){
            this.orientation-=rad(0.03*flip);
        }
    }

    this.position.x-=Math.sin(rad(this.orientation))*speed;
    this.position.y-=Math.cos(rad(this.orientation))*speed;
  }

  protected override onUpdate(step: TimeStep) {
    if (this.manager?.selectedCreature?.id === this.id) return;

    const readings = this.sensors.map((s) => s.readings);

    const food = this.getClosestFood();
    let foodDist = -1;
    let foodDir = -1;
    if (food) {
      const direction = Vector2.add(this.position, food.opposite());
      foodDist = direction.length / this.rayRadius;
      foodDir = direction.heading;
    }

    const activations = this.sensors.map((s) => s.activated ? 1 : 0);
    const sensorsInputs: number[] = [];
    for (const sensor of this.sensors) {
      const readings = sensor.readings;
      readings.forEach((reading) => {
        if (reading === null) {
          sensorsInputs.push(0);
        }
        else {
          sensorsInputs.push(1 - reading.offset);
        }
      });
    }


    // console.log('inputs', [ ...sensorsInputs, this.position.x / Canvas.width, this.position.y / Canvas.height, this.velocity.length / MAX_SPEED, (this.orientation % 360) / 360]);
    const res = this.brain.compute([ ...sensorsInputs ]); //, this.position.x / Canvas.width, this.position.y / Canvas.height, this.velocity.length / MAX_SPEED, (this.orientation % 360) / 360]);
    // const res = this.brain.compute([food ? 1 : 0, this.position.x / Canvas.width, this.position.y / Canvas.height, this.velocity.x, this.velocity.y]);

    // this._calculateTarget(this.brain.getAction(0), this.brain.getAction(1));

    const forward = this.brain.getOutput(0);
    const reverse = this.brain.getOutput(0);
    const left = this.brain.getOutput(0);
    const right = this.brain.getOutput(0);

    //this._updateMovement(forward, reverse, left, right);

    const force = new Vector2(1 * (res[0] - 0.5), 1 * (res[1] - 0.5));
    this._applyForce(force.mult(1));
    this._update(step);


    /*
    this._calculateTarget(res[0], res[1]);

    const seekForce = this._seek(this.targetLocation);

    this._applyForce(seekForce);

    this._update();
    */

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
  }

  public get isSelected () {
    return this.manager?.selectedCreature?.id === this.id
  }

  protected override onRender() {

    Canvas.custom((ctx) => {

      if (this.manager?.selectedCreature && this.manager.selectedCreature.id !== this.id) {
        ctx.globalAlpha = 0.2;
      }

      ctx.strokeStyle = this.rayColor;
      ctx.stroke(this.shape);

      if (Canvas.debug) {
        ctx.setLineDash([2, 2]);
        ctx.strokeStyle = 'black';
        ctx.stroke(this.bbox.shape);
      }

    });

    /*
    if (this.manager.selectedCreature?.id === this.id) {
      const fontSize = Canvas.width > 900
        ? 10
        : Canvas.width > 450
          ? 6
          : 4;

      const options: TextOptions = {
        fillStyle: '#000000',
        fontSize: 10,
        font: 'Arial',
      };

      Canvas.text(`Angle: ${(Math.round(this.orientation * 100) / 100)}`, this.x - this.size, this.y - this.size * 2.5, options);
      Canvas.text(`Speed: ${Math.abs(Math.round(this.currentSpeed * 100) / 100)}`, this.x - this.size, this.y - this.size * 2, options);
      Canvas.text(`Health: ${Math.floor(this.health / 10)}`, this.x - this.size, this.y - this.size * 1.5, options);
      Canvas.text(`Age: ${Math.round(this.timeAlive)} (${this.isAdult ? 'Adult' : 'Child'})`, this.x - this.size, this.y - this.size, options);
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
      Canvas.text(`State: ${state}`, this.x - this.size, this.y - this.size / 2, options);
    }
    */

    if (this.isPregnant) {
      Canvas.drawCircle(this.x, this.y, this.timePregnant / 200, '#000000');
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