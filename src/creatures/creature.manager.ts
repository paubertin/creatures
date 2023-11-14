import { Canvas } from "./canvas";
import { Creature, Gender, TIME_TO_GIVE_BIRTH } from "./creature";
import { FemaleCreature } from "./female.creature";
import { MaleCreature } from "./male.creature";

export class CreatureManager {

  private static instance: CreatureManager;

  public static selectedCreature: Creature | null = null;

  private activeCreatures: Creature[] = [];

  private constructor (public numberOfCreatures: number) {}

  public static init (numberOfCreatures: number) {
    if (this.instance) return;
    this.instance = new CreatureManager(numberOfCreatures);
    for(let i = 0; i < this.instance.numberOfCreatures; i++) {
      this.spawnCreature();
    }
  }

  public static get creatures () {
    return this.instance.activeCreatures;
  }

  public static spawnCreature () {
    this.instance.activeCreatures.push((Math.random() < 0.5) ? new MaleCreature().setManager(this) : new FemaleCreature().setManager(this));
  }

  public static render () {
    Canvas.clearRect('creatures');
    this.instance.activeCreatures.forEach((creature) => creature.render());
  }

  public static update () {
    const deads: number[] = [];
    const babies: Creature[] = [];
    this.instance.activeCreatures.forEach((creature, idx) => {
      creature.update();
      if (creature.isDead) {
        deads.push(idx);
        return;
      }
      if (creature.gender === Gender.FEMALE && creature.isPregnant) {
        creature.timePregnant++;
        if (creature.timePregnant >= TIME_TO_GIVE_BIRTH) {
          const baby = (Math.random() < 0.5) ? new MaleCreature().setManager(this) : new FemaleCreature().setManager(this);
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