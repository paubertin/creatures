import { Creature, Gender, TIME_TO_GIVE_BIRTH } from "./entities/creature";
import { FemaleCreature } from "./entities/female.creature";
import { MaleCreature } from "./entities/male.creature";
import { SceneNode } from "./engine/scene";
import { TimeStep } from "./engine/time";

export class CreatureManager {

  private static instance: CreatureManager;

  public static selectedCreature: Creature | null = null;

  private activeCreatures: Creature[] = [];

  private constructor (public numberOfCreatures: number) {}

  public static init (numberOfCreatures: number, rootNode: SceneNode) {
    if (this.instance) return;
    this.instance = new CreatureManager(numberOfCreatures);
    for(let i = 0; i < this.instance.numberOfCreatures; i++) {
      this.spawnCreature(rootNode);
    }
  }

  public static get creatures () {
    return this.instance.activeCreatures;
  }

  public static spawnCreature (rootNode: SceneNode) {
    this.instance.activeCreatures.push((Math.random() < 0.5) ? new MaleCreature(rootNode).setManager(this) : new FemaleCreature(rootNode).setManager(this));
  }

  public static render () {
    this.instance.activeCreatures.forEach((creature) => creature.render());
  }

  public static update (step: TimeStep) {
    const deads: number[] = [];
    const babies: Creature[] = [];
    this.instance.activeCreatures.forEach((creature, idx) => {
      creature.update(step);
      if (creature.isDead) {
        deads.push(idx);
        return;
      }
      if (creature.gender === Gender.FEMALE && creature.isPregnant) {
        creature.timePregnant++;
        if (creature.timePregnant >= TIME_TO_GIVE_BIRTH) {
          const baby = (Math.random() < 0.5) ? new MaleCreature(creature.parent!).setManager(this) : new FemaleCreature(creature.parent!).setManager(this);
          baby.position.x = creature.x - creature.size;
          baby.position.y = creature.y - creature.size;

          babies.push(baby);

          creature.isPregnant = false;
          creature.timePregnant = 0;
        }
      }
    });

    for (const dead of deads) {
      this.instance.activeCreatures.splice(dead, 1);
      this.instance.numberOfCreatures--;
    }

    for (const baby of babies) {
      this.instance.activeCreatures.push(baby);
      this.instance.numberOfCreatures++;
    }
  }
}