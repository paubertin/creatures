import { Vector2 } from "../vector2";
import { GRID_SIZE } from "./constants";

export function gridCells (n: number) {
  return GRID_SIZE * n;
}

export function isSpaceFree (walls: Set<string>, position: Vector2) {
  const str = `${position.x},${position.y}`;
  const isWallPresent = walls.has(str);
  return !isWallPresent;
}