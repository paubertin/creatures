import { GameObject } from './game-object'
import { Vector2 } from "../vector2";
import { Color } from "./color";

export class Wall extends GameObject {
  constructor(private _corners: Vector2[]) {
    super();
  }


  public override visible(position: Vector2, direction: number, angle: number) {

    let visibility_data = this._corners.map(c => { return this._coordinatesRelativeToPointAndDirection(position, direction, c); });

    if (Math.abs(visibility_data[1]['y'] - visibility_data[0]['y']) < 0.00001) { return false; }

    if (this._creatureRelativeCoordinateVisible(visibility_data[0], angle) || this._creatureRelativeCoordinateVisible(visibility_data[1], angle)) {
      return true;
    }

    let w = visibility_data[1]['y'] / (visibility_data[1]['y'] - visibility_data[0]['y']);
    let intersection_point = new Vector2({ x: w * visibility_data[0]['x'] + (1 - w) * visibility_data[1]['x'], y: 0 });

    if (w < 0 || w > 1) return false;

    return this._creatureRelativeCoordinateVisible(intersection_point, angle);
  }

  _creatureRelativeCoordinateVisible(relative_corner_coordinates: Vector2, angle: number) {
    return relative_corner_coordinates['x'] > 0 &&
      Math.abs(relative_corner_coordinates['y']) < relative_corner_coordinates['x'] * Math.tan(angle);
  }

  override visibilityDistance(position: Vector2, direction: number) {
    let visibility_data = this._corners.map(c => { return this._coordinatesRelativeToPointAndDirection(position, direction, c); });

    let w = visibility_data[1]['y'] / (visibility_data[1]['y'] - visibility_data[0]['y']);

    if (w < 0) { return this._distance(position, this._corners[1]); }
    if (w > 1) { return this._distance(position, this._corners[0]); }

    return w * visibility_data[0]['x'] + (1 - w) * visibility_data[1]['x'];
  }

  _distance(p1: Vector2, p2: Vector2) {
    return Math.sqrt(Math.pow(p1['x'] - p2['x'], 2) + Math.pow(p1['y'] - p2['y'], 2));
  }

  visibilityColor() {
    return new Color({ r: 128, g: 128, b: 128 });
  }

  _coordinatesRelativeToPointAndDirection(origin: Vector2, direction: number, point: Vector2) {
    let rx = point['x'] - origin['x'];
    let ry = point['y'] - origin['y'];

    let nx = rx * Math.cos(-direction) - ry * Math.sin(-direction);
    let ny = rx * Math.sin(-direction) + ry * Math.cos(-direction);

    return new Vector2({
      x: nx,
      y: ny
    });
  }

  wallLength() {
    return this._distance(this._corners[0], this._corners[1]);
  }


  handleCollision(vectors: Vector2[], radius: number) {
    if (!this.vectorColides(vectors, radius)) { return vectors[1]; }

    let wallUnit = {
      x: (this._corners[1]['x'] - this._corners[0]['x']) / this.wallLength(),
      y: (this._corners[1]['y'] - this._corners[0]['y']) / this.wallLength()
    };

    let diff = { x: vectors[1]['x'] - vectors[0]['x'], y: vectors[1]['y'] - vectors[0]['y'] };
    let s = diff['x'] * wallUnit['x'] + diff['y'] * wallUnit['y'];

    let point = new Vector2({
      x: vectors[0]['x'] + wallUnit['x'] * s,
      y: vectors[0]['y'] + wallUnit['y'] * s
    });
    return this.pointCollides(point, radius) ? vectors[0] : point;
  }

  vectorColides(vectors: Vector2[], radius: number) {
    return this.pointCollides(vectors[1], radius) || this.crossed(vectors);
  }

  crossed(vectors: Vector2[]) {
    let relative_vectors = vectors.map(v => { return this._cordinatesRelativeToWall(v); });

    let w = relative_vectors[1]['y'] / (relative_vectors[1]['y'] - relative_vectors[0]['y']);
    let intersection_point = w * relative_vectors[0]['x'] + (1 - w) * relative_vectors[1]['x'];

    return relative_vectors[0]['y'] * relative_vectors[1]['y'] < 0 && intersection_point > -20 && intersection_point < this.wallLength() + 20;
  }

  pointCollides(point: Vector2, radius: number) {
    let relative_vector = this._cordinatesRelativeToWall(point);
    return Math.abs(relative_vector['y']) < radius && relative_vector['x'] > -radius && relative_vector['x'] < this.wallLength() + radius;
  }

  _cordinatesRelativeToWall(point: Vector2) {
    let wallAngle = Math.acos((this._corners[1]['x'] - this._corners[0]['x']) / this.wallLength());

    if (this._corners[0]['y'] > this._corners[1]['y']) { wallAngle = Math.PI * 2 - wallAngle; }

    return this._coordinatesRelativeToPointAndDirection(this._corners[0], wallAngle, point)
  }



  drawTo(context: CanvasRenderingContext2D) {
    let color = this.visibilityColor();
    context.strokeStyle = `rgb(${color.r},${color.g},${color.b})`;
    context.beginPath();
    context.moveTo(this._corners[0]['x'], this._corners[0]['y']);
    context.lineTo(this._corners[1]['x'], this._corners[1]['y']);
    context.stroke();
  }
}