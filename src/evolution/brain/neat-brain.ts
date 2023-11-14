import { NeatDNA } from "../dna/neat-dna";
import { sigmoid } from "../helpers";
import { BaseBrain } from "./base";
import { NeatBrainPlotter } from "./neat-brain-plotter";

export class NeatBrain extends BaseBrain<NeatDNA> {
  public constructor(dna: NeatDNA) {
    super(dna);
  }

  public override think(input: Record<string, number>) {
      const nodes: Record<string, number> = JSON.parse(JSON.stringify(input));

      this._dna.connections.forEach(connection => {
          if(connection.enabled) {
              let inValue = sigmoid(nodes[connection.inNode]) || 0;
              let outValue = nodes[connection.outNode] || 0;
              nodes[connection.outNode] = outValue + connection.weight * inValue;
          }
      });
      let result: Record<string, number> = {};
      this._dna.outNodes.forEach((n) => {
          result[n] = sigmoid(nodes[n]);
      });
      return result;
  }

  public get nodeLevels() { return this._dna.nodeLevels; }
  public get nodes() { return this._dna.nodes; }

  public get connections() {
      return this._dna.connections;
  }

  public draw() {
      (new NeatBrainPlotter(document.getElementById('brain-viewer')!, this)).draw();
  }

}