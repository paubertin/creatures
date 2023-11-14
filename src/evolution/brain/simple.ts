import { SimpleDNA } from "../dna/simple";
import { BaseBrain } from "./base";

export class SimpleBrain <DNA extends SimpleDNA> extends BaseBrain<DNA> {
  constructor(_dna: DNA) {
    super(_dna);
  }

  public think(inputHash: any) {
      let input = Object.keys(inputHash).map(key => { return inputHash[key]; });
      let hidden_neurons = this.sigmoidMap(this._dna.firstLayer.multiplyWithVector(input));
      let output = this.sigmoidMap(this._dna.secondLayer.multiplyWithVector(hidden_neurons));
      return {
          acceleration_angle: output[0],
          acceleration_radius: output[1],
          shooting_trigger: output[2],
          sexual_desire: output[3]
      };
  }

  public draw(): void { }
}