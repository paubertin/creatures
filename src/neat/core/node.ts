import { Config } from "../config";
import { clamp, randFloat } from "../utils";
import { Brain } from "./genome";

export class Node {

  public bias: number = 0;
  public value: number;

  public constructor(
    public id: string,
    public layer: number,
    public brain: Brain,
    public name: string = 'Neuron',
  ) {
    this.id = id;
    this.layer = layer;
    if (this.layer !== 0) {
      this.bias = randFloat(Config.NEAT.BIAS.min, Config.NEAT.BIAS.max);
    }
    this.value = this.bias;
  }

  public fire() {
    let connections = this.brain.getConnected(this.id);

    let sum = 0;
    for (let i = 0; i < connections.length; i++) {
      const c = connections[i];
      const n1 = this.brain.getNode(c.n1);
      sum += (n1.value * c.weight)
    }

    // this.val = Math.tanh(sum + this.bias); not using for this project !
    this.value = clamp(sum + this.bias, Config.NEAT.VALUE.min, Config.NEAT.VALUE.max)
  }

  public mutate(n: number) {
    if (n === 0) {
      return;
    }
    this.bias = clamp(this.bias + randFloat(Config.NEAT.BIAS.min * n, Config.NEAT.BIAS.max * n), Config.NEAT.BIAS.min, Config.NEAT.BIAS.max);
  }

  public copy(brain: Brain) {
    let node = new Node(this.id, this.layer, brain);
    node.bias = this.bias;
    node.value = this.value;
    node.name = this.name;
    return node;
  }

}
