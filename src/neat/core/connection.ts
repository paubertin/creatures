import { Config } from "../config";
import { clamp, randFloat } from "../utils";

export class Connection {

  public weight: number;
  public innovationId: string;

  public constructor(
    public idNode1: string,
    public idNode2: number,
    weight?: number,
  ) {
    if (weight == undefined) {
      this.weight = randFloat(Config.NEAT.WEIGHT.min, Config.NEAT.WEIGHT.max);
    }
    else {
      this.weight = weight;
    }
    this.innovationId = `${idNode1}-${idNode2}`;
  }

  public mutate(n: number) {
    if (n === 0) {
      return;
    }
    this.weight = clamp(this.weight + randFloat(Config.NEAT.WEIGHT.min * n, Config.NEAT.WEIGHT.max * n), Config.NEAT.WEIGHT.min, Config.NEAT.WEIGHT.max);
  }

  public copy() {
    const conn = new Connection(this.idNode1, this.idNode2);
    conn.weight = this.weight;
    return conn;
  }
}