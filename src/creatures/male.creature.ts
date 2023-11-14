import { Canvas } from "./canvas";
import { Creature, Gender } from "./creature";

export class MaleCreature extends Creature {
  public constructor () {
    const size = (Canvas.width > Canvas.height) ? (Canvas.width / Canvas.height) * 12 : (Canvas.height / Canvas.width) * 12;
    super ({
      color: '#0000AA',
      rayColor: '#000088',
      gender: Gender.MALE,
      health: Math.random() * (1200 - 800) + 800,
      percentMaxSpeed: 1,
    });
  }
}