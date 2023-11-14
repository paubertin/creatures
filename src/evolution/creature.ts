import { Vector2 } from "../vector2";
import { BaseBrain } from "./brain/base";
import { SimpleBrain } from "./brain/simple";
import { Color } from "./color";
import { Config } from "./config";
import { BaseDNA } from "./dna/base";
import { Egg } from "./egg";
import { Food } from "./food";
import { GameObject } from "./game-object";
import { World } from "./world";

export class Creature extends GameObject {

  private _dna: BaseDNA;
  private _external_dna: BaseDNA | null = null;
  private _brain: BaseBrain;

  private _max_energy: number;
  private _max_speed: number;
  private _born_in_iteration: number;
  private _world: World;
  private _direction: number;
  private _speed: number;
  private _energy: number;
  private _alive: boolean;
  private _time_since_last_egg_layed: number;
  private _time_since_last_fire: number;
  private _fire_power: number;
  private _max_fire_power: number;

  private _sight: Color[] = [];

  public constructor(world: World, dna: BaseDNA, positon: Vector2, iteration_number: number) {
      super();

      this._dna = dna;
      this._brain = dna.buildBrain() as BaseBrain;

      this._max_energy = 10000;
      this._max_speed = 2;

      this._position = positon;
      this._born_in_iteration = iteration_number;
      this._world = world;

      this._direction = Math.random() * 2 * Math.PI;
      this._speed = 0;
      // this.eyeSize = 0.27*Math.PI;
      this._energy = 5000;
      this._alive = true;
      this._time_since_last_egg_layed = 0;
      this._time_since_last_fire = 0;
      this._fire_power = 0;
      this._max_fire_power = 5000;

      Config
          .set('energy_lost_when_bullet_hits', 10000)
          .set('energy_lost_when_bullet_fired', 500);

      for(let i = 0; i < this.sightResolution; i++) {
        this._sight.push(new Color(128, 128, 128));
          // this._sight.push({ r:128, g:128, b:128, d:10000 });
      }
  }

  public get brain () {
    return this._brain;
  }

  public set brain (b: BaseBrain) {
    this._brain = b;
  }

  public get eyeSize () {
    return this._dna.eyeSize;
  }

  public get sightResolution () {
    return this._dna.sightResolution;
  }

  public see(things: GameObject[]) {
      let angle = this.eyeSize / this.sightResolution;
      for(let i = 0; i < this.sightResolution; i++) {
          let sightDirection = this._direction + (i - (this.sightResolution - 1) / 2) * angle;

          let result = {r: 128, g: 128, b: 128, d: this.seeClosestWallDistance()};

          things.forEach(thing => {
              if (thing.visible(this._position, sightDirection, angle)) {
                  let distance = thing.visibilityDistance(this._position, sightDirection);

                  if (result.d === null || result.d > distance) {
                      result.d = distance;
                      let color = thing.visibilityColor(this._position, sightDirection);
                      result['r'] = color['r'];
                      result['g'] = color['g'];
                      result['b'] = color['b'];
                  }
              }
          });
          this._sight[i] = new Color(result);
      }
  }

  public seeClosestWallDistance() {
      let t = [
              (-this._position['x']) / Math.cos(this._direction),
              (-this._position['y']) / Math.sin(this._direction),
              (1600-this._position['x']) / Math.cos(this._direction),
              (900-this._position['y']) / Math.sin(this._direction)
          ];
      t = t.filter(v => { return v && v >= 0; });
      return Math.min(...t);
  }


  public override get radius() {
      return 20;
  }

  public visibilityColor(position: Vector2, direction: number) {
      return this._dna.visibilityColor;
  }

  public drawTo(context: CanvasRenderingContext2D, thisIteration: number) {
      this._drawBody(context);
      this._drawEye(context);
      this._drawEnergy(context);

      if(this._brain.possessed) {
          context.beginPath();
          context.strokeStyle = '#5500ff';
          let position = this.position;
          context.rect(position.x - 32, position.y - 32,64,64);
          context.stroke();
      }

      context.fillText(`${Math.floor((thisIteration-this._born_in_iteration)/1000)}`,this._position['x']+20, this._position['y']+20);
  }

  private _drawBody(context: CanvasRenderingContext2D) {
      context.beginPath();
      let color = this._dna.visibilityColor;
      context.strokeStyle = `rgb(${color.r},${color.g},${color.b})`;
      context.moveTo(this._position['x'], this._position['y']);
      context.arc(this._position['x'], this._position['y'], 20, this._direction + this.eyeSize, this._direction - this.eyeSize);
      context.lineTo(this._position['x'], this._position['y']);
      context.stroke();

      if (this._dna.constructor.name === 'NeatDna') {
          context.beginPath();
          context.strokeStyle = 'rgb(0,0,0)';
          context.arc(this._position['x'], this._position['y'], 2, this._direction + this.eyeSize, this._direction - this.eyeSize);
          context.stroke();
      }

      if(this._external_dna) {
          let egg_color = this._external_dna.eggColor;
          context.strokeStyle = `rgb(${egg_color.r},${egg_color.g},${egg_color.b})`;
          context.beginPath();
          context.arc(this._position['x'], this._position['y'], 5, this._direction + this.eyeSize, this._direction - this.eyeSize);
          context.stroke();
      }

  }
  
  private _drawEye(context: CanvasRenderingContext2D) {
      for(let i = 0; i < this.sightResolution; i++) {
          context.beginPath();
          let color = this._sight[i];
          let angle = this._direction + 2*(i - this.sightResolution/2) * this.eyeSize / this.sightResolution;
          context.strokeStyle = `rgb(${color.r},${color.g},${color.b})`;
          context.arc(this._position['x'], this._position['y'], 16, angle, angle + 2*this.eyeSize / this.sightResolution);
          context.stroke();
      }

  }

  private _drawEnergy(context: CanvasRenderingContext2D) {
      context.strokeStyle = '#000000';
      context.beginPath();
      let arcAngle = Math.PI - (this._energy / 5000 + 0.1);
      context.arc(this._position['x'], this._position['y'], 16, this._direction + arcAngle, this._direction - arcAngle);
      context.stroke();

      context.strokeStyle = 'rgb(200,0,0)';
      context.beginPath();
      let arcAngle2 = Math.PI - (this._fire_power / 2500 + 0.1);
      context.arc(this._position['x'], this._position['y'], 12, this._direction + arcAngle2, this._direction - arcAngle2);
      context.stroke();
  }

  public iterate() {
      this._looseEnergy();

      let status = this.buildStatusVector();
      let thought = this._brain.think(status);

      if(isNaN(thought.acceleration_angle)) {
          console.log(status, thought, this._dna);
          throw "NaN value in thought";
      }

      this._updateSpeed(thought.acceleration_angle, thought.acceleration_radius);
      this._updatePosition();
      this._shoot((thought.shooting_trigger || 0) > 0.5);
      this._reproduce(thought.sexual_desire || 1);
  }

  public buildStatusVector() {
      let status: Record<string, number> = {
          energy: this._energy / this._max_energy,
          fire_power: this._fire_power / this._max_fire_power,
          speed: this._speed / this._max_speed,
          dna_color: (this._external_dna ? this._external_dna.options.eggColor : -180) / 360
      };
      for (let i = 0; i < this.sightResolution; i++) {
          let pixelId = this._dna.pixelId(i);

          let hsl = Color.rgb2hsl(this._sight[i]['r'],this._sight[i]['g'],this._sight[i]['b']);

          status['sight_' + pixelId + 'h'] = hsl['h']/360;
          status['sight_' + pixelId + 's'] = hsl['s']/100;
          status['sight_' + pixelId + 'l'] = hsl['l']/100;
          status['sight_' + pixelId + 'd'] = Creature._keepInRange(20/(this._sight[i]['d']+1),0,1);

      }
      return status;
  }

  private _shoot(trigger: boolean) {
      ++this._fire_power;
      ++this._time_since_last_fire;
      if(trigger && this._fire_power > 300 && this._time_since_last_fire > 50) {
          let bullet_position = new Vector2({
              x: this._position.x + 30 * Math.cos(this._direction),
              y: this._position.y + 30 * Math.sin(this._direction)
          });
          this._world.addBullet(bullet_position, this._direction);
          this._fire_power -= 300;
          this._time_since_last_fire = 0;
          this._energy -= Config.get<number>('energy_lost_when_bullet_fired');
      }
      this._fire_power = Creature._keepInRange(this._fire_power,0, this._max_fire_power);
  }

  private _reproduce(sexual_desire: number) {
      this._time_since_last_egg_layed += 1;
      if (this._energy > 8000 && this._time_since_last_egg_layed > 1000 && Math.random() < 0.01 && sexual_desire > Math.random()) {
          if(this._external_dna) {
              this._createOffspring(this._external_dna);
          } else {
              this._layEgg();
          }
          this._energy -= 2500;
          this._time_since_last_egg_layed = 0;
      }
  }

  private _createOffspring(external: BaseDNA) {
      this._world.injectCreature(this.mix(external), new Vector2({x: this._position.x, y: this._position.y}), [this._dna, external]);
      this._external_dna = null;
  }

  private _layEgg() {
      let egg_position = new Vector2({
          x: Creature._keepInRange(this._position.x - 30 * Math.cos(this._direction), 20, 1560),
          y: Creature._keepInRange(this._position.y - 30 * Math.sin(this._direction), 20, 860)
      });
      this._world.addEgg(egg_position, this._dna.eggColor, this._dna);
  }

  distance(other: GameObject) {
      return this.distanceFromPoint(other.position);
  }

  containsPoint(point: Vector2) {
      return this.distanceFromPoint(point) < this.radius;
  }

  distanceFromPoint(point: Vector2) {
      return Math.sqrt(Math.pow(this._position['x'] - point['x'], 2) + Math.pow(this._position['y'] - point['y'], 2));
  }

  feed(food: Food) {
      this._energy += food.value;
      this._energy = Creature._keepInRange(this._energy, 0, this._max_energy);
  }

  takeHit() {
      this._energy -= Config.get<number>('energy_lost_when_bullet_hits');
  }

  canTakeEgg(egg: Egg) {
      let myEgg = egg.dna.id === this._dna.id;
      let sameDnaType = Object.getPrototypeOf(egg.dna) === Object.getPrototypeOf(this._dna);
      return !myEgg && sameDnaType;
  }

  takeEgg(e: Egg) {
      this._external_dna = e.dna;
  }

  mix(other_dna: BaseDNA) {
      return this._dna.mix(other_dna);
  }

  public get alive () {
      return this._alive;
  }

  _updateSpeed(accelerationAngle: number, accelerationRadius: number) {
      this._direction += (accelerationAngle - 0.5) / 10;

      this._speed += (accelerationRadius - 0.5) / 10;
      this._speed = Creature._keepInRange(this._speed, 0, this._max_speed);
  }

  _updatePosition() {
      let new_position = new Vector2({
          x: this._position['x'] + this._speed * Math.cos(this._direction),
          y: this._position['y'] + this._speed * Math.sin(this._direction)
      });

      this._world.getWalls().forEach(wall => {
          new_position = wall.handleCollision([this._position, new_position], this.radius);
      });

      this._position['x'] = Creature._keepInRange(new_position['x'], 20, 1580);
      this._position['y'] = Creature._keepInRange(new_position['y'], 20, 880);
  }

  _looseEnergy() {
      this._energy -= this._speed+1;
      if (this._energy < 1) {
          this._alive = false;
      }
      this._energy = Creature._keepInRange(this._energy, 0, 10000);
  }

  static _keepInRange(value: number, min: number, max: number) {
      return Math.min(max,Math.max(min, value));
  }

}