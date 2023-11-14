import { GameObject } from "../gameObject";
import { Vector2 } from "../vector2";

export function moveTowards(object: GameObject, destination: Vector2, speed: number = 1) {
  let dX = destination.x - object.position.x;
  let dY = destination.y - object.position.y;

  let distance: number = Math.sqrt(dX**2 + dY**2);

  if (distance <= speed) {
    object.position.x = destination.x;
    object.position.y = destination.y;
  }
  else {
    object.position.x += dX / distance * speed;
    object.position.y += dY / distance * speed;

    dX = destination.x - object.position.x;
    dY = destination.y - object.position.y;

    distance = Math.sqrt(dX**2 + dY**2);
  }

  return distance;
}