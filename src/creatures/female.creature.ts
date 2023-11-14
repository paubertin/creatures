import { Creature, Gender } from "./creature";

export class FemaleCreature extends Creature {
  public constructor () {
    super ({
      color: '#880088',
      rayColor: '#550055',
      gender: Gender.FEMALE,
      health: Math.random() * (1500 - 1000) + 1000,
      percentMaxSpeed: 0.8,
    });
  }
}