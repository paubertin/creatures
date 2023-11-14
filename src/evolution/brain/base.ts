import { BaseDNA } from "../dna/base";
import { sigmoid } from "../helpers";

export abstract class BaseBrain<DNA extends BaseDNA | never = never> {

  protected _dna!: DNA;

  constructor(protected dna?: DNA) {
    if (dna) {
      this._dna = dna;
    }
  }

  public abstract think(input: any): any;

  sigmoidMap(vector: number[]) {
      return vector.map((x) => {
          return sigmoid(x);
      })
  }

  public get possessed () {
      return false;
  }

  public abstract draw(): void;
}