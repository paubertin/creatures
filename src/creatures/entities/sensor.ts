import { Canvas } from "../engine/canvas";
import { Creature } from "./creature";
import { CreatureManager } from "../creature.manager";
import { Path } from "../geometry/path";
import { BBox, DOMSegment, fastCos, toRad } from "../utils";
import { TimeStep } from "../engine/time";
import { Renderable } from "./renderable";
import { Wall } from "./wall";
import { Food } from "./food";

export abstract class Sensor extends Renderable {
  public creature: Creature;

  protected _activated: boolean = false;

  public get activated() {
    return this._activated;
  }

  public constructor(creature: Creature, orientation: number) {
    super(creature, 0, 0, orientation, undefined, 'sensor');
    this.creature = creature;
  }
}

export class Ray extends DOMSegment {
  public shape: Path;

  public constructor (from: DOMPoint, to: DOMPoint) {
    super(from, to);
    this.shape = new Path();
    this.shape.moveTo(from.x, from.y);
    this.shape.lineTo(to.x, to.y);
  }

}


export class RangeSensor extends Sensor {

  public range: number;
  public angle: number;
  public override shape: Path;
  public override bbox: BBox;

  public resolution: number = 7 ;
  public rays: Ray[] = [];

  public readings: ({ ray: DOMSegment; point: DOMPoint; segment: DOMSegment; bbox?: BBox; offset: number } | null)[] = [];

  public constructor(creature: Creature, range: number, orientation: number, angle: number) {
    super(creature, orientation);
    this.range = range;
    this.angle = angle;

    this.shape = new Path();
    this.shape.moveTo(0, 0);
    this.shape.arc(0, 0, this.range, toRad(-this.angle * 0.5), toRad(this.angle * 0.5));
    this.shape.lineTo(0, 0);
    this.shape.closePath();
    this.bbox = this.shape.getBBox();

    for (let i = 0; i < this.resolution; ++i) {
      const angle = toRad(-this.angle * 0.5 + i * (this.angle / this.resolution) + (this.angle / this.resolution) * 0.5);
      this.rays.push(new Ray(new DOMPoint(0, 0), new DOMPoint(Math.cos(angle) * this.range, Math.sin(angle) * this.range)));
    }
  }

  protected override onUpdate(step: TimeStep) {
    this._activated = false;
    // this.detect();
    this.getReadings();

    // if (this.readings.some((r) => r !== null)) {
    //   console.log('readings', this.readings.map((r) => r === null ? null : r.offset));
    // }
  }

  /*
  public detect() {
    for (const creature of CreatureManager.creatures) {
      if (creature.id === this.creature.id) continue;
      const bbox = creature.bbox;
      const points = [
        new DOMPoint(bbox.x, bbox.y),
        new DOMPoint(bbox.x + bbox.width, bbox.y),
        new DOMPoint(bbox.x + bbox.width, bbox.y + bbox.height),
        new DOMPoint(bbox.x, bbox.y + bbox.height),
      ]

      const vertices = creature.vertices;
      for (let point of points) {
        point = point.matrixTransform(creature.transform);
        // point = point.matrixTransform(this.creature.transform.inverse());
        // point = point.matrixTransform(this.transform.inverse());
        point = point.matrixTransform(this.transform.multiply(this.creature.transform).inverse());
        // if (this.creature.id === 4) console.log('point', new DOMPoint(point.x, point.y));
        // const dist = Math.sqrt((this.position.x - point.x)**2 + (this.position.y - point.y)**2);
        // if (this.creature.id === 4) console.log('distance au capteur', dist);
        if (Canvas.isPointInPath(this.shape, point.x, point.y)) {
          this._activated = true;
          break;
        }
      }
      if (this._activated) {
        break;
      }
    }
  }
  */

  private getReadings () {
    this.readings = [];
    for (const ray of this.rays) {
      const creatures = this.scene.getNodes((node): node is Creature => node instanceof Creature).filter((c) => c.id !== this.creature.id);
      const walls = this.scene.getNodes((node): node is Wall => node instanceof Wall);
      const foods = this.scene.getNodes((node): node is Food => node instanceof Food);
      const entities = [
        // ...creatures,
        ...walls,
        ...foods,
      ];
      this.readings.push(
        this.getReading(ray, entities),
      );
    }
  }

  private getReading(ray: DOMSegment, entities: Renderable[]) {
    const touches = [];
    for (const entity of entities) {
      const bbox = entity.bbox;
      if (!bbox) continue;

      let globalBox = bbox.matrixTransform(entity.globalTransform);
      let localBbox = globalBox.matrixTransform(this.creature.translation.inverse());
      localBbox = localBbox.matrixTransform(this.creature.rotation.inverse());

      for (const segment of localBbox.segments) {
        const touch = getIntersection(ray.from, ray.to, segment.from, segment.to);
        if (touch) {
          touch.bbox = localBbox; 
          touches.push(touch);
        }
      }
    }
    if (touches.length === 0) {
      return null;
    }
    else {
      const offsets = touches.map((t) => t.offset);
      const minOffset = Math.min(...offsets);
      return touches.find((t) => t.offset === minOffset)!;
    }
  }

  protected override onRender() {
    Canvas.custom((ctx) => {
      ctx.globalAlpha = 0.4;

      ctx.setLineDash([5, 5]);
      /*
      ctx.stroke(this.shape);
      ctx.fillStyle = 'red';
      if (this._activated) {
        ctx.globalAlpha = 0.2;
        ctx.fill(this.shape);
      }
      */

      ctx.globalAlpha = 0.2;
      this.rays.forEach((ray) => ctx.stroke(ray.shape));

      ctx.globalAlpha = 0.4;
      this.readings.forEach((r) => {
        if (r) {
          const circle = new Path();
          circle.arc(r.point.x, r.point.y, 3, 0, Math.PI * 2);
          ctx.fill(circle);
          ctx.setLineDash([]);
          ctx.strokeStyle = 'blue';
          /*
          let segment = new Path();
          segment.moveTo(r.segment.from.x, r.segment.from.y);
          segment.lineTo(r.segment.to.x, r.segment.to.y);
          ctx.stroke(segment);

          if (r.bbox) {
            ctx.stroke(r.bbox.shape);
          }
          
          ctx.strokeStyle = 'green';
          segment = new Path();
          segment.moveTo(r.ray.from.x, r.ray.from.y);
          segment.lineTo(r.ray.to.x, r.ray.to.y);
          ctx.stroke(segment);
          */

        }
      });

    });
  }

}

export function lerp(min: number, max: number, alpha: number) {
  return min + alpha * (max - min);
}

export function getIntersection(a: DOMPoint, b: DOMPoint, c: DOMPoint, d: DOMPoint): { point: DOMPoint; segment: DOMSegment; bbox?: BBox; ray: Ray, offset: number } | null {
  const tTop = (d.x - c.x) * (a.y - c.y) - (d.y - c.y) * (a.x - c.x);
  const uTop = (c.y - a.y) * (a.x - b.x) - (c.x - a.x) * (a.y - b.y);
  const bottom = (d.y - c.y) * (b.x - a.x) - (d.x - c.x) * (b.y - a.y);

  if (bottom !== 0) {
    const t = tTop / bottom;
    const u = uTop / bottom;
    if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
      return {
        point: new DOMPoint(lerp(a.x, b.x, t), lerp(a.y, b.y, t)),
        segment: new DOMSegment(c, d),
        ray: new Ray(a, b),
        offset: t,
      };
    }
  }
  return null;
}