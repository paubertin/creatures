import { BaseBrain } from "../brain/base";
import { Color } from "../color";
import { bimodalValueMix } from "../helpers";
import { Matrix } from "../matrix";

export interface IBaseDNA {
  id: string;
  eyeSize: number;
  sightResolution: number;
  color: number;
  eggColor: number;
}

export abstract class BaseDNA {

  public get options () {
    return this._dna;
  }

  public constructor(protected _dna: IBaseDNA) { }

  public get eyeSize() {
    return this._dna.eyeSize;
  }

  public get sightResolution() {
    return this._dna.sightResolution;
  }

  public get visibilityColor() {
    return new Color(Color.hsl2rgb(this._dna.color, 100, 500));
  }

  public get eggColor() {
    return new Color(Color.hsl2rgb(this._dna.eggColor, 100, 500));
  }

  public get id() {
    return this._dna.id;
  }

  public abstract buildBrain(): any;

  protected _mixEggColor(other: BaseDNA) {
    return this._bimodalHueMix(this._dna.eggColor, other._dna.eggColor);
  }

  protected _mixColor(other: BaseDNA) {
    return this._bimodalHueMix(this._dna.color, other._dna.color);
  }

  protected _mixEyeSize(other: BaseDNA) {
    return BaseDNA._keepInRange(BaseDNA.mutateValue(Math.random() < 0.5 ? this._dna.eyeSize : other._dna.eyeSize, 0.01 * Math.PI), 0.17 * Math.PI, 0.27 * Math.PI);
  }

  protected _bimodalHueMix(lhs: number, rhs: number) {
    const smaller = (lhs < rhs) ? lhs : rhs;
    const larger = (lhs >= rhs) ? lhs : rhs;

    if (larger - smaller < 360 + smaller - larger) {
      return Math.floor(bimodalValueMix(smaller, larger) + 360) % 360;
    }
    else {
      return Math.floor(bimodalValueMix(smaller + 360, larger) + 360) % 360;
    }
  }

  public static mutateValue(value: number, maxMutation: number) {
    return value + (Math.random() < 0.3 ? maxMutation * 2 * Math.random() - maxMutation : 0)
  }

  public static _keepInRange(value: number, min: number, max: number) {
    return Math.min(max, Math.max(min, value));
  }

  public abstract pixelId (i: number): string;

  public abstract mix(other: BaseDNA): BaseDNA;

}