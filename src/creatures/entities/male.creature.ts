import { Creature, Gender } from "./creature";
import { SceneNode } from "../engine/scene";

export class MaleCreature extends Creature {
  public constructor (parent: SceneNode) {
    super (parent, {
      color: '#0000AA',
      rayColor: '#000088',
      gender: Gender.MALE,
      health: Math.random() * (1200 - 800) + 800,
      percentMaxSpeed: 1,
    });
  }
}