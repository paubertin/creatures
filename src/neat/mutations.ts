import { Organism } from "./organism";
import { randFloat } from "./utils";

export interface BioMutation {
  name: string;
  description: string;
  chance: number;
  apply: (org: Organism) => void;
}

export const BioMutations: BioMutation[] = [
  {
    name: 'Change type',
    description: 'Change the type of a singular cell',
    chance: 0.1,
    apply: (org: Organism) => {},
  },
  {
    name: 'Bone structure',
    description: 'Change the angle of a bone',
    chance: 0.25,
    apply: (org: Organism) => {
      const num = Math.floor(randFloat(0, org.bones.length));
      org.bones[num].angle += randFloat(-Math.PI/5, Math.PI/5);
    },
  }
];