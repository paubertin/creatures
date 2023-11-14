import { SimpleBrain } from "../brain/simple";
import { Matrix } from "../matrix";
import { BaseDNA, IBaseDNA } from "./base";

export interface ISimpleDNA extends IBaseDNA {
  firstLayer: Matrix;
  secondLayer: Matrix;
}

export class SimpleDNA extends BaseDNA {

  protected override _dna: ISimpleDNA;

  public constructor(dna: ISimpleDNA) {
    super(dna);
    this._dna = dna;
  }

  public buildBrain() {
    return new SimpleBrain(this);
  }

  public mix(other: SimpleDNA) {
    return new SimpleDNA({
      id: crypto.randomUUID(),
      firstLayer: this.mutateEye((this.firstLayer.mix(other.firstLayer)).mutate(1)),
      secondLayer: (this.secondLayer.mix(other.secondLayer)).mutate(0.1),
      eggColor: this._mixEggColor(other),
      color: this._mixColor(other),
      eyeSize: this._mixEyeSize(other),
      sightResolution: this.sightResolution,
    });
  }

  public get secondLayer() {
    return this._dna.secondLayer;
  }

  public get firstLayer() {
    return this._dna.firstLayer;
  }

  public mutateEye(matrix: Matrix) {
    if (Math.random() > 0.9) {
      const data = matrix.data;
      const i = (data[0].length - 4 * this.sightResolution) + 4 * Math.floor(Math.random() * (this.sightResolution - 1));
      let tmp = 0;
      for (let k = 0; k < data.length; ++k) {
        tmp = data[k][i + 0]; data[k][i + 0] = data[k][i + 4]; data[k][i + 4] = tmp;
        tmp = data[k][i + 1]; data[k][i + 1] = data[k][i + 5]; data[k][i + 5] = tmp;
        tmp = data[k][i + 2]; data[k][i + 2] = data[k][i + 6]; data[k][i + 6] = tmp;
        tmp = data[k][i + 3]; data[k][i + 3] = data[k][i + 7]; data[k][i + 7] = tmp;
      }
      return new Matrix(data);
    }
    return matrix;
  }

  public pixelId(i: number) {
    return `${i}`;
  }

  public static generateRandomDna() {
    const midLayerSize = 20;
    const sightResolution = 7;
    return new SimpleDNA({
      id: crypto.randomUUID(),
      firstLayer: Matrix.random(midLayerSize, sightResolution * 4 + 4),
      secondLayer: Matrix.random(4, midLayerSize),
      eggColor: Math.floor(Math.random() * 360),
      color: Math.floor(Math.random() * 360),
      eyeSize: (0.17 + 0.1 * Math.random()) * Math.PI,
      sightResolution: sightResolution,
    });
  }

  public static generateRandomDnaWithReducedComplexity() {
    const midLayerSize = 20;
    const sightResolution = 7;
    return new SimpleDNA({
      id: crypto.randomUUID(),
      firstLayer: SimpleDNA.reducedComplexityFirstLayer(midLayerSize, 4, sightResolution),
      secondLayer: Matrix.randomDiagonal(4, midLayerSize),
      eggColor: Math.floor(Math.random() * 360),
      color: Math.floor(Math.random() * 360),
      eyeSize: (0.17 + 0.1 * Math.random()) * Math.PI,
      sightResolution: sightResolution,
    });
  }

  public static reducedComplexityFirstLayer(rows: number, randomColumns: number, sightResolution: number) {
    const result = [];
    for (let i = 0; i < rows; ++i) {
      const v = [];
      for (let j = 0; j < randomColumns; ++j) {
        v.push(2 * Math.random() - 1);
      }

      const sightFunctions = SimpleDNA.generateSightFunctions();
      for (let j = 0; j < sightResolution; ++j) {
        sightFunctions.forEach((func) => {
          const x = 2 * (j / sightResolution) - 1;
          v.push(func(x));
        });
      }

      result.push(v);
    }
    return new Matrix(result);
  }

  public static generateSightFunctions() {
    const rnd = () => {
      return 2 * Math.random() - 1
    };

    return [0, 0, 0, 0].map((_) => {
      const type = Math.floor(Math.random() * 5) - 1;
      switch (type) {
        case -1:
          return (x: number) => { return x < 0.01 ? rnd() : 0; };
        case 0:
          return (x: number) => { return rnd(); };
        case 1:
          return (x: number) => { return rnd() * x; };
        case 2:
          return (x: number) => { return rnd() * x * x + rnd(); };
        case 3:
          return (x: number) => { return rnd() * x * x * x; };
        default:
          return (x: number) => { return 0; };
      }
    });

  }
}